import React, { createContext, useContext, useState, useCallback } from "react";
import { surveys, responses, questions } from "../config/supabase-api";


// Erstellen des Umfrage-Kontexts
const UmfrageContext = createContext();
// Benutzerdefinierter Hook für den Zugriff auf den Umfrage-Kontext

export function useUmfrage() {
  return useContext(UmfrageContext);
}
// Umfrage Provider Komponente

export const UmfrageProvider = ({ children }) => {
  const [surveyList, setSurveyList] = useState([]);
  const [questionList, setQuestionList] = useState([]);
  const [responseList, setResponseList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const forceCleanReload = async () => {
    try {
      setLoading(true);
      setError(null);

      // Clear all caches and state
      setSurveyList([]);
      setQuestionList([]);
      setResponseList([]);
      setLastFetch(null);

      // Wait a bit to ensure everything is cleared
      await new Promise(resolve => setTimeout(resolve, 100));

      // Fetch fresh data from Supabase and normalize
      console.log("🔄 Force clean reload from Supabase...");
      const raw = await surveys.getAll();
      console.log('📥 Raw surveys loaded:', raw);

      // Ensure we have an array
      const arr = Array.isArray(raw) ? raw : (raw && typeof raw === 'object' ? [raw] : []);

      // Normalize each survey to have expected fields
      const normalized = arr.map((s, idx) => {
        const id = s && (s.id || s._id || s.ID) ? (s.id || s._id || s.ID) : `survey_${Date.now()}_${idx}`;
        const title = s && (s.title || s.name) ? (s.title || s.name) : '';
        const description = s && s.description ? s.description : '';
        const status = s && s.status ? s.status : (s && typeof s.active === 'boolean' ? (s.active ? 'active' : 'inactive') : 'inactive');
        const active = status === 'active' || Boolean(s && s.active);
        const questions = Array.isArray(s && s.questions) ? s.questions : [];
        const responses = Array.isArray(s && s.responses) ? s.responses : [];

        return {
          ...s,
          id,
          title,
          description,
          status,
          active,
          questions,
          responses
        };
      });

      console.log('✅ Normalized surveys:', normalized);
      setSurveyList(normalized);
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
      const raw = await surveys.getAll();
      console.log('📥 Raw fetched surveys:', raw);

      const arr = Array.isArray(raw) ? raw : (raw && typeof raw === 'object' ? [raw] : []);

      const normalized = arr.map((s, idx) => {
        const id = s && (s.id || s._id || s.ID) ? (s.id || s._id || s.ID) : `survey_${Date.now()}_${idx}`;
        const title = s && (s.title || s.name) ? (s.title || s.name) : '';
        const description = s && s.description ? s.description : '';
        const status = s && s.status ? s.status : (s && typeof s.active === 'boolean' ? (s.active ? 'active' : 'inactive') : 'inactive');
        const active = status === 'active' || Boolean(s && s.active);
        const questions = Array.isArray(s && s.questions) ? s.questions : [];
        const responses = Array.isArray(s && s.responses) ? s.responses : [];

        return {
          ...s,
          id,
          title,
          description,
          status,
          active,
          questions,
          responses
        };
      });

      console.log('✅ Normalized fetched surveys:', normalized);
      setSurveyList(normalized);
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
      setQuestionList([]);
      setError(null);
    } catch (err) {
      setError("Fehler beim Laden der Fragen");
      console.error("Fehler beim Laden der Fragen:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Alle Umfrageantworten abrufen  
  const fetchResponses = useCallback(async () => {
    setLoading(true);
    try {
      console.log('📥 Fetching responses from Supabase...');
      const data = await responses.getAll();
      setResponseList(data);
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
        setQuestionList([...questionList, data]);
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
        setQuestionList(questionList.map(q => q.id === questionId ? data : q));
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
      setQuestionList(questionList.filter(q => q.id !== questionId));
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

  // Single survey by ID holen
  const getSurveyById = async (surveyId) => {
    try {
      console.log('📥 Fetching survey by ID from Supabase:', surveyId);
      const data = await surveys.getById(surveyId);
      console.log('✅ Survey loaded:', data);
      return data;
    } catch (err) {
      console.error("Fehler beim Laden der Umfrage:", err);
      setError("Fehler beim Laden der Umfrage: " + err.message);
      return null;
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
      setResponseList([data, ...responseList]);
      setError(null);
      return true;
    } catch (err) {
      setError("Fehler beim Speichern der Antwort: " + err.message);
      console.error("Fehler beim Speichern der Antwort:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Context-Wert mit allen Funktionen und State
  const value = {
    surveys: surveyList,
    questions: questionList,
    responses: responseList,
    loading,
    error,
    lastFetch,
    fetchSurveys,
    fetchQuestions,
    fetchResponses,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    createSurvey,
    getSurveyById,
    updateSurvey,
    deleteSurvey,
    submitSurveyResponse,
    forceCleanReload
  };

  return (
    <UmfrageContext.Provider value={value}>
      {children}
    </UmfrageContext.Provider>
  );
};
console.log('📋 Supabase UmfrageContext loaded');
