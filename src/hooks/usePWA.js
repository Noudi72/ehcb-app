import { useEffect, useState } from 'react';

const usePWA = () => {
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    // Prüfen ob im Browser
    if (typeof window === 'undefined') return;

    // Service Worker registrieren
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
  navigator.serviceWorker.register(`${import.meta.env.BASE_URL || '/'}sw.js`)
          .then((registration) => {
            console.log('SW registered: ', registration);
            
            // Push-Notification-Berechtigung anfordern (optional)
            if ('Notification' in window && Notification.permission === 'default') {
              // Nicht automatisch fragen, sondern nur bei Bedarf
              console.log('Push-Notifications verfügbar');
            }
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }

    // PWA Install-Prompt verwalten
    const handleBeforeInstallPrompt = (e) => {
      console.log('Install prompt verfügbar');
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      console.log('PWA wurde installiert');
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    // Online/Offline Status verfolgen
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      console.log('Kein Install-Prompt verfügbar');
      return false;
    }

    try {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      
      if (result.outcome === 'accepted') {
        console.log('PWA installation accepted');
        setIsInstallable(false);
        setDeferredPrompt(null);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Install-Fehler:', error);
      return false;
    }
  };

  const sendTestNotification = async () => {
    if (typeof window === 'undefined') return;
    
    try {
      // Erst Berechtigung anfordern
      if ('Notification' in window) {
        let permission = Notification.permission;
        
        if (permission === 'default') {
          permission = await Notification.requestPermission();
        }
        
        if (permission === 'granted') {
          // Einfache Browser-Notification
          new Notification('EHC Biel Spirit', {
            body: 'Test-Benachrichtigung erfolgreich! 🏒',
            icon: `${import.meta.env.BASE_URL || '/'}ehcb_logo.png`,
            badge: `${import.meta.env.BASE_URL || '/'}ehcb_logo.png`
          });
        } else {
          alert('Push-Benachrichtigungen sind nicht erlaubt');
        }
      } else {
        alert('Ihr Browser unterstützt keine Push-Benachrichtigungen');
      }
    } catch (error) {
      console.error('Notification-Fehler:', error);
      alert('Fehler beim Senden der Test-Benachrichtigung');
    }
  };

  return {
    isInstallable,
    isOnline,
    installApp,
    sendTestNotification
  };
};

export default usePWA;
