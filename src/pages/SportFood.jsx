import React from "react";
import { useSportFood } from "../context/SportFoodContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import BackButton from "../components/BackButton";
import TranslationButton from "../components/TranslationButton";


export default function SportFood() {
  const { foodItems, loading, error } = useSportFood();
  const { isCoach } = useAuth();
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen flex flex-col font-sans ${isDarkMode ? 'bg-gray-900' : 'bg-[#f8fafc]'}`}>
      <Header />
      <div className="px-4 py-4">
        <BackButton to="/" />
      </div>

      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="flex justify-between items-center mb-6">
            <h1 className={`text-2xl font-bold text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Sport Food Guide</h1>
            {isCoach && (
              <button
                onClick={() => navigate('/coach/sportfood')}
                className={`text-sm px-3 py-1 rounded-lg hover:bg-opacity-90 transition ${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-[#0a2240] text-white hover:bg-blue-900'}`}
              >
                Bearbeiten
              </button>
            )}
          </div>

          {loading && (
            <div className="flex justify-center items-center py-10">
              <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${isDarkMode ? 'border-blue-400' : 'border-blue-500'}`}></div>
              <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Laden...</span>
            </div>
          )}

          {error && (
            <div className={`border px-4 py-3 rounded mb-4 ${isDarkMode ? 'bg-red-900 border-red-700 text-red-300' : 'bg-red-100 border-red-400 text-red-700'}`}>
              {error}
            </div>
          )}
          
          {foodItems.map((category, index) => (
            <div key={index} className="mb-8">
              <h2 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-blue-400' : 'text-[#0a2240]'}`}>{category.category}</h2>
              <div className="space-y-4">
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} className={`rounded-xl shadow-md border p-4 ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
                    <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.name}</div>
                    <div className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.description}</div>
                    <div className={`text-xs font-semibold mt-2 ${isDarkMode ? 'text-blue-400' : 'text-[#0a2240]'}`}>Timing: {item.time}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-blue-900 bg-opacity-20' : 'bg-[#0a2240] bg-opacity-10'}`}>
            <h3 className={`font-semibold ${isDarkMode ? 'text-blue-400' : 'text-[#0a2240]'}`}>Wichtige Hinweise:</h3>
            <ul className={`list-disc pl-5 mt-2 text-sm space-y-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>Hydrierung ist essenziell - trinke regelmäßig Wasser!</li>
              <li>Jeder Körper reagiert anders - finde heraus, was für dich am besten funktioniert</li>
              <li>Bei Fragen wende dich an unseren Ernährungsberater</li>
            </ul>
          </div>
          
          {/* Bestelllink */}
          <div className="mt-6 text-center">
            <a 
              href="https://sponser-app.vercel.app" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`inline-flex items-center py-3 px-6 rounded-lg hover:bg-opacity-90 transition ${isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-[#0a2240] text-white hover:bg-blue-900'}`}
            >
              <span className="mr-2">Sponser Sport Food bestellen</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </main>

      {/* Translation Button - außer auf externen Seiten */}
      <TranslationButton position="bottom-right" />
      
    </div>
  );
}
