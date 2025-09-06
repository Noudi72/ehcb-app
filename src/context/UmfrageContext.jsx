import React, { createContext, useState, useContext, useEffect } from "react";
import { surveys, questions, responses, teams } from "../config/supabase-api";

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
  const [responsesData, setResponsesData] = useState([]);
  const [questionsData, setQuestionsData] = useState([]);
  const [teamsData, setTeamsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load all surveys - SUPABASE FIRST, JSON FALLBACK
  const loadUmfragen = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading surveys - trying Supabase first...');
      
      // Try Supabase first
      const supabaseData = await surveys.getAll();
      if (supabaseData && supabaseData.length > 0) {
        console.log("📊 Surveys loaded from Supabase:", supabaseData.length);
        console.log("📊 Survey titles:", supabaseData.map(s => s.title));
        setUmfragen(supabaseData);
        setError(null);
        return;
      }
      
      // Fallback to JSON Server
      console.log('📊 Supabase empty, trying JSON Server fallback...');
      const response = await fetch('http://localhost:3001/surveys');
      if (response.ok) {
        const jsonData = await response.json();
        console.log("📊 Surveys loaded from JSON Server:", jsonData.length);
        console.log("📊 Survey titles:", jsonData.map(s => s.title));
        setUmfragen(jsonData);
        setError(null);
      } else {
        throw new Error('Both Supabase and JSON Server failed');
      }
    } catch (err) {
      console.error("❌ Failed to load surveys:", err);
      setError(`Fehler beim Laden: ${err.message}`);
      setUmfragen([]);
    } finally {
      setLoading(false);
    }
  };

  // Load teams - SUPABASE ONLY
  const loadTeams = async () => {
    try {
      console.log("🏒 Loading teams from Supabase...");
      const data = await teams.getAll();
      console.log("📊 Teams loaded:", data?.length || 0);
      
      if (data && data.length > 0) {
        setTeamsData(data);
      } else {
        // Fallback to hardcoded teams if Supabase table is empty/missing
        console.log("📊 Using fallback teams");
        setTeamsData([
          { id: 1, name: "u16-elit" },
          { id: 2, name: "u18-elit" }, 
          { id: 3, name: "u21-elit" }
        ]);
      }
    } catch (err) {
      console.error("❌ Failed to load teams:", err);
      // Always fallback to hardcoded teams
      setTeamsData([
        { id: 1, name: "u16-elit" },
        { id: 2, name: "u18-elit" }, 
        { id: 3, name: "u21-elit" }
      ]);
    }
  };

  // Load all responses - SUPABASE ONLY
  const loadResponses = async () => {
    try {
      console.log('🔄 Loading responses from Supabase...');
      const data = await responses.getAll();
      console.log("📝 Responses loaded successfully:", data?.length || 0);
      setResponsesData(data || []);
    } catch (err) {
      console.error("❌ Failed to load responses:", err);
      setResponsesData([]);
    }
  };

  // Load all questions - SUPABASE FIRST, JSON FALLBACK
  const loadQuestions = async () => {
    try {
      console.log('🔄 Loading questions - trying Supabase first...');
      
      // Try Supabase first
      const supabaseData = await questions.getAll();
      if (supabaseData && supabaseData.length > 0) {
        console.log("❓ Questions loaded from Supabase:", supabaseData.length);
        console.log("❓ Question IDs:", supabaseData.map(q => q.id));
        setQuestionsData(supabaseData);
        return;
      }
      
      // Fallback to JSON Server
      console.log('❓ Supabase empty, trying JSON Server fallback...');
      const response = await fetch('http://localhost:3001/questions');
      if (response.ok) {
        const jsonData = await response.json();
        console.log("❓ Questions loaded from JSON Server:", jsonData.length);
        console.log("❓ Question IDs:", jsonData.map(q => q.id));
        setQuestionsData(jsonData);
      } else {
        throw new Error('Both Supabase and JSON Server failed for questions');
      }
    } catch (err) {
      console.error("❌ Failed to load questions:", err);
      setQuestionsData([]);
    }
  };

  // Create new survey - SUPABASE ONLY
  const createUmfrage = async (umfrageData) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Creating survey in Supabase...');
      const newUmfrage = await surveys.create(umfrageData);
      console.log('✅ Survey created successfully:', newUmfrage);
      await loadUmfragen(); // Reload list
      return newUmfrage;
    } catch (err) {
      console.error("❌ Failed to create survey:", err);
      setError("Fehler beim Erstellen der Umfrage");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update survey - SUPABASE ONLY
  const updateUmfrage = async (id, updates) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Updating survey in Supabase:', id);
      const updatedUmfrage = await surveys.update(id, updates);
      console.log('✅ Survey updated successfully:', updatedUmfrage);
      await loadUmfragen(); // Reload list
      return updatedUmfrage;
    } catch (err) {
      console.error("❌ Failed to update survey:", err);
      setError("Fehler beim Aktualisieren der Umfrage");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete survey - SUPABASE ONLY
  const deleteUmfrage = async (id) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 Deleting survey from Supabase:', id);
      await surveys.delete(id);
      console.log('✅ Survey deleted successfully');
      await loadUmfragen(); // Reload list
    } catch (err) {
      console.error("❌ Failed to delete survey:", err);
      setError("Fehler beim Löschen der Umfrage");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Submit survey response - SUPABASE ONLY
  const submitResponse = async (responseData) => {
    setError(null);
    try {
      console.log('🔄 Submitting response to Supabase...');
      const data = await responses.create(responseData);
      console.log('✅ Response submitted successfully:', data);
      await loadResponses(); // Reload responses
      return data;
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

  // Add new question - SUPABASE ONLY
  const addQuestion = async (questionData) => {
    try {
      console.log('🔄 Creating question in Supabase...');
      const newQuestion = await questions.create(questionData);
      console.log('✅ Question created successfully:', newQuestion);
      await loadQuestions(); // Reload questions
      return newQuestion;
    } catch (err) {
      console.error("❌ Failed to create question:", err);
      throw err;
    }
  };

  // Update question - SUPABASE ONLY
  const updateQuestion = async (id, questionData) => {
    try {
      console.log('🔄 Updating question in Supabase...', id);
      const updatedQuestion = await questions.update(id, questionData);
      console.log('✅ Question updated successfully:', updatedQuestion);
      await loadQuestions(); // Reload questions
      return updatedQuestion;
    } catch (err) {
      console.error("❌ Failed to update question:", err);
      throw err;
    }
  };

  // Delete question - SUPABASE ONLY
  const deleteQuestion = async (id) => {
    try {
      console.log('🔄 Deleting question in Supabase...', id);
      await questions.delete(id);
      console.log('✅ Question deleted successfully');
      await loadQuestions(); // Reload questions
      return true;
    } catch (err) {
      console.error("❌ Failed to delete question:", err);
      return false;
    }
  };

  // Load data on mount
  useEffect(() => {
    loadUmfragen();
    loadResponses(); 
    loadQuestions();
    loadTeams();
  }, []);

  const value = {
    umfragen,
    surveys: umfragen, // Alias for compatibility
    responses: responsesData,
    questions: questionsData, 
    teams: teamsData,
    loading,
    error,
    loadUmfragen,
    fetchSurveys: loadUmfragen, // Alias for compatibility
    loadResponses,
    fetchResponses: loadResponses, // Alias for compatibility
    loadQuestions,
    fetchQuestions: loadQuestions, // Alias for compatibility
    addQuestion,
    updateQuestion,
    deleteQuestion,
    createUmfrage,
    createSurvey: createUmfrage, // Alias for compatibility
    updateUmfrage,
    updateSurvey: updateUmfrage, // Alias for compatibility
    deleteUmfrage,
    deleteSurvey: deleteUmfrage, // Alias for compatibility
    submitResponse,
    submitSurveyResponse: submitResponse, // Alias for compatibility
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

console.log('📋 Supabase UmfrageContext loaded - PRODUCTION MODE');