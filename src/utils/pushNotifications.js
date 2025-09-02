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
    // Berechtigung prüfen/anfordern
    if ('Notification' in window) {
      let permission = Notification.permission;
      
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }
      
      if (permission === 'granted') {
        // Push-Notification für neue Umfrage
        new Notification('📋 Neue Umfrage - EHC Biel Spirit', {
          body: `Neue Umfrage verfügbar: ${surveyTitle}` + (description ? ` - ${description.substring(0, 80)}...` : ''),
          icon: '/spirit-logo.png',
          badge: '/spirit-logo.png',
          tag: 'survey-notification', // Verhindert mehrere gleichzeitige Umfrage-Notifications
          requireInteraction: true, // Umfragen sind wichtiger - Benutzer muss aktiv schließen
          silent: false
        });
        
        console.log('Umfrage-Benachrichtigung gesendet:', surveyTitle);
      }
    }
  } catch (error) {
    console.warn('Fehler beim Senden der Umfrage-Benachrichtigung:', error);
  }
};

/**
 * Prüft ob Push-Benachrichtigungen unterstützt und erlaubt sind
 * @returns {boolean} true wenn Notifications verfügbar sind
 */
export const areNotificationsSupported = () => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

/**
 * Prüft den aktuellen Berechtigungsstatus
 * @returns {string} 'granted', 'denied', oder 'default'
 */
export const getNotificationPermission = () => {
  if (!areNotificationsSupported()) return 'denied';
  return Notification.permission;
};

/**
 * Fordert Benachrichtigungsberechtigung an (falls noch nicht erteilt)
 * @returns {Promise<string>} Berechtigungsstatus nach Anfrage
 */
export const requestNotificationPermission = async () => {
  if (!areNotificationsSupported()) return 'denied';
  
  if (Notification.permission === 'default') {
    return await Notification.requestPermission();
  }
  
  return Notification.permission;
};
