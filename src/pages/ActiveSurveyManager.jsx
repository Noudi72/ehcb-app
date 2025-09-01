import React, { useState, useEffect } from "react";
import StatusBadge from "./SurveyManagerOverview";
import { useUmfrage } from "../context/UmfrageContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import BackButton from "../components/BackButton";


export default function ActiveSurveyManager() {
  const { 
    surveys, 
    questions,
    updateSurvey,
    fetchSurveys,
    fetchQuestions,
    loading, 
    error 
  } = useUmfrage();
  
  const { user, isCoach } = useAuth();
  const { isDarkMode } = useTheme();
  const [activeSurveys, setActiveSurveys] = useState([]);
  const [inactiveSurveys, setInactiveSurveys] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchSurveys();
    fetchQuestions();
  }, [fetchSurveys, fetchQuestions]);

  // Sortiere Umfragen nach aktiv/inaktiv
  useEffect(() => {
    if (surveys) {
      setActiveSurveys(surveys.filter(survey => survey.active));
      setInactiveSurveys(surveys.filter(survey => !survey.active));
    }
  }, [surveys]);

  // Umfrage Status ändern (aktiv/inaktiv)
  const toggleSurveyStatus = async (survey) => {
    try {
      // Nur die notwendigen Felder senden
      const updateData = {
        title: survey.title,
        description: survey.description,
        questions: survey.questions,
        active: !survey.active,
        resultsVisibleToPlayers: survey.resultsVisibleToPlayers || false,
        anonymous: survey.anonymous || false,
        targetTeams: survey.targetTeams || [],
        createdAt: survey.createdAt
      };
      
      await updateSurvey(survey.id, updateData);
      
      setSuccessMessage(`Umfrage "${survey.title}" wurde ${!survey.active ? 'aktiviert' : 'deaktiviert'}`);
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      
      // Daten neu laden
      fetchSurveys();
    } catch (error) {
      console.error("Fehler beim Aktualisieren der Umfrage:", error);
      alert("Fehler beim Ändern des Umfragestatus");
    }
  };

  // Ergebnissichtbarkeit ändern
  const toggleResultsVisibility = async (survey) => {
    try {
      const updateData = {
        title: survey.title,
        description: survey.description,
        questions: survey.questions,
        active: survey.active,
        resultsVisibleToPlayers: !survey.resultsVisibleToPlayers,
        anonymous: survey.anonymous || false,
        targetTeams: survey.targetTeams || [],
        createdAt: survey.createdAt
      };
      
      await updateSurvey(survey.id, updateData);
      
      setSuccessMessage(`Ergebnissichtbarkeit für "${survey.title}" wurde ${!survey.resultsVisibleToPlayers ? 'aktiviert' : 'deaktiviert'}`);
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      
      // Daten neu laden
      fetchSurveys();
    } catch (error) {
      console.error("Fehler beim Aktualisieren der Umfrage:", error);
      alert("Fehler beim Ändern der Ergebnissichtbarkeit");
    }
  };
  
  // Anonymität ändern
  const toggleAnonymity = async (survey) => {
    try {
      const updateData = {
        title: survey.title,
        description: survey.description,
        questions: survey.questions,
        active: survey.active,
        resultsVisibleToPlayers: survey.resultsVisibleToPlayers || false,
        anonymous: !survey.anonymous,
        targetTeams: survey.targetTeams || [],
        createdAt: survey.createdAt
      };
      
      await updateSurvey(survey.id, updateData);
      
      setSuccessMessage(`Umfrage "${survey.title}" wurde auf ${!survey.anonymous ? 'anonym' : 'nicht anonym'} gesetzt`);
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      
      // Daten neu laden
      fetchSurveys();
    } catch (error) {
      console.error("Fehler beim Aktualisieren der Anonymität:", error);
      alert("Fehler beim Ändern der Anonymität");
    }
  };

  // Fragen für eine Umfrage anzeigen
  const getQuestionsForSurvey = (survey) => {
    if (!survey || !survey.questions || !Array.isArray(survey.questions) || !questions) {
      return [];
    }
    
    return survey.questions.map(qId => 
      questions.find(q => q.id === qId)
    ).filter(q => q !== undefined);
  };

  // Wenn kein Coach, Zugriff verweigern
  if (!isCoach) {
    return (
      <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-[#f8fafc]'}`}>
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className={`w-full max-w-3xl rounded-lg shadow p-6 text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h1 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>Zugriff verweigert</h1>
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : ''}`}>Du musst als Coach angemeldet sein, um auf diese Seite zuzugreifen.</p>
          </div>
        </main>
        
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-[#f8fafc]'}`}>
      <Header />
      <BackButton to="/coach/dashboard" />
      <main className="flex-1 container mx-auto p-4">
        <div className="mb-6">
          <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-blue-400' : ''}`}>Aktive/Inaktive Umfragen verwalten</h1>
          <p className={`text-gray-600 ${isDarkMode ? 'text-gray-300' : ''}`}>
            Hier kannst du Umfragen aktivieren oder deaktivieren sowie die Sichtbarkeit der Ergebnisse einstellen.
          </p>
        </div>
        
        {successMessage && (
          <div className={`px-4 py-3 rounded relative mb-4 ${
            isDarkMode ? 'bg-green-900 border-green-700 text-green-300 border' : 'bg-green-100 border-green-400 text-green-700 border'
          }`}>
            {successMessage}
          </div>
        )}
        
        {error && (
          <div className={`px-4 py-3 rounded relative mb-4 ${
            isDarkMode ? 'bg-red-900 border-red-700 text-red-300 border' : 'bg-red-100 border-red-400 text-red-700 border'
          }`}>
            {error}
          </div>
        )}
        
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-green-400' : ''}`}>Aktive Umfragen</h2>
            <Link 
              to="/coach/survey-editor" 
              className={`px-4 py-2 rounded ${
                isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              + Neue Umfrage erstellen
            </Link>
          </div>
          
          {activeSurveys.length === 0 ? (
            <div className={`rounded-lg shadow p-6 text-center ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>
              Keine aktiven Umfragen vorhanden.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeSurveys.map(survey => (
                <div key={survey.id} className={`rounded-lg shadow p-4 border-l-4 border-green-500 ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-bold flex items-center ${isDarkMode ? 'text-gray-200' : ''}`}>
                      {survey.title}
                      <span className="ml-2"><StatusBadge status={survey.status || (survey.active ? "active" : "draft")} /></span>
                    </h3>
                    <div className="flex space-x-2">
                      <Link 
                        to={`/coach/survey-editor?id=${survey.id}`} 
                        className={`p-1 rounded ${
                          isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white'
                        }`}
                        title="Bearbeiten"
                      >
                        ✏️
                      </Link>
                    </div>
                  </div>
                  <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{survey.description}</p>
                  
                  <div className="mt-2 mb-3">
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Fragen:</p>
                    <ul className={`list-disc list-inside text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {getQuestionsForSurvey(survey).map((q, i) => (
                        <li key={i} className="truncate">
                          {q ? q.question : 'Unbekannte Frage'}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button 
                      onClick={() => toggleSurveyStatus(survey)}
                      className={`px-3 py-1 rounded text-sm ${
                        isDarkMode ? 'bg-red-900 text-red-300 hover:bg-red-800' : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      Deaktivieren
                    </button>
                    <button 
                      onClick={() => toggleResultsVisibility(survey)}
                      className={`px-3 py-1 rounded text-sm ${
                        survey.resultsVisibleToPlayers 
                          ? (isDarkMode ? 'bg-yellow-900 text-yellow-300 hover:bg-yellow-800' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200')
                          : (isDarkMode ? 'bg-blue-900 text-blue-300 hover:bg-blue-800' : 'bg-blue-100 text-blue-700 hover:bg-blue-200')
                      }`}
                    >
                      {survey.resultsVisibleToPlayers 
                        ? 'Ergebnisse für Spieler verbergen'
                        : 'Ergebnisse für Spieler sichtbar machen'}
                    </button>
                    <button 
                      onClick={() => toggleAnonymity(survey)}
                      className={`px-3 py-1 rounded text-sm ${
                        survey.anonymous 
                          ? (isDarkMode ? 'bg-green-900 text-green-300 hover:bg-green-800' : 'bg-green-100 text-green-700 hover:bg-green-200')
                          : (isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                      }`}
                    >
                      {survey.anonymous 
                        ? 'Anonym (Spielernamen verborgen)'
                        : 'Nicht anonym (Spielernamen sichtbar)'}
                    </button>
                    <Link 
                      to={`/umfrage-results?id=${survey.id}`} 
                      className={`px-3 py-1 rounded text-sm ${
                        isDarkMode ? 'bg-purple-900 text-purple-300 hover:bg-purple-800' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                      }`}
                    >
                      Ergebnisse ansehen
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div>
          <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-gray-400' : ''}`}>Inaktive Umfragen</h2>
          {inactiveSurveys.length === 0 ? (
            <div className={`rounded-lg shadow p-6 text-center ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>
              Keine inaktiven Umfragen vorhanden.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inactiveSurveys.map(survey => (
                <div key={survey.id} className={`rounded-lg shadow p-4 border-l-4 border-gray-300 ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-bold flex items-center ${isDarkMode ? 'text-gray-200' : ''}`}>
                      {survey.title}
                      <span className="ml-2"><StatusBadge status={survey.status || (survey.active ? "active" : "draft")} /></span>
                    </h3>
                    <div className="flex space-x-2">
                      <Link 
                        to={`/coach/survey-editor?id=${survey.id}`} 
                        className={`p-1 rounded ${
                          isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white'
                        }`}
                        title="Bearbeiten"
                      >
                        ✏️
                      </Link>
                    </div>
                  </div>
                  <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{survey.description}</p>
                  
                  <div className="mt-2 mb-3">
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Fragen:</p>
                    <ul className={`list-disc list-inside text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {getQuestionsForSurvey(survey).map((q, i) => (
                        <li key={i} className="truncate">
                          {q ? q.question : 'Unbekannte Frage'}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button 
                      onClick={() => toggleSurveyStatus(survey)}
                      className={`px-3 py-1 rounded text-sm ${
                        isDarkMode ? 'bg-green-900 text-green-300 hover:bg-green-800' : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      Aktivieren
                    </button>
                    <button 
                      onClick={() => toggleResultsVisibility(survey)}
                      className={`px-3 py-1 rounded text-sm ${
                        survey.resultsVisibleToPlayers 
                          ? (isDarkMode ? 'bg-yellow-900 text-yellow-300 hover:bg-yellow-800' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200')
                          : (isDarkMode ? 'bg-blue-900 text-blue-300 hover:bg-blue-800' : 'bg-blue-100 text-blue-700 hover:bg-blue-200')
                      }`}
                    >
                      {survey.resultsVisibleToPlayers 
                        ? 'Ergebnisse für Spieler verbergen'
                        : 'Ergebnisse für Spieler sichtbar machen'}
                    </button>
                    <button 
                      onClick={() => toggleAnonymity(survey)}
                      className={`px-3 py-1 rounded text-sm ${
                        survey.anonymous 
                          ? (isDarkMode ? 'bg-green-900 text-green-300 hover:bg-green-800' : 'bg-green-100 text-green-700 hover:bg-green-200')
                          : (isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                      }`}
                    >
                      {survey.anonymous 
                        ? 'Anonym (Spielernamen verborgen)'
                        : 'Nicht anonym (Spielernamen sichtbar)'}
                    </button>
                    <Link 
                      to={`/umfrage-results?id=${survey.id}`} 
                      className={`px-3 py-1 rounded text-sm ${
                        isDarkMode ? 'bg-purple-900 text-purple-300 hover:bg-purple-800' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                      }`}
                    >
                      Ergebnisse ansehen
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
    </div>
  );
}
