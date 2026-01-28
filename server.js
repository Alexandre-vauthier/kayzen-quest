import express from 'express';
import compression from 'compression';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

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

// SPA fallback - toutes les routes non-API retournent index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✨ Kaizen Quest serveur démarré sur le port ${PORT}`);
  console.log(`🌐 Accédez à l'application sur http://localhost:${PORT}`);
  if (ANTHROPIC_API_KEY) {
    console.log('🔑 Clé API Anthropic configurée');
  } else {
    console.warn('⚠️  Clé API Anthropic non configurée - les fonctionnalités IA seront limitées');
  }
});
