import React, { useState, useEffect } from 'react';
import usePWA from '../hooks/usePWA';

const InstallPrompt = () => {
  const { isInstallable, isOnline, installApp } = usePWA();
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Prüfen ob bereits installiert oder dismissed
    const isDismissed = localStorage.getItem('installPromptDismissed');
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    if (isInstallable && !isDismissed && !isStandalone && !dismissed) {
      // Verzögerte Anzeige für bessere UX
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isInstallable, dismissed]);

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setShowBanner(false);
      setDismissed(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem('installPromptDismissed', 'true');
  };

  if (!showBanner || !isInstallable) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center p-4">
        {/* Install Banner */}
        <div className="install-banner show bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg max-w-md w-full p-6 text-white shadow-2xl transform transition-all duration-300">
          <div className="flex items-start space-x-4">
            {/* App Icon */}
            <div className="flex-shrink-0">
              <img 
                src="/u18-team_app-icon.png" 
                alt="EHC Biel Spirit" 
                className="w-12 h-12 rounded-lg"
              />
            </div>
            
            {/* Content */}
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-2">
                EHC Biel Spirit installieren
              </h3>
              <p className="text-blue-100 text-sm mb-4">
                Installiere die App für schnelleren Zugriff und Push-Benachrichtigungen
              </p>
              
              {/* Features */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm">
                  <svg className="w-4 h-4 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-blue-100">Offline-Nutzung</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <svg className="w-4 h-4 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-blue-100">Push-Benachrichtigungen</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <svg className="w-4 h-4 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-blue-100">Homescreen-Zugriff</span>
                </div>
              </div>
              
              {/* Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleInstall}
                  className="flex-1 bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors touch-button"
                >
                  Installieren
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 border border-blue-300 text-blue-100 rounded-lg hover:bg-blue-600 transition-colors touch-button"
                >
                  Später
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InstallPrompt;
