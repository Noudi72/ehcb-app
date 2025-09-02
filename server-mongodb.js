// MongoDB-basierter Server für EHCB App
import express from 'express';
import fileUpload from 'express-fileupload';
import https from 'https';
import { URLSearchParams } from 'url';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import mongoService from './mongodb-service.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment variables
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

const app = express();

// MongoDB Verbindung beim Start
async function startServer() {
  try {
    await mongoService.connect();
    console.log('🍃 MongoDB Atlas ready');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }

  // CORS-Middleware
  app.use((req, res, next) => {
    const origin = req.headers.origin || '*';
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  // Body Parser
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // File Upload
  app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    createParentPath: true
  }));

  // Static files
  app.use(express.static('public'));

  // Health check
  app.get('/', (req, res) => {
    res.json({
      status: 'ok',
      service: 'ehcb-app api (MongoDB)',
      time: new Date().toISOString(),
      database: 'MongoDB Atlas'
    });
  });

  // MongoDB REST API Routes

  // USERS
  app.get('/users', async (req, res) => {
    try {
      const users = await mongoService.findAll('users');
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/users/:id', async (req, res) => {
    try {
      const user = await mongoService.findById('users', req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/users', async (req, res) => {
    try {
      const user = await mongoService.insertOne('users', req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch('/users/:id', async (req, res) => {
    try {
      const user = await mongoService.updateById('users', req.params.id, req.body);
      res.json(user);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  });

  app.delete('/users/:id', async (req, res) => {
    try {
      await mongoService.deleteById('users', req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  });

  // TEAMS
  app.get('/teams', async (req, res) => {
    try {
      const teams = await mongoService.findAll('teams');
      res.json(teams);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/teams', async (req, res) => {
    try {
      const team = await mongoService.insertOne('teams', req.body);
      res.status(201).json(team);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // SURVEYS
  app.get('/surveys', async (req, res) => {
    try {
      const surveys = await mongoService.findAll('surveys');
      res.json(surveys);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/surveys', async (req, res) => {
    try {
      const survey = await mongoService.insertOne('surveys', req.body);
      res.status(201).json(survey);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch('/surveys/:id', async (req, res) => {
    try {
      const survey = await mongoService.updateById('surveys', parseInt(req.params.id), req.body);
      res.json(survey);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  });

  app.delete('/surveys/:id', async (req, res) => {
    try {
      await mongoService.deleteById('surveys', parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  });

  // SURVEY RESPONSES
  app.get('/survey-responses', async (req, res) => {
    try {
      const responses = await mongoService.findAll('survey-responses');
      res.json(responses);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/survey-responses', async (req, res) => {
    try {
      const response = await mongoService.insertOne('survey-responses', req.body);
      res.status(201).json(response);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/survey-responses/:id', async (req, res) => {
    try {
      await mongoService.deleteById('survey-responses', parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  });

  // NEWS
  app.get('/news', async (req, res) => {
    try {
      const news = await mongoService.findAll('news');
      res.json(news);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/news', async (req, res) => {
    try {
      const newsItem = await mongoService.insertOne('news', req.body);
      res.status(201).json(newsItem);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // SPORT FOOD
  app.get('/sport-food-categories', async (req, res) => {
    try {
      const categories = await mongoService.findAll('sport-food-categories');
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/sport-food-items', async (req, res) => {
    try {
      const items = await mongoService.findAll('sport-food-items');
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // NOTIFICATIONS & PUSH
  app.get('/notifications', async (req, res) => {
    try {
      const notifications = await mongoService.findAll('notifications');
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Push Notification Endpoints (wie vorher)
  const subscriptions = new Map();

  app.post('/api/subscribe', (req, res) => {
    try {
      const subscription = req.body;
      const userId = req.body.userId || 'anonymous';
      subscriptions.set(userId, subscription);
      console.log('Push subscription saved for user:', userId);
      res.status(200).json({ message: 'Subscription saved successfully' });
    } catch (error) {
      console.error('Error saving subscription:', error);
      res.status(500).json({ error: 'Failed to save subscription' });
    }
  });

  app.post('/notify-coaches', (req, res) => {
    try {
      const { type, playerName, playerTeam, message } = req.body;
      console.log('📱 Sending coach notification:', { type, playerName, playerTeam, message });
      
      const coachNotifications = [];
      for (const [userId, subscription] of subscriptions.entries()) {
        if (userId.includes('coach') || userId === 'coach1') {
          coachNotifications.push({
            userId,
            subscription,
            notification: {
              title: '🏒 Neue Spieler-Registrierung',
              body: message,
              icon: '/u18-team_app-icon.png',
              badge: '/u18-team_app-icon.png',
              data: { type: 'new-registration', playerName, playerTeam, url: '/coach-dashboard' }
            }
          });
        }
      }
      
      console.log(`Sending notifications to ${coachNotifications.length} coaches`);
      coachNotifications.forEach(({ userId, notification }) => {
        console.log(`📨 Notification for coach ${userId}:`, notification);
      });
      
      res.status(200).json({ 
        message: 'Coach notifications sent successfully',
        notificationsSent: coachNotifications.length
      });
    } catch (error) {
      console.error('Error sending coach notifications:', error);
      res.status(500).json({ error: 'Failed to send coach notifications' });
    }
  });

  // Translation API (wie vorher)
  app.post('/api/translate', async (req, res) => {
    try {
      const { text, targetLanguage, sourceLanguage = 'de' } = req.body;
      
      if (!text || !targetLanguage) {
        return res.status(400).json({ error: 'Text and target language are required' });
      }

      const deeplApiKey = process.env.DEEPL_API_KEY;
      if (!deeplApiKey) {
        return res.status(503).json({ error: 'DeepL API key not configured on server' });
      }

      // DeepL API Aufruf (gleicher Code wie vorher)
      const isFreeKey = deeplApiKey.endsWith(':fx');
      const deeplBaseUrl = isFreeKey ? 'https://api-free.deepl.com/v2/translate' : 'https://api.deepl.com/v2/translate';

      const deeplLanguages = { 'de': 'DE', 'en': 'EN', 'fr': 'FR' };
      const formData = new URLSearchParams();
      formData.append('text', text);
      formData.append('source_lang', deeplLanguages[sourceLanguage] || 'DE');
      formData.append('target_lang', deeplLanguages[targetLanguage] || 'EN');
      formData.append('auth_key', deeplApiKey);

      const response = await fetch(deeplBaseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });

      const data = await response.json();
      
      if (data.translations && data.translations[0]) {
        res.json({ 
          translatedText: data.translations[0].text,
          sourceLanguage,
          targetLanguage
        });
      } else {
        throw new Error('Invalid DeepL API response format');
      }

    } catch (error) {
      console.error('Translation proxy error:', error);
      res.status(500).json({ error: 'Translation failed', details: error.message });
    }
  });

  // Server starten
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server läuft auf http://0.0.0.0:${PORT}`);
    console.log(`🍃 MongoDB Atlas integriert`);
    console.log(`🌍 Environment: ${NODE_ENV}`);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await mongoService.disconnect();
    process.exit(0);
  });
}

startServer().catch(console.error);
