# Documentation Kaizen Quest

Bienvenue dans la documentation complète de Kaizen Quest!

---

## 📚 Table des matières

### 🏗️ [ARCHITECTURE.md](./ARCHITECTURE.md)
**Architecture et design de l'application**

Contenu:
- Vue d'ensemble technique (stack, structure)
- Architecture des données et flux
- Systèmes principaux (quêtes, progression, objectifs, succès, récits)
- Communication avec l'API
- Décisions architecturales
- Points d'extension futurs

**À lire en premier** pour comprendre la structure globale du projet.

---

### 🧩 [COMPONENTS.md](./COMPONENTS.md)
**Documentation complète des composants React**

Contenu:
- KaizenQuest.tsx (composant racine)
- Tous les modals et popups
- Props, état, fonctions de chaque composant
- Patterns communs et bonnes pratiques
- Gestion événements et rendu conditionnel

**Essentiel** pour travailler sur l'UI ou ajouter des composants.

---

### 🔌 [API.md](./API.md)
**Documentation de l'API backend et Anthropic**

Contenu:
- Backend Express (server.js)
- Endpoint `/api/anthropic`
- Fonctions de génération (thèmes, quêtes, histoires)
- Format des requêtes/réponses
- Gestion erreurs et debugging
- Optimisation coûts API
- Testing et dépannage

**Crucial** pour comprendre l'intégration IA et résoudre problèmes API.

---

### 🗄️ [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md)
**Gestion d'état, persistance et synchronisation**

Contenu:
- Structure complète de l'état React
- Persistance localStorage (3 clés)
- Cycle de vie des données (init, save, reset)
- Patterns de mutations immutables
- États dérivés et optimisations
- Gestion formulaires et popups
- Debugging et outils

**Indispensable** pour manipuler les données et éviter les bugs d'état.

---

### 🚀 [DEPLOYMENT.md](./DEPLOYMENT.md)
**Guide de déploiement production et développement**

Contenu:
- Configuration initiale (API keys, Git)
- Déploiement Render (step-by-step)
- CI/CD automatique
- Développement local
- Dépannage erreurs courantes
- Monitoring et alertes
- Optimisations production
- Sécurité et scaling

**Obligatoire** pour déployer l'app ou configurer son environnement local.

---

## 📝 [CHANGELOG.md](../CHANGELOG.md)
**Historique des versions et changements**

Contenu:
- Versions chronologiques (format Keep a Changelog)
- Features ajoutées/modifiées/supprimées
- Breaking changes et migrations
- Roadmap des prochaines versions

**Utile** pour comprendre l'évolution du projet et les migrations nécessaires.

---

## 🚦 Guide de lecture rapide

### Je veux...

**...comprendre comment fonctionne l'app**
→ Lire [ARCHITECTURE.md](./ARCHITECTURE.md)

**...modifier un composant existant**
→ Consulter [COMPONENTS.md](./COMPONENTS.md)

**...ajouter une nouvelle fonctionnalité**
1. [ARCHITECTURE.md](./ARCHITECTURE.md) - Comprendre où ça s'intègre
2. [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md) - Gérer l'état
3. [COMPONENTS.md](./COMPONENTS.md) - Implémenter l'UI

**...résoudre un bug avec l'API**
→ Debugger avec [API.md](./API.md)

**...déployer en production**
→ Suivre [DEPLOYMENT.md](./DEPLOYMENT.md)

**...voir ce qui a changé récemment**
→ Consulter [CHANGELOG.md](../CHANGELOG.md)

---

## 🎯 Conventions de documentation

### Mise à jour
La documentation doit être mise à jour **en même temps** que le code:
- Nouvelle feature → Ajouter dans COMPONENTS.md + ARCHITECTURE.md
- Changement API → Mettre à jour API.md
- Déploiement → Documenter dans DEPLOYMENT.md
- Release → Ajouter entrée dans CHANGELOG.md

### Format
- **Markdown** pour tous les fichiers
- **Sections claires** avec headers (#, ##, ###)
- **Exemples de code** avec syntax highlighting
- **Émojis** pour navigation rapide
- **Liens** entre documents pour navigation

### Style
- ✅ Concis mais complet
- ✅ Exemples pratiques
- ✅ Code snippets fonctionnels
- ✅ Captures d'écran si nécessaire
- ❌ Éviter jargon inutile
- ❌ Pas de documentation obsolète

---

## 🛠️ Outils recommandés

### Pour lire la documentation
- **VS Code** avec extension Markdown Preview
- **GitHub** (rendu automatique)
- **Notion** (import possible)

### Pour éditer
- **VS Code** avec extensions:
  - Markdown All in One
  - Markdown Preview Enhanced
  - markdownlint

### Pour générer diagrammes
- **Mermaid** (intégré GitHub)
- **draw.io**
- **Excalidraw**

---

## 📖 Documentation externe

### Technologies utilisées
- [React 18](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [Express.js](https://expressjs.com/)
- [Anthropic Claude API](https://docs.anthropic.com/)

### Ressources
- [Render Docs](https://render.com/docs) - Hébergement
- [Keep a Changelog](https://keepachangelog.com/) - Format CHANGELOG
- [Semantic Versioning](https://semver.org/) - Versioning

---

## 🤝 Contribuer à la documentation

### Ajouter une section
1. Identifier le bon fichier (ARCHITECTURE, COMPONENTS, API, etc.)
2. Trouver la section appropriée
3. Ajouter contenu avec exemples
4. Mettre à jour table des matières si nécessaire
5. Commit avec message clair: `docs: add XYZ section to COMPONENTS.md`

### Corriger une erreur
1. Identifier l'erreur
2. Corriger dans le fichier approprié
3. Vérifier cohérence avec reste de la doc
4. Commit: `docs: fix typo in API.md`

### Améliorer clarté
1. Lire section problématique
2. Réécrire avec plus de détails/exemples
3. Demander review si gros changement
4. Commit: `docs: improve STATE_MANAGEMENT clarity`

---

## 📞 Contact

Questions sur la documentation:
- Ouvrir une [issue GitHub](https://github.com/Alexandre-vauthier/kayzen-quest/issues)
- Tag: `documentation`

---

## 📄 License

Cette documentation est fournie avec le code source de Kaizen Quest.

---

Dernière mise à jour: 2026-01-28
Version docs: 1.0
