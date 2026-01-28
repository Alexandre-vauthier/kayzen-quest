# Guide de Déploiement - Kaizen Quest

Documentation complète pour déployer l'application en production et développement.

---

## Prérequis

### Comptes requis
- ✅ Compte GitHub (pour héberger le code)
- ✅ Compte Render (pour héberger l'app)
- ✅ Compte Anthropic (pour la clé API Claude)

### Outils locaux
- Node.js 18+ et npm
- Git
- Éditeur de code (VS Code recommandé)

---

## Configuration initiale

### 1. Obtenir une clé API Anthropic

1. Aller sur [console.anthropic.com](https://console.anthropic.com/)
2. Se connecter / Créer un compte
3. Aller dans Settings → API Keys
4. Créer une nouvelle clé
5. **Copier immédiatement** (ne sera plus affichée)
6. Format: `sk-ant-api03-xxxxx...`

**Important:** Ne JAMAIS commiter la clé dans le code!

### 2. Configurer le dépôt Git

```bash
# Cloner le projet
git clone https://github.com/Alexandre-vauthier/kayzen-quest.git
cd kayzen-quest

# Installer dépendances
npm install
```

---

## Déploiement sur Render

### Étape 1: Créer le Web Service

1. Se connecter sur [render.com](https://render.com)
2. Dashboard → "New +" → "Web Service"
3. Connecter le dépôt GitHub
4. Sélectionner `kayzen-quest`

### Étape 2: Configuration du service

**Settings:**
```
Name: kayzen-quest (ou autre)
Region: Frankfurt (Europe Central)
Branch: main
Root Directory: (laisser vide)
Runtime: Node
Build Command: npm install && npm run build
Start Command: node server.js
Instance Type: Free (ou supérieur)
```

### Étape 3: Variables d'environnement

Dans "Environment" tab:

**ANTHROPIC_API_KEY** (obligatoire)
```
sk-ant-api03-votre_clé_ici
```

**PORT** (optionnel)
```
3000
```
Note: Render assigne automatiquement le port, mais on peut le définir.

### Étape 4: Déploiement

1. Cliquer "Create Web Service"
2. Render va:
   - Cloner le repo
   - Installer les dépendances
   - Builder avec Vite
   - Démarrer le serveur Express
3. Attendre quelques minutes
4. L'app sera disponible sur: `https://kayzen-quest.onrender.com` (ou URL assignée)

### Étape 5: Vérification

1. Ouvrir l'URL Render
2. Tester l'onboarding
3. Générer des quêtes
4. Vérifier les logs Render si erreur

---

## Déploiement automatique (CI/CD)

### Configuration actuelle

**Déclencheur:** Push sur la branche `main`

**Process:**
```
Git push → GitHub → Render détecte → Build & Deploy automatique
```

### Workflow

1. Développer localement
2. Commit + push:
```bash
git add .
git commit -m "Description changements"
git push origin main
```
3. Render redéploie automatiquement
4. Consulter logs dans Render dashboard

### Build logs

Dans Render dashboard:
- Voir progression du build
- Erreurs de compilation
- Warnings
- Temps de build

### Application logs

Dans "Logs" tab:
- Requêtes HTTP
- Erreurs serveur
- console.log du code
- Erreurs API Anthropic

---

## Développement local

### Configuration

1. **Créer fichier `.env`** à la racine:
```bash
ANTHROPIC_API_KEY=sk-ant-api03-votre_clé_ici
PORT=3000
```

2. **Ajouter `.env` au `.gitignore`** (déjà fait):
```
# .gitignore
.env
```

### Lancer en dev

**Terminal 1 - Vite dev server:**
```bash
npm run dev
```
Ouvre `http://localhost:5173`

**Terminal 2 - Backend Express:**
```bash
node server.js
```
Backend sur `http://localhost:3000`

**Configuration Vite pour proxy:**
```javascript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
});
```

### Build local (test production)

```bash
# Build
npm run build

# Serve
npm start
# OU
node server.js
```

Ouvre `http://localhost:3000`

---

## Structure de déploiement

### Fichiers clés

```
kayzen-quest/
├── server.js              # Backend Express (point d'entrée production)
├── dist/                  # Build Vite (généré par npm run build)
│   ├── index.html
│   ├── assets/
│   │   ├── index-xxx.js
│   │   └── index-xxx.css
│   └── ...
├── .env                   # Variables locales (NON commité)
├── .env.example           # Template pour .env
└── package.json
```

### Process de build

```
Source TypeScript + React
         ↓
    Vite build
         ↓
  dist/ (optimisé)
         ↓
  Express serve dist/
         ↓
   Production ready
```

---

## Dépannage

### Erreur "ANTHROPIC_API_KEY non configurée"

**Cause:** Variable d'environnement manquante

**Solution:**
1. Vérifier `.env` en local
2. Vérifier variables Render en production:
   - Dashboard → Service → Environment
   - Vérifier présence de `ANTHROPIC_API_KEY`
   - Vérifier format: `sk-ant-api03-...`
3. Redéployer après ajout

### Erreur 404 sur routes

**Cause:** Express ne sert pas correctement le frontend

**Solution:**
Vérifier `server.js`:
```javascript
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
```

### Build fails sur Render

**Causes possibles:**
1. Erreur TypeScript
2. Dépendance manquante
3. Mémoire insuffisante (free tier)

**Solutions:**
1. Tester build local: `npm run build`
2. Vérifier les logs Render
3. Passer à instance payante si OOM

### API calls timeout

**Causes:**
1. Claude API lente
2. Prompt trop complexe
3. Rate limit atteint

**Solutions:**
1. Augmenter max_tokens
2. Simplifier prompts
3. Vérifier quotas Anthropic

### localStorage ne persiste pas

**Cause:** Utilisateur en navigation privée

**Solution:** Message d'avertissement dans l'UI

---

## Monitoring

### Métriques Render

Dashboard affiche:
- CPU usage
- Memory usage
- Response time
- Requests/min
- Uptime

### Logs à surveiller

**Erreurs critiques:**
```
ANTHROPIC_API_KEY non configurée
Anthropic API error
Save failed
Load failed
```

**Warnings:**
```
Theme generation failed
Quest generation failed
Story generation failed
```

### Alertes recommandées

Configurer dans Render:
- Service down
- High error rate
- High response time
- Memory exceeded

---

## Optimisations production

### 1. Caching

**Render auto-cache:**
- node_modules
- Build artifacts

**Browser caching:**
Assets Vite ont hash dans nom → cache infini

### 2. Compression

Express compression middleware:
```javascript
const compression = require('compression');
app.use(compression());
```

### 3. Rate limiting

Limiter requêtes API:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100 // max requests
});

app.use('/api/', limiter);
```

### 4. Error tracking

Intégrer Sentry:
```javascript
const Sentry = require("@sentry/node");

Sentry.init({ dsn: process.env.SENTRY_DSN });

app.use(Sentry.Handlers.errorHandler());
```

---

## Backup et restauration

### Backup localStorage

**Fonctionnalité à ajouter:**
```javascript
// Export data
const exportData = () => {
  const data = {
    player: localStorage.getItem('kaizen-player'),
    quests: localStorage.getItem('kaizen-daily-quests'),
    history: localStorage.getItem('kaizen-history')
  };

  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'kaizen-backup.json';
  a.click();
};

// Import data
const importData = (file) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = JSON.parse(e.target.result);
    localStorage.setItem('kaizen-player', data.player);
    localStorage.setItem('kaizen-daily-quests', data.quests);
    localStorage.setItem('kaizen-history', data.history);
    window.location.reload();
  };
  reader.readAsText(file);
};
```

---

## Scaling

### Horizontal scaling

Render supporte:
- Load balancing automatique
- Multiple instances
- Auto-scaling

**Attention:** localStorage local ne scale pas
→ Migrer vers DB pour multi-instances

### Vertical scaling

Free tier:
- 512 MB RAM
- 0.1 CPU

Upgrade:
- Starter: $7/mois
- Standard: $25/mois
- Plus de resources

### Migration vers DB

Pour scaling futur:
1. PostgreSQL sur Render
2. Remplacer localStorage
3. API CRUD
4. Sessions utilisateurs

---

## Sécurité production

### Checklist

✅ **Clé API:**
- Stockée en variable d'environnement
- Jamais dans le code
- Jamais dans les logs

✅ **HTTPS:**
- Automatique avec Render
- Certificat SSL gratuit

✅ **CORS:**
- Configuré dans Express
- Limiter origins en production

✅ **Rate limiting:**
- Protège contre abus API
- Limite coûts Anthropic

✅ **Input validation:**
- Valider tous les inputs utilisateur
- Sanitize avant envoi à API

✅ **Error handling:**
- Ne pas exposer stack traces
- Messages génériques au client

---

## Commandes utiles

### Développement
```bash
npm run dev          # Dev server Vite
node server.js       # Backend Express
npm run build        # Build production
npm start            # Serve production build
```

### Git
```bash
git status           # Voir changements
git add .            # Stager tous
git commit -m "msg"  # Commit
git push origin main # Push & deploy
git log              # Historique commits
```

### Render CLI (optionnel)
```bash
npm install -g render-cli
render login
render services list
render logs
render deploy
```

---

## Ressources

### Documentation
- [Render Docs](https://render.com/docs)
- [Vite Docs](https://vitejs.dev/)
- [Anthropic API Docs](https://docs.anthropic.com/)

### Support
- Render: support@render.com
- Issues GitHub: [github.com/Alexandre-vauthier/kayzen-quest/issues](https://github.com/Alexandre-vauthier/kayzen-quest/issues)

### Monitoring
- Render Dashboard: [dashboard.render.com](https://dashboard.render.com)
- Anthropic Console: [console.anthropic.com](https://console.anthropic.com)
