import React, { createContext, useState, useContext, useCallback } from "react";
import { surveys, questions, responses, users } from "../config/supabase-api";

const UmfrageContext = createContext();

export const UmfrageProvider = ({ children }) => {
  const [surveyList, setSurveyList] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const forceCleanReload = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Clear all caches and state
      setSurveyList([]);
      setQuestions([]);
      setResponses([]);
      setLastFetch(null);
      
      // Wait a bit to ensure everything is cleared
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Fetch fresh data from Supabase
      console.log("🔄 Force clean reload from Supabase...");
      const data = await surveys.getAll();
      console.log('📥 Fresh surveys loaded:', data);
      setSurveyList(data);
      setLastFetch(Date.now());
    } catch (error) {
      console.error("❌ Fehler beim Force Clean Reload:", error);
      setError("Fehler beim Neuladen der Daten");
    } finally {
      setLoading(false);
    }
  };

  // Alle Umfragen abrufen (mit Cache-Busting)
  const fetchSurveys = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) {
      return forceCleanReload();
    }
    
    setLoading(true);
    try {
      console.log('📥 Fetching surveys from Supabase...');
      const data = await surveys.getAll();
      console.log('📥 Fetched surveys:', data);
      setSurveys(data);
      setError(null);
    } catch (err) {
      setError("Fehler beim Laden der Umfragen");
      console.error("Fehler beim Laden der Umfragen:", err);
    } finally {
      setLoading(false);
    }
  }, []);, users } from "../config/supabase-api";ort React, { createContext, useState, useContext, useCallback, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { translateText } from "../config/translationService";
import { sendSurveyNotification } from "../utils/pushNotifications";

// Erstellen des Umfrage-Kontexts
const UmfrageContext = createContext();

// Benutzerdefinierter Hook für den Zugriff auf den Umfrage-Kontext
export const useUmfrage = () => useContext(UmfrageContext);

// Umfrage Provider Komponente
export const UmfrageProvider = ({ children }) => {
  const [surveys, setSurveys] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  
  // Force clean state and reload everything
  const forceCleanReload = async () => {
    console.log('🧹 FORCE CLEAN RELOAD - Clearing all state and reloading...');
    setLoading(true);
    setSurveys([]);
    setQuestions([]);
    setResponses([]);
    setError(null);
    
    try {
      // NUCLEAR cache-busting with random values and headers
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      
      const response = await axios.get(`${API_BASE_URL}/surveys`, {
        params: {
          _t: timestamp,
          _r: random,
          nocache: true,
          v: '3.0',
          bust: timestamp
        },
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      console.log('🎯 NUCLEAR FRESH DATA:', response.data);
      setSurveys(response.data);
      setError(null);
      
    } catch (err) {
      setError("Fehler beim Neuladen der Daten");
      console.error("Fehler beim Force Clean Reload:", err);
    } finally {
      setLoading(false);
    }
  };

  // Alle Umfragen abrufen (mit Cache-Busting)
  const fetchSurveys = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) {
      return forceCleanReload();
    }
    
    setLoading(true);
    try {
      console.log('📥 Fetching surveys from Supabase...');
      const data = await surveys.getAll();
      console.log('📥 Fetched surveys:', data);
      setSurveys(data);
      setError(null);
    } catch (err) {
      setError("Fehler beim Laden der Umfragen");
      console.error("Fehler beim Laden der Umfragen:", err);
    } finally {
      setLoading(false);
    }
  }, []);
  
    // Alle Fragen abrufen
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      console.log('📥 Fetching questions from Supabase...');
      // Note: In our new Supabase structure, questions are included in surveys
      // We'll keep this for backward compatibility but just set empty array
      setQuestions([]);
      setError(null);
    } catch (err) {
      setError("Fehler beim Laden der Fragen");
      console.error("Fehler beim Laden der Fragen:", err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Umfrageantworten abrufen und nach Datum sortieren (neueste zuerst)
  const fetchResponses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/survey-responses`);
      // Sortieren nach submittedAt, neueste zuerst
      const sortedResponses = [...response.data].sort((a, b) => {
        return new Date(b.submittedAt) - new Date(a.submittedAt);
      });
      setResponses(sortedResponses);
      setError(null);
    } catch (err) {
      setError("Fehler beim Laden der Umfrageantworten");
      console.error("Fehler beim Laden der Umfrageantworten:", err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Neue Frage hinzufügen
  const addQuestion = async (questionData) => {
    setLoading(true);
    try {
      console.log("Erstelle Frage in Supabase:", questionData);
      const data = await questions.create(questionData);
      
      if (data) {
        setQuestions([...questions, data]);
        setError(null);
        return data;
      } else {
        throw new Error("Keine Daten von Supabase erhalten");
      }
    } catch (err) {
      setError("Fehler beim Speichern der Frage: " + err.message);
      console.error("Fehler beim Speichern der Frage:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Frage aktualisieren
  const updateQuestion = async (questionId, questionData) => {
    setLoading(true);
    try {
      console.log(`Aktualisiere Frage mit ID ${questionId} in Supabase`);
      
      const data = await questions.update(questionId, questionData);
      
      if (data) {
        // Aktualisiere die Frage in der Liste
        setQuestions(questions.map(q => q.id === questionId ? data : q));
        setError(null);
        return data;
      } else {
        throw new Error("Keine Daten von Supabase erhalten");
      }
    } catch (err) {
      setError("Fehler beim Aktualisieren der Frage: " + err.message);
      console.error("Fehler beim Aktualisieren der Frage:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Frage löschen
  const deleteQuestion = async (questionId) => {
    setLoading(true);
    try {
      await questions.delete(questionId);
      setQuestions(questions.filter(q => q.id !== questionId));
      setError(null);
      return true;
    } catch (err) {
      setError("Fehler beim Löschen der Frage: " + err.message);
      console.error("Fehler beim Löschen der Frage:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Neue Umfrage erstellen
  const createSurvey = async (surveyData) => {
    setLoading(true);
    try {
      console.log('🔥 Erstelle Umfrage in Supabase:', surveyData);
      
      const data = await surveys.create(surveyData);
      
      if (data) {
        // Force refresh after creation to get fresh data
        await fetchSurveys(true);
        
        setError(null);
        console.log('✅ Umfrage erfolgreich erstellt');
        
        return data;
      } else {
        throw new Error("Keine Daten von Supabase erhalten");
      }
    } catch (err) {
      setError("Fehler beim Erstellen der Umfrage: " + err.message);
      console.error("❌ Fehler beim Erstellen der Umfrage:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Neue Benachrichtigung erstellen
  const createNotification = async (notificationData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/notifications`, notificationData);
      setNotifications(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      console.error("Fehler beim Erstellen der Benachrichtigung:", err);
      return null;
    }
  };

  // Team-spezifische Benachrichtigungen erstellen
  const createTeamNotifications = async (targetTeams, notificationData) => {
    try {
      // Hole alle User aus der Datenbank
      const usersResponse = await axios.get(`${API_BASE_URL}/users`);
      const users = usersResponse.data;

      // Filtere Spieler basierend auf den Ziel-Teams
      let targetUsers = [];
      
      if (!targetTeams || targetTeams.length === 0 || targetTeams.includes('all')) {
        // Alle aktiven Spieler
        targetUsers = users.filter(user => user.role === 'player' && user.active === true);
      } else {
        // Nur Spieler der ausgewählten Teams
        targetUsers = users.filter(user => {
          if (user.role !== 'player' || user.active !== true) return false;
          
          // Prüfe sowohl teams Array als auch mainTeam Feld für Abwärtskompatibilität
          const userTeams = user.teams || (user.mainTeam ? [user.mainTeam] : []);
          return targetTeams.some(team => userTeams.includes(team));
        });
      }

      // Erstelle Benachrichtigung für jeden Ziel-User
      for (const user of targetUsers) {
        const notification = {
          userId: user.id,
          title: notificationData.title,
          message: notificationData.message,
          type: notificationData.type || 'info',
          contentId: notificationData.contentId,
          isRead: false,
          createdAt: new Date().toISOString()
        };

        await axios.post(`${API_BASE_URL}/notifications`, notification);
      }

      console.log(`Umfrage-Benachrichtigungen an ${targetUsers.length} Spieler gesendet`);
      return true;
    } catch (error) {
      console.error('Fehler beim Senden der Team-Benachrichtigungen:', error);
      return false;
    }
  };
  
  // Umfrage aktualisieren
  const updateSurvey = async (surveyId, updatedData) => {
    setLoading(true);
    try {
      console.log('📝 Updating survey in Supabase:', surveyId, updatedData);
      
      const data = await surveys.update(surveyId, updatedData);
      
      // Force refresh after update to get fresh data
      await fetchSurveys(true);
      
      console.log('✅ Survey updated and data refreshed');
      setError(null);
      return data;
    } catch (err) {
      setError("Fehler beim Aktualisieren der Umfrage: " + err.message);
      console.error("Fehler beim Aktualisieren der Umfrage:", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Umfrage löschen
  const deleteSurvey = async (surveyId) => {
    setLoading(true);
    try {
      console.log('🗑️ Deleting survey in Supabase:', surveyId);
      await surveys.delete(surveyId);
      
      // Force refresh after deletion to get fresh data
      await fetchSurveys(true);
      
      console.log('✅ Survey deleted and data refreshed');
      setError(null);
      return true;
    } catch (err) {
      setError("Fehler beim Löschen der Umfrage: " + err.message);
      console.error("Fehler beim Löschen der Umfrage:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Umfrageantwort speichern
  const submitSurveyResponse = async (responseData) => {
    setLoading(true);
    try {
      const data = await responses.create(responseData);
      
      // Die neue Antwort am Anfang hinzufügen (neueste zuerst)
      setResponses([data, ...responses]);
      setError(null);
      return true;
    } catch (err) {
      setError("Fehler beim Speichern der Umfrageantwort");
      console.error("Fehler beim Speichern der Umfrageantwort:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Umfrageantwort löschen
  const deleteResponse = async (responseId) => {
    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/survey-responses/${responseId}`);
      setResponses(responses.filter(r => r.id !== responseId));
      setError(null);
      return true;
    } catch (err) {
      setError("Fehler beim Löschen der Antwort: " + (err.response?.data?.message || err.message));
      console.error("Fehler beim Löschen der Antwort:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Aktive Umfragen abrufen
  const getActiveSurveys = () => {
    return surveys.filter(survey => survey.active);
  };
  
  // Fragen für eine bestimmte Umfrage abrufen
  const getQuestionsForSurvey = (surveyId) => {
    const survey = surveys.find(s => s.id === surveyId);
    if (!survey || !survey.questions) return [];
    
    return questions.filter(q => survey.questions.includes(q.id));
  };
  
  // Alle aktiven Umfragen mit ihren Fragen abrufen
  const getActiveSurveysWithQuestions = () => {
    const activeSurveys = getActiveSurveys();
    console.log("Aktive Umfragen:", activeSurveys);
    console.log("Verfügbare Fragen:", questions);
    
    const result = activeSurveys.map(survey => {
      console.log(`Verarbeite Umfrage ${survey.id}:`, survey);
      
      // Sicherstellen, dass survey.questions ein Array ist
      let questionIds = [];
      
      // Prüfe ob survey.questions ein Array von IDs oder ein Array von Objekten ist
      if (Array.isArray(survey.questions)) {
        if (survey.questions.length > 0 && typeof survey.questions[0] === 'string') {
          // Es ist ein Array von IDs
          questionIds = survey.questions;
        } else if (survey.questions.length > 0 && typeof survey.questions[0] === 'object') {
          // Es ist ein Array von Frage-Objekten, extrahiere die IDs
          questionIds = survey.questions.map(q => q.id);
        }
      }
      
      console.log(`Frage-IDs in Umfrage ${survey.id}:`, questionIds);
      console.log("Alle verfügbaren Frage-IDs:", questions.map(q => q.id));
      
      // Vollständige Fragen-Objekte abrufen
      const surveyQuestions = questionIds
        .map(id => questions.find(q => q.id === id))
        .filter(q => q !== undefined);
      
      console.log(`Gefundene Fragen für Umfrage ${survey.id}:`, surveyQuestions);
      
      if (surveyQuestions.length === 0) {
        console.warn(`Keine Fragen für Umfrage ${survey.id} gefunden!`);
      }
      
      return {
        ...survey,
        questions: surveyQuestions
      };
    });
    
    console.log("Ergebnis:", result);
    return result;
  };

  // Initial Daten laden
  useEffect(() => {
    fetchQuestions();
    fetchSurveys();
    fetchResponses();
  }, [fetchQuestions, fetchSurveys, fetchResponses]);
  
  // Benachrichtigungen abrufen
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/notifications`);
      setNotifications(response.data);
    } catch (err) {
      console.error("Fehler beim Laden der Benachrichtigungen:", err);
    }
  }, []);

  // Initial auch Benachrichtigungen laden
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Neue Funktion: Fragen basierend auf der aktuellen Sprache übersetzen
  const getTranslatedQuestions = useCallback(async (questionsList, currentLanguage) => {
    if (!currentLanguage || currentLanguage === 'de') {
      return questionsList; // Deutsche Originale
    }

    try {
      const translatedQuestions = await Promise.all(
        questionsList.map(async (question) => {
          const translatedQuestion = await translateText(
            question.question, 
            currentLanguage, 
            'de'
          );
          
          let translatedOptions = question.options;
          if (question.options && Array.isArray(question.options)) {
            translatedOptions = await Promise.all(
              question.options.map(option => translateText(option, currentLanguage, 'de'))
            );
          }
          
          return {
            ...question,
            question: translatedQuestion,
            options: translatedOptions
          };
        })
      );
      return translatedQuestions;
    } catch (error) {
      console.error("Fehler beim Übersetzen der Fragen:", error);
      return questionsList; // Fallback zu deutschen Originalen
    }
  }, []);

  // Neue Funktion: Übersetzte Umfragen mit Fragen abrufen
  const getTranslatedSurveysWithQuestions = useCallback(async (currentLanguage) => {
    const activeSurveys = getActiveSurveysWithQuestions();
    
    if (!currentLanguage || currentLanguage === 'de') {
      return activeSurveys;
    }

    try {
      const translatedSurveys = await Promise.all(
        activeSurveys.map(async (survey) => {
          // Übersetze Survey-Titel und Beschreibung
          const translatedTitle = await translateText(
            survey.title, 
            currentLanguage, 
            'de'
          );
          const translatedDescription = await translateText(
            survey.description, 
            currentLanguage, 
            'de'
          );
          
          return {
            ...survey,
            title: translatedTitle,
            description: translatedDescription,
            questions: await getTranslatedQuestions(survey.questions, currentLanguage)
          };
        })
      );
      return translatedSurveys;
    } catch (error) {
      console.error("Fehler beim Übersetzen der Umfragen:", error);
      return activeSurveys;
    }
  }, [getActiveSurveysWithQuestions, getTranslatedQuestions]);

  // Werte, die dem Context zur Verfügung gestellt werden
  const value = {
    surveys,
    questions,
    responses,
    notifications,
    loading,
    error,
    fetchSurveys,
    fetchQuestions,
    fetchResponses,
    fetchNotifications,
    forceCleanReload, // Add this to context
    addQuestion,
    updateQuestion,
    deleteQuestion,
    createSurvey,
    createNotification,
    deleteSurvey,
    updateSurvey,
    submitSurveyResponse,
    deleteResponse,
    getActiveSurveys,
    getQuestionsForSurvey,
    getActiveSurveysWithQuestions,
    getTranslatedQuestions,
    getTranslatedSurveysWithQuestions
  };
  
  return (
    <UmfrageContext.Provider value={value}>
      {children}
    </UmfrageContext.Provider>
  );
};
