// Translation Service für EHC Biel-Bienne Spirit App
// Vereinfachte Mock-Implementation für Tests

// Einheitliche Backend-URL über zentrale API-Konfiguration
import { API_BASE_URL } from './api';

// Client-seitiges Throttling für Backend-Requests (max. 2 parallel, kleiner Jitter)
const MAX_CONCURRENT = 2;
let activeCount = 0;
const queue = [];
const inFlight = new Map(); // Key -> Promise

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function runWithThrottle(task) {
  // optionaler Jitter 100-200ms, um Bursts zu glätten
  const jitter = 100 + Math.floor(Math.random() * 100);
  await sleep(jitter);

  if (activeCount >= MAX_CONCURRENT) {
    await new Promise(resolve => queue.push(resolve));
  }
  activeCount++;
  try {
    return await task();
  } finally {
    activeCount--;
    const next = queue.shift();
    if (next) next();
  }
}

// Cache für Übersetzungen
const translationCache = new Map();

// Mock-Übersetzungen für häufige Begriffe
const mockTranslations = {
  'de_fr': {
    'Hallo': 'Bonjour',
    'Welt': 'Monde',
    'Hallo Welt': 'Bonjour le monde',
    'Wie': 'Comment',
    'geht': 'allez',
    'es': 'vous',
    'dir': 'vous',
    'heute': 'aujourd\'hui',
    'war': 'était',
    'das': 'le',
    'Training': 'entraînement',
    'Wie geht es dir?': 'Comment allez-vous ?',
    'Hallo, wie geht es dir heute?': 'Bonjour, comment allez-vous aujourd\'hui ?',
    'Wie war das Training heute': 'Comment était l\'entraînement aujourd\'hui',
    'Danke': 'Merci',
    'Bitte': 'S\'il vous plaît',
    'Auf Wiedersehen': 'Au revoir',
    'Guten Morgen': 'Bonjour',
    'Guten Abend': 'Bonsoir',
    'Hockey': 'Hockey',
    'Spiel': 'Match',
    'Team': 'Équipe',
    'Spieler': 'Joueur',
    'gut': 'bien',
    'sehr': 'très',
    'toll': 'génial',
    'ist': 'est',
    'ein': 'un',
    'tolles': 'formidable',
    'spielen': 'joue',
    'spielt': 'joue'
  },
  'de_en': {
    'Hallo': 'Hello',
    'Welt': 'World',
    'Hallo Welt': 'Hello World',
    'Wie': 'How',
    'geht': 'are',
    'es': 'you',
    'dir': 'you',
    'heute': 'today',
    'war': 'was',
    'das': 'the',
    'Training': 'training',
    'Wie geht es dir?': 'How are you?',
    'Hallo, wie geht es dir heute?': 'Hello, how are you today?',
    'Wie war das Training heute': 'How was the training today',
    'Danke': 'Thank you',
    'Bitte': 'Please',
    'Auf Wiedersehen': 'Goodbye',
    'Guten Morgen': 'Good morning',
    'Guten Abend': 'Good evening',
    'Hockey': 'Hockey',
    'Spiel': 'Game',
    'Team': 'Team',
    'Spieler': 'Player',
    'gut': 'good',
    'sehr': 'very',
    'toll': 'great',
    'ist': 'is',
    'ein': 'a',
    'tolles': 'wonderful',
    'spielen': 'play',
    'spielt': 'plays'
  },
  'fr_en': {
    'Bonjour': 'Hello',
    'Monde': 'World',
    'Bonjour le monde': 'Hello World',
    'Comment': 'How',
    'allez': 'are',
    'vous': 'you',
    'aujourd\'hui': 'today',
    'était': 'was',
    'le': 'the',
    'entraînement': 'training',
    'Comment allez-vous ?': 'How are you?',
    'Merci': 'Thank you',
    'S\'il vous plaît': 'Please',
    'Au revoir': 'Goodbye',
    'Bonsoir': 'Good evening',
    'Hockey': 'Hockey',
    'Match': 'Game',
    'Équipe': 'Team',
    'Joueur': 'Player',
    'bien': 'good',
    'très': 'very',
    'génial': 'great'
  },
  'en_de': {
    'Hello': 'Hallo',
    'World': 'Welt',
    'Hello World': 'Hallo Welt',
    'How': 'Wie',
    'are': 'geht',
    'you': 'dir',
    'today': 'heute',
    'was': 'war',
    'the': 'das',
    'training': 'Training',
    'How are you?': 'Wie geht es dir?',
    'Thank you': 'Danke',
    'Please': 'Bitte',
    'Goodbye': 'Auf Wiedersehen',
    'Good morning': 'Guten Morgen',
    'Good evening': 'Guten Abend',
    'Hockey': 'Hockey',
    'Game': 'Spiel',
    'Team': 'Team',
    'Player': 'Spieler',
    'good': 'gut',
    'very': 'sehr',
    'great': 'toll'
  },
  'en_fr': {
    'Hello': 'Bonjour',
    'World': 'Monde',
    'Hello World': 'Bonjour le monde',
    'How': 'Comment',
    'are': 'allez',
    'you': 'vous',
    'today': 'aujourd\'hui',
    'was': 'était',
    'the': 'le',
    'training': 'entraînement',
    'How are you?': 'Comment allez-vous ?',
    'Thank you': 'Merci',
    'Please': 'S\'il vous plaît',
    'Goodbye': 'Au revoir',
    'Good morning': 'Bonjour',
    'Good evening': 'Bonsoir',
    'Hockey': 'Hockey',
    'Game': 'Match',
    'Team': 'Équipe',
    'Player': 'Joueur',
    'good': 'bien',
    'very': 'très',
    'great': 'génial'
  },
  'fr_de': {
    'Bonjour': 'Hallo',
    'Monde': 'Welt',
    'Bonjour le monde': 'Hallo Welt',
    'Comment': 'Wie',
    'allez': 'geht',
    'vous': 'dir',
    'aujourd\'hui': 'heute',
    'était': 'war',
    'le': 'das',
    'entraînement': 'Training',
    'Comment allez-vous ?': 'Wie geht es dir?',
    'Merci': 'Danke',
    'S\'il vous plaît': 'Bitte',
    'Au revoir': 'Auf Wiedersehen',
    'Bonsoir': 'Guten Abend',
    'Hockey': 'Hockey',
    'Match': 'Spiel',
    'Équipe': 'Team',
    'Joueur': 'Spieler',
    'bien': 'gut',
    'très': 'sehr',
    'génial': 'toll'
  }
};

// Feature-Flag: DeepL-Proxy im Frontend verwenden? Standard: aus in PROD
const USE_DEEPL_PROXY = (import.meta.env?.VITE_USE_DEEPL_PROXY === 'true');

/**
 * Übersetzt Text mit Mock-Translation oder Backend-Proxy (DeepL API)
 * @param {string} text - Zu übersetzender Text
 * @param {string} targetLanguage - Zielsprache (de, fr, en)
 * @param {string} sourceLanguage - Quellsprache (optional, Standard: 'de')
 * @returns {Promise<string>} Übersetzter Text
 */
export const translateText = async (text, targetLanguage, sourceLanguage = 'de') => {
  if (!text || text.trim() === '') {
    return '';
  }

  if (targetLanguage === sourceLanguage) {
    return text;
  }

  const cacheKey = `${text}_${sourceLanguage}_${targetLanguage}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  try {
    const mockKey = `${sourceLanguage}_${targetLanguage}`;

    if (mockTranslations[mockKey] && mockTranslations[mockKey][text]) {
      const translatedText = mockTranslations[mockKey][text];
      translationCache.set(cacheKey, translatedText);
      return translatedText;
    }

    // Nur wenn explizit erlaubt, Backend-Proxy versuchen
    if (USE_DEEPL_PROXY) {
      try {
        const base = API_BASE_URL || '';
        const key = `${text}__${sourceLanguage}->${targetLanguage}`;
        const doRequest = () => fetch(`${base}/api/translate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, targetLanguage, sourceLanguage })
        });
        let response;
        if (inFlight.has(key)) {
          response = await inFlight.get(key);
        } else {
          const p = runWithThrottle(doRequest);
          inFlight.set(key, p);
          try {
            response = await p;
          } finally {
            inFlight.delete(key);
          }
        }
        if (response.ok) {
          const data = await response.json();
          if (data.translatedText) {
            const translatedText = data.translatedText;
            translationCache.set(cacheKey, translatedText);
            return translatedText;
          }
        }
      } catch (backendError) {
        // Ignoriere und fallback
      }
    }

    // Fallback: Enhanced Mock
    const enhancedTranslation = translateWithEnhancedMock(text, mockKey);
    translationCache.set(cacheKey, enhancedTranslation);
    return enhancedTranslation;
  } catch (error) {
    return text;
  }
};

/**
 * Intelligente Mock-Übersetzung mit verbesserter Wort-für-Wort-Logik
 */
function translateWithEnhancedMock(text, mockKey) {
  if (!mockTranslations[mockKey]) {
    return text;
  }

  // Satzzeichen und Wörter getrennt behandeln
  const words = text.split(/(\s+|[.,!?;:])/);
  const translations = mockTranslations[mockKey];
  
  const translatedWords = words.map(word => {
    // Leerzeichen und Satzzeichen unverändert lassen
    if (/^\s+$/.test(word) || /^[.,!?;:]+$/.test(word)) {
      return word;
    }
    
    // Wort in verschiedenen Formen suchen
    const cleanWord = word.trim();
    
    // 1. Exakte Übereinstimmung
    if (translations[cleanWord]) {
      return translations[cleanWord];
    }
    
    // 2. Lowercase-Übereinstimmung
    const lowerWord = cleanWord.toLowerCase();
    if (translations[lowerWord]) {
      return translations[lowerWord];
    }
    
    // 3. Kapitalisierte Version
    const capitalizedWord = lowerWord.charAt(0).toUpperCase() + lowerWord.slice(1);
    if (translations[capitalizedWord]) {
      return translations[capitalizedWord];
    }
    
    // 4. Suche nach Teilübereinstimmungen
    for (const [key, value] of Object.entries(translations)) {
      if (key.toLowerCase().includes(lowerWord) || lowerWord.includes(key.toLowerCase())) {
        return value;
      }
    }
    
    // 5. Falls nichts gefunden wurde, ursprüngliches Wort zurückgeben
    return cleanWord;
  });
  
  return translatedWords.join('');
}

/**
 * Prüft ob der Backend-Translation-Service verfügbar ist
 */
export const checkAPIAvailability = async () => {
  if (!USE_DEEPL_PROXY) {
    return { backend: false, mock: true, deepl: false, status: 'disabled' };
  }
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const base = API_BASE_URL || '';
    const response = await fetch(`${base}/api/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'test', targetLanguage: 'en', sourceLanguage: 'de' }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return { backend: response.ok, mock: true, deepl: response.ok, status: response.status };
  } catch (error) {
    return { backend: false, mock: true, deepl: false, status: 'mock-only' };
  }
};

/**
 * Löscht den Übersetzungs-Cache
 */
export const clearTranslationCache = () => {
  translationCache.clear();
  console.log('Translation cache cleared');
};

/**
 * Gibt Cache-Statistiken zurück
 */
export const getCacheStats = () => {
  return {
    size: translationCache.size,
    keys: Array.from(translationCache.keys()),
    mockTranslationsAvailable: Object.keys(mockTranslations).length
  };
};

// Initialisierung: API-Verfügbarkeit prüfen
checkAPIAvailability();
