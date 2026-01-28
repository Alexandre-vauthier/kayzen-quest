# Composants - Kaizen Quest

Documentation complète de tous les composants React de l'application.

---

## KaizenQuest.tsx

**Type:** Composant principal / Container
**Fichier:** `src/components/KaizenQuest.tsx`

### Description
Composant racine de l'application. Gère l'état global, la logique métier, et orchestre tous les sous-composants.

### État principal

```typescript
// Player state
const [player, setPlayer] = useState<Player>({
  name: "Aventurier",
  level: 1,
  xp: 0,
  xpToNext: 100,
  badges: [],
  questsCompleted: 0,
  hardQuestsCompleted: 0,
  perfectDays: 0,
  goals: [],
  storyChapters: [],
  onboardingComplete: false
});

// Quests state
const [dailyQuests, setDailyQuests] = useState<DailyQuests>({
  quests: [],
  selectedQuestId: null,
  date: new Date().toDateString()
});

// UI state
const [questHistory, setQuestHistory] = useState<QuestHistory[]>([]);
const [showBadges, setShowBadges] = useState(false);
const [showGoals, setShowGoals] = useState(false);
const [showHistory, setShowHistory] = useState(false);
const [showOnboarding, setShowOnboarding] = useState(false);

// Loading states
const [generating, setGenerating] = useState(false);
const [generatingStory, setGeneratingStory] = useState(false);
const [generatingThemes, setGeneratingThemes] = useState(false);

// Popup states
const [levelUpPopup, setLevelUpPopup] = useState<LevelUpPopupData | null>(null);
const [badgePopup, setBadgePopup] = useState<Badge | null>(null);
const [perfectDayPopup, setPerfectDayPopup] = useState(false);

// Goals input
const [newGoal, setNewGoal] = useState('');
const [selectedPresetGoals, setSelectedPresetGoals] = useState<string[]>([]);
```

### Fonctions principales

#### `checkBadges(newPlayerData: Player)`
Vérifie et débloque les nouveaux succès.
- Parcourt `allBadges`
- Vérifie les conditions
- Affiche popup si nouveau succès

#### `completeOnboarding()`
Finalise l'onboarding et génère les thèmes.
- Combine preset goals + custom goal
- Génère thèmes via API séquentiellement
- Marque `onboardingComplete = true`

#### `addGoal()`
Ajoute un nouvel objectif.
- Génère thèmes via API
- Met à jour `player.goals`

#### `removeGoal(goalId: string)`
Supprime un objectif et ses thèmes.

#### `generateQuests()`
Génère 3 quêtes quotidiennes.
- Récupère historique (éviter duplicatas)
- Construit info objectifs avec niveaux
- Appelle `generateQuestsFromAPI`
- Met à jour `dailyQuests`

#### `selectQuest(questId: number)`
Sélectionne la quête du jour.
- Met quête en status `selected`
- Autres quêtes → `bonus`
- Ferme automatiquement section bonus (via useEffect dans QuestSelection)

#### `updateThemeProgress(goalId, themeId)`
Met à jour progression d'un thème.
- Incrémente `questsCompleted`
- Calcule nouveau `developmentLevel`
- Met à jour `lastTouched`

#### `completeQuest(questId: number)`
Complète une quête.
1. Met à jour progression thème si applicable
2. Calcule XP (avec bonus si quête bonus)
3. Vérifie level up
4. Met à jour player stats
5. Vérifie journée parfaite (3/3 quêtes)
6. Ajoute à l'historique
7. Vérifie nouveaux badges
8. Génère histoire si level up

#### `generateLevelUpStory(newPlayerData, newLevel, currentTitle, previousTitle)`
Génère l'histoire de level up.
- Appelle API avec contexte
- Crée nouveau chapitre
- Affiche popup avec histoire

### Hooks useEffect

**1. Réinitialisation quotidienne**
```typescript
useEffect(() => {
  const checkDailyReset = () => {
    const today = new Date().toDateString();
    if (dailyQuests.date !== today) {
      setDailyQuests({ quests: [], selectedQuestId: null, date: today });
    }
  };
  checkDailyReset();
  const interval = setInterval(checkDailyReset, 60000);
  return () => clearInterval(interval);
}, [dailyQuests.date]);
```

**2. Chargement initial**
```typescript
useEffect(() => {
  const loadData = async () => {
    // Charge player, quests, history depuis localStorage
    // Affiche onboarding si nouveau joueur
  };
  loadData();
}, []);
```

**3. Sauvegarde automatique**
```typescript
useEffect(() => {
  if (player.onboardingComplete) saveData();
}, [player, dailyQuests, questHistory]);
```

### Rendu

Affiche OnboardingModal OU l'interface principale avec:
- Player Card (nom, niveau, XP, boutons modaux)
- Section Quêtes du jour
- Popups (level up, badge, perfect day)
- Modals (histoire, objectifs, succès)

---

## OnboardingModal.tsx

**Type:** Modal
**Fichier:** `src/components/OnboardingModal.tsx`

### Props

```typescript
interface OnboardingModalProps {
  selectedPresetGoals: string[];
  newGoal: string;
  generatingThemes: boolean;
  onTogglePresetGoal: (goalId: string) => void;
  onNewGoalChange: (value: string) => void;
  onComplete: () => void;
}
```

### Description
Premier écran affiché aux nouveaux utilisateurs pour définir leurs objectifs.

### Structure
1. **Champ personnalisé** (en haut)
   - Label: "Ton objectif"
   - Placeholder: "Indiquez sur quoi vous souhaitez progresser"

2. **Liste preset goals** (8 boutons)
   - Sélection multiple
   - États actif/inactif visuellement distingués

3. **Bouton Commencer**
   - Désactivé si aucun objectif
   - Affiche loader pendant génération thèmes

### UX
- Full screen modal
- Gradient background
- Bouton désactivé tant que génération en cours
- Feedback visuel sur sélection

---

## QuestSelection.tsx

**Type:** Présentation
**Fichier:** `src/components/QuestSelection.tsx`

### Props

```typescript
interface QuestSelectionProps {
  quests: Quest[];
  selectedQuestId: number | null;
  onSelectQuest: (questId: number) => void;
  onCompleteQuest: (questId: number) => void;
}
```

### Description
Affiche et gère les 3 quêtes quotidiennes (sélection + bonus).

### État local
```typescript
const [showBonusQuests, setShowBonusQuests] = useState(true);
```

### Logique d'affichage

**3 sections possibles:**

1. **Section quête sélectionnée** (si `selectedQuestId !== null`)
   - Titre: "⭐ Ta quête du jour"
   - Carte de la quête avec badge "Quête du jour"
   - Bouton "Valider la quête"

2. **Section choix de quête** (si `selectedQuestId === null && availableQuests.length > 0`)
   - Titre: "⭐ Choisis ta quête du jour"
   - Liste des quêtes avec bouton "Choisir"

3. **Section quêtes bonus** (collapsible)
   - Titre: "⭐ Quêtes bonus (+50% XP) (X restantes)"
   - Toggle expand/collapse
   - Auto-collapse après sélection quête principale

### Fonction renderQuestCard(quest, isMain)

Rend une carte de quête avec:
- **Header**: Icône catégorie + Titre (full width)
- **Badges**: XP, Bonus +50%, Quête du jour
- **Footer**: Bouton action (Choisir / Valider / Complété)

**Layout:**
```
┌─────────────────────────┐
│ 🎯 Titre de la quête    │
├─────────────────────────┤
│ +15 XP  ⭐ Bonus +50%   │
├─────────────────────────┤
│     [Valider la quête]  │
└─────────────────────────┘
```

### Styles conditionnels
- Bordure violette si quête du jour
- Bordure couleur difficulté (vert/jaune/rouge)
- Opacité réduite si complétée
- Hover effect si non complétée

---

## BadgesModal.tsx

**Type:** Modal
**Fichier:** `src/components/BadgesModal.tsx`

### Props

```typescript
interface BadgesModalProps {
  player: Player;
  onClose: () => void;
}
```

### Description
Affiche les succès du joueur avec statistiques.

### Structure

**1. Header**
- Titre: "Succès"
- Bouton fermer

**2. Section statistiques** (2 colonnes)
- Quêtes complétées
- Journées parfaites

**3. Grille succès** (3 colonnes)
- 5 badges totaux
- Débloqués: couleur + animation pulse
- Verrouillés: grayscale + opacité 50%

### Badges affichés
1. Premier Pas 🔥
2. Explorateur 🌟
3. Maître 🏆
4. Centurion 💯
5. Perfectionniste ⚡

---

## BadgePopup.tsx

**Type:** Notification
**Fichier:** `src/components/BadgePopup.tsx`

### Props

```typescript
interface BadgePopupProps {
  badge: Badge;
}
```

### Description
Popup temporaire (4s) en haut à droite pour notifier nouveau succès.

### Contenu
- Emoji du badge (grande taille, animation bounce)
- Label "SUCCÈS !"
- Nom du badge

### Style
- Gradient coloré (jaune/orange/rose)
- Position fixed top-right
- Auto-dismiss après 4s

---

## GoalsModal.tsx

**Type:** Modal
**Fichier:** `src/components/GoalsModal.tsx`

### Props

```typescript
interface GoalsModalProps {
  goals: Goal[];
  newGoal: string;
  generatingThemes: boolean;
  onClose: () => void;
  onNewGoalChange: (value: string) => void;
  onAddGoal: () => void;
  onRemoveGoal: (goalId: string) => void;
}
```

### Description
Gestion des objectifs et thèmes.

### Structure

**1. Liste objectifs existants**
Pour chaque goal:
- Label objectif avec bouton supprimer
- Liste thèmes avec:
  - Nom du thème
  - Niveau de développement (none/low/medium/high/advanced)
  - Nombre de quêtes complétées
  - Couleur badge selon niveau

**2. Ajout nouvel objectif**
- Input texte
- Bouton "Ajouter"
- Support Enter key
- Loader pendant génération

### Gestion événements
```typescript
const handleKeyPress = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter') {
    onAddGoal();
  }
};
```

---

## HistoryModal.tsx

**Type:** Modal
**Fichier:** `src/components/HistoryModal.tsx`

### Props

```typescript
interface HistoryModalProps {
  storyChapters: StoryChapter[];
  onClose: () => void;
}
```

### Description
Affiche les chapitres d'histoire générés à chaque level up.

### Structure
- Liste chronologique des chapitres
- Pour chaque chapitre:
  - Niveau
  - Titre (rang)
  - Histoire (récit généré)
  - Date

### État vide
Message si aucun chapitre encore débloqué.

---

## LevelUpPopup.tsx

**Type:** Popup
**Fichier:** `src/components/LevelUpPopup.tsx`

### Props

```typescript
interface LevelUpPopupProps {
  data: LevelUpPopupData;
  generatingStory: boolean;
}

interface LevelUpPopupData {
  level: number;
  title: Title;
  titleChanged: boolean;
  story: string | null;
}
```

### Description
Popup célébration level up (8s).

### Contenu
- Emoji du titre (grande taille, pulse)
- "NIVEAU X !"
- Si nouveau titre: "Tu es [Titre] !"
- Histoire générée (ou loader si en génération)

### Style
- Gradient animé
- Centré écran
- Fond semi-transparent
- Auto-dismiss après 8s

---

## Composants helper (non-React)

### constants.ts

Exporte:
- `difficultyXP: Record<DifficultyLevel, number>`
- `BONUS_QUEST_MULTIPLIER = 1.5`
- `categories: Record<string, Category>` (5 catégories avec icônes)
- `titles: Title[]` (6 titres progressifs)
- `presetGoals: PresetGoal[]` (8 objectifs prédéfinis)
- `allBadges: Badge[]` (5 badges avec conditions)
- `difficultyColors: Record<DifficultyLevel, string>` (classes Tailwind)

### utils.ts

Fonctions:
- `getWeekStart(): string` - Calcule début de semaine
- `getPlayerTitle(level: number): Title` - Trouve titre selon niveau
- `generateThemesForGoal(goalLabel: string): Promise<Goal>` - API call
- `generateQuestsFromAPI(recentQuests, goalsInfo, hasGoals): Promise<Quest[]>` - API call
- `generateLevelUpStoryFromAPI(level, title, goalsText, recentQuests, previousChapters): Promise<string>` - API call

---

## Patterns communs

### Gestion des modals
```typescript
const [showModal, setShowModal] = useState(false);

// Ouverture
<button onClick={() => setShowModal(true)}>Ouvrir</button>

// Modal
{showModal && <Modal onClose={() => setShowModal(false)} />}
```

### Loading states
```typescript
const [loading, setLoading] = useState(false);

const action = async () => {
  setLoading(true);
  try {
    await apiCall();
  } finally {
    setLoading(false);
  }
};

// UI
{loading ? <Loader /> : <Button />}
```

### Conditional rendering
```typescript
{condition && <Component />}
{condition ? <ComponentA /> : <ComponentB />}
```

### Popup avec auto-dismiss
```typescript
const [showPopup, setShowPopup] = useState(false);

useEffect(() => {
  if (showPopup) {
    const timer = setTimeout(() => setShowPopup(false), 4000);
    return () => clearTimeout(timer);
  }
}, [showPopup]);
```
