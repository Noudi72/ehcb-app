// server.cjs
const jsonServer = require('json-server');
const express = require('express');
const fileUpload = require('express-fileupload');
const https = require('https');
const http = require('http');
const { URLSearchParams } = require('url');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

// Environment variables
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = jsonServer.create();
// Support konfigurierbaren DB-Pfad (z. B. für persistente Disks auf Render)
const DEFAULT_DB_FILE = path.join(__dirname, 'db.json');
const DB_FILE = process.env.DB_FILE || DEFAULT_DB_FILE;
// Falls ein externer DB_PATH gesetzt ist und die Datei nicht existiert, versuche initial zu seed'en
try {
  const targetDir = path.dirname(DB_FILE);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE) && fs.existsSync(DEFAULT_DB_FILE)) {
    fs.copyFileSync(DEFAULT_DB_FILE, DB_FILE);
  }
} catch (e) {
  console.warn('Warnung beim Initialisieren der DB-Datei:', e.message);
}
const router = jsonServer.router(DB_FILE);
const middlewares = jsonServer.defaults({ static: 'public' });

// Verzeichnisse für Uploads erstellen, falls sie nicht existieren (lokaler Fallback)
const uploadsDir = process.env.UPLOAD_DIR || path.join(__dirname, 'public', 'uploads');
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

// Cloudinary Konfiguration (für Uploads ohne lokale Disk)
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER || 'ehcb-app';

let cloudinaryEnabled = false;
if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
  cloudinaryEnabled = true;
  console.log('☁️  Cloudinary Uploads aktiviert (Folder:', CLOUDINARY_FOLDER, ')');
} else {
  console.log('💾 Lokaler Upload-Fallback aktiv (Cloudinary nicht konfiguriert)');
}

// Einfacher In-Memory LRU-Cache für Übersetzungen
const CACHE_TTL_MS = parseInt(process.env.TRANSLATION_CACHE_TTL_MS || `${7 * 24 * 60 * 60 * 1000}`, 10); // 7 Tage
const CACHE_MAX = parseInt(process.env.TRANSLATION_CACHE_MAX || '3000', 10);
const translationCache = new Map(); // key -> { value, ts }
const inflightMap = new Map(); // key -> Promise

function makeCacheKey({ text, sourceLanguage, targetLanguage }) {
  return `${text.trim()}__${sourceLanguage}->${targetLanguage}`;
}

function cacheGet(key) {
  const entry = translationCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    translationCache.delete(key);
    return null;
  }
  // LRU: refresh order
  translationCache.delete(key);
  translationCache.set(key, entry);
  return entry.value;
}

function cacheSet(key, value) {
  if (translationCache.has(key)) translationCache.delete(key);
  translationCache.set(key, { value, ts: Date.now() });
  // LRU Eviction
  while (translationCache.size > CACHE_MAX) {
    const oldestKey = translationCache.keys().next().value;
    translationCache.delete(oldestKey);
  }
}

// CORS-Middleware (mit Preflight-Handling)
server.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Vary', 'Origin');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  // Optional: Wenn du Cookies nutzen willst, setze auf true und passe Allow-Origin an spezifische Domains an
  // res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Simple health/root route so '/' doesn't return 404
server.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'ehcb-app api',
    time: new Date().toISOString(),
  });
});

// Additional health endpoints for platforms/readiness probes
server.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
server.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// JSON Body Parser
// Wichtig: json-server parst den Body nicht per defaults();
// Wir aktivieren daher den Body-Parser, damit req.body in Custom-Routen verfügbar ist.
server.use(jsonServer.bodyParser);
// Optional: Falls du lieber Express-Parser nutzen willst, auskommentieren:
// server.use(express.json());
// server.use(express.urlencoded({ extended: true }));

// File Upload Middleware
server.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB Größenbeschränkung
  createParentPath: true
}));

// Helper: Upload nach Cloudinary (Buffer)
function uploadBufferToCloudinary(file, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(file.data);
  });
}

// DeepL Translation Proxy
server.post('/api/translate', async (req, res) => {
  try {
    const { text, targetLanguage, sourceLanguage = 'de' } = req.body;
    
    if (!text || !targetLanguage) {
      return res.status(400).json({ error: 'Text and target language are required' });
    }

  const deeplApiKey = process.env.DEEPL_API_KEY;
    if (!deeplApiKey) {
      return res.status(503).json({ error: 'DeepL API key not configured on server' });
    }
    // Cache-Check (vor DeepL)
    const cacheKey = makeCacheKey({ text, sourceLanguage, targetLanguage });
    const cached = cacheGet(cacheKey);
    if (cached) {
      return res.json({ translatedText: cached, sourceLanguage, targetLanguage, cached: true });
    }

    // Free-Keys (":fx") nutzen den Free-Endpunkt, sonst Pro
  const isFreeKey = deeplApiKey.endsWith(':fx');
  const deeplBaseUrl = isFreeKey ? 'https://api-free.deepl.com/v2/translate' : 'https://api.deepl.com/v2/translate';

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

    console.log('DeepL API Request:', { sourceLanguage, targetLanguage, endpoint: deeplBaseUrl.includes('api-free') ? 'free' : 'pro' });

    async function requestWithRetry(maxRetries = 1) {
      try {
        const data = await makeHttpsRequest(deeplBaseUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(formData.toString())
          },
          body: formData.toString()
        });
        return { ok: true, data };
      } catch (err) {
        // Versuche HTTP-Status zu extrahieren
        const match = /^HTTP\s(\d{3}):\s([\s\S]*)/.exec(err.message || '');
        const status = match ? parseInt(match[1], 10) : 500;
        const body = match ? match[2] : err.message;
        if (maxRetries > 0 && (status === 429 || status >= 500)) {
          await new Promise(r => setTimeout(r, 400));
          return requestWithRetry(maxRetries - 1);
        }
        return { ok: false, status, body };
      }
    }

    // In-Flight-Deduplizierung
    let result;
    if (inflightMap.has(cacheKey)) {
      result = await inflightMap.get(cacheKey);
    } else {
      const p = requestWithRetry(1);
      inflightMap.set(cacheKey, p);
      try {
        result = await p;
      } finally {
        inflightMap.delete(cacheKey);
      }
    }
    if (!result.ok) {
      const status = result.status || 500;
      console.error('DeepL API Fehler:', { status, body: result.body?.slice?.(0, 500) });
      return res.status(status).json({ error: 'DeepL proxy error', details: result.body });
    }
    const data = result.data;
    console.log('DeepL API Response OK');

    if (data.translations && data.translations[0]) {
      const translatedText = data.translations[0].text;
      cacheSet(cacheKey, translatedText);
      res.json({ 
        translatedText,
        sourceLanguage: sourceLanguage,
        targetLanguage: targetLanguage
      });
    } else {
      throw new Error('Invalid DeepL API response format');
    }

  } catch (error) {
    console.error('Translation proxy error:', error);
    const match = /^HTTP\s(\d{3}):\s([\s\S]*)/.exec(error.message || '');
    const status = match ? parseInt(match[1], 10) : 500;
    const details = match ? match[2] : error.message;
    res.status(status).json({ error: 'Translation failed', details });
  }
});

// GET-Route für Translation API Status
server.get('/api/translate', (req, res) => {
  res.json({ 
    status: 'API is running',
    message: 'Use POST request with { text, targetLanguage, sourceLanguage } to translate'
  });
});

// Optional: Stub endpoint for notifications to avoid 404s in the client
server.get('/notifications', (req, res) => {
  res.json([]);
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

// Upload-Endpunkte (Cloudinary, mit lokalem Fallback)
server.post('/api/upload/pdf', async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: 'Keine Dateien hochgeladen' });
    }
    const pdfFile = req.files.file;

    if (cloudinaryEnabled) {
      const result = await uploadBufferToCloudinary(pdfFile, {
        folder: `${CLOUDINARY_FOLDER}/pdf`,
        resource_type: 'raw',
        use_filename: true,
        unique_filename: true,
      });
      return res.json({
        success: true,
        provider: 'cloudinary',
        fileName: result.public_id,
        url: result.secure_url,
        resource_type: result.resource_type,
      });
    }

    const fileName = Date.now() + '_' + pdfFile.name;
    const uploadPath = path.join(pdfDir, fileName);
    pdfFile.mv(uploadPath, err => {
      if (err) {
        console.error('Fehler beim Speichern der PDF:', err);
        return res.status(500).json({ error: 'Fehler beim Hochladen' });
      }
      res.json({ success: true, provider: 'local', fileName, filePath: `/uploads/pdf/${fileName}` });
    });
  } catch (error) {
    console.error('PDF Upload Fehler:', error);
    res.status(500).json({ error: 'Fehler beim Hochladen', details: error.message });
  }
});

server.post('/api/upload/video', async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: 'Keine Dateien hochgeladen' });
    }
    const videoFile = req.files.file;

    if (cloudinaryEnabled) {
      const result = await uploadBufferToCloudinary(videoFile, {
        folder: `${CLOUDINARY_FOLDER}/video`,
        resource_type: 'video',
        use_filename: true,
        unique_filename: true,
      });
      return res.json({
        success: true,
        provider: 'cloudinary',
        fileName: result.public_id,
        url: result.secure_url,
        resource_type: result.resource_type,
      });
    }

    const fileName = Date.now() + '_' + videoFile.name;
    const uploadPath = path.join(videoDir, fileName);
    videoFile.mv(uploadPath, err => {
      if (err) {
        console.error('Fehler beim Speichern des Videos:', err);
        return res.status(500).json({ error: 'Fehler beim Hochladen' });
      }
      res.json({ success: true, provider: 'local', fileName, filePath: `/uploads/video/${fileName}` });
    });
  } catch (error) {
    console.error('Video Upload Fehler:', error);
    res.status(500).json({ error: 'Fehler beim Hochladen', details: error.message });
  }
});

server.post('/api/upload/image', async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: 'Keine Dateien hochgeladen' });
    }
    const imageFile = req.files.file;

    // Dateityp prüfen
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(imageFile.mimetype)) {
      return res.status(400).json({ error: 'Ungültiger Dateityp. Nur JPEG, PNG und WebP sind erlaubt.' });
    }
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (imageFile.size > maxSize) {
      return res.status(400).json({ error: 'Datei zu groß. Maximum 10MB erlaubt.' });
    }

    if (cloudinaryEnabled) {
      const result = await uploadBufferToCloudinary(imageFile, {
        folder: `${CLOUDINARY_FOLDER}/images`,
        resource_type: 'image',
        use_filename: true,
        unique_filename: true,
      });
      return res.json({
        success: true,
        provider: 'cloudinary',
        fileName: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
      });
    }

    const fileName = Date.now() + '_' + imageFile.name;
    const uploadPath = path.join(imageDir, fileName);
    imageFile.mv(uploadPath, err => {
      if (err) {
        console.error('Fehler beim Speichern des Bildes:', err);
        return res.status(500).json({ error: 'Fehler beim Hochladen' });
      }
      res.json({ success: true, provider: 'local', fileName, filePath: `/uploads/images/${fileName}` });
    });
  } catch (error) {
    console.error('Image Upload Fehler:', error);
    res.status(500).json({ error: 'Fehler beim Hochladen', details: error.message });
  }
});

// Statisches Verzeichnis für Uploads
server.use('/uploads', express.static(uploadsDir));

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
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server läuft auf http://0.0.0.0:${PORT}`);
  console.log(`📁 Upload-Verzeichnisse: ${uploadsDir}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
});
