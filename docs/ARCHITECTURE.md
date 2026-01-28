# Architecture - Kaizen Quest

## Vue d'ensemble

Kaizen Quest est une application de gamification de développement personnel construite avec React, TypeScript et Vite. L'application utilise l'API Anthropic Claude pour générer du contenu personnalisé (quêtes, thèmes, histoires).

## Stack technique

### Frontend
- **React 18** - Library UI
- **TypeScript** - Typage statique
- **Vite** - Build tool et dev server
- **Tailwind CSS** - Framework CSS utility-first
- **Lucide React** - Bibliothèque d'icônes

### Backend
- **Express.js** - Serveur Node.js
- **Anthropic API** - Génération de contenu IA (Claude Sonnet 4)

### Déploiement
- **Render** - Hébergement web

## Structure du projet

```
kayzen-quest/
├── public/               # Assets statiques
├── src/
│   ├── components/      # Composants React
│   │   ├── KaizenQuest.tsx          # Composant principal
│   │   ├── OnboardingModal.tsx      # Modal d'onboarding
│   │   ├── QuestSelection.tsx       # Sélection des quêtes
│   │   ├── BadgesModal.tsx          # Modal des succès
│   │   ├── BadgePopup.tsx           # Popup de notification succès
│   │   ├── GoalsModal.tsx           # Modal de gestion objectifs
│   │   ├── HistoryModal.tsx         # Modal historique/chapitres
│   │   └── LevelUpPopup.tsx         # Popup de level up
│   ├── types/
│   │   └── types.ts     # Définitions TypeScript
│   ├── utils/
│   │   ├── constants.ts # Constantes (badges, titres, XP...)
│   │   └── utils.ts     # Fonctions utilitaires et API calls
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── server.js            # Serveur Express (proxy API)
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Architecture des données

### Flux de données principal

```
User Action → Component → State Update → localStorage → UI Update
                    ↓
              API Call (si besoin)
                    ↓
            Backend Proxy (server.js)
                    ↓
              Anthropic API
                    ↓
            Response → State
```

### Stockage des données

**localStorage** est utilisé pour la persistance avec 3 clés:
- `kaizen-player` - État du joueur
- `kaizen-daily-quests` - Quêtes du jour
- `kaizen-history` - Historique des quêtes complétées

## Systèmes principaux

### 1. Système de quêtes quotidiennes

**Flow:**
1. Génération de 3 quêtes par jour via Claude API
2. Utilisateur sélectionne 1 quête comme "quête du jour"
3. Les 2 autres deviennent des "quêtes bonus" (+50% XP)
4. Complétion → gain XP → vérification level up et badges

**États des quêtes:**
- `available` - Quête générée, pas encore sélectionnée
- `selected` - Quête du jour choisie
- `bonus` - Quête bonus (non sélectionnée)
- `completed` - Quête terminée

### 2. Système de progression

**XP et niveaux:**
- XP de base par difficulté: Easy (10), Medium (25), Hard (50)
- Bonus XP quêtes bonus: x1.5
- XP requis pour level up: `xpToNext * 1.5` (croissance exponentielle)

**Titres progressifs:**
1. Aventurier (niv 1-5)
2. Disciple (niv 6-10)
3. Voyageur (niv 11-15)
4. Maître (niv 16-20)
5. Sage (niv 21-30)
6. Légende (niv 31+)

### 3. Système d'objectifs et thèmes

**Structure:**
- Goal (objectif) contient plusieurs Themes
- Themes progressent avec `questsCompleted`
- Niveau de développement: none → low → medium → high → advanced
- Le niveau influence la difficulté suggérée des quêtes

**Algorithme de progression des thèmes:**
```
0-3 quêtes   → low
4-7 quêtes   → medium
8-15 quêtes  → high
16+ quêtes   → advanced
```

### 4. Système de succès (badges)

5 succès principaux:
- **Premier Pas** 🔥 - 1ère quête
- **Explorateur** 🌟 - Niveau 5
- **Maître** 🏆 - Niveau 10
- **Centurion** 💯 - 100 quêtes
- **Perfectionniste** ⚡ - 25 quêtes difficiles

### 5. Système de "journée parfaite"

Compléter les 3 quêtes du jour = journée parfaite
- Incrémente `perfectDays`
- Affiche popup de célébration
- Trackée dans l'historique

### 6. Système de récits progressifs

À chaque level up:
- Génération d'un "chapitre" d'histoire personnalisée
- Basé sur: objectifs, quêtes récentes, chapitres précédents
- Stocké dans `storyChapters[]`
- Consultable via modal Histoire

## Communication avec l'API

### Backend Proxy Pattern

Pour sécuriser la clé API Anthropic:
```
Frontend → POST /api/anthropic → Backend → Anthropic API
```

**Endpoint:** `/api/anthropic`
**Méthode:** POST
**Body:**
```json
{
  "model": "claude-sonnet-4-20250514",
  "max_tokens": 500-1000,
  "messages": [
    {
      "role": "user",
      "content": "prompt..."
    }
  ]
}
```

### Fonctions de génération

**1. `generateThemesForGoal(goalLabel)`**
- Génère 2-10 thèmes pour un objectif
- Retourne: Goal avec themes[]

**2. `generateQuestsFromAPI(recentQuests, goalsInfo, hasGoals)`**
- Génère 3 quêtes quotidiennes
- Adapte difficulté selon niveau de développement des thèmes
- Évite les duplicatas avec `recentQuests`

**3. `generateLevelUpStoryFromAPI(level, title, goalsText, recentQuests, previousChapters)`**
- Génère récit personnalisé niveau up
- Ton zen, 3-5 phrases
- Continuité narrative avec chapitres précédents

## Réinitialisation quotidienne

**Mécanisme:**
- Timer vérifie toutes les 60s si `dailyQuests.date !== today`
- Si jour différent → reset des quêtes
- Préserve l'historique et le joueur

## Performance et optimisation

### Chargement asynchrone
- États de chargement visibles: `generating`, `generatingStory`, `generatingThemes`
- Génération séquentielle des thèmes (onboarding) pour feedback progressif

### Gestion de l'état
- État local avec `useState`
- Sauvegarde automatique via `useEffect` sur changements
- Lecture initiale du localStorage au mount

## Sécurité

### API Key Protection
- ✅ Clé stockée côté serveur uniquement (variable d'environnement)
- ✅ Backend proxy pour toutes les requêtes Anthropic
- ✅ Aucune exposition client-side

### Validation
- TypeScript pour validation des types
- Vérifications avant appels API

## Décisions architecturales clés

### Pourquoi localStorage?
- Pas besoin de backend DB pour MVP
- Données sensibles limitées
- Expérience offline possible
- Simplicité de déploiement

### Pourquoi un backend Express?
- Proxy sécurisé pour API Anthropic
- Évolutif vers DB si besoin
- Contrôle des requêtes API

### Pourquoi React avec state local?
- Application de taille moyenne
- Pas besoin de Redux/Context pour la complexité actuelle
- Performance suffisante

## Points d'extension futurs

### Possibilités d'évolution:
1. **Base de données** - Migration PostgreSQL/MongoDB
2. **Authentification** - Multi-utilisateurs
3. **Social** - Partage de quêtes, classements
4. **Analytics** - Suivi détaillé progression
5. **Notifications** - Rappels quotidiens
6. **Mobile** - React Native ou PWA
7. **Gamification avancée** - Équipement, personnages, combos
