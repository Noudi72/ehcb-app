import React, { createContext, useState, useContext, useEffect } from "react";
import { surveys } from "../config/supabase-api";
import { supabase } from "../config/supabase-api";

const UmfrageContext = createContext();

export const useUmfrage = () => {
  const context = useContext(UmfrageContext);
  if (!context) {
    throw new Error("useUmfrage must be used within an UmfrageProvider");
  }
  return context;
};

export const UmfrageProvider = ({ children }) => {
  const [umfragen, setUmfragen] = useState([]);
  const [responses, setResponses] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [teams, setTeams] = useState([]);

  // CLEAN VERSION - Load all surveys
  const loadUmfragen = async () => {
    try {
      console.log('🔄 Loading surveys from Supabase...');
      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .order('id', { ascending: false });
      
      if (error) {
        console.warn('⚠️ Surveys error:', error.message);
        setUmfragen([]);
        return;
      }
      
      console.log("📊 Surveys loaded successfully:", data?.length || 0);
      setUmfragen(data || []);
    } catch (err) {
      console.error("❌ Failed to load surveys:", err);
      setUmfragen([]);
    }
  };

  // CLEAN VERSION - Load responses  
  const loadResponses = async () => {
    try {
      console.log('🔄 Loading responses from Supabase...');
      const { data, error } = await supabase
        .from('survey_responses')
        .select('*')
        .order('id', { ascending: false });
      
      if (error) {
        console.warn('⚠️ Responses error:', error.message);
        setResponses([]);
        return;
      }
      
      console.log("📝 Responses loaded successfully:", data?.length || 0);
      setResponses(data || []);
    } catch (err) {
      console.error("❌ Failed to load responses:", err);
      setResponses([]);
    }
  };

  // CLEAN VERSION - Load questions
  const loadQuestions = async () => {
    try {
      console.log('🔄 Loading questions from Supabase...');
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('id', { ascending: false });
      
      if (error) {
        console.warn('⚠️ Questions error:', error.message);
        setQuestions([]);
        return;
      }
      
      console.log("❓ Questions loaded successfully:", data?.length || 0);
      setQuestions(data || []);
    } catch (err) {
      console.error("❌ Failed to load questions:", err);
      setQuestions([]);
    }
  };

  // Create new survey
  const createUmfrage = async (umfrageData) => {
    setLoading(true);
    setError(null);
    try {
      const newUmfrage = await surveys.create(umfrageData);
      if (newUmfrage) {
        await loadUmfragen(); // Reload list
        return newUmfrage;
      }
    } catch (err) {
      console.error("❌ Failed to create survey:", err);
      setError("Fehler beim Erstellen der Umfrage");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update survey
  const updateUmfrage = async (id, updates) => {
    setLoading(true);
    setError(null);
    try {
      const updatedUmfrage = await surveys.update(id, updates);
      if (updatedUmfrage) {
        await loadUmfragen(); // Reload list
        return updatedUmfrage;
      }
    } catch (err) {
      console.error("❌ Failed to update survey:", err);
      setError("Fehler beim Aktualisieren der Umfrage");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete survey
  const deleteUmfrage = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await surveys.delete(id);
      await loadUmfragen(); // Reload list
    } catch (err) {
      console.error("❌ Failed to delete survey:", err);
      setError("Fehler beim Löschen der Umfrage");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Submit survey response
  const submitResponse = async (responseData) => {
    setError(null);
    try {
      const { data, error } = await supabase
        .from('survey_responses')
        .insert([responseData])
        .select()
        .single();
      
      if (error) {
        console.error("❌ Supabase response error:", error);
        setError("Fehler beim Senden der Antwort");
        throw error;
      }
      
      if (data) {
        await loadResponses(); // Reload responses
        return data;
      }
    } catch (err) {
      console.error("❌ Failed to submit response:", err);
      setError("Fehler beim Senden der Antwort");
      throw err;
    }
  };

  // Get active surveys
  const getActiveUmfragen = () => {
    return umfragen.filter(umfrage => umfrage.active === true);
  };

  // Get survey by ID
  const getUmfrageById = (id) => {
    return umfragen.find(umfrage => umfrage.id === parseInt(id));
  };

  // Load data on mount
  useEffect(() => {
    console.log('🚀 UmfrageContext initializing...');
    loadUmfragen();
    loadResponses();
    loadQuestions();
  }, []);

  const value = {
    umfragen,
    surveys: umfragen, // Alias for compatibility
    responses,
    questions,
    loading,
    error,
    loadUmfragen,
    fetchSurveys: loadUmfragen, // Alias for compatibility
    loadResponses,
    fetchResponses: loadResponses, // Alias for compatibility
    loadQuestions,
    fetchQuestions: loadQuestions, // Alias for compatibility
    createUmfrage,
    updateUmfrage,
    updateSurvey: updateUmfrage, // Alias for compatibility
    deleteUmfrage,
    deleteSurvey: deleteUmfrage, // Alias for compatibility
    submitResponse,
    getActiveUmfragen,
    getUmfrageById
  };

  return (
    <UmfrageContext.Provider value={value}>
      {children}
    </UmfrageContext.Provider>
  );
};

export default UmfrageContext;

console.log('✅ CLEAN UmfrageContext loaded - NO MORE RESPONSES2 ERRORS!');
