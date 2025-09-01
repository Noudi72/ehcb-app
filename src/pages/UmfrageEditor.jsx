import React, { useState, useEffect } from "react";
import { useUmfrage } from "../context/UmfrageContext";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import BackButton from "../components/BackButton";


export default function UmfrageEditor() {
  const { surveyId } = useParams(); // Verwende useParams statt Query-Parameter
  const navigate = useNavigate();
  const { 
    questions, 
    surveys, 
    addQuestion, 
    updateQuestion, 
    deleteQuestion, 
    loading, 
    error, 
    fetchSurveys, 
    fetchQuestions, 
    createSurvey, 
    updateSurvey 
  } = useUmfrage();
  
  // Zustand für neue Frage
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    type: "options",
    options: ["", ""],
    required: false,
    placeholder: "",
    min: 0,
    max: 100
  });
  
  // Zustand für die zu bearbeitende Umfrage
  const [currentSurvey, setCurrentSurvey] = useState(null);

  // Zustand für UI-Steuerelemente
  const [activeTab, setActiveTab] = useState("questions");
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  // Laden der Umfragedaten beim ersten Render
  useEffect(() => {
    const loadSurveyData = async () => {
      try {
        // Lade alle Fragen und Umfragen
        await Promise.all([fetchQuestions(), fetchSurveys()]);
        
        // Standardmäßig den Fragen-Tab anzeigen
        setActiveTab("questions");
        
        // Initialisiere eine leere neue Umfrage
        setCurrentSurvey({
          title: "",
          description: "",
          questions: [],
          resultsVisibleToPlayers: false,
          anonymous: false,
          active: true
        });
      } catch (err) {
        console.error("Fehler beim Laden der Daten:", err);
      }
    };
    
    loadSurveyData();
  }, [fetchQuestions, fetchSurveys]);

  // Bestehende Umfrage laden, wenn surveyId in URL vorhanden ist
  useEffect(() => {
    if (surveyId && surveys && surveys.length > 0) {
      const existingSurvey = surveys.find(s => s.id === surveyId);
      if (existingSurvey) {
        console.log("Lade bestehende Umfrage:", existingSurvey);
        setCurrentSurvey({
          ...existingSurvey,
          // Stelle sicher, dass alle erforderlichen Felder vorhanden sind
          title: existingSurvey.title || "",
          description: existingSurvey.description || "",
          questions: existingSurvey.questions || [],
          resultsVisibleToPlayers: Boolean(existingSurvey.resultsVisibleToPlayers),
          anonymous: Boolean(existingSurvey.anonymous),
          active: Boolean(existingSurvey.active)
        });
        // Wechsle zur Umfrage-Erstellung, da wir eine bestehende Umfrage bearbeiten
        setActiveTab("surveys");
      }
    }
  }, [surveyId, surveys]);

  // Optionen für Fragentypen
  const questionTypes = [
    { value: "options", label: "Optionen (Einmalauswahl)" },
    { value: "radio", label: "Radio-Buttons" },
    { value: "checkbox", label: "Checkboxen (Mehrfachauswahl)" },
    { value: "number", label: "Zahleneingabe" },
    { value: "textarea", label: "Text-Eingabefeld" }
  ];

  // Hilfsfunktion um bessere Beschreibungen basierend auf Fragen zu generieren
  const generateSuggestionForDescription = (selectedQuestions) => {
    if (!selectedQuestions || selectedQuestions.length === 0) return "";
    
    const selectedQuestionObjects = selectedQuestions.map(qId => 
      questions.find(q => q.id === qId)
    ).filter(q => q);
    
    if (selectedQuestionObjects.length === 1) {
      const q = selectedQuestionObjects[0];
      if (q.question.toLowerCase().includes('training')) {
        return "Feedback zu unseren Trainingsmethoden und -inhalten";
      } else if (q.question.toLowerCase().includes('spiel')) {
        return "Verbesserung der Spielvorbereitung und -performance";
      } else if (q.question.toLowerCase().includes('wohlbefinden')) {
        return "Regelmäßige Erfassung des Spielerwohlbefindens";
      }
      return "Feedback der Spieler zu wichtigen Teamthemen";
    } else {
      return `Umfrage mit ${selectedQuestionObjects.length} Fragen zu verschiedenen Teamthemen`;
    }
  };

  // Handler für das Ändern der neuen Frage
  const handleQuestionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewQuestion({
      ...newQuestion,
      [name]: type === "checkbox" ? checked : value
    });
  };

  // Handler für das Ändern der Optionen
  const handleOptionChange = (index, value) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = value;
    setNewQuestion({
      ...newQuestion,
      options: updatedOptions
    });
  };

  // Option hinzufügen
  const addOption = () => {
    setNewQuestion({
      ...newQuestion,
      options: [...newQuestion.options, ""]
    });
  };

  // Option entfernen
  const removeOption = (index) => {
    const updatedOptions = newQuestion.options.filter((_, i) => i !== index);
    setNewQuestion({
      ...newQuestion,
      options: updatedOptions
    });
  };

  // Frage zum Bearbeiten laden
  const handleEditQuestion = (q) => {
    console.log("Bearbeite Frage:", q);
    
    // Stelle sicher, dass alle Eigenschaften korrekt übernommen werden
    setNewQuestion({
      ...q,
      // Standardwerte für fehlende Eigenschaften setzen
      type: q.type || "options",
      options: Array.isArray(q.options) && q.options.length > 0 ? q.options : ["", ""],
      required: Boolean(q.required),
      placeholder: q.placeholder || "",
      min: q.min !== undefined ? q.min : 0,
      max: q.max !== undefined ? q.max : 100,
      resultsVisibleToPlayers: Boolean(q.resultsVisibleToPlayers)
    });
    
    setEditMode(true);
    setEditId(q.id);
    
    // Wechsel zum Erstellungs-Tab und scrollen zum Anfang
    setActiveTab("create");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Formularzurücksetzen
  const resetForm = () => {
    setNewQuestion({
      question: "",
      type: "options",
      options: ["", ""],
      required: false,
      placeholder: "",
      min: 0,
      max: 100,
      resultsVisibleToPlayers: false
    });
    setEditMode(false);
    setEditId(null);
    setShowPreview(false);
  };
  
  // Umfrage speichern oder aktualisieren
  const handleSaveSurvey = async (e) => {
    e.preventDefault();
    
    if (!currentSurvey) {
      alert("Keine Umfragedaten vorhanden.");
      return;
    }
    
    if (!currentSurvey.title.trim()) {
      alert("Bitte geben Sie einen Titel für die Umfrage ein.");
      return;
    }
    
    if (!currentSurvey.questions || currentSurvey.questions.length === 0) {
      alert("Bitte wählen Sie mindestens eine Frage für die Umfrage aus.");
      return;
    }
    
    try {
      let result;
      
      // Wenn eine ID vorhanden ist, aktualisieren wir die bestehende Umfrage
      if (surveyId) {
        result = await updateSurvey(surveyId, {
          ...currentSurvey,
          updatedAt: new Date().toISOString()
        });
        if (result) {
          showSuccess("Umfrage wurde erfolgreich aktualisiert!");
        }
      } else {
        // Sonst erstellen wir eine neue
        result = await createSurvey({
          ...currentSurvey,
          active: true,
          createdAt: new Date().toISOString()
        });
        if (result) {
          showSuccess("Umfrage wurde erfolgreich erstellt!");
          // Umfragen neu laden
          await fetchSurveys();
          // Formular zurücksetzen und zur Fragen-Übersicht wechseln
          setCurrentSurvey(null);
          setActiveTab("questions");
        }
      }
    } catch (err) {
      console.error("Fehler beim Speichern der Umfrage:", err);
      alert("Fehler beim Speichern der Umfrage. Bitte versuche es erneut.");
    }
  };

  // Erfolgsbenachrichtigung anzeigen und nach Zeit ausblenden
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  // Frage speichern oder aktualisieren
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validierung
    if (!newQuestion.question?.trim()) {
      alert("Bitte gib eine Frage ein");
      return;
    }

    if (["options", "radio", "checkbox"].includes(newQuestion.type)) {
      // Überprüfe, ob alle Optionen ausgefüllt sind
      const filteredOptions = newQuestion.options.filter(option => option.trim());
      
      // Überprüfe, ob es mindestens zwei Optionen gibt
      if (filteredOptions.length < 2) {
        alert("Bitte füge mindestens zwei Optionen hinzu");
        return;
      }
      
      // Setze gefilterte Optionen
      newQuestion.options = filteredOptions;
    }

    try {
      console.log("Frage wird gespeichert:", newQuestion);
      console.log("Edit-Modus:", editMode, "Edit-ID:", editId);
      
      let result;
      if (editMode && editId) {
        // Bei Bearbeitung PUT-Methode direkt aufrufen mit der bestehenden ID
        console.log("Aktualisiere bestehende Frage mit ID:", editId);
        result = await updateQuestion(editId, {
          ...newQuestion,
          id: editId
        });
      } else {
        // Bei neuer Frage POST-Methode aufrufen
        const newId = `question_${Date.now()}`;
        console.log("Erstelle neue Frage mit ID:", newId);
        result = await addQuestion({
          ...newQuestion,
          id: newId
        });
      }
      
      if (result) {
        showSuccess(editMode ? "Frage wurde aktualisiert!" : "Neue Frage wurde hinzugefügt!");
        
        // Fragen neu laden
        await fetchQuestions();
        
        // Formular zurücksetzen
        resetForm();
        
        // Zurück zur Fragenübersicht
        setActiveTab("questions");
      }
    } catch (err) {
      console.error("Fehler beim Speichern der Frage:", err);
      alert("Fehler beim Speichern der Frage. Bitte versuche es erneut.");
    }
  };

  // Frage löschen
  const handleDeleteQuestion = async (id) => {
    if (window.confirm("Möchtest du diese Frage wirklich löschen?")) {
      const success = await deleteQuestion(id);
      if (success) {
        showSuccess("Frage wurde gelöscht!");
      }
    }
  };
  
  // Frage zur aktuellen Umfrage hinzufügen
  const handleAddToSurvey = (question) => {
    if (!currentSurvey) {
      setCurrentSurvey({
        title: "",
        description: "",
        questions: [question.id],
        resultsVisibleToPlayers: false,
        active: true
      });
    } else {
      // Nur hinzufügen, wenn die Frage noch nicht enthalten ist
      if (!currentSurvey.questions?.includes(question.id)) {
        setCurrentSurvey({
          ...currentSurvey,
          questions: [...(currentSurvey.questions || []), question.id]
        });
      }
    }
    
    // Zum Umfrage-Tab wechseln
    setActiveTab("surveys");
    showSuccess(`Frage "${question.question.substring(0, 30)}..." zur Umfrage hinzugefügt`);
  };

  // Render-Funktion für die Vorschau der Frage
  const renderQuestionPreview = () => {
    switch (newQuestion.type) {
      case 'options':
        return (
          <div className="space-y-2">
            {newQuestion.options.map((option, i) => (
              <div 
                key={i} 
                className="p-3 rounded-lg border cursor-pointer transition-colors bg-gray-50 border-gray-200 hover:bg-gray-100"
              >
                {option || `Option ${i + 1}`}
              </div>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <div className="space-y-2">
            {newQuestion.options.map((option, i) => (
              <div key={i} className="flex items-center p-2">
                <input 
                  type="checkbox" 
                  id={`preview-option-${i}`} 
                  className="mr-2 h-5 w-5 text-blue-600"
                />
                <label 
                  htmlFor={`preview-option-${i}`} 
                  className="cursor-pointer"
                >
                  {option || `Option ${i + 1}`}
                </label>
              </div>
            ))}
          </div>
        );
      case 'number':
        return (
          <input 
            type="number"
            placeholder={newQuestion.placeholder || "Zahl eingeben"}
            min={newQuestion.min}
            max={newQuestion.max}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
        );
      case 'radio':
        return (
          <div className="space-y-2">
            {newQuestion.options.map((option, i) => (
              <div key={i} className="flex items-center p-2">
                <input 
                  type="radio" 
                  id={`preview-radio-${i}`}
                  name="previewRadio"
                  className="mr-2 h-5 w-5 text-blue-600"
                />
                <label 
                  htmlFor={`preview-radio-${i}`} 
                  className="cursor-pointer"
                >
                  {option || `Option ${i + 1}`}
                </label>
              </div>
            ))}
          </div>
        );
      case 'textarea':
        return (
          <textarea 
            className="w-full p-3 border border-gray-300 rounded-lg min-h-[120px]"
            placeholder={newQuestion.placeholder || "Text eingeben..."}
          ></textarea>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] font-sans">
      <Header />
      <BackButton to="/coach/dashboard" />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Umfrage-Editor</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab("questions")}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === "questions"
                    ? "bg-[#0a2240] text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                Fragen
              </button>
              <button
                onClick={() => setActiveTab("create")}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === "create"
                    ? "bg-[#0a2240] text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {editMode ? "Frage bearbeiten" : "Neue Frage"}
              </button>
              <button
                onClick={() => setActiveTab("surveys")}
                className={`px-4 py-2 rounded-lg ${
                  activeTab === "surveys"
                    ? "bg-[#0a2240] text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {surveyId ? "Umfrage bearbeiten" : "Umfrage erstellen"}
              </button>
            </div>
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

          {loading && (
            <div className="flex justify-center my-4">
              <div className="spinner-border text-blue-500" role="status">
                <span className="sr-only">Wird geladen...</span>
              </div>
            </div>
          )}

          {/* Fragen-Tab */}
          {activeTab === "questions" && (
            <div>
              {questions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Es wurden noch keine Fragen erstellt.</p>
                  <button
                    onClick={() => setActiveTab("create")}
                    className="mt-4 px-4 py-2 bg-[#0a2240] text-white rounded-lg"
                  >
                    Erste Frage erstellen
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((q, index) => (
                    <div 
                      key={q.id} 
                      className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-lg flex items-center">
                          {/* Status-Indikator - prüfen ob die Frage in einer aktiven Umfrage ist */}
                          {surveys.some(survey => {
                            console.log(`Prüfe Umfrage ${survey.id}:`, survey);
                            return survey.active && Array.isArray(survey.questions) && survey.questions.includes(q.id);
                          }) ? (
                            <span className="w-4 h-4 bg-green-500 rounded-full mr-2 flex-shrink-0" title="Online"></span>
                          ) : (
                            <span className="w-4 h-4 bg-red-500 rounded-full mr-2 flex-shrink-0" title="Offline"></span>
                          )}
                          {index + 1}. {q.question} 
                          {q.required && <span className="text-red-500 ml-1">*</span>}
                        </h3>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleAddToSurvey(q)}
                            className="text-green-600 hover:text-green-800"
                            title="Zur Umfrage hinzufügen"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleEditQuestion(q)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Frage bearbeiten"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDeleteQuestion(q.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Frage löschen"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-500 mb-2">
                        {questionTypes.find(type => type.value === q.type)?.label || q.type}
                      </div>
                      
                      {q.options && q.options.length > 0 && (
                        <div className="mt-2 text-sm">
                          <div className="font-medium">Optionen:</div>
                          <ul className="list-disc list-inside ml-2">
                            {q.options.map((option, i) => (
                              <li key={i}>{option}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Erstellen-Tab */}
          {activeTab === "create" && (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  {/* Formularfelder */}
                  <div className="mb-4">
                    <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
                      Frage
                    </label>
                    <input
                      type="text"
                      id="question"
                      name="question"
                      value={newQuestion.question}
                      onChange={handleQuestionChange}
                      placeholder="Gib deine Frage ein..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                      Fragetyp
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={newQuestion.type}
                      onChange={handleQuestionChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      {questionTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {(newQuestion.type === 'options' || 
                    newQuestion.type === 'radio' || 
                    newQuestion.type === 'checkbox') && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Optionen
                      </label>
                      {newQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center mb-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            placeholder={`Option ${index + 1}`}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => removeOption(index)}
                            className="ml-2 text-red-600 hover:text-red-800"
                            disabled={newQuestion.options.length <= 2}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addOption}
                        className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Option hinzufügen
                      </button>
                    </div>
                  )}

                  {(newQuestion.type === 'number') && (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label htmlFor="min" className="block text-sm font-medium text-gray-700 mb-1">
                          Minimalwert
                        </label>
                        <input
                          type="number"
                          id="min"
                          name="min"
                          value={newQuestion.min}
                          onChange={handleQuestionChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="max" className="block text-sm font-medium text-gray-700 mb-1">
                          Maximalwert
                        </label>
                        <input
                          type="number"
                          id="max"
                          name="max"
                          value={newQuestion.max}
                          onChange={handleQuestionChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  {(newQuestion.type === 'number' || newQuestion.type === 'textarea') && (
                    <div className="mb-4">
                      <label htmlFor="placeholder" className="block text-sm font-medium text-gray-700 mb-1">
                        Platzhalter
                      </label>
                      <input
                        type="text"
                        id="placeholder"
                        name="placeholder"
                        value={newQuestion.placeholder}
                        onChange={handleQuestionChange}
                        placeholder="z.B. 'Deine Antwort...'"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  )}

                  <div className="mb-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="required"
                        name="required"
                        checked={newQuestion.required}
                        onChange={handleQuestionChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="required" className="ml-2 block text-sm text-gray-700">
                        Pflichtfeld
                      </label>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="resultsVisibleToPlayers"
                        name="resultsVisibleToPlayers"
                        checked={newQuestion.resultsVisibleToPlayers || false}
                        onChange={handleQuestionChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="resultsVisibleToPlayers" className="ml-2 block text-sm text-gray-700">
                        Ergebnisse für Spieler sichtbar
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  {/* Vorschau-Bereich */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">Vorschau</h3>
                      <button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {showPreview ? "Ausblenden" : "Anzeigen"}
                      </button>
                    </div>

                    {showPreview && (
                      <div className="mt-3 p-4 border border-gray-200 rounded-lg">
                        <h4 className="text-xl font-semibold mb-3">
                          {newQuestion.question || "Deine Frage"}
                          {newQuestion.required && <span className="text-red-500 ml-1">*</span>}
                        </h4>
                        {renderQuestionPreview()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6 space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white shadow-sm hover:bg-gray-50"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[#0a2240] text-white rounded-md shadow-sm hover:bg-[#081a33]"
                >
                  {loading ? "Wird gespeichert..." : (editMode ? "Aktualisieren" : "Speichern")}
                </button>
              </div>
            </form>
          )}
          
          {/* Surveys-Tab */}
          {activeTab === "surveys" && (
            <div>
              <form onSubmit={handleSaveSurvey} className="space-y-6">
                <div className="mb-4">
                  <label htmlFor="surveyTitle" className="block text-sm font-medium text-gray-700 mb-1">
                    Umfragetitel
                  </label>
                  <input
                    type="text"
                    id="surveyTitle"
                    name="title"
                    value={currentSurvey?.title || ""}
                    onChange={(e) => setCurrentSurvey({...currentSurvey || {}, title: e.target.value})}
                    placeholder="Gib den Titel der Umfrage ein..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="surveyDescription" className="block text-sm font-medium text-gray-700">
                      Umfragebeschreibung (Optional)
                    </label>
                    {(currentSurvey?.questions || []).length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const suggestion = generateSuggestionForDescription(currentSurvey.questions);
                          if (suggestion) {
                            setCurrentSurvey({...currentSurvey || {}, description: suggestion});
                          }
                        }}
                        className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-gray-600"
                      >
                        💡 Beschreibung vorschlagen
                      </button>
                    )}
                  </div>
                  <textarea
                    id="surveyDescription"
                    name="description"
                    value={currentSurvey?.description || ""}
                    onChange={(e) => setCurrentSurvey({...currentSurvey || {}, description: e.target.value})}
                    placeholder="Kurze Beschreibung des Zwecks der Umfrage (z.B. 'Feedback zu Trainingsmethoden sammeln'). Die eigentlichen Fragen werden unten ausgewählt."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 min-h-[80px]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Tipp: Beschreibung sollte sich von den Fragen unterscheiden, um Dopplungen zu vermeiden.
                  </p>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="resultsVisibleToPlayers"
                      name="resultsVisibleToPlayers"
                      checked={currentSurvey?.resultsVisibleToPlayers || false}
                      onChange={(e) => setCurrentSurvey({...currentSurvey || {}, resultsVisibleToPlayers: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="resultsVisibleToPlayers" className="ml-2 block text-sm text-gray-700">
                      Ergebnisse für Spieler sichtbar
                    </label>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="anonymous"
                      name="anonymous"
                      checked={currentSurvey?.anonymous || false}
                      onChange={(e) => setCurrentSurvey({...currentSurvey || {}, anonymous: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="anonymous" className="ml-2 block text-sm text-gray-700">
                      Anonyme Umfrage (Namen werden nicht mit Antworten verknüpft)
                    </label>
                  </div>
                </div>

                {/* Team-Auswahl für Umfragen */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ziel-Teams</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={!currentSurvey?.targetTeams || currentSurvey?.targetTeams.length === 0 || currentSurvey?.targetTeams.includes('all')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCurrentSurvey({...currentSurvey || {}, targetTeams: ['all']});
                          } else {
                            setCurrentSurvey({...currentSurvey || {}, targetTeams: []});
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">Alle Teams</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={currentSurvey?.targetTeams?.includes('u16-elit') || false}
                        onChange={(e) => {
                          const current = currentSurvey?.targetTeams || [];
                          let newTeams = current.filter(t => t !== 'all');
                          if (e.target.checked) {
                            newTeams = [...newTeams, 'u16-elit'];
                          } else {
                            newTeams = newTeams.filter(t => t !== 'u16-elit');
                          }
                          setCurrentSurvey({...currentSurvey || {}, targetTeams: newTeams});
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">U16-Elit</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={currentSurvey?.targetTeams?.includes('u18-elit') || false}
                        onChange={(e) => {
                          const current = currentSurvey?.targetTeams || [];
                          let newTeams = current.filter(t => t !== 'all');
                          if (e.target.checked) {
                            newTeams = [...newTeams, 'u18-elit'];
                          } else {
                            newTeams = newTeams.filter(t => t !== 'u18-elit');
                          }
                          setCurrentSurvey({...currentSurvey || {}, targetTeams: newTeams});
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">U18-Elit</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={currentSurvey?.targetTeams?.includes('u21-elit') || false}
                        onChange={(e) => {
                          const current = currentSurvey?.targetTeams || [];
                          let newTeams = current.filter(t => t !== 'all');
                          if (e.target.checked) {
                            newTeams = [...newTeams, 'u21-elit'];
                          } else {
                            newTeams = newTeams.filter(t => t !== 'u21-elit');
                          }
                          setCurrentSurvey({...currentSurvey || {}, targetTeams: newTeams});
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">U21-Elit</span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {!currentSurvey?.targetTeams || currentSurvey?.targetTeams.length === 0 || currentSurvey?.targetTeams.includes('all') 
                      ? 'Umfrage wird an alle Spieler gesendet' 
                      : `Umfrage wird nur an ${currentSurvey?.targetTeams?.length} Team(s) gesendet`}
                  </p>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">Fragen auswählen</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Wähle die Fragen aus, die in dieser Umfrage gestellt werden sollen. Die Fragen werden in der Reihenfolge angezeigt, wie sie hier ausgewählt werden.
                  </p>
                  
                  {/* Duplikat-Warnung */}
                  {currentSurvey?.description && questions.some(q => 
                    (currentSurvey?.questions || []).includes(q.id) && 
                    q.question.toLowerCase().includes(currentSurvey.description.toLowerCase().substring(0, 20))
                  ) && (
                    <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-yellow-800">Mögliche Dopplung erkannt</p>
                          <p className="text-sm text-yellow-700">Die Beschreibung ähnelt einer ausgewählten Frage. Prüfe, ob beide Texte wirklich benötigt werden.</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {questions.length === 0 ? (
                    <p className="text-gray-500">Es wurden noch keine Fragen erstellt.</p>
                  ) : (
                    <div className="max-h-[400px] overflow-y-auto border border-gray-200 rounded-lg p-4">
                      {questions.map((q) => {
                        const isSelected = (currentSurvey?.questions || []).includes(q.id);
                        const isDuplicateOfDescription = currentSurvey?.description && 
                          q.question.toLowerCase().includes(currentSurvey.description.toLowerCase().substring(0, 20));
                        
                        return (
                          <div key={q.id} className={`flex items-start mb-2 p-3 rounded ${isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'} ${isDuplicateOfDescription && isSelected ? 'border-yellow-300 bg-yellow-50' : ''}`}>
                            <input
                              type="checkbox"
                              id={`question-${q.id}`}
                              checked={isSelected}
                              onChange={(e) => {
                                const newQuestions = e.target.checked
                                  ? [...(currentSurvey?.questions || []), q.id]
                                  : (currentSurvey?.questions || []).filter(id => id !== q.id);
                                setCurrentSurvey({...currentSurvey || {}, questions: newQuestions});
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                            />
                            <div className="ml-3 flex-1">
                              <label htmlFor={`question-${q.id}`} className="block text-sm font-medium text-gray-900 cursor-pointer">
                                {q.question}
                              </label>
                              <p className="text-xs text-gray-500 mt-1">
                                Typ: {q.type === 'checkbox' ? 'Mehrfachauswahl' : q.type === 'options' ? 'Einmalauswahl' : q.type === 'textarea' ? 'Textantwort' : q.type}
                                {q.options && q.options.length > 0 && ` • ${q.options.length} Optionen`}
                              </p>
                              {isDuplicateOfDescription && isSelected && (
                                <p className="text-xs text-yellow-600 mt-1 font-medium">⚠️ Ähnelt der Beschreibung</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentSurvey(null);
                      setActiveTab("questions");
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white shadow-sm hover:bg-gray-50"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !currentSurvey?.title || (currentSurvey?.questions || []).length === 0}
                    className="px-4 py-2 bg-[#0a2240] text-white rounded-md shadow-sm hover:bg-[#081a33] disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {loading ? "Wird gespeichert..." : (surveyId ? "Umfrage aktualisieren" : "Umfrage erstellen")}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
      
    </div>
  );
}
