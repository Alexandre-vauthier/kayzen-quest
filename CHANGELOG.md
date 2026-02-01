# Changelog - Kaizen Quest

Historique des versions et changements majeurs de l'application.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).

---

## [1.3.0] - 2026-02-01

### Correctifs, améliorations UX et nouvelles fonctionnalités

#### Fixed
- **Affichage XP bonus corrigé** - Les 3 quêtes au chargement (statut `available`) affichaient toutes le XP bonus (+50%). Désormais seules les quêtes de statut `bonus` montrent le XP majoré.
- **Labels niveaux dans Objectifs** - Remplacement de "none(0)" par des labels français : Nouveau, Débutant, Intermédiaire, Avancé, Expert.

#### Changed
- **Progression XP facilitée** - Multiplicateur XP pour le niveau suivant réduit de x1.5 à x1.2 pour une montée de niveau plus accessible.

#### Added
- **Timer prochaine génération** - Compteur à rebours affiché à côté de "Quêtes du jour" indiquant le temps restant avant la réinitialisation quotidienne (minuit).
- **Quêtes bonus complétées visibles** - Les quêtes bonus terminées restent affichées dans la section bonus (grisées) au lieu de disparaître. Nouveau champ `wasBonus` sur l'interface Quest.
- **Message IA de complétion** - À chaque validation de quête, un message généré par IA s'affiche en toast (6s) décrivant le bénéfice concret de l'action accomplie.
- **Page Paramètres** - Icône engrenage discrète en haut à droite du titre. Modal avec 4 liens : Mon compte, Notifications, CGU, Support (pages vides pour le moment).
- **Nouveau composant SettingsModal** (`src/components/SettingsModal.tsx`)
- **Nouvelle fonction API** `generateQuestCompletionMessage` dans `utils.ts`

### De v1.2.0 vers v1.3.0

**Pas de breaking changes**
- Nouveau champ optionnel `wasBonus` sur Quest (rétrocompatible)
- Nouvelles fonctionnalités UI uniquement

---

## [1.2.0] - 2026-01-28

### Améliorations UX majeures

#### Changed
- **Onboarding redesigné**
  - Champ objectif personnalisé déplacé au-dessus de la liste des presets
  - Label changé: "Ou ton propre objectif" → "Ton objectif"
  - Placeholder plus explicite: "Indiquez sur quoi vous souhaitez progresser"

- **Player Card réorganisée**
  - Suppression des 3 blocs de stats (Quêtes/Perfect Days/Badges)
  - Remplacement par 3 boutons icônés: Histoire, Objectifs, Succès
  - Interface plus épurée et navigable

- **Renommage "Badges" → "Succès"**
  - Modal renommé
  - Popup de notification mise à jour
  - Label Player Card changé
  - Cohérence terminologique dans toute l'app

- **Quest Cards refondues**
  - Titre prend désormais toute la largeur
  - Badges XP et bonus sur une seule ligne
  - Boutons positionnés en bas au lieu de sur le côté
  - Texte "Valider la quête" au lieu de "Terminé"
  - Suppression des pills de catégorie (Corps, Esprit...)
  - Layout plus lisible et moderne

- **Section Quêtes du jour améliorée**
  - Icône ⚠️ remplacée par ⭐ violet dans "Choisis ta quête du jour"
  - Bouton de génération centré sous le texte descriptif
  - Meilleure hiérarchie visuelle

#### Added
- **États de chargement AI visibles**
  - Loader lors de la génération de thèmes (onboarding + ajout objectif)
  - Loader lors de la génération de quêtes
  - Loader lors de la génération d'histoire (level up déjà existant)
  - Feedback utilisateur amélioré

- **Modal Succès enrichi**
  - Ajout de 2 compteurs en haut: Quêtes complétées et Journées parfaites
  - Statistiques centralisées et plus visibles

- **Auto-collapse section bonus**
  - Section quêtes bonus se ferme automatiquement après sélection quête principale
  - Réduction du scroll et focus sur la quête du jour
  - Réouverture manuelle possible

#### Removed
- Compteur "1/3 quêtes complétées" supprimé
- Pills de catégorie dans les quest cards (simplification visuelle)
- Blocs stats de la Player Card (remplacés par boutons modaux)

---

## [1.1.0] - 2026-01-27

### Sécurisation et refactoring

#### Added
- **Backend Express pour proxy API**
  - Endpoint `/api/anthropic` sécurisé
  - Protection de la clé API Anthropic côté serveur
  - Variables d'environnement (ANTHROPIC_API_KEY)
  - Configuration Render pour déploiement

#### Changed
- **Appels API refactorisés**
  - Migration de tous les appels Anthropic vers backend proxy
  - Suppression de l'exposition de la clé API côté client
  - Gestion d'erreurs améliorée

#### Security
- ✅ Clé API désormais stockée uniquement côté serveur
- ✅ Aucune exposition dans le code frontend
- ✅ Configuration via variables d'environnement

---

## [1.0.0] - 2026-01-26

### Simplification majeure - Focus sur la valeur

Grande refonte pour se concentrer sur les fonctionnalités à forte valeur ajoutée.

#### Removed - Systèmes supprimés
- **Système de quêtes hebdomadaires/principales** - Trop complexe
  - Main quests supprimées
  - Weekly quests supprimées
  - Focus uniquement sur quêtes quotidiennes

- **Système de momentum/streaks** - Gamification excessive
  - dailyStreak retiré
  - lastCompletionDate retiré
  - Motivation intrinsèque privilégiée

- **Système de rituels** - Doublon avec quêtes
  - Rituels supprimés entièrement
  - generateRitualsFromAPI retiré
  - RitualsModal supprimé

- **Stats par catégorie** - Complexité inutile
  - body/mind/environment/projects/social stats retirés
  - PlayerStats interface supprimée

- **5 badges sur 10** - Trop nombreux
  - Conservés uniquement les 5 badges les plus significatifs
  - Focus sur milestones importants

#### Added - Nouveaux systèmes
- **Système de sélection de quête**
  - 3 quêtes générées par jour
  - Utilisateur choisit 1 "quête du jour"
  - 2 autres deviennent "quêtes bonus" avec +50% XP
  - États: available → selected/bonus → completed

- **Système "Journée Parfaite"**
  - Compléter les 3 quêtes = journée parfaite
  - Compteur `perfectDays` ajouté
  - Popup de célébration
  - Tracking dans l'historique

- **Nouveau composant QuestSelection**
  - Gestion complète du flux de quêtes
  - Section quête sélectionnée
  - Section quêtes bonus collapsible
  - UI/UX optimisée

#### Changed - Systèmes modifiés
- **Types TypeScript refondus**
  - Quest status: 'available' | 'selected' | 'bonus' | 'completed'
  - DailyQuests interface avec selectedQuestId
  - Player: ajout perfectDays, retrait des anciennes stats
  - QuestHistory: ajout wasPerfectDay

- **Badges réduits à 5**
  - Premier Pas 🔥 (1 quête)
  - Explorateur 🌟 (niveau 5)
  - Maître 🏆 (niveau 10)
  - Centurion 💯 (100 quêtes)
  - Perfectionniste ⚡ (25 quêtes difficiles)

- **Logique de génération de quêtes**
  - Adaptation de la difficulté selon niveau de développement thème
  - Prompts API optimisés
  - Meilleure personnalisation

#### Removed - Fichiers supprimés
- `src/components/RitualsModal.tsx`
- `src/components/NewQuestModal.tsx`
- `src/components/QuestCard.tsx`

---

## [0.2.0] - 2026-01-25

### Modularisation et architecture

#### Added
- **Structure de projet complète**
  - Types TypeScript (types.ts)
  - Constantes centralisées (constants.ts)
  - Utilitaires (utils.ts)
  - Composants modulaires

- **Composants créés**
  - OnboardingModal
  - BadgesModal
  - BadgePopup
  - GoalsModal
  - HistoryModal
  - LevelUpPopup
  - QuestCard
  - NewQuestModal (supprimé en v1.0.0)
  - RitualsModal (supprimé en v1.0.0)

- **Configuration build**
  - Vite configuration
  - TypeScript configuration
  - Tailwind CSS configuration
  - Package.json avec scripts

- **Système de goals et thèmes**
  - Objectifs personnalisables
  - Génération de thèmes par IA
  - Progression des thèmes (none → low → medium → high → advanced)
  - Influence sur difficulté des quêtes

- **Système de récits progressifs**
  - Génération d'histoire personnalisée à chaque level up
  - Continuité narrative
  - Ton zen et inspirant
  - Stockage des chapitres

#### Changed
- Migration de fichier monolithique vers architecture modulaire
- Séparation des responsabilités
- Amélioration de la maintenabilité

---

## [0.1.0] - 2026-01-24

### Version initiale - Monolithe

#### Added
- **Composant unique kaysen.ts**
  - Toute la logique dans un seul fichier
  - ~1500 lignes de code

- **Fonctionnalités de base**
  - Génération de quêtes IA
  - Système XP et niveaux
  - Badges
  - Rituels
  - Momentum/Streaks
  - Quêtes principales/weekly/daily
  - Stats par catégorie

- **Intégration IA**
  - Anthropic Claude API
  - Génération de contenu personnalisé
  - Prompts structurés

- **Persistance**
  - localStorage pour sauvegarder progression
  - 3 clés de stockage

- **UI/UX**
  - Tailwind CSS
  - Lucide icons
  - Modals et popups
  - Animations

---

## Format des versions

### [Major.Minor.Patch]

- **Major** (1.x.x) - Changements breaking, refonte majeure
- **Minor** (x.1.x) - Nouvelles fonctionnalités, améliorations
- **Patch** (x.x.1) - Corrections de bugs, petites modifications

### Types de changements

- **Added** - Nouvelles fonctionnalités
- **Changed** - Modifications de fonctionnalités existantes
- **Deprecated** - Fonctionnalités dépréciées (à retirer)
- **Removed** - Fonctionnalités supprimées
- **Fixed** - Corrections de bugs
- **Security** - Corrections de sécurité

---

## Prochaines versions planifiées

### [1.3.0] - Amélioration mobile
- [ ] Design responsive optimisé mobile
- [ ] Touch gestures
- [ ] PWA configuration

### [1.4.0] - Analytics et insights
- [ ] Dashboard de progression
- [ ] Graphiques statistiques
- [ ] Tendances et patterns

### [2.0.0] - Multi-utilisateurs
- [ ] Authentification
- [ ] Base de données (migration de localStorage)
- [ ] API REST complète
- [ ] Profils utilisateurs

### [2.1.0] - Features sociales
- [ ] Partage de quêtes
- [ ] Classements
- [ ] Communauté

---

## Notes de migration

### De v0.x.x vers v1.0.0

**Breaking changes:**
- Rituals system supprimé → aucune migration nécessaire
- Quest types changés → localStorage sera reset
- Player stats structure modifiée → migration automatique

**Migration localStorage:**
Le système détecte automatiquement et réinitialise si incompatibilité.

### De v1.0.0 vers v1.1.0

**Pas de breaking changes**
- Configuration backend requise
- Variables d'environnement à définir

### De v1.1.0 vers v1.2.0

**Pas de breaking changes**
- Changements UI uniquement
- Data structure inchangée
