# API Documentation - Kaizen Quest

## Vue d'ensemble

L'application utilise un backend Express comme proxy pour sécuriser les appels à l'API Anthropic Claude. Toutes les requêtes IA passent par le serveur Node.js.

---

## Backend Express (server.js)

### Configuration

**Port:** `process.env.PORT || 3000`
**Clé API:** `process.env.ANTHROPIC_API_KEY` (obligatoire)

### Middleware

```javascript
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));
```

---

## Endpoint: POST /api/anthropic

Proxy sécurisé vers l'API Anthropic Claude.

### Request

**URL:** `/api/anthropic`
**Method:** `POST`
**Headers:**
```
Content-Type: application/json
```

**Body:**
```typescript
{
  model: string;           // "claude-sonnet-4-20250514"
  max_tokens: number;      // 500-1000 selon usage
  messages: Array<{
    role: "user";
    content: string;       // Prompt structuré
  }>;
}
```

### Response Success

**Status:** 200
**Body:**
```typescript
{
  content: Array<{
    text: string;          // Réponse générée par Claude
    type: "text";
  }>;
  id: string;
  model: string;
  role: "assistant";
  stop_reason: string;
  type: "message";
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}
```

### Response Error

**Status:** 500
**Body:**
```typescript
{
  error: string;           // Message d'erreur
}
```

### Erreurs possibles

1. **Clé API manquante**
```json
{
  "error": "ANTHROPIC_API_KEY non configurée"
}
```

2. **Erreur API Anthropic**
```json
{
  "error": "Anthropic API error: [détails]"
}
```

3. **Erreur serveur**
```json
{
  "error": "Erreur serveur: [détails]"
}
```

---

## Fonctions d'appel API (utils.ts)

### 1. generateThemesForGoal

**Objectif:** Générer 2-10 thèmes pour un objectif donné

**Signature:**
```typescript
async function generateThemesForGoal(goalLabel: string): Promise<Goal>
```

**Paramètres:**
- `goalLabel` - Label de l'objectif (ex: "Être en meilleure forme physique")

**Prompt envoyé:**
```
Analyse: "{goalLabel}"

Identifie 2-10 thèmes essentiels.

JSON:
{"themes": [{"id": "id", "name": "Nom"}]}
```

**Configuration API:**
- Model: `claude-sonnet-4-20250514`
- Max tokens: `800`

**Traitement réponse:**
1. Parse JSON de la réponse
2. Ajoute métadonnées à chaque thème:
   - `questsCompleted: 0`
   - `lastTouched: null`
   - `developmentLevel: "none"`
3. Construit objet Goal avec:
   - `id`: `goal-{timestamp}`
   - `label`: goalLabel
   - `themes`: array traité
   - `createdAt`: ISO string

**Retour:**
```typescript
{
  id: "goal-1738021234567",
  label: "Être en meilleure forme physique",
  themes: [
    {
      id: "cardio",
      name: "Cardio",
      questsCompleted: 0,
      lastTouched: null,
      developmentLevel: "none"
    },
    // ...
  ],
  createdAt: "2025-01-28T10:30:00.000Z"
}
```

**Gestion erreur:**
```javascript
try {
  // API call
} catch (err) {
  console.error('Theme generation failed:', err);
  throw err;
}
```

---

### 2. generateQuestsFromAPI

**Objectif:** Générer 3 quêtes quotidiennes personnalisées

**Signature:**
```typescript
async function generateQuestsFromAPI(
  recentQuests: string,
  goalsInfo: string,
  hasGoals: boolean
): Promise<Quest[]>
```

**Paramètres:**
- `recentQuests` - Liste des 15 dernières quêtes (éviter duplicatas)
- `goalsInfo` - Info détaillée sur objectifs et thèmes avec niveaux
- `hasGoals` - Boolean indiquant si l'utilisateur a des objectifs

**Prompt avec objectifs:**
```
Génère 3 quêtes quotidiennes. JSON uniquement.

{goalsInfo}

RÈGLE CRUCIALE - Difficulté adaptée au niveau:
- Thèmes "none" ou "low" (0-3 quêtes) → difficulté FACILE (découverte)
- Thèmes "medium" (4-7 quêtes) → difficulté MOYENNE (progression)
- Thèmes "high" ou "advanced" (8+ quêtes) → difficulté DIFFICILE (challenge)

La difficulté doit correspondre au niveau de développement du thème !

Priorité aux thèmes peu développés. Varie les thèmes.

Éviter: {recentQuests}

Format:
{"quests": [{"title": "Action", "category": "body|mind|environment|projects|social", "difficulty": "easy|medium|hard", "goalId": "goal-XXX", "themeId": "theme-id"}, ...]}
```

**Prompt sans objectifs:**
```
Génère 3 quêtes quotidiennes. JSON uniquement.

Amélioration générale, 1 facile, 1 moyen, 1 difficile

Éviter: {recentQuests}

Format:
{"quests": [{"title": "Action", "category": "body|mind|environment|projects|social", "difficulty": "easy|medium|hard"}, ...]}

1 facile, 1 moyen, 1 difficile.
```

**Format goalsInfo:**
```
Objectif "Être en meilleure forme":
  - Cardio (0 quêtes, niveau: none, difficulté suggérée: easy)
  - Renforcement (3 quêtes, niveau: low, difficulté suggérée: easy)
  - Nutrition (5 quêtes, niveau: medium, difficulté suggérée: medium)

Objectif "Apprendre le japonais":
  - Vocabulaire (10 quêtes, niveau: high, difficulté suggérée: hard)
```

**Configuration API:**
- Model: `claude-sonnet-4-20250514`
- Max tokens: `1000`

**Traitement réponse:**
1. Parse JSON
2. Map quêtes avec métadonnées:
   - `id`: `Date.now() + index`
   - `completed`: `false`
   - `type`: `'daily'`
   - `goalId`: depuis réponse ou `null`
   - `themeId`: depuis réponse ou `null`

**Retour:**
```typescript
[
  {
    id: 1738021234567,
    title: "Faire 20 minutes de cardio",
    category: "body",
    difficulty: "easy",
    completed: false,
    type: "daily",
    goalId: "goal-123",
    themeId: "cardio"
  },
  // ... 2 autres quêtes
]
```

---

### 3. generateLevelUpStoryFromAPI

**Objectif:** Générer un récit personnalisé pour un level up

**Signature:**
```typescript
async function generateLevelUpStoryFromAPI(
  newLevel: number,
  currentTitle: Title,
  goalsText: string,
  recentQuests: QuestHistory[],
  previousChapters: StoryChapter[]
): Promise<string>
```

**Paramètres:**
- `newLevel` - Nouveau niveau atteint
- `currentTitle` - Titre correspondant
- `goalsText` - Objectifs (labels séparés par virgules)
- `recentQuests` - 15 dernières quêtes (pour contexte)
- `previousChapters` - 2 derniers chapitres (pour continuité)

**Prompt:**
```
Niveau {newLevel} ({currentTitle.name}).

Objectifs: {goalsText || 'Amélioration'}

Quêtes:
- {quest1.title}
- {quest2.title}
...

Précédents:
{level1}: "{story1.substring(0, 80)}..."
{level2}: "{story2.substring(0, 80)}..."

Récit court (3-5 phrases), ton zen, pas de liste, progression visible.

Uniquement le récit.
```

**Configuration API:**
- Model: `claude-sonnet-4-20250514`
- Max tokens: `500`

**Exemple de récit généré:**
```
Ta pratique quotidienne commence à porter ses fruits. Les fondations que tu as posées avec patience se renforcent jour après jour. Cette constance dans l'effort te fait découvrir de nouvelles capacités. Continue sur cette voie, chaque pas compte.
```

**Retour:**
```typescript
string // Le récit généré, trimé
```

---

## Bonnes pratiques d'utilisation

### 1. Gestion des erreurs

Toujours wrapper dans try/catch:

```typescript
try {
  const result = await generateQuestsFromAPI(...);
  // Use result
} catch (err) {
  console.error('Generation failed:', err);
  // Fallback UI ou message utilisateur
  alert('Erreur génération');
}
```

### 2. Loading states

Afficher feedback pendant génération:

```typescript
setGenerating(true);
try {
  const quests = await generateQuestsFromAPI(...);
  setDailyQuests(quests);
} finally {
  setGenerating(false);
}
```

### 3. Rate limiting

Anthropic API a des limites:
- Éviter appels simultanés multiples
- Générer thèmes séquentiellement (onboarding)
- Batch requests si possible

### 4. Caching

Stratégies:
- ✅ Stocker quêtes générées (réinitialisation quotidienne)
- ✅ Stocker thèmes (pas de régénération)
- ✅ Stocker chapitres (historique)
- ❌ Ne pas recalculer inutilement

### 5. Parsing JSON robuste

Claude peut retourner markdown wrappé:

```typescript
const text = data.content[0].text
  .trim()
  .replace(/```json|```/g, '')
  .trim();
const parsed = JSON.parse(text);
```

---

## Configuration environnement

### Variables requises

**Production (Render):**
```bash
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
PORT=3000  # Optionnel, auto-assigné par Render
```

**Développement local:**
Créer `.env`:
```bash
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
PORT=3000
```

### Sécurité

✅ **Bon:**
- Clé stockée dans variable d'environnement
- Backend proxy pour tous les appels
- Aucune exposition client-side

❌ **Mauvais:**
```javascript
// NE JAMAIS FAIRE:
const apiKey = "sk-ant-api03-xxxxx"; // hardcodé
fetch('https://api.anthropic.com/v1/messages', {
  headers: { 'x-api-key': apiKey } // appel direct depuis frontend
});
```

---

## Coûts API

### Modèle utilisé
**claude-sonnet-4-20250514**

Tokens moyens par appel:
- `generateThemesForGoal`: ~200-400 tokens
- `generateQuestsFromAPI`: ~400-600 tokens
- `generateLevelUpStoryFromAPI`: ~300-500 tokens

### Optimisation coûts

1. **Limiter max_tokens** selon besoin réel
2. **Éviter duplicatas** - checker cache avant génération
3. **Batch operations** quand possible
4. **Prompts concis** mais précis

---

## Testing API

### Test manuel avec curl

**Générer thèmes:**
```bash
curl -X POST http://localhost:3000/api/anthropic \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-4-20250514",
    "max_tokens": 800,
    "messages": [{
      "role": "user",
      "content": "Analyse: \"Être en meilleure forme\"\n\nIdentifie 2-10 thèmes essentiels.\n\nJSON:\n{\"themes\": [{\"id\": \"id\", \"name\": \"Nom\"}]}"
    }]
  }'
```

### Test dans l'app

1. Ouvrir console navigateur
2. Onboarding → ajouter objectif
3. Vérifier network tab: `POST /api/anthropic`
4. Inspecter response

---

## Dépannage

### Erreur "ANTHROPIC_API_KEY non configurée"

**Cause:** Variable d'environnement manquante
**Solution:**
1. Vérifier `.env` en local
2. Vérifier variables Render en prod

### Erreur parsing JSON

**Cause:** Claude retourne texte mal formaté
**Solution:** Vérifier regex de nettoyage:
```typescript
.replace(/```json|```/g, '')
```

### Timeout

**Cause:** Réponse API lente
**Solution:** Augmenter timeout ou gérer avec retry logic

### Rate limit exceeded

**Cause:** Trop de requêtes simultanées
**Solution:** Implémenter queue ou throttling
