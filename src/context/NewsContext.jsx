import React, { createContext, useState, useContext, useEffect } from 'react';
import { sendNewsNotification } from '../utils/pushNotifications';

// Erstellen eines Kontexts für News-Daten
const NewsContext = createContext();

// NewsProvider-Komponente
export const NewsProvider = ({ children }) => {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // News aus localStorage laden
  const loadNews = () => {
    try {
      const stored = localStorage.getItem('ehcb-news');
      if (stored) {
        const parsedNews = JSON.parse(stored);
        setNewsItems(parsedNews);
      }
    } catch (error) {
      console.error('Fehler beim Laden der News aus localStorage:', error);
    } finally {
      setLoading(false);
    }
  };

  // News in localStorage speichern
  const saveNews = (newsArray) => {
    try {
      localStorage.setItem('ehcb-news', JSON.stringify(newsArray));
    } catch (error) {
      console.error('Fehler beim Speichern der News in localStorage:', error);
    }
  };

  // Initial News laden
  useEffect(() => {
    loadNews();
  }, []);
  
  // Funktion zum Hinzufügen eines News-Items
  const addNewsItem = async (newItem) => {
    try {
      const newsWithId = {
        ...newItem,
        id: Date.now(), // Eindeutige ID generieren
        createdAt: new Date().toISOString()
      };
      
      const updatedNews = [newsWithId, ...newsItems];
      setNewsItems(updatedNews);
      saveNews(updatedNews);
      
      // Push-Benachrichtigung für neue News senden (nur für Spieler wichtig)
      try {
        await sendNewsNotification(
          newsWithId.title, 
          newsWithId.content || newsWithId.description || ''
        );
      } catch (error) {
        console.warn('Push-Benachrichtigung für News konnte nicht gesendet werden:', error);
      }
      
      return newsWithId;
    } catch (error) {
      console.error('Fehler beim Hinzufügen der News:', error);
      throw error;
    }
  };
  
  // Funktion zum Aktualisieren eines News-Items
  const updateNewsItem = async (updatedItem) => {
    try {
      const updatedNews = newsItems.map(item => 
        item.id === updatedItem.id ? { ...updatedItem, updatedAt: new Date().toISOString() } : item
      );
      setNewsItems(updatedNews);
      saveNews(updatedNews);
      return updatedItem;
    } catch (error) {
      console.error('Fehler beim Aktualisieren der News:', error);
      throw error;
    }
  };
  
  // Funktion zum Löschen eines News-Items
  const deleteNewsItem = async (itemId) => {
    try {
      const updatedNews = newsItems.filter(item => item.id !== itemId);
      setNewsItems(updatedNews);
      saveNews(updatedNews);
    } catch (error) {
      console.error('Fehler beim Löschen der News:', error);
      throw error;
    }
  };

  // Funktion zum Löschen aller News (für Testing)
  const clearAllNews = () => {
    setNewsItems([]);
    saveNews([]);
  };

  return (
    <NewsContext.Provider value={{ 
      newsItems, 
      addNewsItem, 
      updateNewsItem, 
      deleteNewsItem,
      clearAllNews,
      loading,
      refreshNews: loadNews
    }}>
      {children}
    </NewsContext.Provider>
  );
};

// Hook für den Zugriff auf den News-Kontext
export const useNews = () => {
  const context = useContext(NewsContext);
  if (!context) {
    throw new Error('useNews must be used within a NewsProvider');
  }
  return context;
};
