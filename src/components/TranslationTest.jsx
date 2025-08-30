import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { checkAPIAvailability } from '../config/translationService';

const TranslationTest = () => {
  const { language, changeLanguage, translateDynamic, languages } = useLanguage();
  const [testText, setTestText] = useState('Hallo, wie geht es dir heute?');
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiStatus, setApiStatus] = useState(null);

  // Beispieltexte für verschiedene Sprachen
  const exampleTexts = {
    de: [
      'Hallo, wie geht es dir heute?',
      'Wie war das Training heute',
      'Hockey ist ein tolles Spiel',
      'Das Team spielt sehr gut'
    ],
    fr: [
      'Bonjour, comment allez-vous?',
      'L\'entraînement était génial',
      'Hockey est un sport formidable'
    ],
    en: [
      'Hello, how are you today?',
      'The training was great today',
      'Hockey is a wonderful game'
    ]
  };

  // API-Status beim Laden prüfen
  useEffect(() => {
    const checkStatus = async () => {
      const status = await checkAPIAvailability();
      setApiStatus(status);
    };
    checkStatus();
  }, []);

  const handleTranslate = async () => {
    if (!testText) return;
    
    setLoading(true);
    setError('');
    
    try {
      const result = await translateDynamic(testText, language);
      setTranslatedText(result);
    } catch (err) {
      setError(`Übersetzungsfehler: ${err.message}`);
      console.error('Translation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        🔄 DeepL Übersetzungs-Test (Backend-Proxy)
      </h2>
      
      {/* API Status */}
      {apiStatus && (
        <div className={`mb-4 p-3 rounded-md ${
          apiStatus.mock ? 'bg-blue-100 border border-blue-400 text-blue-700' : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          <div className="flex items-center gap-2">
            <span>{apiStatus.mock ? '✅' : '❌'}</span>
            <span>
              Übersetzungs-Service: {apiStatus.backend ? 'Backend + Mock' : 'Nur Mock'} verfügbar
            </span>
          </div>
          {apiStatus.backend && (
            <div className="text-sm mt-1">🚀 DeepL API über Backend-Proxy aktiv</div>
          )}
          {!apiStatus.backend && (
            <div className="text-sm mt-1">📝 Mock-Übersetzungen für häufige Begriffe</div>
          )}
        </div>
      )}
      
      {/* Language Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Zielsprache:
        </label>
        <div className="flex gap-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
                language === lang.code
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <span>{lang.flag}</span>
              {lang.name}
            </button>
          ))}
        </div>
      </div>

      {/* Input Text */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Text zum Übersetzen:
        </label>
        <textarea
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows="3"
          placeholder="Geben Sie hier den Text ein..."
        />
        
        {/* Beispiel-Buttons */}
        <div className="mt-2">
          <p className="text-xs text-gray-500 mb-1">Beispiele:</p>
          <div className="flex flex-wrap gap-1">
            {exampleTexts.de.map((example, index) => (
              <button
                key={index}
                onClick={() => setTestText(example)}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
              >
                {example.length > 30 ? example.substring(0, 30) + '...' : example}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Translate Button */}
      <button
        onClick={handleTranslate}
        disabled={loading || !testText}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Übersetze...
          </div>
        ) : (
          `Nach ${languages.find(l => l.code === language)?.name} übersetzen`
        )}
      </button>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Translated Text */}
      {translatedText && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Übersetzung ({languages.find(l => l.code === language)?.name}):
          </label>
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-gray-800">{translatedText}</p>
          </div>
        </div>
      )}

      {/* Current Language Info */}
      <div className="text-sm text-gray-600">
        <p>Aktuelle Sprache: {languages.find(l => l.code === language)?.name} ({language})</p>
        <p>Service: {apiStatus?.backend ? 'Backend + Mock' : 'Intelligente Mock-Übersetzungen'}</p>
        <p className="text-xs mt-1">
          Verfügbare Wörter: Hallo, wie, geht, es, dir, heute, war, das, Training, Hockey, Team, etc.
        </p>
        <p className="text-xs text-blue-600">
          💡 Tipp: Verwenden Sie die Beispiel-Buttons für beste Ergebnisse
        </p>
      </div>
    </div>
  );
};

export default TranslationTest;
