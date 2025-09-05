import React, { createContext, useState, useContext, useEffect } from "react";
import { useReflexion } from "./ReflexionContext";
import { useUmfrage } from "./UmfrageContext";
import { notifications as notificationsAPI } from "../config/supabase-api";

// Erstellen des Benachrichtigungs-Kontexts
const NotificationContext = createContext();

// Benutzerdefinierter Hook für den Zugriff auf den Benachrichtigungs-Kontext
export const useNotification = () => useContext(NotificationContext);

// Notification Provider Komponente
export const NotificationProvider = ({ children }) => {
  const { reflections } = useReflexion();
  const { umfragen } = useUmfrage(); // Korrigiert: umfragen statt surveys
  const [notifications, setNotifications] = useState([]);
  const [lastChecked, setLastChecked] = useState(null);
  
  // Laden des letzten Überprüfungszeitpunkts aus dem localStorage
  useEffect(() => {
    const savedLastChecked = localStorage.getItem("lastChecked");
    if (savedLastChecked) {
      setLastChecked(new Date(savedLastChecked));
    } else {
      // Wenn noch keine Überprüfung erfolgt ist, aktuelles Datum verwenden
      const now = new Date();
      setLastChecked(now);
      localStorage.setItem("lastChecked", now.toISOString());
    }
  }, []);
  
  // Benachrichtigungen vom Server laden
  useEffect(() => {
    const fetchServerNotifications = async () => {
      try {
        const serverNotifications = await notificationsAPI.getAll();
        const formattedNotifications = serverNotifications.map(notification => ({
          ...notification,
          id: `server-${notification.id}`,
          read: notification.read || false
        }));
        
        setNotifications(prevNotifications => {
          // Nur Benachrichtigungen hinzufügen, die noch nicht existieren
          const existingIds = prevNotifications.map(n => n.id);
          const newServerNotifications = formattedNotifications.filter(
            n => !existingIds.includes(n.id)
          );
          
          return [...newServerNotifications, ...prevNotifications];
        });
      } catch (err) {
        console.error("Fehler beim Laden der Benachrichtigungen:", err);
      }
    };
    
    fetchServerNotifications();
    
    // Alle 60 Sekunden aktualisieren
    const intervalId = setInterval(fetchServerNotifications, 60000);
    return () => clearInterval(intervalId);
  }, []);

  // Überwachen der Reflexionen, um neue Benachrichtigungen zu erstellen
  useEffect(() => {
    if (lastChecked && reflections.length > 0) {
      const newNotifications = reflections.filter(
        (reflexion) => new Date(reflexion.date) > lastChecked
      );
      
      if (newNotifications.length > 0) {
        setNotifications((prevNotifications) => [
          ...newNotifications.map(reflexion => ({
            id: `reflection-${reflexion.id}`,
            type: "new-reflection",
            message: `Neue Reflexion von ${reflexion.name}`,
            date: reflexion.date,
            read: false,
            data: reflexion
          })),
          ...prevNotifications
        ]);
      }
    }
  }, [reflections, lastChecked]);
  
  // Überwachen der Umfragen, um neue Benachrichtigungen zu erstellen
  useEffect(() => {
    if (lastChecked && umfragen.length > 0) {
      const newSurveys = umfragen.filter(
        (survey) => new Date(survey.createdAt) > lastChecked && survey.active
      );
      
      if (newSurveys.length > 0) {
        setNotifications((prevNotifications) => [
          ...newSurveys.map(survey => ({
            id: `survey-${survey.id}`,
            type: "new-survey",
            message: `Neue Umfrage: ${survey.title}`,
            date: survey.createdAt,
            read: false,
            data: survey
          })),
          ...prevNotifications
        ]);
      }
    }
  }, [umfragen, lastChecked]);
  
  // Markieren aller Benachrichtigungen als gelesen
  const markAllAsRead = () => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) => ({ ...notification, read: true }))
    );
    
    const now = new Date();
    setLastChecked(now);
    localStorage.setItem("lastChecked", now.toISOString());
  };
  
  // Markieren einer einzelnen Benachrichtigung als gelesen
  const markAsRead = async (notificationId) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
    
    // Wenn es eine Server-Benachrichtigung ist, auch auf dem Server aktualisieren
    if (notificationId.startsWith('server-')) {
      const serverNotificationId = notificationId.replace('server-', '');
      try {
        await notificationsAPI.markAsRead(serverNotificationId);
      } catch (err) {
        console.error("Fehler beim Aktualisieren der Benachrichtigung:", err);
      }
    }
  };
  
  // Entfernen einer Benachrichtigung
  const removeNotification = async (notificationId) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== notificationId)
    );
    
    // Wenn es eine Server-Benachrichtigung ist, auch auf dem Server entfernen
    if (notificationId.startsWith('server-')) {
      const serverNotificationId = notificationId.replace('server-', '');
      try {
        await notificationsAPI.delete(serverNotificationId);
      } catch (err) {
        console.error("Fehler beim Entfernen der Benachrichtigung:", err);
      }
    }
  };
  
  // Neue Benachrichtigung senden
  const sendNotification = async (notification) => {
    try {
      console.log('📤 Sending notification:', notification);
      
      // Für jetzt als lokale Benachrichtigung hinzufügen
      const newNotification = {
        id: Date.now(),
        title: notification.title,
        message: notification.message,
        type: notification.type || 'info',
        read: false,
        timestamp: new Date(),
        urgent: notification.urgent || false
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      
      // Hier könnte später eine echte Push-Notification API integriert werden
      console.log('✅ Notification sent successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to send notification:', error);
      throw error;
    }
  };

  // Anzahl der ungelesenen Benachrichtigungen
  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;
  
  // Werte, die dem Context zur Verfügung gestellt werden
  const value = {
    notifications,
    unreadCount,
    markAllAsRead,
    markAsRead,
    removeNotification,
    sendNotification,
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
