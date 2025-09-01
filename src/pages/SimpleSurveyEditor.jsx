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
    updateSurvey 
  } = useUmfrage();
  
  // Vereinfachter Zustand - nur eine Liste von Fragen, kein separater Titel
  const [surveyTitle, setSurveyTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  // Lade Umfragedaten beim ersten Render
  useEffect(() => {
    fetchSurveys();
    if (surveyId && surveys.length > 0) {
      const existingSurvey = surveys.find(s => s.id === surveyId);
      if (existingSurvey) {
        setSurveyTitle(existingSurvey.title || "");
        setQuestions(existingSurvey.questions || []);
      }
    }
  }, [fetchSurveys, surveyId, surveys]);

  // Erste Frage hinzufügen falls keine vorhanden - nur einmal beim Mount
  useEffect(() => {
    if (questions.length === 0 && !surveyId) {
      const newQuestion = {
        id: `q_${Date.now()}`,
        text: "",
        type: "multiple-choice",
        options: ["", ""],
        required: false
      };
      setQuestions([newQuestion]);
    }
  }, []); // Leere dependency array um endlose Loops zu verhindern

  // Neue Frage hinzufügen
  const addQuestion = () => {
    const newQuestion = {
      id: `q_${Date.now()}`,
      text: "",
      type: "multiple-choice",
      options: ["", ""],
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
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== questionId));
    }
  };

  // Option zu Frage hinzufügen
  const addOption = (questionId) => {
    const question = questions.find(q => q.id === questionId);
    updateQuestion(questionId, {
      options: [...(question?.options || []), ""]
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
    // Validierung: Prüfe ob mindestens eine Frage ausgefüllt ist
    const validQuestions = questions.filter(q => q.text.trim());
    
    if (validQuestions.length === 0) {
      alert("Bitte geben Sie mindestens eine Frage ein.");
      return;
    }

    // Automatischen Titel generieren wenn nicht vorhanden
    const finalTitle = surveyTitle.trim() || `Umfrage vom ${new Date().toLocaleDateString('de-DE')}`;

    console.log('💾 Speichere Umfrage:', { finalTitle, validQuestions });

    try {
      const surveyData = {
        title: finalTitle,
        description: "", // Keine separate Beschreibung mehr
        questions: validQuestions,
        resultsVisibleToPlayers: false,
        anonymous: true, // Standardmäßig anonym
        targetTeams: ["u18-elit"],
        active: true,
        createdAt: new Date().toISOString()
      };

      let result;
      if (surveyId) {
        result = await updateSurvey(surveyId, { ...surveyData, id: surveyId });
        setSuccessMessage("Umfrage erfolgreich aktualisiert!");
      } else {
        result = await createSurvey(surveyData);
        setSuccessMessage("Umfrage erfolgreich erstellt!");
      }

      console.log('✅ Umfrage gespeichert:', result);

      // Nach 2 Sekunden zur Übersicht zurückkehren
      setTimeout(() => {
        navigate('/coach/surveys');
      }, 2000);

    } catch (err) {
      console.error("❌ Fehler beim Speichern:", err);
      setSuccessMessage(""); // Clear success message
      alert("Fehler beim Speichern der Umfrage: " + (err.message || "Unbekannter Fehler"));
    }
  };

  // Umfrage löschen (entfernt - nicht in SimpleSurveyEditor benötigt)

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] font-sans">
      <Header />
      <BackButton to="/coach/surveys" />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {surveyId ? "📝 Umfrage bearbeiten" : "✨ Neue Umfrage erstellen"}
            </h1>
          </div>

          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {successMessage}
            </div>
          )}

          {/* Vereinfachtes Formular - nur das Nötigste */}
          <div className="space-y-6">
            
            {/* Optionaler Titel */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📋 Umfragetitel (optional)
              </label>
              <input
                type="text"
                value={surveyTitle}
                onChange={(e) => setSurveyTitle(e.target.value)}
                placeholder="z.B. 'Training Feedback' - oder leer lassen für automatischen Titel"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Wenn leer, wird automatisch ein Titel generiert
              </p>
            </div>

            {/* Fragen */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Fragen</h3>
                <button
                  onClick={addQuestion}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  + Frage hinzufügen
                </button>
              </div>

              {questions.map((question, questionIndex) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Frage {questionIndex + 1}</h4>
                    {questions.length > 1 && (
                      <button
                        onClick={() => removeQuestion(question.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                        title="Frage löschen"
                      >
                        ❌
                      </button>
                    )}
                  </div>

                  {/* Fragetext */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fragetext *
                    </label>
                    <input
                      type="text"
                      value={question.text}
                      onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                      placeholder="z.B. 'Wie zufrieden warst du mit dem heutigen Training?'"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Fragetyp */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Antworttyp
                    </label>
                    <select
                      value={question.type}
                      onChange={(e) => updateQuestion(question.id, { type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="multiple-choice">Multiple Choice</option>
                      <option value="text">Textantwort</option>
                      <option value="rating">Bewertung (1-5 Sterne)</option>
                      <option value="yes-no">Ja/Nein</option>
                    </select>
                  </div>

                  {/* Antwortoptionen für Multiple Choice */}
                  {question.type === 'multiple-choice' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Antwortoptionen
                      </label>
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-2 mb-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...question.options];
                              newOptions[optionIndex] = e.target.value;
                              updateQuestion(question.id, { options: newOptions });
                            }}
                            placeholder={`Option ${optionIndex + 1}`}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          {question.options.length > 2 && (
                            <button
                              onClick={() => removeOption(question.id, optionIndex)}
                              className="text-red-600 hover:text-red-800 px-2"
                              title="Option entfernen"
                            >
                              🗑️
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
                  )}
                </div>
              ))}
            </div>

            {/* Speichern Button */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                onClick={() => navigate('/coach/surveys')}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Wird gespeichert..." : (surveyId ? "Aktualisieren" : "Erstellen")}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
