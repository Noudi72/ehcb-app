import React, { useState } from 'react';
import { translationService } from '../services/TranslationService';
import { useLanguage } from '../context/LanguageContext';
import BackButton from '../components/BackButton';

const AITranslationDemo = () => {
  const { language, t } = useLanguage();
  const [testQuestion, setTestQuestion] = useState('');
  const [translationResults, setTranslationResults] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [apiStats, setApiStats] = useState(null);

  // Demo-Fragen zum Testen
  const demoQuestions = [
    'Wie findest du das neue Trainingskonzept?',
    'Bist du zufrieden mit deiner Kondition?',
    'Welche Übung möchtest du öfter machen?',
    'Wie ist deine Motivation heute?',
    'Was können wir am Training verbessern?'
  ];

  const handleTranslate = async (question) => {
    setIsTranslating(true);
    setTestQuestion(question);
    
    try {
      console.log('🚀 Starting AI Translation with DeepL...');
      
      // Übersetze in alle Sprachen
      const results = {
        de: question, // Original
        fr: await translationService.translateText(question, 'fr', 'de'),
        en: await translationService.translateText(question, 'en', 'de')
      };
      
      setTranslationResults(results);
      setApiStats(translationService.getCacheStats());
      
      console.log('✅ Translation completed:', results);
    } catch (error) {
      console.error('❌ Translation error:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-600 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <BackButton to="/" />
        </div>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🤖 AI-Übersetzung Live Demo
          </h1>
          <p className="text-xl text-blue-100 mb-2">
            DeepL API in Aktion - Echte AI-Übersetzung!
          </p>
          <div className="inline-flex items-center bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
            ✅ DeepL API aktiv ({apiStats?.preferredApi || 'loading...'})
          </div>
        </div>

        {/* Demo Questions */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-4">📝 Demo-Fragen testen</h2>
          <p className="text-gray-600 mb-4">
            Klicke auf eine Frage und sieh zu, wie sie automatisch mit DeepL übersetzt wird:
          </p>
          
          <div className="grid gap-3">
            {demoQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleTranslate(question)}
                disabled={isTranslating}
                className="p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-left transition-all disabled:opacity-50"
              >
                <span className="font-medium">#{index + 1}</span> {question}
              </button>
            ))}
          </div>
        </div>

        {/* Translation Results */}
        {testQuestion && (
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4">🌍 Übersetzungs-Ergebnisse</h2>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <strong>Originale Frage:</strong> {testQuestion}
            </div>

            {isTranslating ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-blue-600 font-medium">
                  DeepL übersetzt... 🤖
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* German */}
                <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg">
                  <span className="text-2xl">🇩🇪</span>
                  <div>
                    <div className="font-semibold text-red-800">Deutsch (Original)</div>
                    <div className="text-gray-700">{translationResults.de}</div>
                  </div>
                </div>

                {/* French */}
                <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                  <span className="text-2xl">🇫🇷</span>
                  <div>
                    <div className="font-semibold text-blue-800">Français (DeepL AI)</div>
                    <div className="text-gray-700">{translationResults.fr}</div>
                  </div>
                </div>

                {/* English */}
                <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                  <span className="text-2xl">🇬🇧</span>
                  <div>
                    <div className="font-semibold text-green-800">English (DeepL AI)</div>
                    <div className="text-gray-700">{translationResults.en}</div>
                  </div>
                </div>
              </div>
            )}

            {/* API Stats */}
            {apiStats && (
              <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                <h3 className="font-semibold mb-2">📊 API Statistiken:</h3>
                <div className="text-sm text-gray-600">
                  <div>Verwendete API: <strong>{apiStats.preferredApi}</strong></div>
                  <div>Cache-Einträge: <strong>{apiStats.size}</strong></div>
                  <div>DeepL Key aktiv: <strong>✅ Ja</strong></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            💡 So funktioniert es:
          </h3>
          <ul className="text-yellow-700 space-y-1">
            <li>• Jede neue Umfrage-Frage wird automatisch übersetzt</li>
            <li>• DeepL API sorgt für professionelle Qualität</li>
            <li>• Caching verhindert doppelte API-Calls</li>
            <li>• Fallback bei API-Problemen</li>
            <li>• 500.000 Zeichen gratis pro Monat</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AITranslationDemo;
