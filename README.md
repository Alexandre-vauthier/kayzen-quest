# ⚔️ Kaizen Quest

Application de gamification pour le développement personnel. Transformez votre vie en une aventure RPG !

## 🌟 Fonctionnalités

- **Système de quêtes quotidiennes** : 3 quêtes générées par jour, choisissez votre quête principale, les 2 autres deviennent des bonus (+50% XP)
- **Progression RPG** : Gagnez des niveaux et de l'XP en complétant vos quêtes
- **5 catégories de vie** : Corps, Esprit, Environnement, Projets, Social
- **Journée parfaite** : Complétez les 3 quêtes du jour pour un bonus spécial
- **5 badges déblocables** : Badges à débloquer selon vos accomplissements
- **Objectifs personnalisés** : Définissez vos propres objectifs avec des thèmes générés par IA
- **Génération IA** : Utilise Claude d'Anthropic pour générer des quêtes et récits personnalisés
- **Message IA de complétion** : Feedback motivant généré par IA à chaque quête validée
- **Historique narratif** : Une histoire de votre progression générée à chaque level up
- **Paramètres** : Page de paramètres avec accès au compte, notifications, CGU et support

## 🚀 Installation

### Prérequis

- Node.js 18+
- npm ou yarn

### Installation des dépendances

```bash
npm install
```

## 💻 Développement

Lancer le serveur de développement :

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 🏗️ Build

Construire l'application pour la production :

```bash
npm run build
```

Les fichiers de production seront générés dans le dossier `dist/`

## 🌐 Déploiement

Démarrer le serveur de production :

```bash
npm run build
npm start
```

Le serveur sera accessible sur `http://localhost:3000`

## 📁 Structure du projet

```
kayzen-quest/
├── src/
│   ├── components/          # Composants React
│   │   ├── KaizenQuest.tsx  # Composant principal
│   │   ├── QuestSelection.tsx # Sélection et affichage des quêtes
│   │   ├── OnboardingModal.tsx
│   │   ├── LevelUpPopup.tsx
│   │   ├── BadgePopup.tsx
│   │   ├── BadgesModal.tsx
│   │   ├── GoalsModal.tsx
│   │   ├── HistoryModal.tsx
│   │   └── SettingsModal.tsx
│   ├── types/               # Types TypeScript
│   │   └── types.ts
│   ├── utils/               # Utilitaires
│   │   ├── constants.ts     # Constantes de l'application
│   │   └── utils.ts         # Fonctions utilitaires
│   ├── main.tsx            # Point d'entrée
│   └── index.css           # Styles globaux
├── public/                  # Assets statiques
├── server.js               # Serveur Express
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

## 🎮 Utilisation

1. **Onboarding** : Choisissez vos objectifs de vie
2. **Génération de quêtes** : Cliquez sur "Générer" pour obtenir 3 quêtes quotidiennes personnalisées
3. **Sélection** : Choisissez votre quête du jour, les 2 autres deviennent des bonus (+50% XP)
4. **Complétion** : Validez vos quêtes pour gagner de l'XP et recevoir un message de motivation IA
5. **Progression** : Montez de niveau et débloquez des badges !

## 🔑 Configuration API

L'application utilise l'API Claude d'Anthropic pour la génération de contenu IA (quêtes, rituels, récits).

### Configuration locale

1. **Obtenir une clé API** sur [Anthropic Console](https://console.anthropic.com/)
2. **Créer un fichier `.env`** à la racine du projet :
   ```bash
   cp .env.example .env
   ```
3. **Ajouter votre clé API** dans le fichier `.env` :
   ```
   ANTHROPIC_API_KEY=sk-ant-api03-...
   ```

### Configuration sur Render

1. Accédez à votre service sur [Render Dashboard](https://dashboard.render.com)
2. Allez dans **Environment** → **Environment Variables**
3. Ajoutez la variable :
   - **Key** : `ANTHROPIC_API_KEY`
   - **Value** : Votre clé API Anthropic
4. Sauvegardez et redéployez

**Note** : La clé API est maintenant gérée de manière sécurisée côté serveur via le backend proxy `/api/anthropic`. Elle n'est jamais exposée côté client.

## 🛠️ Technologies utilisées

- **React 18** - Framework UI
- **TypeScript** - Typage statique
- **Vite** - Build tool
- **Tailwind CSS** - Framework CSS
- **Lucide React** - Icônes
- **Express** - Serveur web
- **Claude API** - Génération de contenu IA

## 📝 Scripts disponibles

- `npm run dev` - Lance le serveur de développement
- `npm run build` - Construit l'application pour la production
- `npm run preview` - Prévisualise le build de production
- `npm start` - Démarre le serveur Express en production

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

MIT

---

Développé avec ❤️ et inspiré par la philosophie Kaizen 🌱
