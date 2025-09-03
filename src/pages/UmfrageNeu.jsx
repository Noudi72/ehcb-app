import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUmfrage } from '../context/UmfrageContext';
import Header from '../components/Header';
import BackButton from '../components/BackButton';

const UmfrageNeu = () => {
  const { user } = useAuth();
  const { surveys, loading, fetchSurveys, submitSurveyResponse } = useUmfrage();
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});

  // Umfragen beim Laden der Komponente abrufen
  useEffect(() => {
    if (user?.username) {
      fetchSurveys();
    }
  }, [user?.username, fetchSurveys]);

  // Gefilterte Umfragen basierend auf Benutzer und Team
  const filteredSurveys = React.useMemo(() => {
    if (!surveys || !Array.isArray(surveys)) return [];
    
    // Nur aktive Umfragen anzeigen
    const activeSurveys = surveys.filter(survey => survey.active);
    
    // Team-Filter anwenden
    const userTeams = user?.teams || [];
    const isCoach = user?.username === 'coach' || user?.name === 'coach' || user?.role === 'coach';
    
    if (isCoach) {
      // Coaches sehen ALLE aktiven Umfragen
      return activeSurveys;
    } else {
      // Spieler sehen nur team-spezifische Umfragen
      return activeSurveys.filter(survey => {
        if (!survey.target_teams || survey.target_teams.length === 0) return true;
        return survey.target_teams.some(team => userTeams.includes(team));
      });
    }
  }, [surveys, user]);

  // Umfrage auswählen
  const selectSurvey = (survey) => {
    setSelectedSurvey(survey);
    setCurrentQuestion(0);
    setAnswers({});
  };

  // Antwort speichern
  const saveAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Navigation zwischen Fragen
  const nextQuestion = () => {
    if (selectedSurvey?.questions && currentQuestion < selectedSurvey.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  // Umfrage abschicken
  const submitSurvey = async () => {
    try {
      const responseData = {
        survey_id: selectedSurvey.id,
        player_name: user?.username || 'Anonym',
        responses: answers,
        submitted_at: new Date().toISOString()
      };

      const success = await submitSurveyResponse(responseData);
      
      if (success) {
        alert('Umfrage erfolgreich übermittelt!');
        setSelectedSurvey(null);
        setCurrentQuestion(0);
        setAnswers({});
      } else {
        alert('Fehler beim Übermitteln der Umfrage.');
      }
    } catch (error) {
      console.error('Fehler beim Übermitteln:', error);
      alert('Fehler beim Übermitteln der Umfrage.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Lade Umfragen...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="px-4 py-4">
        <BackButton to="/" />
      </div>
      
      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Umfragen</h1>
          
          {/* Debug-Info */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm">
            <p><strong>User:</strong> {user?.username || 'Nicht eingeloggt'}</p>
            <p><strong>Surveys loaded:</strong> {surveys?.length || 0}</p>
            <p><strong>Filtered surveys:</strong> {filteredSurveys?.length || 0}</p>
          </div>

          {!selectedSurvey && (
            <div>
              {filteredSurveys.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Keine Umfragen verfügbar.</p>
                  {surveys && surveys.length > 0 && (
                    <p className="text-sm text-gray-500 mt-2">
                      Es gibt {surveys.length} Umfragen, aber keine für Ihr Team.
                    </p>
                  )}
                  <button 
                    onClick={() => fetchSurveys(true)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    � Neu laden
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-lg font-medium text-gray-700 mb-4">
                    Verfügbare Umfragen ({filteredSurveys.length}):
                  </h2>
                  {filteredSurveys.map(survey => (
                    <div
                      key={survey.id}
                      onClick={() => selectSurvey(survey)}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all"
                    >
                      <h3 className="font-semibold text-gray-900 mb-1">{survey.title}</h3>
                      <p className="text-sm text-gray-600">{survey.description}</p>
                      <div className="mt-2 text-xs text-gray-500">
                        📋 {survey.questions?.length || 0} Fragen
                        {survey.target_teams && survey.target_teams.length > 0 && (
                          <span className="ml-2">
                            👥 Teams: {survey.target_teams.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedSurvey && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <button
                  onClick={() => setSelectedSurvey(null)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  ← Zurück zur Auswahl
                </button>
                <span className="text-sm text-gray-500">
                  Frage {currentQuestion + 1} von {selectedSurvey.questions?.length || 0}
                </span>
              </div>
              
              <h2 className="text-xl font-semibold mb-6">{selectedSurvey.title}</h2>
              
              {selectedSurvey.questions && selectedSurvey.questions.length > 0 ? (
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-4 text-gray-900">
                      {selectedSurvey.questions[currentQuestion]?.question || 'Frage nicht verfügbar'}
                    </h3>
                    
                    <div className="space-y-3">
                      {selectedSurvey.questions[currentQuestion]?.type === 'multiple-choice' ? (
                        selectedSurvey.questions[currentQuestion]?.options?.map((option, index) => (
                          <label key={index} className="flex items-center space-x-3">
                            <input
                              type="radio"
                              name={`question-${currentQuestion}`}
                              value={option}
                              checked={answers[selectedSurvey.questions[currentQuestion].id] === option}
                              onChange={(e) => saveAnswer(selectedSurvey.questions[currentQuestion].id, e.target.value)}
                              className="w-4 h-4 text-blue-600"
                            />
                            <span className="text-gray-700">{option}</span>
                          </label>
                        ))
                      ) : (
                        <textarea
                          value={answers[selectedSurvey.questions[currentQuestion]?.id] || ''}
                          onChange={(e) => saveAnswer(selectedSurvey.questions[currentQuestion].id, e.target.value)}
                          placeholder="Ihre Antwort hier eingeben..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={4}
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <button
                      onClick={prevQuestion}
                      disabled={currentQuestion === 0}
                      className={`px-4 py-2 rounded-lg ${
                        currentQuestion === 0 
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                          : 'bg-gray-600 text-white hover:bg-gray-700'
                      }`}
                    >
                      Zurück
                    </button>
                    
                    {currentQuestion < selectedSurvey.questions.length - 1 ? (
                      <button
                        onClick={nextQuestion}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Weiter
                      </button>
                    ) : (
                      <button
                        onClick={submitSurvey}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Absenden
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-red-600">Keine Fragen in dieser Umfrage gefunden.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UmfrageNeu;
