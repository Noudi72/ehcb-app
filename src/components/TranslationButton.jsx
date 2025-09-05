import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const TranslationButton = ({ 
  position = 'bottom-right', 
  className = '',
  size = 'normal' 
}) => {
  const { language, changeLanguage, currentLanguage } = useLanguage();
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    setIsOpen(false);
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
        className={`
          ${currentSize.button}
          flex items-center justify-center
          rounded-full shadow-lg
          transition-all duration-300 hover:scale-110
          ${isDarkMode 
            ? 'bg-gray-800 hover:bg-gray-700 text-white border-2 border-gray-600' 
            : 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200'
          }
        `}
        title="Sprache wählen / Choisir langue / Choose language"
      >
        <span className="text-lg">{currentLanguage.flag}</span>
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
