// server.cjs
const jsonServer = require('json-server');
const express = require('express');
const fileUpload = require('express-fileupload');
const https = require('https');
const http = require('http');
const { URLSearchParams } = require('url');
const path = require('path');
const fs = require('fs');

// Environment variables
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults({ static: 'public' });

// Verzeichnisse für Uploads erstellen, falls sie nicht existieren
const uploadsDir = path.join(__dirname, 'public', 'uploads');
const pdfDir = path.join(uploadsDir, 'pdf');
const videoDir = path.join(uploadsDir, 'video');
const imageDir = path.join(uploadsDir, 'images');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir, { recursive: true });
}
if (!fs.existsSync(videoDir)) {
  fs.mkdirSync(videoDir, { recursive: true });
}
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
}

// CORS-Middleware
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  next();
});

// JSON Body Parser - using json-server defaults
// server.use(express.json());
// server.use(express.urlencoded({ extended: true }));

// File Upload Middleware
server.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB Größenbeschränkung
  createParentPath: true
}));

// DeepL Translation Proxy
server.post('/api/translate', async (req, res) => {
  try {
    const { text, targetLanguage, sourceLanguage = 'de' } = req.body;
    
    if (!text || !targetLanguage) {
      return res.status(400).json({ error: 'Text and target language are required' });
    }

    const deeplApiKey = '294179f7-bc8d-489c-8b9f-20dd859001bc:fx';
    const deeplBaseUrl = 'https://api-free.deepl.com/v2/translate';

    // DeepL verwendet andere Sprachcodes
    const deeplLanguages = {
      'de': 'DE',
      'en': 'EN',
      'fr': 'FR'
    };

    const formData = new URLSearchParams();
    formData.append('text', text);
    formData.append('source_lang', deeplLanguages[sourceLanguage] || 'DE');
    formData.append('target_lang', deeplLanguages[targetLanguage] || 'EN');
    formData.append('auth_key', deeplApiKey);

    console.log('DeepL API Request:', { text, sourceLanguage, targetLanguage });

    // Native Node.js HTTPS request
    const data = await makeHttpsRequest(deeplBaseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(formData.toString())
      },
      body: formData.toString()
    });

    console.log('DeepL API Response:', data);

    if (data.translations && data.translations[0]) {
      res.json({ 
        translatedText: data.translations[0].text,
        sourceLanguage: sourceLanguage,
        targetLanguage: targetLanguage
      });
    } else {
      throw new Error('Invalid DeepL API response format');
    }

  } catch (error) {
    console.error('Translation proxy error:', error);
    res.status(500).json({ 
      error: 'Translation failed', 
      details: error.message 
    });
  }
});

// GET-Route für Translation API Status
server.get('/api/translate', (req, res) => {
  res.json({ 
    status: 'API is running',
    message: 'Use POST request with { text, targetLanguage, sourceLanguage } to translate'
  });
});

// Helper function für HTTPS requests
function makeHttpsRequest(url, options) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

// Push-Notification-Endpoints
const subscriptions = new Map(); // In-Memory-Speicher für Subscriptions

// Push-Subscription speichern
server.post('/api/subscribe', (req, res) => {
  try {
    const subscription = req.body;
    const userId = req.body.userId || 'anonymous'; // Benutzer-ID aus Session/Auth
    
    subscriptions.set(userId, subscription);
    console.log('Push subscription saved for user:', userId);
    
    res.status(200).json({ message: 'Subscription saved successfully' });
  } catch (error) {
    console.error('Error saving subscription:', error);
    res.status(500).json({ error: 'Failed to save subscription' });
  }
});

// Test-Notification senden
server.post('/api/send-notification', (req, res) => {
  try {
    const { userId, title, message, url } = req.body;
    
    if (userId && subscriptions.has(userId)) {
      // Hier würdest du normalerweise web-push verwenden
      // Für jetzt nur erfolgreiche Response
      console.log(`Notification sent to ${userId}: ${title} - ${message}`);
      res.status(200).json({ message: 'Notification sent successfully' });
    } else {
      res.status(404).json({ error: 'User subscription not found' });
    }
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Broadcast-Notification an alle
server.post('/api/broadcast-notification', (req, res) => {
  try {
    const { title, message, url } = req.body;
    
    console.log(`Broadcasting notification: ${title} - ${message}`);
    console.log(`Active subscriptions: ${subscriptions.size}`);
    
    // Hier würdest du an alle Subscriptions senden
    res.status(200).json({ 
      message: 'Broadcast notification sent successfully',
      recipients: subscriptions.size 
    });
  } catch (error) {
    console.error('Error broadcasting notification:', error);
    res.status(500).json({ error: 'Failed to broadcast notification' });
  }
});

// Standard-Middleware
server.use(middlewares);

// Upload-Endpunkte
server.post('/api/upload/pdf', (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ error: 'Keine Dateien hochgeladen' });
  }

  const pdfFile = req.files.file;
  const fileName = Date.now() + '_' + pdfFile.name;
  const uploadPath = path.join(pdfDir, fileName);

  pdfFile.mv(uploadPath, err => {
    if (err) {
      console.error('Fehler beim Speichern der PDF:', err);
      return res.status(500).json({ error: 'Fehler beim Hochladen' });
    }

    res.json({ 
      success: true, 
      fileName: fileName,
      filePath: `/uploads/pdf/${fileName}` 
    });
  });
});

// Route für Video-Upload
server.post('/api/upload/video', (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ error: 'Keine Dateien hochgeladen' });
  }

  const videoFile = req.files.file;
  const fileName = Date.now() + '_' + videoFile.name;
  const uploadPath = path.join(videoDir, fileName);

  videoFile.mv(uploadPath, err => {
    if (err) {
      console.error('Fehler beim Speichern des Videos:', err);
      return res.status(500).json({ error: 'Fehler beim Hochladen' });
    }

    res.json({ 
      success: true, 
      fileName: fileName,
      filePath: `/uploads/video/${fileName}` 
    });
  });
});

// Route für Image-Upload
server.post('/api/upload/image', (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ error: 'Keine Dateien hochgeladen' });
  }

  const imageFile = req.files.file;
  
  // Überprüfe den Dateityp
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(imageFile.mimetype)) {
    return res.status(400).json({ 
      error: 'Ungültiger Dateityp. Nur JPEG, PNG und WebP sind erlaubt.' 
    });
  }
  
  // Überprüfe die Dateigröße (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (imageFile.size > maxSize) {
    return res.status(400).json({ 
      error: 'Datei zu groß. Maximum 10MB erlaubt.' 
    });
  }

  const fileName = Date.now() + '_' + imageFile.name;
  const uploadPath = path.join(imageDir, fileName);

  imageFile.mv(uploadPath, err => {
    if (err) {
      console.error('Fehler beim Speichern des Bildes:', err);
      return res.status(500).json({ error: 'Fehler beim Hochladen' });
    }

    res.json({ 
      success: true, 
      fileName: fileName,
      filePath: `/uploads/images/${fileName}` 
    });
  });
});

// Statisches Verzeichnis für Uploads
server.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// DELETE-Endpunkt für Survey-Responses (VOR dem Router!)
server.delete('/survey-responses/:id', (req, res) => {
  try {
    const responseId = parseInt(req.params.id, 10);
    console.log('Lösche Survey-Response mit ID:', responseId);
    
    // Da wir json-server verwenden, können wir direkt auf die DB zugreifen
    const db = router.db;
    const surveyResponses = db.get('survey-responses');
    
    // Finde die Response
    const response = surveyResponses.find(response => response.id === responseId).value();
    
    if (!response) {
      return res.status(404).json({ error: 'Survey-Response nicht gefunden' });
    }
    
    // Lösche die Response
    surveyResponses.remove({ id: responseId }).write();
    
    console.log('Survey-Response erfolgreich gelöscht:', responseId);
    res.json({ success: true, message: 'Survey-Response erfolgreich gelöscht' });
    
  } catch (error) {
    console.error('Fehler beim Löschen der Survey-Response:', error);
    res.status(500).json({ error: 'Interner Server-Fehler' });
  }
});

// Router verwenden (NACH den benutzerdefinierten Endpunkten!)
server.use(router);

// Server starten
server.listen(PORT, () => {
  console.log(`🚀 Server läuft auf http://localhost:${PORT}`);
  console.log(`📁 Upload-Verzeichnisse: ${uploadsDir}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
});
