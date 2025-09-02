// Zentrale Push-Notification-Funktionen für EHCB App
// Unterstützt sowohl Browser-Notifications als auch Service Worker Push

/**
 * Prüft ob Push-Notifications unterstützt werden (auch für iPhone/Safari)
 */
export const isPushSupported = () => {
  if (typeof window === 'undefined') return false;
  
  // Browser-Notifications (Standard)
  if ('Notification' in window) return true;
  
  // Service Worker Push (PWA)
  if ('serviceWorker' in navigator && 'PushManager' in window) return true;
  
  // iOS Safari 16.4+ Web Push
  if ('safari' in window && 'pushNotification' in window.safari) return true;
  
  return false;
};

/**
 * Fordert Push-Notification-Berechtigung an (Cross-Platform)
 */
export const requestNotificationPermission = async () => {
  if (!isPushSupported()) {
    return 'not-supported';
  }
  
  try {
    // Standard Browser-Notifications
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission;
    }
    
    // iOS Safari Web Push (falls verfügbar)
    if ('safari' in window && 'pushNotification' in window.safari) {
      const permission = await window.safari.pushNotification.requestPermission();
      return permission === 'granted' ? 'granted' : 'denied';
    }
    
    return 'denied';
  } catch (error) {
    console.error('Fehler beim Anfordern der Push-Berechtigung:', error);
    return 'denied';
  }
};

/**
 * Sendet eine Push-Benachrichtigung für neue News
 * @param {string} newsTitle - Titel der News
 * @param {string} newsPreview - Kurzer Vorschautext
 */
export const sendNewsNotification = async (newsTitle, newsPreview = '') => {
  if (typeof window === 'undefined') return;
  
  try {
    const permission = await requestNotificationPermission();
    
    if (permission === 'granted') {
      // Browser-Notification (funktioniert auf allen Plattformen)
      if ('Notification' in window) {
        new Notification('📰 Neue News - EHC Biel Spirit', {
          body: newsTitle + (newsPreview ? `: ${newsPreview.substring(0, 100)}...` : ''),
          icon: '/spirit-logo.png',
          badge: '/spirit-logo.png',
          tag: 'news-notification',
          requireInteraction: false,
          silent: false
        });
      }
      
      console.log('News-Benachrichtigung gesendet:', newsTitle);
    } else if (permission === 'not-supported') {
      console.info('Push-Notifications werden auf diesem Gerät nicht unterstützt');
    }
  } catch (error) {
    console.warn('Fehler beim Senden der News-Benachrichtigung:', error);
  }
};

/**
 * Sendet eine Push-Benachrichtigung für neue Umfragen
 * @param {string} surveyTitle - Titel der Umfrage
 * @param {string} description - Beschreibung der Umfrage
 */
export const sendSurveyNotification = async (surveyTitle, description = '') => {
  if (typeof window === 'undefined') return;
  
  try {
    const permission = await requestNotificationPermission();
    
    if (permission === 'granted') {
      // Browser-Notification (funktioniert auf allen Plattformen)
      if ('Notification' in window) {
        new Notification('� Neue Umfrage - EHC Biel Spirit', {
          body: surveyTitle + (description ? `: ${description.substring(0, 100)}...` : ''),
          icon: '/spirit-logo.png',
          badge: '/spirit-logo.png',
          tag: 'survey-notification',
          requireInteraction: true, // Umfragen sind wichtiger - User sollte interagieren
          silent: false
        });
      }
      
      console.log('Umfrage-Benachrichtigung gesendet:', surveyTitle);
    } else if (permission === 'not-supported') {
      console.info('Push-Notifications werden auf diesem Gerät nicht unterstützt');
    }
  } catch (error) {
    console.warn('Fehler beim Senden der Umfrage-Benachrichtigung:', error);
  }
};
