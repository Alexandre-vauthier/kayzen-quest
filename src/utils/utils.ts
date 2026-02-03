import type { Title } from '../types/types';
import { titles } from './constants';

export function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(now.setDate(diff)).toDateString();
}

export function getPlayerTitle(level: number): Title {
  return titles.find(t => level <= t.maxLevel) || titles[titles.length - 1];
}

export async function generateThemesForGoal(goalLabel: string, context?: string): Promise<any> {
  try {
    const contextInstruction = context?.trim()
      ? `\n\nContexte de l'utilisateur:\n"${context.trim()}"\n\nUtilise ce contexte pour personnaliser les thèmes.`
      : '';

    const response = await fetch("/api/anthropic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 800,
        messages: [{
          role: "user",
          content: `Analyse: "${goalLabel}"${contextInstruction}

Identifie 2-10 thèmes essentiels.

JSON:
{"themes": [{"id": "id", "name": "Nom"}]}`
        }]
      })
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }

    const text = data.content[0].text.trim().replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(text);

    return {
      id: `goal-${Date.now()}`,
      label: goalLabel,
      context: context?.trim() || undefined,
      themes: parsed.themes.map((t: any) => ({
        ...t,
        questsCompleted: 0,
        lastTouched: null,
        developmentLevel: "none"
      })),
      createdAt: new Date().toISOString()
    };
  } catch (err) {
    console.error('Theme generation failed:', err);
    throw err;
  }
}

export async function generateQuestsFromAPI(
  recentQuests: string,
  goalsInfo: string,
  hasGoals: boolean,
  questCount: number = 3,
  pinnedQuests: string[] = []
): Promise<any[]> {
  try {
    const difficultyInstruction = !hasGoals
      ? questCount <= 3
        ? '1 facile, 1 moyen, 1 difficile.'
        : '2 faciles, 2 moyens, 1 difficile.'
      : '';

    // Total = pinned quests + new quests (pinned are IN ADDITION to quota)
    const totalQuests = pinnedQuests.length + questCount;
    const pinnedInstruction = pinnedQuests.length > 0
      ? `\nQUÊTES ÉPINGLÉES (habitudes récurrentes à TOUJOURS inclure) :
${pinnedQuests.map(q => `- "${q}" [PINNED]`).join('\n')}

Génère EN PLUS ${questCount} nouvelles quêtes variées.
Marque les quêtes épinglées avec "isPinned": true dans le JSON.`
      : '';

    const response = await fetch("/api/anthropic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{
          role: "user",
          content: `Génère ${totalQuests} quêtes quotidiennes. JSON uniquement.

${hasGoals ? `${goalsInfo}

RÈGLE CRUCIALE - Difficulté adaptée au niveau:
- Thèmes "none" ou "low" (0-3 quêtes) → difficulté FACILE (découverte)
- Thèmes "medium" (4-7 quêtes) → difficulté MOYENNE (progression)
- Thèmes "high" ou "advanced" (8+ quêtes) → difficulté DIFFICILE (challenge)

La difficulté doit correspondre au niveau de développement du thème !

Priorité aux thèmes peu développés. Varie les thèmes.
IMPORTANT: Utilise les goalId et themeId EXACTS fournis entre crochets ci-dessus.` : `Amélioration générale, ${difficultyInstruction}`}
${pinnedInstruction}

Éviter (pour les nouvelles quêtes): ${recentQuests || 'aucune'}

Pour chaque quête, ajoute :
- "description": 1 phrase courte expliquant le bénéfice concret de cette action
- "estimatedTime": durée estimée ("5 min", "10 min", "15 min", "20 min", "30 min" ou "30+ min")
${pinnedQuests.length > 0 ? '- "isPinned": true/false (true uniquement pour les quêtes épinglées listées ci-dessus)' : ''}

Format:
{"quests": [{"title": "Action", "description": "Bénéfice concret", "estimatedTime": "10 min", "category": "body|mind|environment|projects|social", "difficulty": "easy|medium|hard"${pinnedQuests.length > 0 ? ', "isPinned": false' : ''}${hasGoals ? ', "goalId": "goalId-exact", "themeId": "themeId-exact"' : ''}}, ...]}

${difficultyInstruction}`
        }]
      })
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }

    const text = data.content[0].text.trim().replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(text);

    return parsed.quests.map((q: any, i: number) => ({
      id: Date.now() + i,
      title: q.title,
      description: q.description || null,
      estimatedTime: q.estimatedTime || null,
      category: q.category,
      difficulty: q.difficulty,
      completed: false,
      type: 'daily',
      goalId: q.goalId || null,
      themeId: q.themeId || null,
      isPinned: q.isPinned || false
    }));
  } catch (err) {
    console.error('Quest generation failed:', err);
    throw err;
  }
}

export async function generateQuestCompletionMessage(questTitle: string): Promise<string> {
  try {
    const response = await fetch("/api/anthropic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 100,
        messages: [{
          role: "user",
          content: `Quête accomplie : "${questTitle}"

Génère UNE seule phrase courte et motivante sur le bénéfice concret de cette action pour le développement personnel. Ton bienveillant et zen. Pas de guillemets. Uniquement la phrase.`
        }]
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data.content[0].text.trim();
  } catch (err) {
    console.error('Completion message failed:', err);
    return '';
  }
}

export async function generateWeeklyRecap(
  questHistory: any[],
  goals: any[],
  playerLevel: number
): Promise<string> {
  try {
    const thisWeek = questHistory.filter(q => {
      const d = new Date(q.date);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return d >= weekAgo;
    });

    if (thisWeek.length === 0) return 'Pas de quêtes cette semaine. Lance-toi !';

    const categories = thisWeek.reduce((acc: Record<string, number>, q: any) => {
      if (q.category) acc[q.category] = (acc[q.category] || 0) + 1;
      return acc;
    }, {});

    const response = await fetch("/api/anthropic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        messages: [{
          role: "user",
          content: `Récap hebdomadaire. Ton bienveillant et motivant, 3-4 phrases max.

Niveau: ${playerLevel}
Quêtes cette semaine: ${thisWeek.length}
Catégories: ${Object.entries(categories).map(([k, v]) => `${k}: ${v}`).join(', ')}
Objectifs: ${goals.map(g => g.label).join(', ') || 'Aucun'}
Journées parfaites cette semaine: ${thisWeek.filter(q => q.wasPerfectDay).length}

Quêtes réalisées:
${thisWeek.map(q => `- ${q.title}`).join('\n')}

Génère un court récap personnalisé. Mentionne les points forts et un encouragement. Uniquement le texte.`
        }]
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data.content[0].text.trim();
  } catch (err) {
    console.error('Weekly recap failed:', err);
    return '';
  }
}

export async function generateLevelUpStoryFromAPI(
  newLevel: number,
  currentTitle: Title,
  goalsText: string,
  recentQuests: any[],
  previousChapters: any[]
): Promise<string> {
  try {
    const response = await fetch("/api/anthropic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        messages: [{
          role: "user",
          content: `Niveau ${newLevel} (${currentTitle.name}).

Objectifs: ${goalsText || 'Amélioration'}

Quêtes:
${recentQuests.map(q => `- ${q.title}`).join('\n')}

${previousChapters.length > 0 ? `Précédents:
${previousChapters.map(ch => `${ch.level}: "${ch.story.substring(0, 80)}..."`).join('\n')}` : ''}

Récit court (3-5 phrases), ton zen, pas de liste, progression visible.

Uniquement le récit.`
        }]
      })
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }

    return data.content[0].text.trim();
  } catch (err) {
    console.error('Story generation failed:', err);
    throw err;
  }
}
