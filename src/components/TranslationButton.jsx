import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { translateText } from '../config/translationService';

const TranslationButton = ({ 
  position = 'bottom-right', 
  className = '',
  size = 'normal' 
}) => {
  const { language, changeLanguage, currentLanguage } = useLanguage();
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const languages = [
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  const handleLanguageChange = async (langCode) => {
    if (isTranslating) return;
    
    setIsTranslating(true);
    changeLanguage(langCode);
    setIsOpen(false);
    
    // Seiteninhalt übersetzen
    try {
      console.log(`🌐 TranslationButton: Übersetze nach ${langCode}...`);
      
      // Warte kurz damit der Language Context aktualisiert wird
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Alle Textelemente sammeln (ausgenommen Navigation und Buttons)
      const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span:not(.no-translate), div:not(.no-translate):not([role="button"]), label');
      const elementsToTranslate = [];
      
      textElements.forEach(element => {
        const text = element.textContent.trim();
        // Nur übersetzen wenn: direkter Text, mehr als 2 Zeichen, nicht bereits übersetzt
        if (element.children.length === 0 && 
            text.length > 2 &&
            !text.match(/^[🇩🇪🇫🇷🇬🇧🇺🇸]/) && // Keine Flags
            !text.match(/^\d+$/) && // Keine reinen Zahlen
            !element.classList.contains('no-translate') &&
            !element.hasAttribute('data-translated') &&
            !element.closest('.no-translate') &&
            !element.closest('button') &&
            !element.closest('[role="button"]') &&
            !element.closest('nav')) {
          elementsToTranslate.push(element);
        }
      });

      console.log(`📝 TranslationButton: ${elementsToTranslate.length} Elemente zu übersetzen`);
      
      // Übersetzung in kleinen Batches
      const batchSize = 3;
      let translated = 0;
      
      for (let i = 0; i < elementsToTranslate.length; i += batchSize) {
        const batch = elementsToTranslate.slice(i, i + batchSize);
        
        await Promise.all(batch.map(async (element) => {
          try {
            const originalText = element.textContent.trim();
            const translatedText = await translateText(originalText, langCode, currentLanguage.code);
            
            if (translatedText && translatedText !== originalText) {
              element.textContent = translatedText;
              element.setAttribute('data-translated', 'true');
              element.setAttribute('data-original', originalText);
              translated++;
            }
          } catch (error) {
            console.error('TranslationButton: Übersetzungsfehler:', error);
          }
        }));
        
        // Pause zwischen Batches
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      console.log(`✅ TranslationButton: ${translated} Texte übersetzt`);
      
    } catch (error) {
      console.error('❌ TranslationButton: Fehler bei Übersetzung:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  // Position styles
  const positionStyles = {
    'bottom-right': 'fixed bottom-6 right-6 z-50',
    'top-right': 'fixed top-20 right-6 z-50',
    'inline': 'relative',
    'header': 'relative'
  };

  // Size styles
  const sizeStyles = {
    small: {
      button: 'w-10 h-10 text-sm',
      dropdown: 'w-40',
      text: 'text-xs'
    },
    normal: {
      button: 'w-12 h-12 text-base',
      dropdown: 'w-48',
      text: 'text-sm'
    },
    large: {
      button: 'w-14 h-14 text-lg',
      dropdown: 'w-52',
      text: 'text-base'
    }
  };

  const currentSize = sizeStyles[size];

  return (
    <div className={`${positionStyles[position]} ${className}`}>
      {/* Translation Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isTranslating}
        className={`
          ${currentSize.button}
          flex items-center justify-center
          rounded-full shadow-lg
          transition-all duration-300 hover:scale-110
          ${isTranslating ? 'opacity-50 cursor-not-allowed' : ''}
          ${isDarkMode 
            ? 'bg-gray-800 hover:bg-gray-700 text-white border-2 border-gray-600' 
            : 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200'
          }
        `}
        title="Sprache wählen / Choisir langue / Choose language"
      >
        {isTranslating ? (
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <span className="text-lg">{currentLanguage.flag}</span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className={`
            absolute ${position.includes('right') ? 'right-0' : 'left-0'} 
            ${position.includes('bottom') ? 'bottom-full mb-2' : 'top-full mt-2'}
            ${currentSize.dropdown}
            ${isDarkMode 
              ? 'bg-gray-800 border-gray-600' 
              : 'bg-white border-gray-200'
            }
            rounded-lg shadow-xl border py-1 z-50
          `}>
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`
                  w-full px-4 py-2 text-left flex items-center space-x-3 
                  transition-colors duration-150 ${currentSize.text}
                  ${lang.code === currentLanguage.code 
                    ? `${isDarkMode 
                        ? 'bg-blue-900 text-blue-100' 
                        : 'bg-blue-50 text-blue-700'
                      } font-medium` 
                    : `${isDarkMode 
                        ? 'text-gray-200 hover:bg-gray-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }`
                  }
                `}
              >
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.name}</span>
                {currentLanguage.code === lang.code && (
                  <svg className="w-4 h-4 ml-auto text-current" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TranslationButton;
