import React, { useState, useEffect } from "react";
import { useUmfrage } from "../context/UmfrageContext-new";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import BackButton from "../components/BackButton";


export default function CoachResultsView() {
  const { surveys, responses, questions, loading, error, fetchSurveys, fetchResponses, fetchQuestions } = useUmfrage();
  const { user, isCoach } = useAuth();
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const navigate = useNavigate();

  // Sicherstellen, dass nur Coaches Zugriff haben
  useEffect(() => {
    if (!user || !isCoach) {
      navigate('/');
    }
  }, [user, isCoach, navigate]);

  // Daten abrufen
  useEffect(() => {
    fetchSurveys();
    fetchResponses();
    fetchQuestions();
  }, [fetchSurveys, fetchResponses, fetchQuestions]);

  // Umfrage auswählen
  const handleSelectSurvey = (survey) => {
    setSelectedSurvey(survey);
  };

  // Antworten für die ausgewählte Umfrage filtern
  const getResponsesForSurvey = () => {
    if (!selectedSurvey) return [];
    return responses.filter(response => response.surveyId === selectedSurvey.id);
  };

  // Einfache Statistiken berechnen
  const calculateStatistics = () => {
    if (!selectedSurvey) return null;
    
    const surveyResponses = getResponsesForSurvey();
    if (surveyResponses.length === 0) return null;
    
    const statistics = {};
    
    // Finde alle Fragen für diese Umfrage
    const surveyQuestions = questions.filter(q => 
      selectedSurvey.questions && selectedSurvey.questions.includes(q.id)
    );
    
    // Für jede Frage Statistiken berechnen
    surveyQuestions.forEach(question => {
      // Initialisieren der Statistiken für diese Frage
      statistics[question.id] = {
        questionText: question.question,
        type: question.type,
        responses: []
      };
      
      // Je nach Fragetyp unterschiedliche Statistiken berechnen
      switch (question.type) {
        case 'options':
        case 'radio':
          // Zähle Optionen für Einmalauswahl-Fragen
          const optionCounts = {};
          
          surveyResponses.forEach(response => {
            if (response.answers && response.answers[question.id]) {
              const answer = response.answers[question.id];
              optionCounts[answer] = (optionCounts[answer] || 0) + 1;
              
              // Füge die individuelle Antwort hinzu
              statistics[question.id].responses.push({
                player: response.playerName,
                answer: answer
              });
            }
          });
          
          statistics[question.id].optionCounts = optionCounts;
          break;
          
        case 'checkbox':
          // Zähle Optionen für Mehrfachauswahl-Fragen
          const checkboxCounts = {};
          
          surveyResponses.forEach(response => {
            if (response.answers && response.answers[question.id]) {
              const answers = response.answers[question.id];
              if (Array.isArray(answers)) {
                answers.forEach(answer => {
                  checkboxCounts[answer] = (checkboxCounts[answer] || 0) + 1;
                });
                
                // Füge die individuelle Antwort hinzu
                statistics[question.id].responses.push({
                  player: response.playerName,
                  answer: answers.join(", ")
                });
              }
            }
          });
          
          statistics[question.id].optionCounts = checkboxCounts;
          break;
          
        case 'number':
          // Berechne Durchschnitt, Min, Max für numerische Fragen
          let sum = 0;
          let min = Infinity;
          let max = -Infinity;
          let count = 0;
          
          surveyResponses.forEach(response => {
            if (response.answers && response.answers[question.id]) {
              const value = parseFloat(response.answers[question.id]);
              if (!isNaN(value)) {
                sum += value;
                min = Math.min(min, value);
                max = Math.max(max, value);
                count++;
                
                // Füge die individuelle Antwort hinzu
                statistics[question.id].responses.push({
                  player: response.playerName,
                  answer: value
                });
              }
            }
          });
          
          statistics[question.id].average = count > 0 ? sum / count : 0;
          statistics[question.id].min = min !== Infinity ? min : 0;
          statistics[question.id].max = max !== -Infinity ? max : 0;
          break;
          
        case 'textarea':
          // Sammle alle Textantworten
          const textAnswers = [];
          
          surveyResponses.forEach(response => {
            if (response.answers && response.answers[question.id]) {
              const answer = response.answers[question.id];
              
              // Füge die individuelle Antwort hinzu
              statistics[question.id].responses.push({
                player: response.playerName,
                answer: answer
              });
              
              textAnswers.push(answer);
            }
          });
          
          statistics[question.id].textAnswers = textAnswers;
          break;
          
        default:
          break;
      }
    });
    
    return statistics;
  };

  // Zeigt die Ergebnisse einer Umfrage an
  const renderSurveyResults = () => {
    if (!selectedSurvey) return null;
    
    const stats = calculateStatistics();
    if (!stats) return <p className="text-gray-500 text-center py-6">Noch keine Antworten für diese Umfrage.</p>;
    
    const surveyQuestions = questions.filter(q => 
      selectedSurvey.questions && selectedSurvey.questions.includes(q.id)
    );
    
    return (
      <div className="space-y-8">
        {surveyQuestions.map(question => {
          const questionStats = stats[question.id];
          if (!questionStats) return null;
          
          return (
            <div key={question.id} className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-medium text-lg mb-3">{question.question}</h3>
              
              {/* Anzeige je nach Fragetyp */}
              {question.type === 'options' || question.type === 'radio' ? (
                <div>
                  <h4 className="font-medium mb-2">Verteilung der Antworten:</h4>
                  <div className="space-y-2">
                    {Object.entries(questionStats.optionCounts || {}).map(([option, count], i) => (
                      <div key={i} className="flex items-center">
                        <div className="w-48">{option}:</div>
                        <div className="flex-1">
                          <div className="bg-blue-100 h-6 rounded" style={{ width: `${(count / questionStats.responses.length) * 100}%` }}>
                            <div className="px-2 text-sm leading-6">{count}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : question.type === 'checkbox' ? (
                <div>
                  <h4 className="font-medium mb-2">Verteilung der Antworten:</h4>
                  <div className="space-y-2">
                    {Object.entries(questionStats.optionCounts || {}).map(([option, count], i) => (
                      <div key={i} className="flex items-center">
                        <div className="w-48">{option}:</div>
                        <div className="flex-1">
                          <div className="bg-purple-100 h-6 rounded" style={{ width: `${(count / questionStats.responses.length) * 100}%` }}>
                            <div className="px-2 text-sm leading-6">{count}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : question.type === 'number' ? (
                <div>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm text-gray-500">Durchschnitt</div>
                      <div className="text-lg font-semibold">{questionStats.average.toFixed(1)}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm text-gray-500">Minimum</div>
                      <div className="text-lg font-semibold">{questionStats.min}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm text-gray-500">Maximum</div>
                      <div className="text-lg font-semibold">{questionStats.max}</div>
                    </div>
                  </div>
                </div>
              ) : question.type === 'textarea' ? (
                <div>
                  <h4 className="font-medium mb-2">Textantworten:</h4>
                  <div className="space-y-2">
                    {questionStats.responses.map((response, i) => (
                      <div key={i} className="bg-gray-50 p-3 rounded">
                        <div className="font-medium text-sm text-gray-600 mb-1">{response.player}</div>
                        <div>{response.answer}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              
              <div className="mt-6">
                <h4 className="font-medium mb-2">Einzelne Antworten:</h4>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Spieler
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Antwort
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {questionStats.responses.map((response, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {response.player}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {response.answer}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Header />
      <BackButton to="/coach/dashboard" />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Coach-Ansicht: Umfrageergebnisse</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="spinner-border text-blue-500" role="status">
              <span className="sr-only">Wird geladen...</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Umfrage-Liste */}
            <div className="md:col-span-1">
              <div className="bg-white p-4 rounded-lg shadow mb-6">
                <h2 className="font-bold mb-4 text-gray-700">Umfragen</h2>
                {surveys.length === 0 ? (
                  <p className="text-gray-500">Keine Umfragen verfügbar</p>
                ) : (
                  <div className="space-y-2">
                    {surveys.map(survey => (
                      <button
                        key={survey.id}
                        onClick={() => handleSelectSurvey(survey)}
                        className={`block w-full text-left px-4 py-2 rounded ${
                          selectedSurvey?.id === survey.id
                            ? "bg-[#0a2240] text-white"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <div className="font-medium">{survey.title}</div>
                        <div className="text-xs mt-1 flex items-center">
                          {survey.active ? (
                            <span className="flex items-center">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                              Aktiv
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                              Inaktiv
                            </span>
                          )}
                          {survey.resultsVisibleToPlayers && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1 rounded">
                              Für Spieler sichtbar
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Ergebnisansicht */}
            <div className="md:col-span-3">
              {selectedSurvey ? (
                <div>
                  <div className="bg-white p-6 rounded-lg shadow mb-6">
                    <h2 className="font-bold text-xl mb-2">{selectedSurvey.title}</h2>
                    {selectedSurvey.description && (
                      <p className="text-gray-600 mb-4">{selectedSurvey.description}</p>
                    )}
                    <div className="flex space-x-2">
                      <div className={`px-2 py-1 rounded text-sm ${
                        selectedSurvey.active 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {selectedSurvey.active ? "Aktiv" : "Inaktiv"}
                      </div>
                      <div className={`px-2 py-1 rounded text-sm ${
                        selectedSurvey.resultsVisibleToPlayers 
                          ? "bg-blue-100 text-blue-800" 
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {selectedSurvey.resultsVisibleToPlayers 
                          ? "Ergebnisse für Spieler sichtbar" 
                          : "Ergebnisse nur für Coaches sichtbar"}
                      </div>
                    </div>
                  </div>
                  {renderSurveyResults()}
                </div>
              ) : (
                <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center justify-center py-10 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-700 mb-1">Umfrageergebnisse</h3>
                  <p className="text-gray-500">Wähle eine Umfrage aus, um deren Ergebnisse zu sehen.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      
    </div>
  );
}
