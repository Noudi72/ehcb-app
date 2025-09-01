import React, { useState, useEffect } from "react";
import { useUmfrage } from "../context/UmfrageContext";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import BackButton from "../components/BackButton";

export default function SimpleSurveyEditor() {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const { 
    surveys, 
    loading, 
    error, 
    fetchSurveys, 
    createSurvey, 
    updateSurvey,
    deleteSurvey 
  } = useUmfrage();
  
  // Zustand für die Umfrage
  const [survey, setSurvey] = useState({
    title: "",
    description: "",
    questions: [],
    resultsVisibleToPlayers: false,
    anonymous: false,
    targetTeams: ["u18-elit"],
    active: false
  });

  // Zustand für Fragen
  const [questions, setQuestions] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  // Lade Umfragedaten beim ersten Render
  useEffect(() => {
    fetchSurveys();
    if (surveyId && surveys.length > 0) {
      const existingSurvey = surveys.find(s => s.id === surveyId);
      if (existingSurvey) {
        setSurvey(existingSurvey);
        setQuestions(existingSurvey.questions || []);
      }
    }
  }, [fetchSurveys, surveyId, surveys]);

  // Neue Frage hinzufügen
  const addQuestion = () => {
    const newQuestion = {
      id: `q_${Date.now()}`,
      text: "",
      type: "multiple-choice",
      options: ["Option 1", "Option 2"],
      required: false
    };
    setQuestions([...questions, newQuestion]);
  };

  // Frage bearbeiten
  const updateQuestion = (questionId, updates) => {
    setQuestions(questions.map(q => 
      q.id === questionId ? { ...q, ...updates } : q
    ));
  };

  // Frage löschen
  const removeQuestion = (questionId) => {
    setQuestions(questions.filter(q => q.id !== questionId));
  };

  // Option zu Frage hinzufügen
  const addOption = (questionId) => {
    updateQuestion(questionId, {
      options: [...(questions.find(q => q.id === questionId)?.options || []), `Option ${(questions.find(q => q.id === questionId)?.options?.length || 0) + 1}`]
    });
  };

  // Option entfernen
  const removeOption = (questionId, optionIndex) => {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options.length > 2) {
      updateQuestion(questionId, {
        options: question.options.filter((_, index) => index !== optionIndex)
      });
    }
  };

  // Umfrage speichern
  const handleSave = async () => {
    if (!survey.title.trim()) {
      alert("Bitte geben Sie einen Umfragetitel ein.");
      return;
    }

    if (questions.length === 0) {
      alert("Bitte fügen Sie mindestens eine Frage hinzu.");
      return;
    }

    try {
      const surveyData = {
        ...survey,
        questions: questions
      };

      let result;
      if (surveyId) {
        result = await updateSurvey(surveyId, surveyData);
      } else {
        result = await createSurvey(surveyData);
      }

      if (result) {
        setSuccessMessage(`Umfrage erfolgreich ${surveyId ? 'aktualisiert' : 'erstellt'}!`);
        setTimeout(() => {
          navigate('/coach/surveys');
        }, 2000);
      }
    } catch (err) {
      console.error("Fehler beim Speichern der Umfrage:", err);
    }
  };

  // Umfrage löschen
  const handleDelete = async () => {
    if (!surveyId) return;
    
    if (window.confirm(`Möchten Sie die Umfrage "${survey.title}" wirklich löschen?`)) {
      try {
        await deleteSurvey(surveyId);
        navigate('/coach/surveys');
      } catch (err) {
        console.error("Fehler beim Löschen der Umfrage:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <BackButton />
      
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            {surveyId ? 'Umfrage bearbeiten' : 'Neue Umfrage erstellen'}
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
              {successMessage}
            </div>
          )}

          {/* Umfrage-Grunddaten */}
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Umfragetitel *
              </label>
              <input
                type="text"
                value={survey.title}
                onChange={(e) => setSurvey({...survey, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="z.B. Trainings-Feedback"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Beschreibung
              </label>
              <textarea
                value={survey.description}
                onChange={(e) => setSurvey({...survey, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Beschreiben Sie den Zweck dieser Umfrage..."
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={survey.anonymous}
                  onChange={(e) => setSurvey({...survey, anonymous: e.target.checked})}
                  className="mr-2"
                />
                Anonyme Umfrage
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={survey.resultsVisibleToPlayers}
                  onChange={(e) => setSurvey({...survey, resultsVisibleToPlayers: e.target.checked})}
                  className="mr-2"
                />
                Ergebnisse für Spieler sichtbar
              </label>
            </div>
          </div>

          {/* Fragen-Bereich */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Fragen</h2>
              <button
                onClick={addQuestion}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                + Frage hinzufügen
              </button>
            </div>

            {questions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Noch keine Fragen hinzugefügt. Klicken Sie auf "Frage hinzufügen" um zu beginnen.
              </div>
            ) : (
              <div className="space-y-6">
                {questions.map((question, index) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-medium text-gray-800">Frage {index + 1}</h3>
                      <button
                        onClick={() => removeQuestion(question.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fragetext *
                        </label>
                        <input
                          type="text"
                          value={question.text}
                          onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Geben Sie Ihre Frage ein..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fragetyp
                        </label>
                        <select
                          value={question.type}
                          onChange={(e) => updateQuestion(question.id, { type: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="multiple-choice">Multiple Choice</option>
                          <option value="text">Textantwort</option>
                          <option value="rating">Bewertung (1-5)</option>
                        </select>
                      </div>

                      {question.type === 'multiple-choice' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Antwortoptionen
                          </label>
                          <div className="space-y-2">
                            {question.options?.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...question.options];
                                    newOptions[optionIndex] = e.target.value;
                                    updateQuestion(question.id, { options: newOptions });
                                  }}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {question.options.length > 2 && (
                                  <button
                                    onClick={() => removeOption(question.id, optionIndex)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              onClick={() => addOption(question.id)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              + Option hinzufügen
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Aktionen */}
          <div className="flex justify-between">
            <div>
              {surveyId && (
                <button
                  onClick={handleDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                  disabled={loading}
                >
                  Umfrage löschen
                </button>
              )}
            </div>
            
            <div className="space-x-4">
              <button
                onClick={() => navigate('/coach/surveys')}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Abbrechen
              </button>
              
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                disabled={loading}
              >
                {loading ? 'Speichert...' : (surveyId ? 'Umfrage aktualisieren' : 'Umfrage erstellen')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
