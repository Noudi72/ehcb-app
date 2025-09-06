import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
  return (
    <>
      <header 
        className="relative bg-cover bg-center text-white"
        style={{
          backgroundImage: `url('${bannerImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: window.innerWidth >= 768 ? 'center' : 'center',
          // Optimiert für angepasstes Desktop Banner
          height: 'clamp(140px, 15vw, 200px)'
        }}
      >
        {/* Top Navigation Bar - minimaler Hintergrund nur für Buttons */}
        <div className="relative z-10 h-full flex items-start justify-end p-4">
          <div className="flex flex-col items-end space-y-2">
            {/* User Info und Language Toggle in einer Reihe */}
            <div className="flex items-center space-x-2">
              {/* User Info */}
              {isAuthenticated && (
                <div className="hidden sm:block text-sm flex items-center space-x-2">
                  {user?.name && <span className="text-white bg-black bg-opacity-50 px-2 py-1 rounded">{user.name}</span>}
                  {isCoach && <span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded font-medium text-xs" style={{boxShadow: 'none'}}>Coach</span>}
                </div>
              )}

              {/* Dark Mode Toggle Button */}
              <button
                onClick={toggleDarkMode}
                className="bg-black bg-opacity-50 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-opacity-70 transition-all duration-300"
                aria-label={isDarkMode ? 'Light Mode aktivieren' : 'Dark Mode aktivieren'}
              >
                {isDarkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Hamburger Menu Button darunter */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="bg-black bg-opacity-50 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-opacity-70 transition-all duration-300"
              aria-label="Menü öffnen"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-white">
                <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Sprachumschalter direkt unter dem Burger-Menü */}
            <div className="relative mt-2">
              <button
                onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                className="bg-black bg-opacity-80 backdrop-blur-sm text-white px-3 py-2 rounded-lg hover:bg-opacity-90 transition-all duration-300 font-medium text-sm flex items-center space-x-2 shadow-lg border border-white border-opacity-20"
                disabled={isTranslating}
              >
                {isTranslating ? (
                  <>
                    <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>...</span>
                  </>
                ) : (
                  <>
                    <span>{currentLanguage.flag || '🇩🇪'}</span>
                    <span>{currentLanguage.code.toUpperCase()}</span>
                    <svg className={`w-3 h-3 transition-transform ${languageMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>

              {/* Language Dropdown */}
              {languageMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 py-1 z-50">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => {
                        setLanguageMenuOpen(false);
                        changeLanguage(language.code);
                        translatePageContent(language.code);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 ${
                        currentLanguage.code === language.code ? 'bg-blue-50 dark:bg-blue-900' : ''
                      }`}
                    >
                      <span>{language.flag}</span>
                      <span className="text-gray-700 dark:text-gray-300">{language.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Click outside overlay */}
              {languageMenuOpen && (
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setLanguageMenuOpen(false)}
                />
              )}
            </div>
          </div>
        </div>
      </header>
      <header 
        className="relative bg-cover bg-center text-white"
        style={{
          backgroundImage: `url('${bannerImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: window.innerWidth >= 768 ? 'center' : 'center',
          // Optimiert für angepasstes Desktop Banner
          height: 'clamp(140px, 15vw, 200px)'
        }}
      >
        {/* Top Navigation Bar - minimaler Hintergrund nur für Buttons */}
        <div className="relative z-10 h-full flex items-start justify-end p-4">
          <div className="flex flex-col items-end space-y-2">
            {/* User Info und Language Toggle in einer Reihe */}
            <div className="flex items-center space-x-2">
              {/* User Info */}
              {isAuthenticated && (
                <div className="hidden sm:block text-sm flex items-center space-x-2">
                  {user?.name && <span className="text-white bg-black bg-opacity-50 px-2 py-1 rounded">{user.name}</span>}
                  {isCoach && <span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded font-medium text-xs" style={{boxShadow: 'none'}}>Coach</span>}
                </div>
              )}

              {/* Dark Mode Toggle Button */}
              <button
                onClick={toggleDarkMode}
                className="bg-black bg-opacity-50 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-opacity-70 transition-all duration-300"
                aria-label={isDarkMode ? 'Light Mode aktivieren' : 'Dark Mode aktivieren'}
              >
                {isDarkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Hamburger Menu Button darunter */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="bg-black bg-opacity-50 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-opacity-70 transition-all duration-300"
              aria-label="Menü öffnen"
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" className="text-white">
                <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Simple Menu Overlay - von rechts, responsive Breite */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-30" onClick={() => setMenuOpen(false)}>
          <div className="bg-white dark:bg-gray-800 w-48 sm:w-56 h-full ml-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Navigation</h3>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M6 18L18 6M6 6l12 12" className="text-gray-600 dark:text-gray-300" />
                  </svg>
                </button>
              </div>
            </div>
            
            <nav className="p-4">
              <ul className="space-y-3">
                <li>
                  <Link 
                    to="/" 
                    className="block py-3 px-4 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 rounded-lg transition-all duration-200 font-medium"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t('common.home')}
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/reflexion" 
                    className="block py-3 px-4 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 rounded-lg transition-all duration-200 font-medium"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t('common.reflexion')}
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/umfrage" 
                    className="block py-3 px-4 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 rounded-lg transition-all duration-200 font-medium"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t('common.survey')}
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/news" 
                    className="block py-3 px-4 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 rounded-lg transition-all duration-200 font-medium"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t('common.news')}
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/sportfood" 
                    className="block py-3 px-4 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 rounded-lg transition-all duration-200 font-medium"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t('common.sportfood')}
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/cardio" 
                    className="block py-3 px-4 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 rounded-lg transition-all duration-200 font-medium"
                    onClick={() => setMenuOpen(false)}
                  >
                    Cardio
                  </Link>
                </li>
                
                {/* Coach Dashboard */}
                {isCoach && (
                  <li className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-3">
                    <Link 
                      to="/coach/dashboard" 
                      className="block py-3 px-4 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-800 dark:hover:text-blue-200 rounded-lg transition-all duration-200 font-semibold bg-blue-50 dark:bg-blue-900/30"
                      onClick={() => setMenuOpen(false)}
                    >
                      {t('home.coachDashboard')}
                    </Link>
                  </li>
                )}
                
                {/* Authentication */}
                {!isAuthenticated ? (
                  <>
                    <li className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-3">
                      <Link 
                        to="/player-login" 
                        className="block py-3 px-4 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-200 rounded-lg transition-all duration-200 font-medium bg-blue-50 dark:bg-blue-900/30"
                        onClick={() => setMenuOpen(false)}
                      >
                        {t('header.playerArea')}
                      </Link>
                    </li>
                    <li className="mt-2">
                      <Link 
                        to="/coach-login" 
                        className="block py-3 px-4 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-200 rounded-lg transition-all duration-200 font-medium bg-blue-50 dark:bg-blue-900/30"
                        onClick={() => setMenuOpen(false)}
                      >
                        {t('header.coachArea')}
                      </Link>
                    </li>
                  </>
                ) : (
                  <li className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-3">
                    <button 
                      onClick={() => {
                        logout();
                        setMenuOpen(false);
                      }}
                      className="w-full text-left py-3 px-4 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-300 rounded-lg transition-all duration-200 font-medium bg-red-50 dark:bg-red-900/20"
                    >
                      {t('common.logout')}
                    </button>
                  </li>
                )}
              </ul>
              
              {/* Dark Mode Toggle */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => {
                    toggleDarkMode();
                    setMenuOpen(false);
                  }}
                  className="w-full mb-2 py-3 px-4 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg transition-all duration-200 font-medium bg-gray-50 dark:bg-gray-800 flex items-center space-x-2"
                >
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    {isDarkMode ? (
                      <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
                    ) : (
                      <path d="M9 2c-1.05 0-2.05.16-3 .46 4.06 1.27 7 5.06 7 9.54 0 4.48-2.94 8.27-7 9.54.95.3 1.95.46 3 .46 5.52 0 10-4.48 10-10S14.52 2 9 2z"/>
                    )}
                  </svg>
                  <span>{isDarkMode ? 'Hell' : 'Dunkel'}</span>
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;