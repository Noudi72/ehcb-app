import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { sendNewsNotification } from '../utils/pushNotifications';

// Erstellen eines Kontexts für News-Daten
const NewsContext = createContext();

// NewsProvider-Komponente
export const NewsProvider = ({ children }) => {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // News laden (Server-First, Local Fallback)
  const loadNews = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/news`);
      const items = Array.isArray(res.data) ? res.data : [];
      // Nach Datum sortieren (neu zuerst), falls kein Server-Sort
      items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setNewsItems(items);
      saveNewsLocal(items);
    } catch (error) {
      console.warn('Konnte News nicht vom Server laden, nutze lokalen Cache:', error?.message || error);
      try {
        const stored = localStorage.getItem('ehcb-news');
        if (stored) {
          const parsedNews = JSON.parse(stored);
          setNewsItems(parsedNews);
        } else {
          setNewsItems([]);
        }
      } catch (e) {
        console.error('Fehler beim Laden der News aus localStorage:', e);
        setNewsItems([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // News in localStorage speichern
  const saveNewsLocal = (newsArray) => {
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
    const payload = {
      ...newItem,
      createdAt: new Date().toISOString(),
    };
    try {
      const res = await axios.post(`${API_BASE_URL}/news`, payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      const saved = res.data || payload;
      const updatedNews = [saved, ...newsItems];
      setNewsItems(updatedNews);
      saveNewsLocal(updatedNews);
      try {
        await sendNewsNotification(saved.title, saved.content || saved.description || '');
      } catch (error) {
        console.warn('Push-Benachrichtigung für News konnte nicht gesendet werden:', error);
      }
      return saved;
    } catch (error) {
      console.warn('Server-POST fehlgeschlagen, speichere lokal:', error?.message || error);
      const local = { ...payload, id: Date.now() };
      const updatedNews = [local, ...newsItems];
      setNewsItems(updatedNews);
      saveNewsLocal(updatedNews);
      return local;
    }
  };
  
  // Funktion zum Aktualisieren eines News-Items
  const updateNewsItem = async (updatedItem) => {
    const payload = { ...updatedItem, updatedAt: new Date().toISOString() };
    try {
      await axios.patch(`${API_BASE_URL}/news/${updatedItem.id}`, payload, {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.warn('Server-PATCH fehlgeschlagen, aktualisiere nur lokal:', error?.message || error);
    }
    const updatedNews = newsItems.map(item => item.id === updatedItem.id ? payload : item);
    setNewsItems(updatedNews);
    saveNewsLocal(updatedNews);
    return payload;
  };
  
  // Funktion zum Löschen eines News-Items
  const deleteNewsItem = async (itemId) => {
    try {
      await axios.delete(`${API_BASE_URL}/news/${itemId}`);
    } catch (error) {
      console.warn('Server-DELETE fehlgeschlagen, lösche nur lokal:', error?.message || error);
    }
    const updatedNews = newsItems.filter(item => item.id !== itemId);
    setNewsItems(updatedNews);
    saveNewsLocal(updatedNews);
  };

  // Funktion zum Löschen aller News (für Testing)
  const clearAllNews = async () => {
    // Nur lokal leeren; optional: alle IDs sammeln und am Server löschen
    setNewsItems([]);
    saveNewsLocal([]);
  };

  return (
    <NewsContext.Provider value={{ 
      newsItems, 
      addNewsItem, 
      updateNewsItem, 
      deleteNewsItem,
  clearAllNews,
  loading,
  // Alias: beide anbieten, damit bestehende Seiten funktionieren
  refreshNews: loadNews,
  fetchNews: loadNews
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
