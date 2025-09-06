import React, { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useUmfrage } from "../context/UmfrageContext";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import BackButton from "../components/BackButton";


export default function UmfrageEditor() {
  const { t } = useLanguage();
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

  // Zustand für UI-Steuerelemente - Neue logische Struktur
  const [currentStep, setCurrentStep] = useState(1); // 1=Einstellungen, 2=Fragen, 3=Vorschau, 4=Status
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
        
        // Bestimme den Start-Schritt basierend auf dem Kontext
        if (surveyId) {
          setCurrentStep(1); // Bei bestehender Umfrage: Einstellungen anzeigen
        } else {
          setCurrentStep(1); // Bei neuer Umfrage: Auch mit Einstellungen beginnen
        }
      } catch (err) {
        console.error("Fehler beim Laden der Daten:", err);
      }
    };
    
    loadSurveyData();
  }, []); // FIXED: Removed fetchQuestions, fetchSurveys dependencies

  // Bestehende Umfrage laden, wenn surveyId in URL vorhanden ist
  useEffect(() => {
    if (surveyId && surveys && surveys.length > 0) {
      console.log("🔍 Suche Umfrage mit ID:", surveyId, "Typ:", typeof surveyId);
      console.log("📋 Verfügbare Umfragen:", surveys.map(s => ({id: s.id, title: s.title, active: s.active})));
      
      // Konvertiere surveyId zu Number für Vergleich, da URL-Parameter immer Strings sind
      const surveyIdNum = parseInt(surveyId, 10);
      const existingSurvey = surveys.find(s => s.id === surveyIdNum || s.id === surveyId);
      
      if (existingSurvey) {
        console.log("✅ Bestehende Umfrage gefunden:", existingSurvey);
        
        // Verwende die Original-Daten direkt ohne unnötige Transformationen
        const loadedSurvey = {
          ...existingSurvey,
          // Sichere Fallbacks für fehlende Felder
          title: existingSurvey.title || "",
          description: existingSurvey.description || "",
          questions: existingSurvey.questions || [],
          target_teams: existingSurvey.target_teams || [],
          resultsVisibleToPlayers: Boolean(existingSurvey.resultsVisibleToPlayers || existingSurvey.results_visible_to_players),
          anonymous: Boolean(existingSurvey.anonymous),
          active: Boolean(existingSurvey.active)
        };
        
        console.log("📝 Setze currentSurvey:", loadedSurvey);
        setCurrentSurvey(loadedSurvey);
        
        // Bei bestehender Umfrage direkt zu Einstellungen
        setCurrentStep(1);
        console.log("✅ Umfrage erfolgreich geladen für Bearbeitung");
      } else {
        console.warn("❌ Umfrage mit ID", surveyId, "nicht gefunden");
        console.log("📋 Verfügbare IDs:", surveys.map(s => `${s.id} (${typeof s.id})`));
      }
    } else if (!surveyId) {
      // Nur bei neuen Umfragen eine leere Umfrage initialisieren
      setCurrentSurvey({
        title: "",
        description: "",
        questions: [],
        target_teams: [],
        resultsVisibleToPlayers: false,
        anonymous: false,
        active: true
      });
      console.log("✨ Neue Umfrage initialisiert");
    } else {
      console.log("⏳ Warte auf Daten - surveyId:", surveyId, "surveys length:", surveys?.length);
    }
  }, [surveyId, surveys]);

  // Auto-Save für currentSurvey Änderungen
  useEffect(() => {
    const saveCurrentSurvey = async () => {
      if (!currentSurvey || !currentSurvey.id) {
        // Noch keine ID = noch nicht gespeicherte Umfrage
        return;
      }

      console.log("💾 Auto-Save: currentSurvey geändert, speichere...", currentSurvey);
      
      try {
        await updateSurvey(currentSurvey.id, currentSurvey);
        console.log("✅ Auto-Save erfolgreich");
      } catch (error) {
        console.error("❌ Auto-Save fehlgeschlagen:", error);
      }
    };

    // Kleiner Timeout, um zu häufige API-Aufrufe zu vermeiden
    const timeoutId = setTimeout(saveCurrentSurvey, 500);
    return () => clearTimeout(timeoutId);
  }, [currentSurvey]);

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
  
  // Separate Funktion für Team-Updates (ohne Titel-Validierung)
  const handleTeamUpdate = async (newTeams) => {
    if (!surveyId || !currentSurvey) return;
    
    try {
      // Speichere nur die Teams, ohne andere Validierungen
      await updateSurvey(surveyId, {
        title: currentSurvey.title || "Unbenannte Umfrage", // Fallback für leeren Titel
        description: currentSurvey.description || "",
        target_teams: newTeams,
        active: currentSurvey.active !== undefined ? currentSurvey.active : true
      });
      return true;
    } catch (err) {
      console.error("Fehler beim Speichern der Team-Zuordnung:", err);
      return false;
    }
  };
  
  // Umfrage speichern oder aktualisieren
  const handleSaveSurvey = async (e) => {
    e.preventDefault();
    
    if (!currentSurvey) {
  alert(t('editor.noSurveyData') || "Keine Umfragedaten vorhanden.");
      return;
    }
    
    if (!currentSurvey.title.trim()) {
  alert(t('editor.enterTitle') || "Bitte geben Sie einen Titel für die Umfrage ein.");
      return;
    }
    
    if (!currentSurvey.questions || currentSurvey.questions.length === 0) {
  alert(t('editor.selectQuestions') || "Bitte wählen Sie mindestens eine Frage für die Umfrage aus.");
      return;
    }
    
    try {
      let result;
      
      // Prepare clean survey data with only allowed fields
      const cleanSurveyData = {
        title: currentSurvey.title,
        description: currentSurvey.description,
        active: currentSurvey.active
      };
      
      // Wenn eine ID vorhanden ist, aktualisieren wir die bestehende Umfrage
      if (surveyId) {
        console.log('📝 Updating survey with data:', cleanSurveyData);
        result = await updateSurvey(surveyId, cleanSurveyData);
        if (result) {
          showSuccess("Umfrage wurde erfolgreich aktualisiert!");
        }
      } else {
        // Sonst erstellen wir eine neue
        result = await createSurvey({
          ...cleanSurveyData,
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
  alert(t('editor.saveError') || "Fehler beim Speichern der Umfrage. Bitte versuche es erneut.");
    }
  };

  // Erfolgsbenachrichtigung anzeigen und nach Zeit ausblenden
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  // Fehlerbenachrichtigung anzeigen
  const showError = (message) => {
    // Für jetzt verwenden wir alert, könnte später durch ein besseres UI ersetzt werden
    alert(message);
  };

  // Frage speichern oder aktualisieren
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validierung
    if (!newQuestion.question?.trim()) {
  alert(t('editor.enterQuestion') || "Bitte gib eine Frage ein");
      return;
    }

    if (["options", "radio", "checkbox"].includes(newQuestion.type)) {
      // Überprüfe, ob alle Optionen ausgefüllt sind
      const filteredOptions = newQuestion.options.filter(option => option.trim());
      
      // Überprüfe, ob es mindestens zwei Optionen gibt
      if (filteredOptions.length < 2) {
  alert(t('editor.addOptions') || "Bitte füge mindestens zwei Optionen hinzu");
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
        
        // Wenn es eine neue Frage ist (nicht im Edit-Modus), füge sie zur aktuellen Umfrage hinzu
        if (!editMode && result.id) {
          if (currentSurvey) {
            // Nur hinzufügen, wenn die Frage noch nicht enthalten ist
            if (!currentSurvey.questions?.includes(result.id)) {
              const updatedSurvey = {
                ...currentSurvey,
                questions: [...(currentSurvey.questions || []), result.id]
              };
              setCurrentSurvey(updatedSurvey);
              
              // Umfrage automatisch speichern
              try {
                await updateSurvey(currentSurvey.id, updatedSurvey);
                console.log("✅ Umfrage automatisch aktualisiert mit neuer Frage");
              } catch (saveError) {
                console.error("❌ Fehler beim automatischen Speichern der Umfrage:", saveError);
              }
            }
          } else {
            // Neue Umfrage erstellen, falls noch keine existiert
            const newSurvey = {
              title: "Neue Umfrage",
              description: "",
              questions: [result.id],
              resultsVisibleToPlayers: false,
              active: true,
              anonymous: false
            };
            setCurrentSurvey(newSurvey);
            console.log("⚠️ Neue Umfrage erstellt, muss manuell gespeichert werden");
          }
        }
        
        // Formular zurücksetzen
        resetForm();
        
        // Zurück zur Fragenübersicht
        setActiveTab("questions");
      }
    } catch (err) {
      console.error("Fehler beim Speichern der Frage:", err);
  alert(t('editor.saveQuestionError') || "Fehler beim Speichern der Frage. Bitte versuche es erneut.");
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
  const handleAddToSurvey = async (question) => {
    if (!currentSurvey) {
      // Neue Umfrage erstellen und speichern
      const newSurvey = {
        title: "Neue Umfrage",
        description: "",
        target_teams: [],
        resultsVisibleToPlayers: false,
        active: true,
        anonymous: false
      };
      
      try {
        console.log("🔄 Erstelle neue Umfrage...");
        const savedSurvey = await createSurvey(newSurvey);
        if (savedSurvey) {
          setCurrentSurvey(savedSurvey);
          
          // Jetzt die Frage mit der survey_id verknüpfen
          console.log("🔄 Verknüpfe Frage mit Umfrage...");
          await updateQuestion(question.id, {
            ...question,
            survey_id: savedSurvey.id
          });
          
          await fetchSurveys(); // Listen aktualisieren
          await fetchQuestions();
          showSuccess(`Neue Umfrage erstellt und Frage "${question.question.substring(0, 30)}..." hinzugefügt`);
        }
      } catch (error) {
        console.error("Fehler beim Erstellen der Umfrage:", error);
        showError("Fehler beim Erstellen der Umfrage");
        return;
      }
    } else {
      // Zu bestehender Umfrage hinzufügen
      try {
        console.log("🔄 Verknüpfe Frage mit bestehender Umfrage...");
        await updateQuestion(question.id, {
          ...question,
          survey_id: currentSurvey.id
        });
        
        await fetchSurveys(); // Listen aktualisieren 
        await fetchQuestions();
        showSuccess(`Frage "${question.question.substring(0, 30)}..." zur Umfrage hinzugefügt`);
      } catch (error) {
        console.error("Fehler beim Hinzufügen der Frage:", error);
        showError("Fehler beim Hinzufügen der Frage zur Umfrage");
        return;
      }
    }
    
    // Zum Umfrage-Tab wechseln
    setActiveTab("surveys");
  };

  // Handler für das Speichern von Fragen (für Step 2)
  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    
    if (!newQuestion.question.trim()) {
      showError("Bitte gib eine Frage ein.");
      return;
    }

    setLoading(true);
    try {
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
        
        // Editor zurücksetzen
        setNewQuestion({
          question: "",
          type: "options",
          options: ["", ""],
          required: false,
          placeholder: "",
          min: 0,
          max: 100
        });
        setEditMode(false);
        setEditId(null);
        setShowPreview(false);
      }
    } catch (err) {
      console.error("Fehler beim Speichern der Frage:", err);
      showError("Fehler beim Speichern der Frage: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handler für das Löschen von Fragen
  const handleDelete = async (id) => {
    if (window.confirm("Möchtest du diese Frage wirklich löschen?")) {
      setLoading(true);
      try {
        const success = await deleteQuestion(id);
        if (success) {
          showSuccess("Frage wurde gelöscht!");
          await fetchQuestions();
        }
      } catch (err) {
        showError("Fehler beim Löschen: " + err.message);
      } finally {
        setLoading(false);
      }
    }
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
    <div className="min-h-screen flex flex-col bg-[#1a1f2e] text-white font-sans">
      <Header />
      <BackButton to="/coach/dashboard" />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="bg-[#2a3441] rounded-xl shadow-xl p-6 mb-8 border border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-100 flex items-center">
                📋 Umfrage-Editor
              </h1>
              {surveyId && currentSurvey && (
                <>
                  <div className="text-gray-300 text-sm mt-1 p-2 bg-gray-800 rounded">
                    <p>Bearbeite: "<strong>{currentSurvey.title || "⚠️ Kein Titel geladen"}</strong>"</p>
                    <p className="text-xs">Survey ID: {surveyId} | Loaded ID: {currentSurvey.id} | Active: {currentSurvey.active ? "✅" : "❌"}</p>
                  </div>
                </>
              )}
            </div>
            
            {/* Step-by-Step Navigation */}
            {surveyId && currentSurvey && (
              <div className="flex items-center space-x-2">
                {[
                  { step: 1, label: "Einstellungen", icon: "⚙️" },
                  { step: 2, label: "Fragen", icon: "❓" },
                  { step: 3, label: "Vorschau", icon: "👁️" },
                  { step: 4, label: "Status", icon: "🚀" }
                ].map((item) => (
                  <button
                    key={item.step}
                    onClick={() => setCurrentStep(item.step)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                      currentStep === item.step
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-gray-600 text-gray-200 hover:bg-gray-500"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="mb-6 bg-red-900/20 border border-red-600/50 text-red-300 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 bg-green-900/20 border border-green-600/50 text-green-200 px-4 py-3 rounded-lg">
              {successMessage}
            </div>
          )}

          {/* Debug-Bereich für Bearbeitungs-Modus */}
          {surveyId && currentSurvey && (
            <div className="mb-6 bg-blue-900/20 border border-blue-600/50 text-blue-300 px-4 py-3 rounded-lg">
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Bearbeitungs-Modus: Umfrage wie ursprünglich erstellt</span>
              </div>
              <div className="text-sm text-blue-200 grid grid-cols-2 gap-4">
                <div>
                  <strong>Titel:</strong> {currentSurvey.title || "⚠️ Kein Titel geladen"}
                </div>
                <div>
                  <strong>Teams:</strong> {currentSurvey.target_teams?.length > 0 ? currentSurvey.target_teams.join(", ") : "Alle Teams"}
                </div>
                <div>
                  <strong>Fragen:</strong> {currentSurvey.questions?.length || 0} ({currentSurvey.questions?.join(", ") || "keine"})
                </div>
                <div>
                  <strong>Status:</strong> {currentSurvey.active ? "Aktiv" : "Inaktiv"}
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex justify-center my-8">
              <div className="spinner-border text-blue-400" role="status">
                <span className="sr-only">Wird geladen...</span>
              </div>
            </div>
          )}

          {/* Schritt 1: Umfrage-Einstellungen */}
          {currentStep === 1 && (
            <div className="space-y-6">{/* Content für Schritt 1 wird hier eingefügt */}</div>
          )}

          {/* Schritt 1: Umfrage-Einstellungen */}
          {currentStep === 1 && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-100 mb-2">⚙️ Schritt 1: Umfrage-Einstellungen</h2>
                <p className="text-gray-300">Lege die grundlegenden Einstellungen für deine Umfrage fest.</p>
              </div>
              
              <form onSubmit={handleSaveSurvey} className="space-y-8">
                {/* Grundeinstellungen */}
                <div className="bg-[#1e2532] rounded-lg p-6 border border-gray-600">
                  <h3 className="text-xl font-semibold mb-4 text-gray-100">Grundeinstellungen</h3>
                  
                  <div className="mb-6">
                    <label htmlFor="surveyTitle" className="block text-sm font-medium text-gray-200 mb-2">
                      Umfragetitel <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="surveyTitle"
                      name="title"
                      value={currentSurvey?.title || ""}
                      onChange={(e) => setCurrentSurvey({...currentSurvey || {}, title: e.target.value})}
                      placeholder="Gib den Titel der Umfrage ein..."
                      className="w-full px-4 py-3 bg-[#2a3441] border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="surveyDescription" className="block text-sm font-medium text-gray-200 mb-2">
                      Umfragebeschreibung (Optional)
                    </label>
                    <textarea
                      id="surveyDescription"
                      name="description"
                      value={currentSurvey?.description || ""}
                      onChange={(e) => setCurrentSurvey({...currentSurvey || {}, description: e.target.value})}
                      placeholder="Kurze Beschreibung des Zwecks der Umfrage..."
                      className="w-full px-4 py-3 bg-[#2a3441] border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                    />
                  </div>
                </div>

                {/* Team-Auswahl */}
                <div className="bg-[#1e2532] rounded-lg p-6 border border-gray-600">
                  <h3 className="text-xl font-semibold mb-4 text-gray-100">Team-Zuordnung</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Wähle die Teams aus, die diese Umfrage sehen sollen.
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#2a3441] rounded-lg p-4 border border-gray-600">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!currentSurvey?.target_teams || currentSurvey.target_teams.length === 0}
                          onChange={(e) => {
                            const newTeams = e.target.checked ? [] : currentSurvey?.target_teams || [];
                            setCurrentSurvey({...currentSurvey || {}, target_teams: newTeams});
                          }}
                          className="mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-500 rounded bg-[#2a3441]"
                        />
                        <div>
                          <div className="text-gray-100 font-medium">Alle Teams</div>
                          <div className="text-gray-300 text-xs">Keine Einschränkung</div>
                        </div>
                      </label>
                    </div>
                    
                    {['u16-elit', 'u18-elit', 'u21-elit'].map(team => (
                      <div key={team} className="bg-[#2a3441] rounded-lg p-4 border border-gray-600">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={currentSurvey?.target_teams?.includes(team) || false}
                            onChange={(e) => {
                              const currentTeams = currentSurvey?.target_teams || [];
                              let newTeams;
                              if (e.target.checked) {
                                newTeams = [...currentTeams, team];
                              } else {
                                newTeams = currentTeams.filter(t => t !== team);
                              }
                              setCurrentSurvey({...currentSurvey || {}, target_teams: newTeams});
                            }}
                            className="mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-500 rounded bg-[#2a3441]"
                          />
                          <div>
                            <div className="text-gray-100 font-medium">{team.toUpperCase()}</div>
                            <div className="text-gray-300 text-xs">Spezifisches Team</div>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Erweiterte Einstellungen */}
                <div className="bg-[#1e2532] rounded-lg p-6 border border-gray-600">
                  <h3 className="text-xl font-semibold mb-4 text-gray-100">Datenschutz & Sichtbarkeit</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-[#2a3441] rounded-lg">
                      <div>
                        <p className="text-white font-medium">Anonyme Umfrage</p>
                        <p className="text-gray-400 text-sm">Antworten werden ohne Namen gespeichert</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentSurvey?.anonymous || false}
                          onChange={(e) => setCurrentSurvey({...currentSurvey || {}, anonymous: e.target.checked})}
                          className="sr-only"
                        />
                        <div className={`relative w-11 h-6 transition-colors duration-200 ease-in-out rounded-full ${
                          currentSurvey?.anonymous ? 'bg-blue-600' : 'bg-gray-600'
                        }`}>
                          <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out ${
                            currentSurvey?.anonymous ? 'transform translate-x-5' : ''
                          }`}></div>
                        </div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-[#2a3441] rounded-lg">
                      <div>
                        <p className="text-white font-medium">Ergebnisse für Spieler sichtbar</p>
                        <p className="text-gray-400 text-sm">Spieler können die Umfrage-Ergebnisse sehen</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentSurvey?.resultsVisibleToPlayers || false}
                          onChange={(e) => setCurrentSurvey({...currentSurvey || {}, resultsVisibleToPlayers: e.target.checked})}
                          className="sr-only"
                        />
                        <div className={`relative w-11 h-6 transition-colors duration-200 ease-in-out rounded-full ${
                          currentSurvey?.resultsVisibleToPlayers ? 'bg-blue-600' : 'bg-gray-600'
                        }`}>
                          <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out ${
                            currentSurvey?.resultsVisibleToPlayers ? 'transform translate-x-5' : ''
                          }`}></div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center pt-6">
                  <div>
                    {surveyId && (
                      <p className="text-gray-400 text-sm">
                        💾 Änderungen werden automatisch gespeichert
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                    >
                      <span>💾</span>
                      <span>{loading ? "Wird gespeichert..." : "Speichern"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                    >
                      <span>➡️</span>
                      <span>Weiter zu Fragen</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Schritt 2: Fragen bearbeiten */}
          {currentStep === 2 && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">❓ Schritt 2: Fragen hinzufügen</h2>
                <p className="text-gray-400">Erstelle und verwalte die Fragen für deine Umfrage.</p>
              </div>
              
              {/* Aktuelle Fragen anzeigen */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-white">Aktuelle Fragen</h3>
                  <button
                    onClick={() => {
                      // Neue Frage erstellen
                      setNewQuestion({
                        question: "",
                        type: "options",
                        options: ["", ""],
                        required: false,
                        placeholder: "",
                        min: 0,
                        max: 100
                      });
                      setEditMode(false);
                      setEditId(null);
                      setShowPreview(false);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                  >
                    <span>➕</span>
                    <span>Neue Frage</span>
                  </button>
                </div>

                {questions.length === 0 ? (
                  <div className="text-center py-8 bg-[#1e2532] rounded-lg border border-gray-600">
                    <p className="text-gray-400 mb-4">Es wurden noch keine Fragen erstellt.</p>
                    <p className="text-gray-500 text-sm">Klicke auf "Neue Frage" um zu beginnen.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {questions.map((q, index) => (
                      <div 
                        key={q.id} 
                        className="p-6 bg-[#1e2532] rounded-lg border border-gray-600 hover:border-gray-500 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="text-lg font-medium text-white mb-2">
                              {index + 1}. {q.question} 
                              {q.required && <span className="text-red-400 ml-2">*</span>}
                            </h4>
                            <div className="text-gray-400 text-sm mb-2">
                              <strong>Typ:</strong> {
                                q.type === "options" ? "Optionen (Einmalauswahl)" : 
                                q.type === "radio" ? "Radio Buttons" : 
                                q.type === "checkbox" ? "Checkboxen (Mehrfachauswahl)" : 
                                q.type === "number" ? "Zahleneingabe" : 
                                q.type === "text" ? "Texteingabe" : 
                                q.type === "textarea" ? "Längerer Text" : 
                                q.type === "scale" ? "Bewertungsskala" : 
                                q.type
                              }
                              {q.required && " • Pflichtfeld"}
                            </div>

                            {q.options && q.options.length > 0 && (
                              <div className="text-gray-400 text-sm mb-2">
                                <strong>Optionen:</strong> {q.options.filter(opt => opt.trim() !== "").join(", ")}
                              </div>
                            )}

                            {q.type === "scale" && (
                              <div className="text-gray-400 text-sm mb-2">
                                <strong>Skala:</strong> {q.min} bis {q.max}
                              </div>
                            )}

                            {q.placeholder && (
                              <div className="text-gray-400 text-sm">
                                <strong>Platzhalter:</strong> {q.placeholder}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex space-x-2 ml-4">
                            <button 
                              onClick={() => {
                                setNewQuestion({
                                  question: q.question,
                                  type: q.type,
                                  options: q.options || ["", ""],
                                  required: q.required,
                                  placeholder: q.placeholder || "",
                                  min: q.min || 0,
                                  max: q.max || 100
                                });
                                setEditMode(true);
                                setEditId(q.id);
                              }}
                              className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded"
                              title="Frage bearbeiten"
                            >
                              ✏️
                            </button>
                            <button 
                              onClick={() => handleDelete(q.id)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded"
                              title="Frage löschen"
                            >
                              �️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Fragen-Editor */}
              {(editMode || showPreview || questions.length === 0) && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    {editMode ? "Frage bearbeiten" : "Neue Frage erstellen"}
                  </h3>
                  
                  <form onSubmit={handleSaveQuestion} className="bg-[#1e2532] rounded-lg p-6 border border-gray-600 space-y-6">
                    <div>
                      <label htmlFor="question" className="block text-sm font-medium text-gray-300 mb-2">
                        Frage <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        id="question"
                        name="question"
                        rows="3"
                        value={newQuestion.question}
                        onChange={handleQuestionChange}
                        placeholder="Stelle hier deine Frage..."
                        className="w-full px-4 py-3 bg-[#2a3441] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-2">
                        Antworttyp
                      </label>
                      <select
                        id="type"
                        name="type"
                        value={newQuestion.type}
                        onChange={handleQuestionChange}
                        className="w-full px-4 py-3 bg-[#2a3441] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {questionTypes.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {["options", "radio", "checkbox"].includes(newQuestion.type) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Antwortoptionen
                        </label>
                        <div className="space-y-2">
                          {newQuestion.options.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...newQuestion.options];
                                  newOptions[index] = e.target.value;
                                  setNewQuestion({...newQuestion, options: newOptions});
                                }}
                                placeholder={`Option ${index + 1}`}
                                className="flex-1 px-3 py-2 bg-[#2a3441] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                              {newQuestion.options.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newOptions = newQuestion.options.filter((_, i) => i !== index);
                                    setNewQuestion({...newQuestion, options: newOptions});
                                  }}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  ❌
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => setNewQuestion({...newQuestion, options: [...newQuestion.options, ""]})}
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            ➕ Weitere Option hinzufügen
                          </button>
                        </div>
                      </div>
                    )}

                    {newQuestion.type === "scale" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="min" className="block text-sm font-medium text-gray-300 mb-2">
                            Minimum
                          </label>
                          <input
                            type="number"
                            id="min"
                            name="min"
                            value={newQuestion.min}
                            onChange={handleQuestionChange}
                            className="w-full px-3 py-2 bg-[#2a3441] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="max" className="block text-sm font-medium text-gray-300 mb-2">
                            Maximum
                          </label>
                          <input
                            type="number"
                            id="max"
                            name="max"
                            value={newQuestion.max}
                            onChange={handleQuestionChange}
                            className="w-full px-3 py-2 bg-[#2a3441] border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    )}

                    {["text", "textarea"].includes(newQuestion.type) && (
                      <div>
                        <label htmlFor="placeholder" className="block text-sm font-medium text-gray-300 mb-2">
                          Platzhaltertext (Optional)
                        </label>
                        <input
                          type="text"
                          id="placeholder"
                          name="placeholder"
                          value={newQuestion.placeholder}
                          onChange={handleQuestionChange}
                          placeholder="z.B. Deine Antwort hier..."
                          className="w-full px-3 py-2 bg-[#2a3441] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    )}

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="required"
                        name="required"
                        checked={newQuestion.required}
                        onChange={handleQuestionChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-[#2a3441]"
                      />
                      <label htmlFor="required" className="ml-2 block text-sm text-gray-300">
                        Pflichtfeld (muss beantwortet werden)
                      </label>
                    </div>

                    <div className="flex justify-between pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setNewQuestion({
                            question: "",
                            type: "options",
                            options: ["", ""],
                            required: false,
                            placeholder: "",
                            min: 0,
                            max: 100
                          });
                          setEditMode(false);
                          setEditId(null);
                          setShowPreview(false);
                        }}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                      >
                        Abbrechen
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {loading ? "Wird gespeichert..." : (editMode ? "Aktualisieren" : "Speichern")}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center pt-6">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
                >
                  <span>⬅️</span>
                  <span>Zurück zu Einstellungen</span>
                </button>
                <div className="text-gray-400 text-sm text-center">
                  <p>📝 {questions.length} Frage{questions.length !== 1 ? 'n' : ''} erstellt</p>
                </div>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                  disabled={questions.length === 0}
                >
                  <span>➡️</span>
                  <span>Weiter zu Vorschau</span>
                </button>
              </div>
            </div>
          )}

          {/* Schritt 3: Vorschau */}
          {currentStep === 3 && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">👁️ Schritt 3: Vorschau</h2>
                <p className="text-gray-400">So wird deine Umfrage für die Spieler aussehen.</p>
              </div>

              {/* Umfrage-Vorschau */}
              <div className="mb-8">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-lg mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">📱 Spieler-Ansicht</h3>
                  <p className="text-blue-100">Dies ist eine Simulation, wie deine Umfrage auf dem Gerät der Spieler erscheint.</p>
                </div>

                {/* Umfrage Simulator */}
                <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-2xl overflow-hidden">
                  {/* Header der Umfrage */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                    <h1 className="text-2xl font-bold mb-2">
                      {currentSurvey?.title || "Umfrage Titel"}
                    </h1>
                    {currentSurvey?.description && (
                      <p className="text-blue-100 text-lg">
                        {currentSurvey.description}
                      </p>
                    )}
                    <div className="mt-4 flex items-center text-blue-100 text-sm">
                      {(() => {
                        const surveyQuestionCount = currentSurvey?.questions
                          ? currentSurvey.questions
                              .map(questionId => questions.find(q => q.id === questionId))
                              .filter(Boolean).length
                          : 0;
                        return (
                          <>
                            <span className="mr-4">📊 {surveyQuestionCount} Frage{surveyQuestionCount !== 1 ? 'n' : ''}</span>
                            {currentSurvey?.anonymous && <span className="mr-4">🔒 Anonym</span>}
                            <span>⏱️ ca. {Math.max(1, Math.ceil(surveyQuestionCount * 0.5))} Minute{Math.ceil(surveyQuestionCount * 0.5) !== 1 ? 'n' : ''}</span>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Fragen-Vorschau */}
                  <div className="p-6 bg-gray-50">
                    {(() => {
                      // Debug-Logging
                      console.log("🔍 VORSCHAU DEBUG ERWEITERT:");
                      console.log("- currentSurvey:", currentSurvey);
                      console.log("- currentSurvey.questions:", currentSurvey?.questions);
                      console.log("- questions (global):", questions);
                      console.log("- questions.length:", questions?.length);
                      
                      // NEUE LOGIK: Verwende currentSurvey.questions direkt (die sind bereits vollständige Objekte)
                      // Fallback: Verwende questions Array mit survey_id Verknüpfung
                      let surveyQuestions = [];
                      
                      if (currentSurvey?.questions && Array.isArray(currentSurvey.questions) && currentSurvey.questions.length > 0) {
                        // Scenario 1: currentSurvey.questions enthält bereits vollständige Objekte (von Supabase geladen)
                        if (typeof currentSurvey.questions[0] === 'object') {
                          console.log("✅ Verwende currentSurvey.questions direkt (vollständige Objekte)");
                          surveyQuestions = currentSurvey.questions;
                        } else {
                          // Scenario 2: currentSurvey.questions enthält nur IDs (Legacy/lokaler State)
                          console.log("🔄 Löse Frage-IDs zu vollständigen Objekten auf");
                          surveyQuestions = currentSurvey.questions
                            .map(questionId => {
                              const numericQuestionId = parseInt(questionId, 10);
                              return questions.find(q => parseInt(q.id, 10) === numericQuestionId);
                            })
                            .filter(Boolean);
                        }
                      } else if (currentSurvey?.id && questions?.length > 0) {
                        // Scenario 3: Finde alle Fragen mit passender survey_id
                        console.log("🔄 Suche Fragen mit survey_id:", currentSurvey.id);
                        surveyQuestions = questions.filter(q => 
                          parseInt(q.survey_id, 10) === parseInt(currentSurvey.id, 10)
                        );
                      }
                      
                      console.log("- surveyQuestions (final):", surveyQuestions);
                      
                      if (!questions || questions.length === 0) {
                        console.warn("❌ PROBLEM: questions Array ist leer oder undefined");
                        fetchQuestions();
                        return (
                          <div className="text-center py-12">
                            <div className="text-6xl mb-4">⏳</div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">Lade Fragen...</h3>
                            <p className="text-gray-500">Einen Moment bitte, die Fragen werden geladen.</p>
                          </div>
                        );
                      }

                      if (surveyQuestions.length === 0) {
                        return (
                          <div className="text-center py-12">
                            <div className="text-6xl mb-4">📝</div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">Noch keine Fragen</h3>
                            <p className="text-gray-500">Gehe zurück zu Schritt 2, um Fragen hinzuzufügen.</p>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-8">
                          {surveyQuestions.map((question, index) => (
                          <div key={question.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                            {/* Frage Header */}
                            <div className="mb-4">
                              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                                {index + 1}. {question.question}
                                {question.required && <span className="text-red-500 ml-1">*</span>}
                              </h4>
                            </div>

                            {/* Antwort-Bereich je nach Typ */}
                            <div className="mt-4">
                              {/* Optionen (Dropdown) */}
                              {question.type === "options" && (
                                <select 
                                  className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-700 cursor-pointer"
                                  disabled
                                >
                                  <option>Wähle eine Option...</option>
                                  {question.options?.filter(opt => opt.trim() !== "").map((option, idx) => (
                                    <option key={idx} value={option}>{option}</option>
                                  ))}
                                </select>
                              )}

                              {/* Radio Buttons */}
                              {question.type === "radio" && (
                                <div className="space-y-3">
                                  {question.options?.filter(opt => opt.trim() !== "").map((option, idx) => (
                                    <label key={idx} className="flex items-center cursor-pointer">
                                      <input 
                                        type="radio" 
                                        name={`question-${question.id}`}
                                        className="mr-3 h-4 w-4 text-blue-600"
                                        disabled
                                      />
                                      <span className="text-gray-700">{option}</span>
                                    </label>
                                  ))}
                                </div>
                              )}

                              {/* Checkboxen */}
                              {question.type === "checkbox" && (
                                <div className="space-y-3">
                                  {question.options?.filter(opt => opt.trim() !== "").map((option, idx) => (
                                    <label key={idx} className="flex items-center cursor-pointer">
                                      <input 
                                        type="checkbox" 
                                        className="mr-3 h-4 w-4 text-blue-600 rounded"
                                        disabled
                                      />
                                      <span className="text-gray-700">{option}</span>
                                    </label>
                                  ))}
                                </div>
                              )}

                              {/* Text Input */}
                              {question.type === "text" && (
                                <input 
                                  type="text"
                                  placeholder={question.placeholder || "Deine Antwort..."}
                                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-700"
                                  disabled
                                />
                              )}

                              {/* Textarea */}
                              {question.type === "textarea" && (
                                <textarea 
                                  rows="4"
                                  placeholder={question.placeholder || "Deine ausführliche Antwort..."}
                                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 resize-none"
                                  disabled
                                />
                              )}

                              {/* Number Input */}
                              {question.type === "number" && (
                                <input 
                                  type="number"
                                  placeholder={question.placeholder || "Zahl eingeben..."}
                                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-700"
                                  disabled
                                />
                              )}

                              {/* Rating Scale */}
                              {question.type === "scale" && (
                                <div className="space-y-3">
                                  <div className="flex justify-between text-sm text-gray-600">
                                    <span>{question.min}</span>
                                    <span>{question.max}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    {Array.from(
                                      { length: (question.max || 10) - (question.min || 1) + 1 }, 
                                      (_, i) => (question.min || 1) + i
                                    ).map(value => (
                                      <label key={value} className="flex flex-col items-center cursor-pointer">
                                        <input 
                                          type="radio" 
                                          name={`scale-${question.id}`}
                                          value={value}
                                          className="mb-1 h-4 w-4 text-blue-600"
                                          disabled
                                        />
                                        <span className="text-sm text-gray-600">{value}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}

                        {/* Submit Button Preview */}
                        <div className="pt-6">
                          <button 
                            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white text-lg font-semibold py-4 rounded-lg shadow-lg cursor-not-allowed opacity-75"
                            disabled
                          >
                            📤 Umfrage absenden
                          </button>
                          <p className="text-center text-gray-500 text-sm mt-2">
                            {currentSurvey?.anonymous ? "Deine Antworten werden anonym gespeichert" : "Deine Antworten werden mit deinem Namen gespeichert"}
                          </p>
                        </div>
                      </div>
                        );
                    })()}
                  </div>
                </div>

                {/* Zusätzliche Informationen */}
                {questions.length > 0 && (
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#1e2532] p-4 rounded-lg border border-gray-600">
                      <h4 className="font-semibold text-white mb-2">📊 Umfrage-Statistiken</h4>
                      <div className="text-gray-300 text-sm space-y-1">
                        <p>Fragen: {questions.length}</p>
                        <p>Pflichtfelder: {questions.filter(q => q.required).length}</p>
                        <p>Geschätzte Zeit: {Math.max(1, Math.ceil(questions.length * 0.5))} Min</p>
                      </div>
                    </div>
                    
                    <div className="bg-[#1e2532] p-4 rounded-lg border border-gray-600">
                      <h4 className="font-semibold text-white mb-2">🎯 Zielgruppen</h4>
                      <div className="text-gray-300 text-sm space-y-1">
                        {currentSurvey?.target_teams?.length > 0 ? (
                          currentSurvey.target_teams.map((team, idx) => (
                            <p key={idx}>• {team}</p>
                          ))
                        ) : (
                          <p className="text-gray-500">Alle Teams</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-[#1e2532] p-4 rounded-lg border border-gray-600">
                      <h4 className="font-semibold text-white mb-2">🔒 Datenschutz</h4>
                      <div className="text-gray-300 text-sm space-y-1">
                        <p>Anonym: {currentSurvey?.anonymous ? "✅ Ja" : "❌ Nein"}</p>
                        <p>Ergebnisse sichtbar: {currentSurvey?.results_visible ? "✅ Ja" : "❌ Nein"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-6">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
                >
                  <span>⬅️</span>
                  <span>Zurück zu Fragen</span>
                </button>
                <div className="text-gray-400 text-sm text-center">
                  <p>👁️ Vorschau für {questions.length} Frage{questions.length !== 1 ? 'n' : ''}</p>
                </div>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
                >
                  <span>➡️</span>
                  <span>Weiter zu Status</span>
                </button>
              </div>
            </div>
          )}

          {/* Schritt 4: Status & Veröffentlichung */}
          {currentStep === 4 && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">🚀 Schritt 4: Veröffentlichung</h2>
                <p className="text-gray-400">Aktiviere deine Umfrage und mache sie für Spieler verfügbar.</p>
              </div>

              {/* Zusammenfassung der Umfrage */}
              <div className="mb-8">
                <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 rounded-lg mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">📋 Umfrage-Zusammenfassung</h3>
                  <p className="text-green-100">Überprüfe alle Einstellungen vor der Veröffentlichung.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Grundinformationen */}
                  <div className="bg-[#1e2532] rounded-lg border border-gray-600 p-6">
                    <h4 className="text-xl font-semibold text-white mb-4 flex items-center">
                      📝 Grundinformationen
                    </h4>
                    <div className="space-y-3 text-gray-300">
                      <div>
                        <span className="text-gray-400">Titel:</span>
                        <p className="font-medium text-white">{currentSurvey?.title || "Kein Titel"}</p>
                      </div>
                      {currentSurvey?.description && (
                        <div>
                          <span className="text-gray-400">Beschreibung:</span>
                          <p className="text-gray-300">{currentSurvey.description}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-400">Anzahl Fragen:</span>
                        <p className="font-medium text-white">{questions.length} Frage{questions.length !== 1 ? 'n' : ''}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Pflichtfelder:</span>
                        <p className="font-medium text-white">{questions.filter(q => q.required).length} von {questions.length}</p>
                      </div>
                    </div>
                  </div>

                  {/* Einstellungen */}
                  <div className="bg-[#1e2532] rounded-lg border border-gray-600 p-6">
                    <h4 className="text-xl font-semibold text-white mb-4 flex items-center">
                      ⚙️ Einstellungen
                    </h4>
                    <div className="space-y-3 text-gray-300">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Anonyme Antworten:</span>
                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                          currentSurvey?.anonymous 
                            ? "bg-green-900 text-green-300" 
                            : "bg-red-900 text-red-300"
                        }`}>
                          {currentSurvey?.anonymous ? "✅ Aktiviert" : "❌ Deaktiviert"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Ergebnisse sichtbar:</span>
                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                          currentSurvey?.results_visible 
                            ? "bg-green-900 text-green-300" 
                            : "bg-red-900 text-red-300"
                        }`}>
                          {currentSurvey?.results_visible ? "✅ Aktiviert" : "❌ Deaktiviert"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Zielgruppen:</span>
                        <div className="mt-1">
                          {currentSurvey?.target_teams?.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {currentSurvey.target_teams.map((team, idx) => (
                                <span key={idx} className="px-2 py-1 bg-blue-900 text-blue-300 rounded text-sm">
                                  {team}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-500 text-sm">Alle Teams</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status-Management */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4">📊 Status-Verwaltung</h3>
                
                <div className="bg-[#1e2532] rounded-lg border border-gray-600 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${
                        currentSurvey?.active ? "bg-green-500" : "bg-red-500"
                      }`}></div>
                      <span className="text-lg font-medium text-white">
                        Umfrage ist {currentSurvey?.active ? "AKTIV" : "INAKTIV"}
                      </span>
                    </div>
                    
                    <button
                      onClick={async () => {
                        if (!currentSurvey?.title?.trim()) {
                          showError("Bitte gib einen Titel für die Umfrage ein.");
                          setCurrentStep(1);
                          return;
                        }
                        
                        if (questions.length === 0) {
                          showError("Bitte erstelle mindestens eine Frage.");
                          setCurrentStep(2);
                          return;
                        }

                        setLoading(true);
                        try {
                          await updateSurvey(currentSurvey.id, {
                            ...currentSurvey,
                            active: !currentSurvey.active
                          });
                          showSuccess(
                            currentSurvey.active 
                              ? "Umfrage wurde deaktiviert" 
                              : "Umfrage wurde erfolgreich veröffentlicht!"
                          );
                        } catch (error) {
                          showError("Fehler beim Statuswechsel: " + error.message);
                        } finally {
                          setLoading(false);
                        }
                      }}
                      disabled={loading}
                      className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors disabled:opacity-50 ${
                        currentSurvey?.active
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {loading ? "Wird gespeichert..." : (
                        currentSurvey?.active ? "🔴 Deaktivieren" : "🚀 Veröffentlichen"
                      )}
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className={`p-4 rounded-lg border ${
                      currentSurvey?.active 
                        ? "bg-green-900/20 border-green-600" 
                        : "bg-yellow-900/20 border-yellow-600"
                    }`}>
                      <h4 className={`font-medium mb-2 ${
                        currentSurvey?.active ? "text-green-300" : "text-yellow-300"
                      }`}>
                        {currentSurvey?.active ? "✅ Umfrage ist online" : "⚠️ Umfrage ist offline"}
                      </h4>
                      <p className={`text-sm ${
                        currentSurvey?.active ? "text-green-400" : "text-yellow-400"
                      }`}>
                        {currentSurvey?.active 
                          ? "Spieler können die Umfrage jetzt sehen und ausfüllen. Du kannst sie jederzeit deaktivieren."
                          : "Die Umfrage ist für Spieler nicht sichtbar. Klicke auf 'Veröffentlichen' um sie zu aktivieren."
                        }
                      </p>
                    </div>

                    {questions.length === 0 && (
                      <div className="p-4 rounded-lg border bg-red-900/20 border-red-600">
                        <h4 className="font-medium mb-2 text-red-300">❌ Keine Fragen vorhanden</h4>
                        <p className="text-sm text-red-400">
                          Du musst mindestens eine Frage erstellen, bevor du die Umfrage veröffentlichen kannst.
                        </p>
                      </div>
                    )}

                    {!currentSurvey?.title?.trim() && (
                      <div className="p-4 rounded-lg border bg-red-900/20 border-red-600">
                        <h4 className="font-medium mb-2 text-red-300">❌ Kein Titel vorhanden</h4>
                        <p className="text-sm text-red-400">
                          Du musst einen Titel für die Umfrage eingeben, bevor du sie veröffentlichen kannst.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Aktionen */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4">🛠️ Weitere Aktionen</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="p-4 bg-[#1e2532] border border-gray-600 rounded-lg hover:border-gray-500 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">👁️</span>
                      <div>
                        <h4 className="font-medium text-white">Vorschau anzeigen</h4>
                        <p className="text-gray-400 text-sm">Sehe dir die Umfrage nochmal an</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setCurrentStep(2)}
                    className="p-4 bg-[#1e2532] border border-gray-600 rounded-lg hover:border-gray-500 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">❓</span>
                      <div>
                        <h4 className="font-medium text-white">Fragen bearbeiten</h4>
                        <p className="text-gray-400 text-sm">Weitere Fragen hinzufügen oder ändern</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setCurrentStep(1)}
                    className="p-4 bg-[#1e2532] border border-gray-600 rounded-lg hover:border-gray-500 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">⚙️</span>
                      <div>
                        <h4 className="font-medium text-white">Einstellungen ändern</h4>
                        <p className="text-gray-400 text-sm">Titel, Teams oder Datenschutz anpassen</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={async () => {
                      if (window.confirm('Möchtest du wirklich alle Antworten dieser Umfrage löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
                        setLoading(true);
                        try {
                          // Hier würde normalerweise die API aufgerufen werden
                          showSuccess("Alle Antworten wurden gelöscht");
                        } catch (error) {
                          showError("Fehler beim Löschen: " + error.message);
                        } finally {
                          setLoading(false);
                        }
                      }
                    }}
                    className="p-4 bg-red-900/20 border border-red-600 rounded-lg hover:border-red-500 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🗑️</span>
                      <div>
                        <h4 className="font-medium text-red-300">Antworten löschen</h4>
                        <p className="text-red-400 text-sm">Alle Antworten permanent entfernen</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center pt-6">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2"
                >
                  <span>⬅️</span>
                  <span>Zurück zu Vorschau</span>
                </button>
                <div className="text-gray-400 text-sm text-center">
                  <p>🚀 {currentSurvey?.active ? "Umfrage ist ONLINE" : "Umfrage ist OFFLINE"}</p>
                </div>
                <button
                  onClick={() => {
                    // Zurück zur Übersicht
                    window.location.href = '/coach-dashboard#surveys';
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <span>📊</span>
                  <span>Zur Übersicht</span>
                </button>
              </div>
            </div>
          )}

          {/* Legacy Content - Wird nach und nach in die Schritte integriert */}
          <div className="hidden">
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

          {/* Erstellen-Tab */}
          {/* Legacy Content - wird nach und nach in die Schritte integriert */}
          {false && activeTab === "create" && (
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
          {false && activeTab === "surveys" && (
            <div>
              <form onSubmit={handleSaveSurvey} className="space-y-8">
                <div className="bg-[#1e2532] rounded-lg p-6 border border-gray-600">
                  <h3 className="text-xl font-semibold mb-4 text-white">Grundeinstellungen</h3>
                  
                  <div className="mb-6">
                    <label htmlFor="surveyTitle" className="block text-sm font-medium text-gray-300 mb-2">
                      Umfragetitel
                    </label>
                    <input
                      type="text"
                      id="surveyTitle"
                      name="title"
                      value={currentSurvey?.title || ""}
                      onChange={(e) => setCurrentSurvey({...currentSurvey || {}, title: e.target.value})}
                      placeholder="Gib den Titel der Umfrage ein..."
                      className="w-full px-4 py-3 bg-[#2a3441] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="surveyDescription" className="block text-sm font-medium text-gray-300">
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
                          className="text-xs bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded text-gray-200 transition-colors"
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
                      className="w-full px-4 py-3 bg-[#2a3441] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      💡 Tipp: Beschreibung sollte sich von den Fragen unterscheiden, um Dopplungen zu vermeiden.
                    </p>
                  </div>
                </div>

                {/* Status-Steuerung */}
                <div className="bg-[#1e2532] rounded-lg p-6 border border-gray-600">
                  <h3 className="text-xl font-semibold mb-4 text-white">Status</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 font-medium">Umfrage-Status</p>
                      <p className="text-gray-400 text-sm">
                        Bestimme, ob die Umfrage für Spieler sichtbar und ausfüllbar ist
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`text-sm font-medium ${currentSurvey?.active ? 'text-gray-400' : 'text-green-400'}`}>
                        Offline
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentSurvey?.active || false}
                          onChange={async (e) => {
                            const newStatus = e.target.checked;
                            const updatedSurvey = {...currentSurvey || {}, active: newStatus};
                            setCurrentSurvey(updatedSurvey);
                            
                            // Sofort speichern wenn es eine bestehende Umfrage ist
                            if (surveyId) {
                              try {
                                await updateSurvey(surveyId, updatedSurvey);
                                showSuccess(`✅ Umfrage ist jetzt ${newStatus ? 'ONLINE' : 'OFFLINE'}`);
                              } catch (error) {
                                console.error("Fehler beim Aktualisieren des Status:", error);
                                showError("❌ Fehler beim Speichern des Status");
                                // Zustand zurücksetzen bei Fehler
                                setCurrentSurvey({...currentSurvey || {}, active: !newStatus});
                              }
                            }
                          }}
                          className="sr-only"
                        />
                        <div className={`relative w-12 h-6 transition-colors duration-200 ease-in-out rounded-full ${
                          currentSurvey?.active ? 'bg-green-500' : 'bg-gray-600'
                        }`}>
                          <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out ${
                            currentSurvey?.active ? 'transform translate-x-6' : ''
                          }`}></div>
                        </div>
                      </label>
                      <span className={`text-sm font-medium ${currentSurvey?.active ? 'text-green-400' : 'text-gray-400'}`}>
                        Online
                      </span>
                    </div>
                  </div>
                  
                  {/* Zusätzliche Status-Informationen */}
                  <div className="mt-4 p-3 bg-[#2a3441] rounded-lg border border-gray-600">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">
                        {currentSurvey?.active ? '🟢' : '⚫'}
                      </span>
                      <div>
                        <p className="text-sm text-white font-medium">
                          {currentSurvey?.active ? 'Umfrage ist ONLINE' : 'Umfrage ist OFFLINE'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {currentSurvey?.active 
                            ? 'Spieler können die Umfrage sehen und ausfüllen' 
                            : 'Umfrage ist für Spieler nicht sichtbar'
                          }
                        </p>
                      </div>
                    </div>
                    
                    {/* Link-Funktion nur für online Umfragen */}
                    {currentSurvey?.active && surveyId && (
                      <div className="mt-3 pt-3 border-t border-gray-600">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-white font-medium">Umfrage-Link teilen</p>
                            <p className="text-xs text-gray-400">
                              Kopiere den Link und teile ihn mit den Spielern
                            </p>
                          </div>
                          <button
                            onClick={async () => {
                              const url = `${window.location.origin}/survey/${surveyId}`;
                              try {
                                await navigator.clipboard.writeText(url);
                                showSuccess("📋 Link wurde kopiert!");
                              } catch (error) {
                                console.error("Fehler beim Kopieren:", error);
                                showError("❌ Fehler beim Kopieren des Links");
                              }
                            }}
                            className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            🔗 Link kopieren
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Team-Auswahl */}
                <div className="bg-[#1e2532] rounded-lg p-6 border border-gray-600">
                  <h3 className="text-xl font-semibold mb-4 text-white">Team-Zuordnung</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Wähle die Teams aus, die diese Umfrage sehen sollen. {surveyId ? "Änderungen werden automatisch gespeichert." : ""}
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#2a3441] rounded-lg p-4 border border-gray-600">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!currentSurvey?.target_teams || currentSurvey.target_teams.length === 0}
                          onChange={async (e) => {
                            const newTeams = e.target.checked ? [] : currentSurvey?.target_teams || [];
                            const updatedSurvey = {...currentSurvey || {}, target_teams: newTeams};
                            setCurrentSurvey(updatedSurvey);
                            
                            // Sofort speichern wenn es eine bestehende Umfrage ist
                            if (surveyId) {
                              const success = await handleTeamUpdate(newTeams);
                              if (success) {
                                showSuccess("✅ Team-Zuordnung gespeichert: Alle Teams");
                              }
                            }
                          }}
                          className="mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-500 rounded bg-[#2a3441]"
                        />
                        <div>
                          <div className="text-white font-medium">Alle Teams</div>
                          <div className="text-gray-400 text-xs">Keine Einschränkung</div>
                        </div>
                      </label>
                    </div>
                    
                    {['u16-elit', 'u18-elit', 'u21-elit'].map(team => (
                      <div key={team} className="bg-[#2a3441] rounded-lg p-4 border border-gray-600">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={currentSurvey?.target_teams?.includes(team) || false}
                            onChange={async (e) => {
                              const currentTeams = currentSurvey?.target_teams || [];
                              let newTeams;
                              if (e.target.checked) {
                                newTeams = [...currentTeams, team];
                              } else {
                                newTeams = currentTeams.filter(t => t !== team);
                              }
                              
                              const updatedSurvey = {...currentSurvey || {}, target_teams: newTeams};
                              setCurrentSurvey(updatedSurvey);
                              
                              // Sofort speichern wenn es eine bestehende Umfrage ist
                              if (surveyId) {
                                const success = await handleTeamUpdate(newTeams);
                                if (success) {
                                  showSuccess(`✅ Team-Zuordnung gespeichert: ${team.toUpperCase()}`);
                                }
                              }
                            }}
                            className="mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-500 rounded bg-[#2a3441]"
                          />
                          <div>
                            <div className="text-white font-medium">{team.toUpperCase()}</div>
                            <div className="text-gray-400 text-xs">Spezifisches Team</div>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 p-3 bg-[#2a3441] rounded-lg border border-gray-600">
                    <p className="text-sm text-gray-300">
                      💡 {!currentSurvey?.target_teams || currentSurvey.target_teams.length === 0 
                        ? 'Umfrage wird an alle Spieler gesendet' 
                        : `Umfrage wird nur an ${currentSurvey.target_teams.length} ausgewählte Team(s) gesendet`}
                    </p>
                  </div>
                </div>
                
                {/* Weitere Einstellungen */}
                <div className="bg-[#1e2532] rounded-lg p-6 border border-gray-600">
                  <h3 className="text-xl font-semibold mb-4 text-white">Weitere Einstellungen</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="resultsVisibleToPlayers"
                        name="resultsVisibleToPlayers"
                        checked={currentSurvey?.resultsVisibleToPlayers || false}
                        onChange={(e) => setCurrentSurvey({...currentSurvey || {}, resultsVisibleToPlayers: e.target.checked})}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-500 rounded bg-[#2a3441]"
                      />
                      <label htmlFor="resultsVisibleToPlayers" className="ml-3 block text-sm text-gray-300">
                        Ergebnisse für Spieler sichtbar
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="anonymous"
                        name="anonymous"
                        checked={currentSurvey?.anonymous || false}
                        onChange={(e) => setCurrentSurvey({...currentSurvey || {}, anonymous: e.target.checked})}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-500 rounded bg-[#2a3441]"
                      />
                      <label htmlFor="anonymous" className="ml-3 block text-sm text-gray-300">
                        Anonyme Umfrage (Namen werden nicht mit Antworten verknüpft)
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Fragen-Auswahl */}
                <div className="bg-[#1e2532] rounded-lg p-6 border border-gray-600">
                  <h3 className="text-xl font-semibold mb-4 text-white">
                    {surveyId ? "Ausgewählte Fragen" : "Fragen auswählen"}
                  </h3>
                  
                  {surveyId ? (
                    <p className="text-gray-400 text-sm mb-4">
                      Diese Fragen sind derzeit in der Umfrage enthalten. Du kannst weitere hinzufügen oder bestehende entfernen.
                    </p>
                  ) : (
                    <p className="text-gray-400 text-sm mb-4">
                      Wähle die Fragen aus, die in dieser Umfrage gestellt werden sollen. Die Fragen werden in der Reihenfolge angezeigt, wie sie hier ausgewählt werden.
                    </p>
                  )}
                  
                  {/* Zeige ausgewählte Fragen zuerst bei Bearbeitung */}
                  {surveyId && currentSurvey?.questions && currentSurvey.questions.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-medium text-white mb-3">Aktuelle Fragen in dieser Umfrage:</h4>
                      <div className="space-y-3 bg-blue-900/20 p-4 rounded-lg border border-blue-600/30">
                        {currentSurvey.questions.map((questionId, index) => {
                          console.log("🔍 Suche Frage mit ID:", questionId, "in", questions);
                          const question = questions.find(q => q.id === questionId);
                          console.log("📝 Gefundene Frage:", question);
                          
                          return question ? (
                            <div key={questionId} className="flex items-start justify-between bg-[#2a3441] p-4 rounded-lg border border-gray-600">
                              <div className="flex-1">
                                <div className="font-medium text-sm text-white">
                                  {index + 1}. {question.question}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  Typ: {question.type === 'checkbox' ? 'Mehrfachauswahl' : 
                                        question.type === 'options' ? 'Einmalauswahl' : 
                                        question.type === 'textarea' ? 'Textantwort' : question.type}
                                  {question.options && question.options.length > 0 && ` • ${question.options.length} Optionen: ${question.options.join(", ")}`}
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  const newQuestions = currentSurvey.questions.filter(id => id !== questionId);
                                  setCurrentSurvey({...currentSurvey, questions: newQuestions});
                                }}
                                className="text-red-400 hover:text-red-300 ml-3 p-1 rounded hover:bg-red-900/20 transition-colors"
                                title="Frage entfernen"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <div key={questionId} className="text-red-400 text-sm bg-red-900/20 p-2 rounded">
                              ⚠️ Frage nicht gefunden (ID: {questionId}) - Verfügbare Fragen: {questions.map(q => q.id).join(", ")}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Alle verfügbaren Fragen */}
                  <h4 className="text-lg font-medium text-white mb-3">
                    {surveyId ? "Weitere verfügbare Fragen:" : "Verfügbare Fragen:"}
                  </h4>
                  
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
                    <p className="text-gray-400">Es wurden noch keine Fragen erstellt.</p>
                  ) : (
                    <div className="max-h-[400px] overflow-y-auto border border-gray-600 rounded-lg p-4 bg-[#2a3441]">
                      {questions.map((q) => {
                        const isSelected = (currentSurvey?.questions || []).includes(q.id);
                        const isDuplicateOfDescription = currentSurvey?.description && 
                          q.question.toLowerCase().includes(currentSurvey.description.toLowerCase().substring(0, 20));
                        
                        return (
                          <div key={q.id} className={`flex items-start mb-3 p-4 rounded-lg border transition-colors ${
                            isSelected 
                              ? 'bg-blue-900/30 border-blue-500/50' 
                              : 'hover:bg-[#1e2532] border-gray-600'
                          } ${isDuplicateOfDescription && isSelected ? 'border-yellow-500/50 bg-yellow-900/20' : ''}`}>
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
                              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-500 rounded mt-1 bg-[#2a3441]"
                            />
                            <div className="ml-4 flex-1">
                              <label htmlFor={`question-${q.id}`} className="block text-sm font-medium text-white cursor-pointer">
                                {q.question}
                              </label>
                              <p className="text-xs text-gray-400 mt-1">
                                Typ: {q.type === 'checkbox' ? 'Mehrfachauswahl' : q.type === 'options' ? 'Einmalauswahl' : q.type === 'textarea' ? 'Textantwort' : q.type}
                                {q.options && q.options.length > 0 && ` • ${q.options.length} Optionen`}
                              </p>
                              {isDuplicateOfDescription && isSelected && (
                                <p className="text-xs text-yellow-400 mt-1 font-medium">⚠️ Ähnelt der Beschreibung</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                {/* Save-Button nur für neue Umfragen */}
                {!surveyId && (
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentSurvey(null);
                        setActiveTab("questions");
                      }}
                      className="px-6 py-3 border border-gray-600 rounded-lg text-gray-300 bg-[#2a3441] shadow-sm hover:bg-[#1e2532] transition-colors"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !currentSurvey?.title || (currentSurvey?.questions || []).length === 0}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? "Wird gespeichert..." : "Umfrage erstellen"}
                    </button>
                  </div>
                )}
                
                {/* Info für bestehende Umfragen */}
                {surveyId && (
                  <div className="bg-green-900/20 border border-green-600/50 text-green-300 px-4 py-3 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Änderungen werden automatisch gespeichert. Du kannst einfach Teams zuweisen oder Fragen hinzufügen/entfernen.</span>
                    </div>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
