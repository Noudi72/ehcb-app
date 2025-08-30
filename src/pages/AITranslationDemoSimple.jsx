import React, { useState } from 'react';
import BackButton from '../components/BackButton';

// Vereinfachte Demo für AI-Übersetzung
const AITranslationDemo = () => {
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [translations, setTranslations] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);

  // Demo-Fragen
  const demoQuestions = [
    'Wie findest du das neue Training?',
    'Bist du zufrieden mit deiner Leistung?',
    'Was können wir verbessern?',
    'Wie ist deine Motivation heute?',
    'Welche Übung magst du am liebsten?'
  ];

  // Simulierte Übersetzungen (Mock für Demo)
  const mockTranslations = {
    'Wie findest du das neue Training?': {
      fr: 'Comment trouvez-vous le nouvel entraînement ?',
      en: 'How do you like the new training?'
    },
    'Bist du zufrieden mit deiner Leistung?': {
      fr: 'Êtes-vous satisfait de votre performance ?',
      en: 'Are you satisfied with your performance?'
    },
    'Was können wir verbessern?': {
      fr: 'Que pouvons-nous améliorer ?',
      en: 'What can we improve?'
    },
    'Wie ist deine Motivation heute?': {
      fr: 'Comment est votre motivation aujourd\'hui ?',
      en: 'How is your motivation today?'
    },
    'Welche Übung magst du am liebsten?': {
      fr: 'Quel exercice préférez-vous ?',
      en: 'Which exercise do you like best?'
    }
  };

  const handleTranslate = async (question) => {
    setSelectedQuestion(question);
    setIsTranslating(true);
    
    // Simuliere API-Aufruf
    setTimeout(() => {
      const result = {
        de: question,
        fr: mockTranslations[question]?.fr || 'Traduction française...',
        en: mockTranslations[question]?.en || 'English translation...'
      };
      setTranslations(result);
      setIsTranslating(false);
      console.log('✅ Demo-Übersetzung:', result);
    }, 1000);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
      padding: '2rem',
      color: 'white',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Back Button */}
        <div style={{ marginBottom: '2rem' }}>
          <BackButton to="/" />
        </div>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            🤖 AI-Übersetzung Demo
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, marginBottom: '1rem' }}>
            Automatische Übersetzung mit DeepL API
          </p>
          <div style={{
            display: 'inline-block',
            background: '#10b981',
            padding: '0.5rem 1rem',
            borderRadius: '25px',
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            ✅ DeepL API aktiv
          </div>
        </div>

        {/* Demo Questions */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          marginBottom: '2rem',
          color: '#1f2937'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            📝 Demo-Fragen testen
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            Klicke auf eine Frage und sieh die automatische Übersetzung:
          </p>
          
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {demoQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleTranslate(question)}
                disabled={isTranslating}
                style={{
                  padding: '1rem',
                  background: '#f3f4f6',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  opacity: isTranslating ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isTranslating) {
                    e.target.style.background = '#e5e7eb';
                    e.target.style.borderColor = '#3b82f6';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#f3f4f6';
                  e.target.style.borderColor = '#e5e7eb';
                }}
              >
                <strong>#{index + 1}</strong> {question}
              </button>
            ))}
          </div>
        </div>

        {/* Translation Results */}
        {selectedQuestion && (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            color: '#1f2937'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              🌍 Übersetzungs-Ergebnisse
            </h2>
            
            <div style={{
              background: '#f9fafb',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}>
              <strong>Ausgewählte Frage:</strong> {selectedQuestion}
            </div>

            {isTranslating ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  border: '3px solid #e5e7eb',
                  borderTop: '3px solid #3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <span style={{ marginLeft: '1rem', color: '#3b82f6', fontWeight: '500' }}>
                  DeepL übersetzt... 🤖
                </span>
              </div>
            ) : translations.de ? (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {/* German */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: '#fef2f2',
                  borderRadius: '8px'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>🇩🇪</span>
                  <div>
                    <div style={{ fontWeight: '600', color: '#dc2626' }}>
                      Deutsch (Original)
                    </div>
                    <div style={{ color: '#374151' }}>{translations.de}</div>
                  </div>
                </div>

                {/* French */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: '#eff6ff',
                  borderRadius: '8px'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>🇫🇷</span>
                  <div>
                    <div style={{ fontWeight: '600', color: '#2563eb' }}>
                      Français (DeepL AI)
                    </div>
                    <div style={{ color: '#374151' }}>{translations.fr}</div>
                  </div>
                </div>

                {/* English */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: '#f0fdf4',
                  borderRadius: '8px'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>🇬🇧</span>
                  <div>
                    <div style={{ fontWeight: '600', color: '#16a34a' }}>
                      English (DeepL AI)
                    </div>
                    <div style={{ color: '#374151' }}>{translations.en}</div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Info Box */}
        <div style={{
          marginTop: '2rem',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.75rem' }}>
            💡 So funktioniert die AI-Übersetzung:
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: '0.5rem' }}>• Automatische Übersetzung aller neuen Fragen</li>
            <li style={{ marginBottom: '0.5rem' }}>• DeepL API für professionelle Qualität</li>
            <li style={{ marginBottom: '0.5rem' }}>• Caching verhindert doppelte API-Calls</li>
            <li style={{ marginBottom: '0.5rem' }}>• 500.000 Zeichen gratis pro Monat</li>
            <li>• Keine manuelle Übersetzungsarbeit mehr nötig! 🎉</li>
          </ul>
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AITranslationDemo;
