import React, { useState, useEffect, useMemo } from "react";
import { useUmfrage } from "../context/UmfrageContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import BackButton from "../components/BackButton";

export default function UmfrageResults() {
  const { surveys, responses, questions, loading, error, fetchSurveys, fetchResponses, fetchQuestions, deleteResponse } = useUmfrage();
  const { user, isCoach } = useAuth(); // Direkt user statt currentUser verwenden
  const { isDarkMode } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [visibleSurveys, setVisibleSurveys] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [chartType, setChartType] = useState('bar');
  const [showResponses, setShowResponses] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewMode, setViewMode] = useState('overview'); // 'overview' oder 'individual'

  useEffect(() => {
    fetchSurveys();
    fetchResponses();
    fetchQuestions();
  }, []); // EMPTY DEPENDENCY - Only run ONCE!

  // URL-Parameter auslesen
  const queryParams = new URLSearchParams(location.search);
  const surveyIdFromUrl = queryParams.get("id");

  // Filter Umfragen und setze ggf. die aus der URL angegebene Umfrage
  useEffect(() => {
    if (surveys && surveys.length > 0) {
      let visible = [];
      
      // Für Coaches alle Umfragen anzeigen, für normale Spieler nur die mit sichtbaren Ergebnissen
      if (isCoach) {
        visible = surveys;
      } else {
        visible = surveys.filter(survey => survey.resultsVisibleToPlayers === true);
      }
      
      setVisibleSurveys(visible);
      
      // Wenn eine Survey-ID in der URL angegeben wurde, diese direkt auswählen
      if (surveyIdFromUrl) {
        const surveyFromUrl = surveys.find(s => s.id === surveyIdFromUrl);
        
        // Prüfen ob Spieler Zugriff auf diese Umfrage haben soll
        if (surveyFromUrl) {
          if (isCoach) {
            setSelectedSurvey(surveyFromUrl);
          } else if (surveyFromUrl.resultsVisibleToPlayers) {
            setSelectedSurvey(surveyFromUrl);
          }
        }
      } else if (visible.length > 0 && !selectedSurvey) {
        // Automatisch erste verfügbare Umfrage auswählen
        setSelectedSurvey(visible[0]);
      }
    }
  }, [surveys, user, isCoach, surveyIdFromUrl]);

  // Einfachere Version: Antworten für einen einzelnen Benutzer filtern
  const getUserResponsesSimple = (userName) => {
    if (!selectedSurvey || !userName) {
      console.log("getUserResponsesSimple: Missing selectedSurvey or userName");
      return null;
    }

    const surveyResponses = getResponsesForSurvey();
    console.log("getUserResponsesSimple: All survey responses:", surveyResponses);

    const userResponse = surveyResponses.find(response => response.playerName === userName);
    console.log("getUserResponsesSimple: Found user response for", userName, ":", userResponse);

    if (!userResponse) {
      console.log("getUserResponsesSimple: No user response found for", userName);
      return null;
    }

    console.log("getUserResponsesSimple: User response answers:", userResponse.answers);

    const userAnswers = {};

    // Gehe nur durch die Fragen, die zu dieser Umfrage gehören
    selectedSurvey.questions.forEach(questionId => {
      const answer = userResponse.answers[questionId];
      console.log(`Processing answer for question ${questionId} (belongs to survey ${selectedSurvey.title}):`, answer);

      // Versuche die Frage im Context zu finden
      const questionData = questions.find(q => q.id === questionId);

      if (questionData) {
        userAnswers[questionId] = {
          question: questionData.question,
          answer: answer,
          type: questionData.type,
          options: questionData.options || []
        };
      } else {
        // Fallback: Erstelle eine Dummy-Frage
        userAnswers[questionId] = {
          question: `Frage ${questionId}`,
          answer: answer,
          type: 'text',
          options: []
        };
      }
    });

    const result = {
      id: userResponse.id, // Survey-Response ID hinzufügen!
      playerName: userName,
      answers: userAnswers,
      createdAt: userResponse.createdAt || userResponse.submittedAt
    };

    console.log("getUserResponsesSimple: Final result:", result);
    return result;
  };
  
  // Frage auswählen
  const handleSelectQuestion = (questionId) => {
    setSelectedQuestion(questionId);
    setShowResponses(false);
  };

  // Umfrage auswählen
  const handleSelectSurvey = (survey) => {
    setSelectedSurvey(survey);
    setSelectedUser(null);
    setViewMode('overview');
    // Automatisch die erste Frage auswählen, wenn die Umfrage Fragen hat
    if (survey.questions && survey.questions.length > 0) {
      setSelectedQuestion(survey.questions[0]);
    } else {
      setSelectedQuestion(null);
    }
  };

  // Einzelnen Benutzer auswählen
  const handleSelectUser = (userName) => {
    setSelectedUser(userName);
    setViewMode('individual');
  };

  // Antwort löschen
  const handleDeleteResponse = async (responseId) => {
    if (window.confirm('Möchten Sie diese Antwort wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      const success = await deleteResponse(responseId);
      if (success) {
        // Nach dem Löschen die Daten neu laden
        await fetchResponses();
        // Zurück zur Übersicht wechseln, falls die gelöschte Antwort die aktuell angezeigte war
        if (selectedUser) {
          setSelectedUser(null);
          setViewMode('overview');
        }
      }
    }
  };

  // Zurück zur Übersicht
  const handleBackToOverview = () => {
    setSelectedUser(null);
    setViewMode('overview');
  };

  // Hilfsfunktion um Antworten für eine bestimmte Umfrage zu filtern
  const getResponsesForSurvey = (survey = selectedSurvey) => {
    if (!survey || !responses) return [];

    // Filtere Responses nach surveyId
    let surveyResponses = responses.filter(response => response.surveyId === survey.id);

    // Wenn keine Responses mit surveyId gefunden wurden, versuche es mit den alten Responses
    // (für Surveys ohne surveyId in den Responses)
    if (surveyResponses.length === 0 && survey.questions && survey.questions.length > 0) {
      surveyResponses = responses.filter(response => {
        if (!response.surveyId) {
          // Prüfe ob die Response Fragen enthält, die zu diesem Survey gehören
          return survey.questions.some(questionId =>
            response.answers && response.answers[questionId] !== undefined
          );
        }
        return false;
      });
    }

    return surveyResponses;
  };

  // Statistiken mit useMemo für Performance-Optimierung
  const statistics = useMemo(() => {
    if (!selectedSurvey) {
      return null;
    }
    
    const surveyResponses = getResponsesForSurvey();
    
    if (surveyResponses.length === 0) {
      return null;
    }
    
    const stats = {};
    
    // Für jede Frage Statistiken berechnen
    selectedSurvey.questions.forEach(questionId => {
      const questionData = questions.find(q => q.id === questionId);
      if (!questionData) return;
      
      const allAnswers = [];
      const answerDetails = [];
      
      surveyResponses.forEach(response => {
        const answer = response.answers[questionId];
        if (answer !== undefined && answer !== null) {
          allAnswers.push(answer);
          answerDetails.push({
            playerName: response.playerName,
            answer: answer,
            createdAt: response.createdAt || response.submittedAt
          });
        }
      });
      
      // Je nach Antworttyp unterschiedliche Statistiken
      if (questionData.type === 'options' || questionData.type === 'radio') {
        const counts = {};
        const answersByOption = {};
        
        allAnswers.forEach((answer, index) => {
          counts[answer] = (counts[answer] || 0) + 1;
          if (!answersByOption[answer]) {
            answersByOption[answer] = [];
          }
          answersByOption[answer].push(answerDetails[index]);
        });
        
        stats[questionId] = {
          questionId: questionId,
          question: questionData.question,
          type: questionData.type,
          counts: counts,
          answersByOption: answersByOption,
          options: questionData.options || [],
          total: allAnswers.length,
          answerDetails: answerDetails
        };
      } else if (questionData.type === 'checkbox') {
        const counts = {};
        const answersByOption = {};
        
        allAnswers.forEach((answerArray, responseIndex) => {
          // Handhabe sowohl Array als auch String-Antworten
          let options = [];
          if (Array.isArray(answerArray)) {
            options = answerArray;
          } else if (typeof answerArray === 'string') {
            // Einzelne String-Antwort als Array behandeln
            options = [answerArray];
          }
          
          options.forEach(option => {
            counts[option] = (counts[option] || 0) + 1;
            if (!answersByOption[option]) {
              answersByOption[option] = [];
            }
            answersByOption[option].push(answerDetails[responseIndex]);
          });
        });
        
        stats[questionId] = {
          questionId: questionId,
          question: questionData.question,
          type: questionData.type,
          counts: counts,
          answersByOption: answersByOption,
          options: questionData.options || [],
          total: allAnswers.length,
          answerDetails: answerDetails
        };
      } else if (questionData.type === 'number') {
        const numericValues = allAnswers.map(a => parseFloat(a)).filter(n => !isNaN(n));
        if (numericValues.length > 0) {
          const sum = numericValues.reduce((a, b) => a + b, 0);
          stats[questionId] = {
            questionId: questionId,
            question: questionData.question,
            type: questionData.type,
            average: sum / numericValues.length,
            min: Math.min(...numericValues),
            max: Math.max(...numericValues),
            values: numericValues,
            total: numericValues.length,
            answerDetails: answerDetails
          };
        }
      } else {
        stats[questionId] = {
          questionId: questionId,
          question: questionData.question,
          type: questionData.type,
          answers: allAnswers,
          answerDetails: answerDetails,
          total: allAnswers.length
        };
      }
    });
    
    return stats;
  }, [selectedSurvey, responses, questions]);

  // Chart-Komponente für numerische Daten
  const renderNumberChart = (data) => {
    const barWidth = 100 / 10; // 10 Bereiche für Histogramm
    const min = data.min;
    const max = data.max;
    const range = max - min;
    
    // Teile die Werte in 10 Bereiche ein
    const buckets = Array(10).fill(0);
    
    data.values.forEach(value => {
      const bucketIndex = Math.min(Math.floor(((value - min) / range) * 10), 9);
      buckets[bucketIndex]++;
    });
    
    const maxCount = Math.max(...buckets);
    
    return (
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm font-medium">Verteilung der Werte</div>
          <div className="text-xs text-gray-500">Min: {min.toFixed(1)}, Max: {max.toFixed(1)}, Durchschnitt: {data.average.toFixed(1)}</div>
        </div>
        
        <div className="h-48 flex items-end">
          {buckets.map((count, i) => {
            const height = count ? (count / maxCount) * 100 : 0;
            const bucketMin = min + (i * (range / 10));
            const bucketMax = min + ((i + 1) * (range / 10));
            
            return (
              <div key={i} className="relative flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-500 opacity-80 rounded-t"
                  style={{ height: `${height}%` }}
                ></div>
                <div className="absolute bottom-0 transform translate-y-full mt-1 text-xs text-gray-600 rotate-45 origin-top-left">
                  {bucketMin.toFixed(1)}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 bg-blue-50 p-3 rounded-lg">
          <div className="font-medium text-blue-800 mb-1">Zusammenfassung</div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-xs text-gray-500">Min</div>
              <div className="text-xl font-bold text-blue-700">{data.min.toFixed(1)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Durchschnitt</div>
              <div className="text-xl font-bold text-blue-700">{data.average.toFixed(1)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Max</div>
              <div className="text-xl font-bold text-blue-700">{data.max.toFixed(1)}</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Chart-Komponente für Optionen und Radio Buttons
  const renderOptionsChart = (data) => {
    const options = data.options;
    const counts = data.counts;
    const maxCount = Math.max(...Object.values(counts).map(count => count || 0));
    
    // Debug-Ausgaben
    console.log("=== DEBUG renderOptionsChart ===");
    console.log("Selected Survey:", selectedSurvey?.title);
    console.log("Data:", data);
    console.log("Survey Responses for this survey:", getResponsesForSurvey());
    console.log("Total participants who answered this question:", data.total);
    console.log("Answer details:", data.answerDetails);
    
    return (
      <div className="mt-4">
        {/* Debug Info für Coach */}
        {isCoach && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs">
            <strong>Debug Info:</strong><br/>
            Gesamt Umfrage-Teilnehmer: {getResponsesForSurvey().length}<br/>
            Diese Frage beantwortet: {data.total}<br/>
            Nicht beantwortet: {getResponsesForSurvey().length - data.total}
          </div>
        )}

        <div className="space-y-4">
          {options.map((option, index) => {
            const count = counts[option] || 0;
            const percentage = data.total ? (count / data.total) * 100 : 0;
            const participantsForOption = data.answersByOption?.[option] || [];
            const colors = [
              'border-blue-500 bg-blue-50', 
              'border-green-500 bg-green-50', 
              'border-amber-500 bg-amber-50', 
              'border-red-500 bg-red-50', 
              'border-purple-500 bg-purple-50', 
              'border-pink-500 bg-pink-50'
            ];
            const color = colors[index % colors.length];
            
            return (
              <div key={index} className={`border-l-4 ${color} p-4 rounded-r-lg shadow-sm`}>
                <div className="flex justify-between items-center mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 mb-1">{option}</h4>
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-bold text-gray-900">{count}</span>
                      <span className="text-sm text-gray-600">von {data.total} ({percentage.toFixed(0)}%)</span>
                    </div>
                  </div>
                  
                  {/* Fortschrittsbalken */}
                  <div className="w-32">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                {/* Teilnehmerliste */}
                {isCoach && !selectedSurvey.anonymous && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-xs font-medium text-gray-600 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                      </svg>
                      Teilnehmer ({participantsForOption.length}):
                    </div>
                    
                    {participantsForOption.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {participantsForOption.map((participant, idx) => (
                          <span 
                            key={idx} 
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white border border-gray-300 text-gray-700 shadow-sm"
                          >
                            {participant.playerName}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500 italic text-sm">Niemand hat diese Option gewählt</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Nicht beantwortete Teilnehmer anzeigen */}
        {isCoach && !selectedSurvey.anonymous && data.total < getResponsesForSurvey().length && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Haben diese Frage nicht beantwortet ({getResponsesForSurvey().length - data.total}):
            </div>
            <div className="flex flex-wrap gap-2">
              {getResponsesForSurvey()
                .filter(response => !data.answerDetails.some(detail => detail.playerName === response.playerName))
                .map((response, idx) => (
                  <span 
                    key={idx} 
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-600"
                  >
                    {response.playerName}
                  </span>
                ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render für individuelle Benutzerantworten
  const renderIndividualUserAnswers = (userData) => {
    console.log("=== DEBUG renderIndividualUserAnswers ===");
    console.log("UserData:", userData);

    if (!userData) {
      console.log("No userData provided");
      return (
        <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <p>Keine Benutzerdaten verfügbar</p>
        </div>
      );
    }

    if (!userData.answers || Object.keys(userData.answers).length === 0) {
      console.log("No answers found in userData");
      return (
        <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <p>Dieser Benutzer hat noch keine Antworten abgegeben</p>
        </div>
      );
    }

    return (
      <div className="mt-4">
        <div className={`p-4 rounded-lg mb-6 border ${isDarkMode ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div>
                <h3 className={`font-semibold ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>{userData.playerName}</h3>
                <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                  Beantwortet am: {new Date(userData.createdAt).toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            {isCoach && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDeleteResponse(userData.id)}
                  className={`px-3 py-1 border rounded-md text-sm transition-colors ${
                    isDarkMode 
                      ? 'bg-red-900 text-red-200 border-red-700 hover:bg-red-800' 
                      : 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100'
                  }`}
                  title="Antwort löschen"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <button
                  onClick={handleBackToOverview}
                  className={`px-3 py-1 border rounded-md hover:bg-opacity-20 transition-colors text-sm ${isDarkMode ? 'bg-white text-blue-600 border-blue-300 hover:bg-blue-100' : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'}`}
                >
                  ← Zurück zur Übersicht
                </button>
              </div>
            )}
            {!isCoach && (
              <button
                onClick={handleBackToOverview}
                className={`px-3 py-1 border rounded-md hover:bg-opacity-20 transition-colors text-sm ${isDarkMode ? 'bg-white text-blue-600 border-blue-300 hover:bg-blue-100' : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'}`}
              >
                ← Zurück zur Übersicht
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {Object.entries(userData.answers).map(([questionId, answerData]) => {
            console.log(`Rendering question ${questionId}:`, answerData);

            // Sicherstellen, dass answerData existiert
            if (!answerData) {
              return (
                <div key={questionId} className={`p-4 rounded-lg border shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
                  <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Frage {questionId}</h4>
                  <div className={`ml-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} italic`}>Keine Daten verfügbar</div>
                </div>
              );
            }

            return (
              <div key={questionId} className={`p-4 rounded-lg border shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
                <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{answerData.question || `Frage ${questionId}`}</h4>

                <div className="ml-4">
                  {answerData.answer === undefined || answerData.answer === null || answerData.answer === '' ? (
                    <div className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} italic`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Nicht beantwortet
                    </div>
                  ) : (
                    <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {answerData.type === 'checkbox' ? (
                        <div>
                          {Array.isArray(answerData.answer) ? (
                            <ul className="list-disc list-inside space-y-1">
                              {answerData.answer.map((option, idx) => (
                                <li key={idx} className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{option}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{answerData.answer}</span>
                            </div>
                          )}
                        </div>
                      ) : answerData.type === 'number' ? (
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                          </svg>
                          <span className={`font-mono text-lg ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{answerData.answer}</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.546 8-10.082 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{answerData.answer}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render für Text-Antworten
  const renderTextAnswers = (data) => {
    return (
      <div className="mt-4">
        <div className="space-y-3">
          {data.answers.map((answer, index) => (
            <div key={index} className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className={`whitespace-pre-wrap ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{answer}</p>
                </div>
                {!selectedSurvey.anonymous && isCoach && (
                  <span className={`text-xs ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {data.answerDetails[index]?.playerName || 'Unbekannt'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {data.answers.length === 0 && (
          <div className={`text-center py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <p>Keine Textantworten verfügbar</p>
          </div>
        )}
      </div>
    );
  };

  // Haupt-Render-Funktion der Komponente
  if (!user) {
    return (
      <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-[#f8fafc]'}`}>
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className={`rounded-lg shadow-md p-8 max-w-lg w-full text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-4V8m-3 4h6" />
            </svg>
            <h1 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Zugriff nicht möglich</h1>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Bitte melde dich an, um Umfrageergebnisse ansehen zu können.</p>
            <button 
              onClick={() => navigate('/coach-login')} 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Zum Login
            </button>
          </div>
        </main>
        
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-[#f8fafc]'}`}>
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className={`shadow-md rounded-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-6">
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-[#0a2240]'}`}>Umfrageergebnisse</h1>
            <BackButton to={isCoach ? "/coach/dashboard" : "/"} />
          </div>
          
          {loading ? (
            <div className="text-center py-10">
              <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto ${isDarkMode ? 'border-white' : 'border-[#0a2240]'}`}></div>
              <p className={`mt-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Daten werden geladen...</p>
            </div>
          ) : error ? (
            <div className={`p-4 rounded-md ${isDarkMode ? 'bg-red-900' : 'bg-red-50'}`}>
              <p className={`text-red-600 ${isDarkMode ? 'text-red-300' : ''}`}>{error}</p>
            </div>
          ) : visibleSurveys.length === 0 ? (
            <div className={`p-6 rounded-lg text-center ${isDarkMode ? 'bg-yellow-900' : 'bg-yellow-50'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-yellow-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className={`font-medium mb-2 ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>Keine Umfrageergebnisse verfügbar</p>
              <p className={`${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                Der Coach entscheidet, welche Umfrageergebnisse sichtbar gemacht werden.
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h3 className={`block text-lg font-medium mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Umfragen auswählen:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {visibleSurveys.map((survey) => (
                    <div
                      key={survey.id}
                      onClick={() => handleSelectSurvey(survey)}
                      className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                        selectedSurvey?.id === survey.id 
                          ? `border-[#0a2240] ${isDarkMode ? 'bg-blue-900' : 'bg-blue-50'} shadow-md` 
                          : `border-gray-200 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:border-blue-300 hover:bg-blue-50'}`
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{survey.title}</h4>
                        {survey.anonymous && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">Anonym</span>
                        )}
                      </div>
                      <p className={`text-sm mb-3 line-clamp-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{survey.description || "Keine Beschreibung"}</p>
                      <div className="flex justify-between items-center">
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {new Date(survey.createdAt).toLocaleDateString()}
                        </span>
                        <span className={`text-xs font-medium px-2 py-1 rounded ${isDarkMode ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-800'}`}>
                          {getResponsesForSurvey(survey).length} Antworten
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {selectedSurvey ? (
                <div>
                  <div className={`p-6 rounded-lg mb-6 border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : ''}`}>{selectedSurvey.title}</h2>
                        <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {selectedSurvey.description || "Keine Beschreibung verfügbar."}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full flex items-center ${
                          selectedSurvey.anonymous ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {selectedSurvey.anonymous ? (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                              <span>Anonyme Umfrage</span>
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span>Personalisierte Umfrage</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-between items-center">
                      <div className="flex items-center">
                        <span className={`font-medium ${isDarkMode ? 'text-gray-300' : ''}`}>Teilnehmer:</span>
                        <span className="ml-2 text-lg font-bold text-blue-600">{getResponsesForSurvey().length}</span>
                      </div>
                      
                      {/* Teilnehmerliste nur für Coach und nicht-anonyme Umfragen */}
                      {isCoach && !selectedSurvey.anonymous && (
                        <div>
                          <div className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Einzelne Antworten ansehen:</div>
                          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                            {getResponsesForSurvey().map((response, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleSelectUser(response.playerName)}
                                className={`text-xs px-3 py-1 rounded-full flex items-center transition-colors ${
                                  selectedUser === response.playerName
                                    ? 'bg-blue-600 text-white'
                                    : `${isDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-300 hover:text-white' : 'bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-800'}`
                                }`}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>{response.playerName || "Unbekannt"}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    {viewMode === 'individual' && selectedUser ? (
                      // Individuelle Benutzeransicht
                      <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
                        {(() => {
                          console.log("=== RENDERING INDIVIDUAL VIEW ===");
                          console.log("Selected User:", selectedUser);
                          console.log("View Mode:", viewMode);
                          const userData = getUserResponsesSimple(selectedUser);
                          console.log("User Data from getUserResponsesSimple:", userData);
                          return renderIndividualUserAnswers(userData);
                        })()}
                      </div>
                    ) : (
                      // Übersichts-Ansicht (bestehende Logik)
                      (() => {
                        const stats = statistics;
                        if (!stats) return (
                          <div className={`p-6 rounded-lg text-center ${isDarkMode ? 'bg-yellow-900' : 'bg-yellow-50'}`}>
                            <p className={`${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                              Keine Statistiken verfügbar für diese Umfrage.
                            </p>
                            <p className={`${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'} text-sm mt-2`}>
                              Es wurden noch keine Antworten abgegeben oder die Fragen wurden gelöscht.
                            </p>
                          </div>
                        );
                        
                        const questionIds = Object.keys(stats);
                        
                        return (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Fragen-Sidebar */}
                            <div className={`p-4 rounded-lg border h-min ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                              <h3 className={`font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Fragen</h3>
                              <div className="space-y-2">
                                {questionIds.map(questionId => {
                                  const stat = stats[questionId];
                                  return (
                                    <div 
                                      key={questionId}
                                      onClick={() => handleSelectQuestion(questionId)}
                                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                        selectedQuestion === questionId 
                                          ? `border-blue-300 border ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'}` 
                                          : `border border-gray-200 ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-white hover:bg-blue-50'}`
                                      }`}
                                    >
                                      <p className={`font-medium mb-1 line-clamp-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                        {stat.question}
                                      </p>
                                      <div className="flex justify-between text-xs">
                                        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                          {(() => {
                                            switch(stat.type) {
                                              case 'options': return 'Einmalauswahl';
                                              case 'radio': return 'Radio-Buttons';
                                              case 'checkbox': return 'Mehrfachauswahl';
                                              case 'number': return 'Zahleneingabe';
                                              default: return 'Text';
                                            }
                                          })()}
                                        </span>
                                        <span className="font-medium text-blue-600">{stat.total} Antworten</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            
                            {/* Ergebnis-Bereich */}
                            <div className="md:col-span-2">
                              {selectedQuestion && statistics?.[selectedQuestion] ? (
                                <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
                                  <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : ''}`}>{statistics[selectedQuestion].question}</h3>
                                  
                                  {statistics[selectedQuestion].type === 'number' && renderNumberChart(statistics[selectedQuestion])}
                                  
                                  {(statistics[selectedQuestion].type === 'options' || statistics[selectedQuestion].type === 'radio' || statistics[selectedQuestion].type === 'checkbox') && 
                                    renderOptionsChart(statistics[selectedQuestion])
                                  }
                                  
                                  {statistics[selectedQuestion].type !== 'number' && 
                                   statistics[selectedQuestion].type !== 'options' && 
                                   statistics[selectedQuestion].type !== 'radio' && 
                                   statistics[selectedQuestion].type !== 'checkbox' && 
                                    renderTextAnswers(statistics[selectedQuestion])
                                  }
                                </div>
                              ) : (
                                // Zeige Übersicht aller Fragen wenn keine spezifische Frage ausgewählt ist
                                <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'}`}>
                                  <h3 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : ''}`}>Alle Antworten - Übersicht</h3>
                                  <div className="space-y-8">
                                    {questionIds.map(questionId => {
                                      const stat = stats[questionId];
                                      if (!stat) return null;
                                      
                                      return (
                                        <div key={questionId} className={`border-b pb-6 last:border-b-0 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                                          <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{stat.question}</h4>
                                          
                                          {stat.type === 'number' && renderNumberChart(stat)}
                                          
                                          {(stat.type === 'options' || stat.type === 'radio' || stat.type === 'checkbox') && 
                                            renderOptionsChart(stat)
                                          }
                                          
                                          {stat.type !== 'number' && 
                                           stat.type !== 'options' && 
                                           stat.type !== 'radio' && 
                                           stat.type !== 'checkbox' && 
                                            renderTextAnswers(stat)
                                          }
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()
                    )}
                  </div>
                </div>
              ) : (
                <div className={`p-6 rounded-lg border text-center ${isDarkMode ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-blue-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className={`font-medium mb-2 ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>Wähle eine Umfrage aus</p>
                  <p className={`${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                    Wähle oben eine Umfrage aus, um die Ergebnisse anzusehen.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}