import express from 'express';
import compression from 'compression';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import webPush from 'web-push';
import cron from 'node-cron';
import admin from 'firebase-admin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

// --- Firebase Admin ---
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
let firestore = null;
if (serviceAccountJson) {
  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    firestore = admin.firestore();
    console.log('🔥 Firebase Admin initialisé');
  } catch (err) {
    console.error('❌ Erreur Firebase Admin:', err.message);
  }
}

// --- Web Push ---
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:contact@kaizenquest.app';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  console.log('🔔 Web Push configuré');
}

// --- Messages motivants ---
const motivationalMessages = [
  "C'est l'heure de progresser ! Tes quêtes t'attendent 🎯",
  "Chaque petit pas compte. Lance-toi dans tes quêtes du jour !",
  "Un jour de plus pour devenir la meilleure version de toi-même 💪",
  "Tes quêtes sont prêtes ! Le moment parfait pour agir, c'est maintenant.",
  "La régularité fait la différence. Ouvre tes quêtes !",
  "Nouveau jour, nouvelles quêtes ! Prêt à relever le défi ?",
  "Rappel : tes quêtes quotidiennes t'attendent. Tu gères ! 🚀",
  "Le changement commence par une action. Découvre tes quêtes du jour.",
  "Ta progression continue ! Viens voir tes quêtes 🌟",
  "Pas de jour sans progrès. Tes quêtes sont là pour toi !",
  "Aujourd'hui est une nouvelle chance de progresser. Tes quêtes t'attendent !",
  "Un petit effort quotidien mène à de grands résultats. C'est parti !",
  "Le meilleur investissement, c'est en toi-même. Ouvre tes quêtes ! 🎮",
  "Rappel amical : tes quêtes du jour sont prêtes à être complétées.",
  "Chaque quête complétée te rapproche de tes objectifs. Go ! ⚡",
];

// Middleware
app.use(compression());
app.use(cors());
app.use(express.json());

// Serve static files from the dist directory
app.use(express.static(join(__dirname, 'dist')));

// API routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasApiKey: !!ANTHROPIC_API_KEY
  });
});

// Proxy pour les appels à l'API Anthropic
app.post('/api/anthropic', async (req, res) => {
  try {
    if (!ANTHROPIC_API_KEY) {
      return res.status(500).json({
        error: 'ANTHROPIC_API_KEY non configurée sur le serveur'
      });
    }

    const { messages, max_tokens, model } = req.body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model || 'claude-sonnet-4-20250514',
        max_tokens: max_tokens || 1000,
        messages
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Erreur API Anthropic:', error);
      return res.status(response.status).json({
        error: 'Erreur lors de l\'appel à l\'API Anthropic',
        details: error
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Erreur serveur:', error);
    res.status(500).json({
      error: 'Erreur serveur lors de l\'appel à l\'API',
      message: error.message
    });
  }
});

// Test endpoint : envoie une notification immédiatement (à supprimer après debug)
app.get('/api/test-push', async (req, res) => {
  if (!firestore || !VAPID_PUBLIC_KEY) {
    return res.json({ error: 'Firebase ou VAPID non configuré', hasFirestore: !!firestore, hasVapid: !!VAPID_PUBLIC_KEY });
  }
  try {
    const snapshot = await firestore.collection('pushSubscriptions').where('enabled', '==', true).get();
    if (snapshot.empty) {
      return res.json({ error: 'Aucune subscription active trouvée', count: 0 });
    }
    const results = [];
    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (!data.subscription) {
        results.push({ uid: doc.id, status: 'skip', reason: 'no subscription' });
        continue;
      }
      const payload = JSON.stringify({
        title: 'Kaizen Quest - Test',
        body: 'Si tu vois ce message, les notifications fonctionnent !',
        url: '/',
      });
      try {
        await webPush.sendNotification(data.subscription, payload);
        results.push({ uid: doc.id, status: 'sent' });
      } catch (err) {
        results.push({ uid: doc.id, status: 'error', code: err.statusCode, message: err.message });
      }
    }
    res.json({ results });
  } catch (err) {
    res.json({ error: err.message });
  }
});

// SPA fallback - toutes les routes non-API retournent index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// --- Cron job : notifications push ---
if (firestore && VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  cron.schedule('* * * * *', async () => {
    try {
      const snapshot = await firestore
        .collection('pushSubscriptions')
        .where('enabled', '==', true)
        .get();

      if (snapshot.empty) return;

      const now = new Date();

      for (const doc of snapshot.docs) {
        const data = doc.data();
        if (!data.subscription || !data.time || !data.timezone) continue;

        // Calculate current time in the user's timezone
        let userTime;
        try {
          userTime = now.toLocaleTimeString('fr-FR', {
            timeZone: data.timezone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });
        } catch {
          userTime = now.toLocaleTimeString('fr-FR', {
            timeZone: 'Europe/Paris',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });
        }

        if (userTime !== data.time) continue;

        const message = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
        const payload = JSON.stringify({
          title: 'Kaizen Quest',
          body: message,
          url: '/',
        });

        try {
          await webPush.sendNotification(data.subscription, payload);
        } catch (err) {
          // Subscription expired or invalid
          if (err.statusCode === 410 || err.statusCode === 404) {
            await doc.ref.update({ enabled: false, subscription: null });
            console.log(`🔕 Subscription expirée pour ${doc.id}, désactivée`);
          }
        }
      }
    } catch (err) {
      console.error('❌ Erreur cron notifications:', err.message);
    }
  });
  console.log('⏰ Cron notifications push actif (chaque minute)');
}

app.listen(PORT, () => {
  console.log(`✨ Kaizen Quest serveur démarré sur le port ${PORT}`);
  console.log(`🌐 Accédez à l'application sur http://localhost:${PORT}`);
  if (ANTHROPIC_API_KEY) {
    console.log('🔑 Clé API Anthropic configurée');
  } else {
    console.warn('⚠️  Clé API Anthropic non configurée - les fonctionnalités IA seront limitées');
  }
});
