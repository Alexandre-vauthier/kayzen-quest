# Gestion d'État - Kaizen Quest

Documentation complète sur la gestion de l'état, la persistance et la synchronisation des données.

---

## Vue d'ensemble

L'application utilise **React state local** avec **localStorage** pour la persistance. Pas de Redux, Context API, ou state management externe.

**Pourquoi ce choix?**
- ✅ Application de taille moyenne
- ✅ État principalement localisé dans KaizenQuest.tsx
- ✅ Pas de prop drilling complexe
- ✅ Simplicité de maintenance
- ✅ Performance suffisante

---

## Structure de l'état

### État racine (KaizenQuest.tsx)

```typescript
// ========================================
// DONNÉES MÉTIER
// ========================================

// Player - Profil et progression
const [player, setPlayer] = useState<Player>({
  name: string;              // Titre actuel (ex: "Aventurier")
  level: number;             // Niveau (1+)
  xp: number;                // XP actuelle
  xpToNext: number;          // XP requis pour level up
  badges: string[];          // IDs des badges débloqués
  questsCompleted: number;   // Total quêtes complétées
  hardQuestsCompleted: number; // Quêtes difficiles complétées
  perfectDays: number;       // Journées parfaites (3/3)
  goals: Goal[];             // Objectifs avec thèmes
  storyChapters: StoryChapter[]; // Histoires de level up
  onboardingComplete: boolean;   // A fini l'onboarding
});

// DailyQuests - Quêtes du jour
const [dailyQuests, setDailyQuests] = useState<DailyQuests>({
  quests: Quest[];           // 3 quêtes générées
  selectedQuestId: number | null; // ID de la quête du jour
  date: string;              // Date génération (toDateString)
});

// QuestHistory - Historique complet
const [questHistory, setQuestHistory] = useState<QuestHistory[]>([
  {
    title: string;           // Titre de la quête
    date: string;            // Date complétion (ISO)
    goalId: string | null;   // ID objectif lié
    themeId: string | null;  // ID thème lié
    wasPerfectDay: boolean;  // Était la 3ème quête du jour
  }
]);

// ========================================
// ÉTAT UI (MODALS)
// ========================================

const [showBadges, setShowBadges] = useState<boolean>(false);
const [showGoals, setShowGoals] = useState<boolean>(false);
const [showHistory, setShowHistory] = useState<boolean>(false);
const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

// ========================================
// ÉTATS DE CHARGEMENT
// ========================================

const [generating, setGenerating] = useState<boolean>(false);
const [generatingStory, setGeneratingStory] = useState<boolean>(false);
const [generatingThemes, setGeneratingThemes] = useState<boolean>(false);

// ========================================
// POPUPS TEMPORAIRES
// ========================================

const [levelUpPopup, setLevelUpPopup] = useState<LevelUpPopupData | null>(null);
const [badgePopup, setBadgePopup] = useState<Badge | null>(null);
const [perfectDayPopup, setPerfectDayPopup] = useState<boolean>(false);

// ========================================
// FORMULAIRES
// ========================================

const [newGoal, setNewGoal] = useState<string>('');
const [selectedPresetGoals, setSelectedPresetGoals] = useState<string[]>([]);
```

---

## Persistance - localStorage

### Clés utilisées

```typescript
'kaizen-player'        // Profil joueur
'kaizen-daily-quests'  // Quêtes du jour
'kaizen-history'       // Historique quêtes
```

### Wrapper localStorage

L'app utilise `(window as any).storage` qui est un wrapper autour de localStorage:

```typescript
// Lecture
const playerData = await (window as any).storage.get('kaizen-player');
const parsed = JSON.parse(playerData.value);

// Écriture
await (window as any).storage.set('kaizen-player', JSON.stringify(player));
```

**Avantages du wrapper:**
- API async cohérente
- Gestion d'erreurs centralisée
- Extensible vers autre storage (IndexedDB, etc.)

---

## Cycle de vie des données

### 1. Initialisation (mount)

**Séquence au démarrage:**

```typescript
useEffect(() => {
  const loadData = async () => {
    try {
      // 1. Charger player
      const playerData = await storage.get('kaizen-player');
      if (playerData) {
        const loadedPlayer = JSON.parse(playerData.value);
        setPlayer(loadedPlayer);

        // Vérifier onboarding
        if (!loadedPlayer.onboardingComplete) {
          setShowOnboarding(true);
        }
      } else {
        // Nouveau joueur
        setShowOnboarding(true);
      }

      // 2. Charger quêtes (si même jour)
      const questsData = await storage.get('kaizen-daily-quests');
      if (questsData) {
        const loaded = JSON.parse(questsData.value);
        if (loaded.date === new Date().toDateString()) {
          setDailyQuests(loaded);
        }
      }

      // 3. Charger historique
      const historyData = await storage.get('kaizen-history');
      if (historyData) {
        setQuestHistory(JSON.parse(historyData.value));
      }
    } catch (err) {
      console.error('Load failed:', err);
      setShowOnboarding(true);
    }
  };

  loadData();
}, []);
```

### 2. Sauvegarde automatique

**Sauvegarde déclenchée à chaque modification:**

```typescript
useEffect(() => {
  if (player.onboardingComplete) {
    saveData();
  }
}, [player, dailyQuests, questHistory]);

const saveData = async () => {
  try {
    await storage.set('kaizen-player', JSON.stringify(player));
    await storage.set('kaizen-daily-quests', JSON.stringify(dailyQuests));
    await storage.set('kaizen-history', JSON.stringify(questHistory));
  } catch (err) {
    console.error('Save failed:', err);
  }
};
```

**Note:** On ne sauvegarde que si `onboardingComplete` pour éviter de sauver l'état initial.

### 3. Réinitialisation quotidienne

**Vérification toutes les 60 secondes:**

```typescript
useEffect(() => {
  const checkDailyReset = () => {
    const today = new Date().toDateString();
    if (dailyQuests.date !== today) {
      setDailyQuests({
        quests: [],
        selectedQuestId: null,
        date: today
      });
    }
  };

  checkDailyReset();
  const interval = setInterval(checkDailyReset, 60000);

  return () => clearInterval(interval);
}, [dailyQuests.date]);
```

**Comportement:**
- Compare date stockée vs date actuelle
- Si différente → reset quêtes
- **Préserve** player et historique

---

## Mutations d'état

### Pattern général

```typescript
// ❌ MAUVAIS - mutation directe
player.level = 2;

// ✅ BON - immutable update
setPlayer(prev => ({ ...prev, level: 2 }));
```

### Exemples de mutations complexes

**1. Ajouter un goal:**
```typescript
setPlayer(prev => ({
  ...prev,
  goals: [...(prev.goals || []), newGoal]
}));
```

**2. Supprimer un goal:**
```typescript
setPlayer(prev => ({
  ...prev,
  goals: (prev.goals || []).filter(g => g.id !== goalId)
}));
```

**3. Mettre à jour un thème dans un goal:**
```typescript
setPlayer(prev => ({
  ...prev,
  goals: prev.goals.map(goal => {
    if (goal.id !== goalId) return goal;

    return {
      ...goal,
      themes: goal.themes.map(theme => {
        if (theme.id !== themeId) return theme;

        return {
          ...theme,
          questsCompleted: theme.questsCompleted + 1,
          developmentLevel: calculateNewLevel(theme.questsCompleted + 1),
          lastTouched: new Date().toISOString()
        };
      })
    };
  })
}));
```

**4. Sélectionner une quête:**
```typescript
setDailyQuests(prev => ({
  ...prev,
  selectedQuestId: questId,
  quests: prev.quests.map(q => {
    if (q.id === questId) {
      return { ...q, status: 'selected', isSelectedQuest: true };
    } else if (q.status === 'available') {
      return { ...q, status: 'bonus', isSelectedQuest: false };
    }
    return q;
  })
}));
```

**5. Compléter une quête:**
```typescript
setDailyQuests(prev => ({
  ...prev,
  quests: prev.quests.map(q =>
    q.id === questId
      ? { ...q, status: 'completed', completedAt: new Date().toISOString() }
      : q
  )
}));
```

---

## États dérivés

Plutôt que de stocker des données calculées, on les dérive:

```typescript
// ✅ BON - calcul à la volée
const currentTitle = getPlayerTitle(player.level);
const selectedQuest = quests.find(q => q.id === selectedQuestId);
const availableQuests = quests.filter(q => q.status === 'available');
const bonusQuests = quests.filter(q => q.status === 'bonus');
const completedQuests = quests.filter(q => q.status === 'completed');

// ❌ ÉVITER - duplication de données
const [currentTitle, setCurrentTitle] = useState(...);
// → Risque de désynchronisation
```

---

## Gestion des formulaires

### Controlled inputs

```typescript
// État
const [newGoal, setNewGoal] = useState('');

// Input
<input
  value={newGoal}
  onChange={(e) => setNewGoal(e.target.value)}
/>

// Reset après submit
const addGoal = async () => {
  if (newGoal.trim()) {
    await generateThemesForGoal(newGoal.trim());
    setNewGoal(''); // Reset
  }
};
```

### Multi-select (preset goals)

```typescript
const [selectedPresetGoals, setSelectedPresetGoals] = useState<string[]>([]);

const toggleGoal = (goalId: string) => {
  if (selectedPresetGoals.includes(goalId)) {
    setSelectedPresetGoals(prev => prev.filter(id => id !== goalId));
  } else {
    setSelectedPresetGoals(prev => [...prev, goalId]);
  }
};
```

---

## Optimisations

### 1. Éviter re-renders inutiles

**Composants enfants stables:**
```typescript
// QuestSelection ne re-render que si props changent
<QuestSelection
  quests={dailyQuests.quests}
  selectedQuestId={dailyQuests.selectedQuestId}
  onSelectQuest={selectQuest}
  onCompleteQuest={completeQuest}
/>
```

**Fonctions callbacks:**
```typescript
// ✅ BON - fonctions stables définies dans le composant
const selectQuest = (questId: number) => { ... };

// ❌ ÉVITER - fonction inline dans render
<Button onClick={() => selectQuest(id)} />
// → Nouvelle fonction à chaque render
```

### 2. Batching des updates

React 18 batch automatiquement:
```typescript
// Ces 3 updates sont batchés en 1 seul re-render
setPlayer(...);
setDailyQuests(...);
setQuestHistory(...);
```

### 3. État local dans composants enfants

État UI temporaire reste local:
```typescript
// Dans QuestSelection.tsx
const [showBonusQuests, setShowBonusQuests] = useState(true);
// ✅ Pas besoin de remonter dans KaizenQuest
```

---

## Patterns de loading states

### Pattern 1: Boolean simple

```typescript
const [loading, setLoading] = useState(false);

const action = async () => {
  setLoading(true);
  try {
    await apiCall();
  } finally {
    setLoading(false); // Toujours reset
  }
};
```

### Pattern 2: Loading différenciés

```typescript
const [generating, setGenerating] = useState(false);
const [generatingStory, setGeneratingStory] = useState(false);
const [generatingThemes, setGeneratingThemes] = useState(false);

// UI peut afficher 3 loaders différents
{generating && <Loader text="Génération quêtes..." />}
{generatingStory && <Loader text="Écriture histoire..." />}
{generatingThemes && <Loader text="Création thèmes..." />}
```

---

## Gestion des popups

### Pattern avec auto-dismiss

```typescript
const [popup, setPopup] = useState<Data | null>(null);

// Afficher popup
setPopup(data);
setTimeout(() => setPopup(null), 4000);

// Render
{popup && <Popup data={popup} />}
```

### Pattern avec cleanup

```typescript
useEffect(() => {
  if (badgePopup) {
    const timer = setTimeout(() => setBadgePopup(null), 4000);
    return () => clearTimeout(timer); // Cleanup
  }
}, [badgePopup]);
```

---

## Debugging

### React DevTools

Inspecter état:
1. Installer React DevTools
2. Ouvrir Components tab
3. Sélectionner KaizenQuest
4. Voir tous les hooks

### Console logging

```typescript
useEffect(() => {
  console.log('Player updated:', player);
}, [player]);

useEffect(() => {
  console.log('Quests updated:', dailyQuests);
}, [dailyQuests]);
```

### localStorage inspection

Chrome DevTools:
1. Application tab
2. Storage → Local Storage
3. Voir les 3 clés kaizen-*
4. Éditer manuellement si besoin

---

## Migration future vers state management

Si l'app grandit, considérer:

### Option 1: Context API
```typescript
const GameContext = createContext();

function GameProvider({ children }) {
  const [player, setPlayer] = useState(...);
  // ... autres states

  return (
    <GameContext.Provider value={{ player, setPlayer, ... }}>
      {children}
    </GameContext.Provider>
  );
}
```

### Option 2: Zustand (léger)
```typescript
import create from 'zustand';

const useGameStore = create((set) => ({
  player: initialPlayer,
  updatePlayer: (updates) => set((state) => ({
    player: { ...state.player, ...updates }
  })),
}));
```

### Option 3: Redux Toolkit
Pour applications très complexes seulement.

---

## Checklist état sain

✅ **Bonnes pratiques:**
- Immutabilité respectée
- Pas de mutation directe
- États dérivés calculés, pas stockés
- Loading states pour feedback UX
- Sauvegarde automatique sur changements
- Validation avant persistance

❌ **Anti-patterns:**
- `player.level++` (mutation directe)
- Dupliquer données entre states
- Oublier cleanup des timers
- Sauvegarder avant onboarding complet
- Perdre données sur erreur API
