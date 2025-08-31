import React, { useState, useEffect } from "react";
import { useUmfrage } from "../context/UmfrageContext";
import { useLanguage } from "../context/LanguageContext";
import Header from "../components/Header";
import BackButton from "../components/BackButton";


export default function Umfrage() {
  const { questions, surveys, getActiveSurveysWithQuestions, getTranslatedSurveysWithQuestions, getTranslatedQuestions, submitSurveyResponse, loading, error } = useUmfrage();
  const { t, language } = useLanguage();
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [playerName, setPlayerName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [activeSurveys, setActiveSurveys] = useState([]);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  
  // Lade aktive Umfragen mit ihren Fragen (übersetzt)
  useEffect(() => {
    const loadTranslatedSurveys = async () => {
      try {
        // Warten bis surveys und questions geladen sind
        if (surveys.length === 0 || questions.length === 0) {
          console.log("Warte auf das Laden von Surveys und Questions...");
          return;
        }
        
        const surveysWithQuestions = await getTranslatedSurveysWithQuestions(language);
        const sortedSurveys = [...surveysWithQuestions].sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        setActiveSurveys(sortedSurveys);
        console.log("Übersetzte aktive Umfragen geladen:", sortedSurveys);
        
        if (sortedSurveys.length > 0) {
          const latestSurvey = sortedSurveys[0];
          setSelectedSurvey(latestSurvey);
          
          if (latestSurvey.questions && Array.isArray(latestSurvey.questions) && latestSurvey.questions.length > 0) {
            console.log("Übersetzte Fragen für ausgewählte Umfrage:", latestSurvey.questions);
            setCurrentQuestions(latestSurvey.questions);
          } else {
            // Keine Fragen in der aktiven Umfrage — lege currentQuestions leer fest
            setCurrentQuestions([]);
          }
        } else {
          // Keine aktiven Umfragen vorhanden: zeige keine Default‑Fragen mehr, sondern eine Info im UI
          setActiveSurveys([]);
          setSelectedSurvey(null);
          setCurrentQuestions([]);
        }
      } catch (error) {
        console.error("Fehler beim Laden der übersetzten Umfragen:", error);
        // Fallback: verwende normale Umfragen
        const surveysWithQuestions = getActiveSurveysWithQuestions();
        const sortedSurveys = [...surveysWithQuestions].sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setActiveSurveys(sortedSurveys);
        
        if (sortedSurveys.length > 0) {
          const latestSurvey = sortedSurveys[0];
          setSelectedSurvey(latestSurvey);
          
          if (latestSurvey.questions && Array.isArray(latestSurvey.questions) && latestSurvey.questions.length > 0) {
            setCurrentQuestions(latestSurvey.questions);
          } else {
            setCurrentQuestions([]);
          }
        } else {
          setCurrentQuestions([]);
        }
      }
    };

    loadTranslatedSurveys();
  }, [surveys, questions, getTranslatedSurveysWithQuestions, getTranslatedQuestions, language]);
  
  // Initialisiere Antworten
  useEffect(() => {
    if (currentQuestions.length === 0) return;
    
    const initialAnswers = {};
    currentQuestions.forEach(q => {
      if (q.type === 'checkbox') {
        initialAnswers[q.id] = [];
      } else {
        initialAnswers[q.id] = '';
      }
    });
    
    setAnswers(initialAnswers);
  }, [currentQuestions]);
  
  // Einfache Funktion zum Aktualisieren der Antworten
  const handleInputChange = (questionId, value, isCheckbox = false) => {
    if (isCheckbox) {
      setAnswers(prev => {
        const currentValues = Array.isArray(prev[questionId]) ? [...prev[questionId]] : [];
        const valueIndex = currentValues.indexOf(value);
        
        if (valueIndex === -1) {
          currentValues.push(value);
        } else {
          currentValues.splice(valueIndex, 1);
        }
        
        return {
          ...prev,
          [questionId]: currentValues
        };
      });
    } else {
      setAnswers(prev => ({
        ...prev,
        [questionId]: value
      }));
    }
  };
  
  // Navigation zwischen Fragen
  const nextQuestion = () => {
    if (activeQuestion < currentQuestions.length - 1) {
      setActiveQuestion(activeQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (activeQuestion > 0) {
      setActiveQuestion(activeQuestion - 1);
    }
  };
  
  // Umfrageantworten absenden
  const handleSubmit = async () => {
    if (!playerName.trim()) {
      alert(t('survey.nameRequired') || "Bitte gib deinen Namen ein");
      return;
    }
    
    if (!selectedSurvey) {
      alert(t('survey.selectSurveyRequired') || "Bitte wähle eine Umfrage aus");
      return;
    }
    
    console.log("Sende Antworten:", {
      playerName,
      answers,
      surveyId: selectedSurvey.id
    });
    
    try {
      const success = await submitSurveyResponse({
        playerName,
        answers,
        surveyId: selectedSurvey.id
      });
      
      if (success) {
        console.log("Umfrage erfolgreich abgesendet");
        setSubmitted(true);
      } else {
        console.error("Fehler beim Absenden der Umfrage - Server meldete keinen Erfolg");
        alert("Beim Absenden der Umfrage ist ein Fehler aufgetreten. Bitte versuche es erneut.");
      }
    } catch (error) {
      console.error("Fehler beim Absenden der Umfrage:", error);
      alert("Beim Absenden der Umfrage ist ein Fehler aufgetreten. Bitte versuche es erneut.");
    }
  };
  
  // Render-Funktion für verschiedene Fragetypen
  const renderQuestionInput = (question) => {
    if (!question) return null;
    
    switch (question.type) {
      case 'options':
      case 'radio':
        return (
          <div className="space-y-3">
            {question.options?.map((option, i) => (
              <div 
                key={i} 
                className={`p-3 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 ${
                  answers[question.id] === option 
                    ? 'bg-[#0a2240] dark:bg-blue-600 text-white border-[#0a2240] dark:border-blue-600' 
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white'
                }`}
                onClick={() => handleInputChange(question.id, option)}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    id={`radio-${question.id}-${i}`}
                    name={`radio-${question.id}`}
                    value={option}
                    checked={answers[question.id] === option}
                    onChange={() => handleInputChange(question.id, option)}
                    className="w-5 h-5 mr-3 accent-[#0a2240] opacity-0 absolute"
                  />
                  <label
                    htmlFor={`radio-${question.id}-${i}`}
                    className="cursor-pointer flex-grow"
                  >
                    {option}
                  </label>
                  {/* Visuelle Radio-Button-Indikator */}
                  {answers[question.id] === option && (
                    <div className="w-5 h-5 rounded-full bg-white border-2 border-[#0a2240] dark:border-blue-400 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-[#0a2240] dark:bg-blue-400"></div>
                    </div>
                  )}
                  {answers[question.id] !== option && (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-500"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
        
      case 'checkbox':
        return (
          <div className="space-y-3">
            {question.options?.map((option, i) => (
              <div 
                key={i}
                className={`p-3 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 ${
                  Array.isArray(answers[question.id]) && answers[question.id].includes(option)
                    ? 'bg-[#0a2240] dark:bg-blue-600 text-white border-[#0a2240] dark:border-blue-600'
                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white'
                }`}
                onClick={() => handleInputChange(question.id, option, true)}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`checkbox-${question.id}-${i}`}
                    checked={Array.isArray(answers[question.id]) && answers[question.id].includes(option)}
                    onChange={() => handleInputChange(question.id, option, true)}
                    className="w-5 h-5 mr-3 accent-[#0a2240] opacity-0 absolute"
                  />
                  <label
                    htmlFor={`checkbox-${question.id}-${i}`}
                    className="cursor-pointer flex-grow"
                  >
                    {option}
                  </label>
                  {/* Visuelle Checkbox-Indikator */}
                  {Array.isArray(answers[question.id]) && answers[question.id].includes(option) ? (
                    <div className="w-5 h-5 border-2 border-[#0a2240] dark:border-blue-400 bg-[#0a2240] dark:bg-blue-400 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-500"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
        
      case 'number':
        return (
          <input
            type="number"
            min={question.min}
            max={question.max}
            placeholder={question.placeholder}
            value={answers[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a2240] dark:focus:ring-blue-500 focus:border-[#0a2240] dark:focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            style={{fontSize: "16px"}}
          />
        );
        
      case 'textarea':
        return (
          <textarea
            placeholder={question.placeholder}
            value={answers[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full p-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg min-h-[120px] focus:outline-none focus:ring-2 focus:ring-[#0a2240] dark:focus:ring-blue-500 focus:border-[#0a2240] dark:focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            style={{fontSize: "16px"}}
          ></textarea>
        );
        
      default:
        return null;
    }
  };

  // Erfolgsnachricht nach Absenden der Umfrage
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-gray-900 font-sans transition-colors duration-300">
        <Header />
        <div className="px-4 py-4">
          <BackButton to="/" />
        </div>
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 text-center transition-colors duration-300">
            <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('survey.thankYou')}</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t('survey.submitted')}
            </p>
            <div className="flex flex-col space-y-4">
              <button 
                onClick={() => {
                  setSubmitted(false);
                  setActiveQuestion(0);
                  setAnswers({});
                  setPlayerName("");
                }}
                className="px-4 py-2 bg-[#0a2240] dark:bg-blue-600 text-white rounded-lg hover:bg-[#0d2a4a] dark:hover:bg-blue-700 transition-colors duration-300"
              >
                {t('survey.startSurvey')}
              </button>
              
              <div className="flex space-x-2 justify-center">
                <button 
                  onClick={() => {
                    window.location.href = "/";
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-300"
                >
                  {t('survey.backToHome')}
                </button>
                <button 
                  onClick={() => {
                    window.location.href = "/umfrage-results";
                  }}
                  className="px-4 py-2 bg-[#0a2240] dark:bg-blue-600 text-white rounded-lg hover:bg-[#081a32] dark:hover:bg-blue-700 transition-colors duration-300"
                >
                  {t('survey.results')}
                </button>
              </div>
            </div>
          </div>
        </main>
        
      </div>
    );
  }
  
  // Hauptansicht der Umfrage
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-gray-900 font-sans transition-colors duration-300">
      <Header />
      <div className="px-4 py-4">
        <BackButton to="/" />
      </div>
      <main className="flex-1 flex flex-col items-center px-4 py-8">
        {loading ? (
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 flex justify-center transition-colors duration-300">
            <div className="spinner-border text-blue-500" role="status">
              <span className="sr-only">{t('common.loading')}</span>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
            {error && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                {error}
              </div>
            )}
            
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('survey.title')}</h1>

            {/* Wenn keine aktiven Umfragen vorhanden sind, zeige eine Info-Box statt Default-Fragen */}
            {activeSurveys.length === 0 && (
              <div className="mb-6 p-4 rounded-lg border border-gray-200 bg-yellow-50 text-gray-800">
                <strong>Zurzeit sind keine Umfragen aktiv.</strong>
                <p className="mt-2 text-sm text-gray-700">Wenn du Trainer bist, kannst du Umfragen im Coach‑Dashboard > Aktive Umfragen aktivieren.</p>
                <div className="mt-3 flex space-x-2">
                  <button onClick={() => window.location.href = '/'} className="px-4 py-2 bg-[#0a2240] text-white rounded">Zur Startseite</button>
                  <button onClick={() => window.location.href = '/coach-login'} className="px-4 py-2 bg-blue-100 text-blue-800 rounded">Coach Login</button>
                </div>
              </div>
            )}

            {/* Survey Auswahl mit Cards */}
            {activeSurveys.length > 0 && activeSurveys.length > 1 && !selectedSurvey && (
              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
                  {t('survey.chooseSurvey')}
                </h2>
                <div className="space-y-3">
                  {activeSurveys.map(survey => (
                    <div
                      key={survey.id}
                      onClick={() => {
                        setSelectedSurvey(survey);
                        if (survey?.questions && survey.questions.length > 0) {
                          setCurrentQuestions(survey.questions);
                        }
                        setActiveQuestion(0);
                        setAnswers({});
                      }}
                      className="p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-[#0a2240] dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer transition-all duration-200 bg-white dark:bg-gray-700"
                    >
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{survey.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{survey.description}</p>
                      <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        {survey.questions?.length || 0} {t('survey.questions')}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('survey.selectToStart')}</p>
                </div>
              </div>
            )}
            
            {/* Zurück Button wenn Umfrage ausgewählt aber noch bei Frage 0 */}
            {activeSurveys.length > 1 && selectedSurvey && activeQuestion === 0 && (
              <div className="mb-4">
                <button
                  onClick={() => {
                    setSelectedSurvey(null);
                    setCurrentQuestions([]);
                    setAnswers({});
                  }}
                  className="text-[#0a2240] dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center transition-colors duration-300"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  {t('survey.backToSelection')}
                </button>
              </div>
            )}
            
            {(activeSurveys.length <= 1 || selectedSurvey) && activeQuestion === 0 && (
              <div className="mb-6">
                <label htmlFor="playerName" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('survey.yourName')}
                </label>
                <input
                  type="text"
                  id="playerName"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder={t('survey.enterName')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                
                {selectedSurvey && selectedSurvey.anonymous && (
                  <div className="mt-3 flex items-center bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-sm">{t('survey.anonymous')}</span>
                  </div>
                )}
                
                {selectedSurvey && !selectedSurvey.anonymous && (
                  <div className="mt-3 flex items-center bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm">{t('survey.disclaimer')}</span>
                  </div>
                )}
              </div>
            )}
            
            <div className="mb-8">
              {currentQuestions.length > 0 && activeQuestion < currentQuestions.length && (
                <>
                  <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    {t('survey.questionOf')} {activeQuestion + 1} {t('survey.of')} {currentQuestions.length}
                  </div>
                  
                  <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    {currentQuestions[activeQuestion] ? 
                      currentQuestions[activeQuestion].question : 
                      "Frage konnte nicht geladen werden"}
                  </h2>
                  
                  {currentQuestions[activeQuestion] ? 
                    renderQuestionInput(currentQuestions[activeQuestion]) :
                    <p className="text-red-500 dark:text-red-400">Es ist ein Problem beim Laden der Frage aufgetreten.</p>
                  }
                </>
              )}
            </div>
            
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between">
                {currentQuestions.length > 0 && (
                  <button 
                    onClick={prevQuestion}
                    disabled={activeQuestion === 0}
                    className={`px-4 py-2 rounded-lg ${activeQuestion === 0 ? 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400' : 'bg-[#0a2240] dark:bg-blue-600 text-white hover:bg-[#0d2a4a] dark:hover:bg-blue-700 transition-colors duration-300'}`}
                  >
                    {t('survey.previous')}
                  </button>
                )}
                
                {currentQuestions.length > 0 && (
                  activeQuestion < currentQuestions.length - 1 ? (
                    <button 
                      onClick={nextQuestion}
                      className="px-4 py-2 bg-[#0a2240] dark:bg-blue-600 text-white rounded-lg hover:bg-[#0d2a4a] dark:hover:bg-blue-700 transition-colors duration-300"
                    >
                      {t('survey.next')}
                    </button>
                  ) : (
                    <button 
                      onClick={handleSubmit}
                      disabled={loading}
                      className="px-4 py-2 bg-[#0a2240] dark:bg-blue-600 text-white rounded-lg hover:bg-[#0d2a4a] dark:hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50"
                    >
                      {loading ? t('common.loading') : t('survey.submit')}
                    </button>
                  )
                )}
              </div>
              
              <button 
                onClick={() => {
                  window.location.href = "/";
                }}
                className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-300"
              >
                {t('survey.backToHome')}
              </button>
            </div>
          </div>
        )}
      </main>
      
    </div>
  );
}
