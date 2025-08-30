// Translation Service mit Google Translate und DeepL API Integration
import { API_BASE_URL } from '../config/api';

export class TranslationService {
  constructor() {
    this.cache = new Map();
    
    // API Keys für verschiedene Übersetzungsdienste
    // Für Demo verwenden wir direkt den Key (in Production über import.meta.env)
    this.googleApiKey = import.meta.env?.VITE_GOOGLE_TRANSLATE_API_KEY;
    this.deeplApiKey = import.meta.env?.VITE_DEEPL_API_KEY || '294179f7-bc8d-489c-8b9f-20dd859001bc:fx';
    
    // API URLs
    this.googleBaseUrl = 'https://translation.googleapis.com/language/translate/v2';
    this.deeplBaseUrl = 'https://api-free.deepl.com/v2/translate'; // oder 'https://api.deepl.com/v2/translate' für Pro
    
    this.supportedLanguages = ['de', 'fr', 'en'];
    
    // Bestimme welche API verwendet werden soll (DeepL bevorzugt)
    this.preferredApi = this.deeplApiKey ? 'deepl' : this.googleApiKey ? 'google' : 'mock';
    
    console.log('Translation Service initialized', {
      preferredApi: this.preferredApi,
      hasGoogleKey: !!this.googleApiKey,
      hasDeeplKey: !!this.deeplApiKey
    });
  }

  // Hauptübersetzungsfunktion - verwendet die beste verfügbare API
  async translateText(text, targetLanguage, sourceLanguage = 'de') {
    if (!text || !targetLanguage || sourceLanguage === targetLanguage) {
      return text;
    }

    const cacheKey = `${text}_${sourceLanguage}_${targetLanguage}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      console.log('Translation from cache:', { text, targetLanguage });
      return this.cache.get(cacheKey);
    }

    let translatedText;
    
    try {
      switch (this.preferredApi) {
        case 'deepl':
          translatedText = await this.translateWithDeepL(text, targetLanguage, sourceLanguage);
          break;
        case 'google':
          translatedText = await this.translateWithGoogle(text, targetLanguage, sourceLanguage);
          break;
        default:
          translatedText = this.getMockTranslation(text, targetLanguage, sourceLanguage);
      }
    } catch (error) {
      console.warn('Translation failed, using fallback:', error);
      translatedText = this.getMockTranslation(text, targetLanguage, sourceLanguage);
    }

    // Cache the result
    this.cache.set(cacheKey, translatedText);
    
    return translatedText;
  }

  // DeepL API Integration (höhere Qualität) - via Backend Proxy
  async translateWithDeepL(text, targetLanguage, sourceLanguage = 'de') {
    console.log('DeepL API called via proxy:', { text, targetLanguage, sourceLanguage });

    try {
      console.log('Sending request to DeepL proxy:', `${API_BASE_URL}/api/translate`);
      
      const response = await fetch(`${API_BASE_URL}/api/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          targetLanguage,
          sourceLanguage
        })
      });

      console.log('DeepL proxy response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('DeepL proxy error response:', errorText);
        throw new Error(`DeepL proxy error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('DeepL proxy full response:', data);
      
      if (data.translatedText) {
        console.log('DeepL API result:', { text, translatedText: data.translatedText, targetLanguage });
        return data.translatedText;
      }
      
      throw new Error('Invalid DeepL proxy response format');
    } catch (error) {
      console.error('DeepL API error:', error);
      throw error;
    }
  }

  // Google Translate API Integration
  async translateWithGoogle(text, targetLanguage, sourceLanguage = 'de') {
    const url = `${this.googleBaseUrl}?key=${this.googleApiKey}`;
    
    const requestBody = {
      q: text,
      source: sourceLanguage,
      target: targetLanguage,
      format: 'text'
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Google Translate API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.data && data.data.translations && data.data.translations[0]) {
        const translatedText = data.data.translations[0].translatedText;
        console.log('Google Translate API result:', { text, translatedText, targetLanguage });
        return translatedText;
      }
      
      throw new Error('Invalid Google API response format');
    } catch (error) {
      console.error('Google Translate API error:', error);
      throw error;
    }
  }

  // Erweiterte Mock-Übersetzungen als Fallback
  getMockTranslation(text, targetLanguage, sourceLanguage = 'de') {
    const translationKey = `${sourceLanguage}_${targetLanguage}`;
    
    // Umfangreiche Mock-Übersetzungen
    const translations = {
      'de_fr': {
        'Wie fühlst du dich zur Zeit?': 'Comment te sens-tu en ce moment?',
        'Was sollten wir Coaches deiner Meinung nach im Training verbessern?': 'Que devrions-nous, les entraîneurs, améliorer à votre avis dans l\'entraînement?',
        'Was machst du, um dich optimal auf das Spiel vorzubereiten?': 'Que fais-tu pour te préparer de manière optimale au match?',
        'Wie lange hast du gestern geschlafen?': 'Combien de temps as-tu dormi hier?',
        'Welche Bereiche möchtest du im Training verbessern?': 'Quels domaines souhaites-tu améliorer à l\'entraînement?',
        'Sehr gut': 'Très bien',
        'Gut': 'Bien',
        'Neutral': 'Neutre',
        'Müde': 'Fatigué',
        'Erschöpft': 'Épuisé',
        'Mentales Training.': 'Entraînement mental.',
        'Fokussiere mich erst kurz vor dem Spiel.': 'Je me concentre peu avant le match.',
        'Gehe meine persönliche Rituale durch vor dem Spiel.': 'Je passe en revue mes rituels personnels avant le match.',
        'Schuss': 'Tir',
        'Skating': 'Patinage', 
        'Taktik': 'Tactique',
        'Kondition': 'Condition physique',
        'Zweikämpfe': 'Duels',
        'Stunden': 'Heures'
      },
      'de_en': {
        'Wie fühlst du dich zur Zeit?': 'How do you feel right now?',
        'Was sollten wir Coaches deiner Meinung nach im Training verbessern?': 'What do you think we coaches should improve in training?',
        'Was machst du, um dich optimal auf das Spiel vorzubereiten?': 'What do you do to prepare optimally for the game?',
        'Wie lange hast du gestern geschlafen?': 'How long did you sleep yesterday?',
        'Welche Bereiche möchtest du im Training verbessern?': 'Which areas would you like to improve in training?',
        'Sehr gut': 'Very good',
        'Gut': 'Good', 
        'Neutral': 'Neutral',
        'Müde': 'Tired',
        'Erschöpft': 'Exhausted',
        'Mentales Training.': 'Mental training.',
        'Fokussiere mich erst kurz vor dem Spiel.': 'I focus just before the game.',
        'Gehe meine persönliche Rituale durch vor dem Spiel.': 'I go through my personal rituals before the game.',
        'Schuss': 'Shot',
        'Skating': 'Skating',
        'Taktik': 'Tactics', 
        'Kondition': 'Fitness',
        'Zweikämpfe': 'Duels',
        'Stunden': 'Hours'
      }
    };

    // Prüfe auf direkte Übersetzung
    if (translations[translationKey] && translations[translationKey][text]) {
      console.log('Mock translation found:', { text, targetLanguage, translation: translations[translationKey][text] });
      return translations[translationKey][text];
    }

    // Einfache Regel-basierte Übersetzung als letzter Fallback
    return this.ruleBasedTranslation(text, targetLanguage);
  }

  // Einfache regel-basierte Übersetzung
  ruleBasedTranslation(text, targetLanguage) {
    if (targetLanguage === 'en') {
      return text
        .replace(/Wie/g, 'How')
        .replace(/Was/g, 'What') 
        .replace(/du/g, 'you')
        .replace(/dich/g, 'yourself')
        .replace(/Zeit/g, 'time')
        .replace(/Spiel/g, 'game')
        .replace(/Training/g, 'training')
        .replace(/sehr/g, 'very')
        .replace(/gut/g, 'good');
    } else if (targetLanguage === 'fr') {
      return text
        .replace(/Wie/g, 'Comment')
        .replace(/Was/g, 'Que')
        .replace(/du/g, 'tu')
        .replace(/dich/g, 'toi')
        .replace(/Zeit/g, 'temps')
        .replace(/Spiel/g, 'match')
        .replace(/Training/g, 'entraînement')
        .replace(/sehr/g, 'très')
        .replace(/gut/g, 'bien');
    }
    
    return text; // Return original if no translation found
  }

  // Übersetzt eine komplette Frage mit allen Optionen
  async translateQuestion(question, targetLanguage) {
    const translatedQuestion = {
      ...question,
      question: await this.translateText(question.question, targetLanguage),
      options: question.options ? await Promise.all(
        question.options.map(option => this.translateText(option, targetLanguage))
      ) : question.options,
    };

    return translatedQuestion;
  }

  // Übersetzt ein Array von Fragen
  async translateQuestions(questions, targetLanguage) {
    if (!Array.isArray(questions)) return questions;
    
    return await Promise.all(
      questions.map(question => this.translateQuestion(question, targetLanguage))
    );
  }

  // Hilfsfunktion: Überprüft ob eine Sprache unterstützt wird
  isLanguageSupported(language) {
    return this.supportedLanguages.includes(language);
  }

  // Hilfsfunktion: Löscht den Übersetzungs-Cache
  clearCache() {
    this.cache.clear();
    console.log('Translation cache cleared');
  }

  // Hilfsfunktion: Zeigt Cache-Statistiken
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
      preferredApi: this.preferredApi
    };
  }

  // Wechselt zwischen den verfügbaren APIs
  switchApi(apiType) {
    if (apiType === 'deepl' && this.deeplApiKey) {
      this.preferredApi = 'deepl';
    } else if (apiType === 'google' && this.googleApiKey) {
      this.preferredApi = 'google';
    } else {
      this.preferredApi = 'mock';
    }
    
    console.log('Switched to API:', this.preferredApi);
    return this.preferredApi;
  }
}

// Singleton-Instanz für die App
export const translationService = new TranslationService();
