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

export async function generateThemesForGoal(goalLabel: string): Promise<any> {
  try {
    const response = await fetch("/api/anthropic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 800,
        messages: [{
          role: "user",
          content: `Analyse: "${goalLabel}"

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
  questCount: number = 3
): Promise<any[]> {
  try {
    const difficultyInstruction = !hasGoals
      ? questCount <= 3
        ? '1 facile, 1 moyen, 1 difficile.'
        : '2 faciles, 2 moyens, 1 difficile.'
      : '';

    const response = await fetch("/api/anthropic", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        messages: [{
          role: "user",
          content: `Génère ${questCount} quêtes quotidiennes. JSON uniquement.

${hasGoals ? `${goalsInfo}

RÈGLE CRUCIALE - Difficulté adaptée au niveau:
- Thèmes "none" ou "low" (0-3 quêtes) → difficulté FACILE (découverte)
- Thèmes "medium" (4-7 quêtes) → difficulté MOYENNE (progression)
- Thèmes "high" ou "advanced" (8+ quêtes) → difficulté DIFFICILE (challenge)

La difficulté doit correspondre au niveau de développement du thème !

Priorité aux thèmes peu développés. Varie les thèmes.
IMPORTANT: Utilise les goalId et themeId EXACTS fournis entre crochets ci-dessus.` : `Amélioration générale, ${difficultyInstruction}`}

Éviter: ${recentQuests || 'aucune'}

Format:
{"quests": [{"title": "Action", "category": "body|mind|environment|projects|social", "difficulty": "easy|medium|hard"${hasGoals ? ', "goalId": "goalId-exact", "themeId": "themeId-exact"' : ''}}, ...]}

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
      category: q.category,
      difficulty: q.difficulty,
      completed: false,
      type: 'daily',
      goalId: q.goalId || null,
      themeId: q.themeId || null
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
