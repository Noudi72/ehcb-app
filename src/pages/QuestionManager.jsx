import React, { useState, useEffect } from "react";
import { useUmfrage } from "../context/UmfrageContext";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import BackButton from "../components/BackButton";


export default function QuestionManager() {
  const { 
    questions, 
    addQuestion, 
    updateQuestion,
    deleteQuestion, 
    fetchQuestions,
    loading, 
    error 
  } = useUmfrage();
  
  const { user, isCoach } = useAuth();
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    type: "options",
    options: ["", ""],
    required: false,
    placeholder: "",
    min: 0,
    max: 10,
    resultsVisibleToPlayers: false
  });
  
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Handler für Änderungen am Formular
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewQuestion(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Option hinzufügen
  const handleAddOption = () => {
    setNewQuestion(prev => ({
      ...prev,
      options: [...prev.options, ""]
    }));
  };

  // Option entfernen
  const handleRemoveOption = (index) => {
    setNewQuestion(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  // Option Wert ändern
  const handleOptionChange = (index, value) => {
    setNewQuestion(prev => {
      const newOptions = [...prev.options];
      newOptions[index] = value;
      return {
        ...prev,
        options: newOptions
      };
    });
  };

  // Formular absenden
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validierung
    if (!newQuestion.question.trim()) {
      alert("Bitte gib einen Fragetext ein");
      return;
    }
    
    // Bei Optionen oder Checkboxen prüfen, ob Optionen vorhanden sind
    if ((newQuestion.type === "options" || newQuestion.type === "checkbox") && 
        (!newQuestion.options.length || !newQuestion.options.some(opt => opt.trim()))) {
      alert("Bitte füge mindestens eine Option hinzu");
      return;
    }
    
    try {
      if (editMode) {
        // Frage aktualisieren
        await updateQuestion(editId, newQuestion);
        setSuccessMessage("Frage erfolgreich aktualisiert");
      } else {
        // Neue Frage hinzufügen
        await addQuestion(newQuestion);
        setSuccessMessage("Frage erfolgreich erstellt");
      }
      
      // Formular zurücksetzen
      setNewQuestion({
        question: "",
        type: "options",
        options: ["", ""],
        required: false,
        placeholder: "",
        min: 0,
        max: 10,
        resultsVisibleToPlayers: false
      });
      setEditMode(false);
      setEditId(null);
      
      // Erfolgsmeldung nach 3 Sekunden ausblenden
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      
      // Daten neu laden
      fetchQuestions();
    } catch (error) {
      console.error("Fehler beim Speichern der Frage:", error);
      alert("Fehler beim Speichern der Frage");
    }
  };

  // Frage bearbeiten
  const handleEdit = (question) => {
    setEditMode(true);
    setEditId(question.id);
    
    // Sicherstellen, dass options ein Array ist
    const options = Array.isArray(question.options) ? question.options : [];
    
    setNewQuestion({
      question: question.question,
      type: question.type || "options",
      options: options.length > 0 ? options : ["", ""],
      required: question.required || false,
      placeholder: question.placeholder || "",
      min: question.min || 0,
      max: question.max || 10,
      resultsVisibleToPlayers: question.resultsVisibleToPlayers || false
    });
    
    // Zum Formular scrollen
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Löschung vorbereiten
  const confirmDelete = (questionId) => {
    setQuestionToDelete(questionId);
    setShowConfirmDelete(true);
  };

  // Frage löschen
  const handleDelete = async () => {
    if (!questionToDelete) return;
    
    try {
      await deleteQuestion(questionToDelete);
      setSuccessMessage("Frage erfolgreich gelöscht");
      setShowConfirmDelete(false);
      setQuestionToDelete(null);
      
      // Erfolgsmeldung nach 3 Sekunden ausblenden
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      
      // Daten neu laden
      fetchQuestions();
    } catch (error) {
      console.error("Fehler beim Löschen der Frage:", error);
      alert("Fehler beim Löschen der Frage");
    }
  };

  // Formular abbrechen
  const handleCancel = () => {
    setEditMode(false);
    setEditId(null);
    setNewQuestion({
      question: "",
      type: "options",
      options: ["", ""],
      required: false,
      placeholder: "",
      min: 0,
      max: 10,
      resultsVisibleToPlayers: false
    });
  };

  // Wenn kein Coach, Zugriff verweigern
  if (!isCoach) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8fafc]">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white rounded-lg shadow p-6 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Zugriff verweigert</h1>
            <p className="mb-4">Du musst als Coach angemeldet sein, um auf diese Seite zuzugreifen.</p>
          </div>
        </main>
        
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Header />
      <BackButton to="/coach/dashboard" />
      <main className="flex-1 container mx-auto p-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Formular für neue/bearbeitete Fragen */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h1 className="text-2xl font-bold mb-4">{editMode ? "Frage bearbeiten" : "Neue Frage erstellen"}</h1>
              
              {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                  {successMessage}
                </div>
              )}
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium">Fragetext:</label>
                  <input 
                    type="text" 
                    name="question" 
                    value={newQuestion.question} 
                    onChange={handleChange} 
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="z.B. Wie fühlst du dich nach dem Training?"
                  />
                </div>
                
                <div>
                  <label className="block mb-1 font-medium">Antworttyp:</label>
                  <select 
                    name="type" 
                    value={newQuestion.type} 
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="options">Einzelauswahl</option>
                    <option value="checkbox">Mehrfachauswahl</option>
                    <option value="text">Freitext</option>
                    <option value="textarea">Textfeld</option>
                    <option value="number">Zahleneingabe</option>
                    <option value="radio">Ja/Nein</option>
                  </select>
                </div>
                
                {/* Optionen für Auswahlfragen */}
                {(newQuestion.type === "options" || newQuestion.type === "checkbox") && (
                  <div>
                    <label className="block mb-1 font-medium">Optionen:</label>
                    {newQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center mb-2">
                        <input 
                          type="text" 
                          value={option} 
                          onChange={(e) => handleOptionChange(index, e.target.value)} 
                          className="flex-1 p-2 border border-gray-300 rounded mr-2"
                          placeholder={`Option ${index + 1}`}
                        />
                        <button 
                          type="button" 
                          onClick={() => handleRemoveOption(index)}
                          className="p-2 bg-red-500 text-white rounded"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                    <button 
                      type="button" 
                      onClick={handleAddOption}
                      className="p-2 bg-blue-500 text-white rounded"
                    >
                      + Option hinzufügen
                    </button>
                  </div>
                )}
                
                {/* Platzhalter für Text/Textarea */}
                {(newQuestion.type === "text" || newQuestion.type === "textarea") && (
                  <div>
                    <label className="block mb-1 font-medium">Platzhaltertext:</label>
                    <input 
                      type="text" 
                      name="placeholder" 
                      value={newQuestion.placeholder} 
                      onChange={handleChange} 
                      className="w-full p-2 border border-gray-300 rounded"
                      placeholder="z.B. Hier deine Antwort eingeben..."
                    />
                  </div>
                )}
                
                {/* Min/Max für Zahleneingaben */}
                {newQuestion.type === "number" && (
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block mb-1 font-medium">Minimum:</label>
                      <input 
                        type="number" 
                        name="min" 
                        value={newQuestion.min} 
                        onChange={handleChange} 
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block mb-1 font-medium">Maximum:</label>
                      <input 
                        type="number" 
                        name="max" 
                        value={newQuestion.max} 
                        onChange={handleChange} 
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="required" 
                    name="required" 
                    checked={newQuestion.required} 
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label htmlFor="required" className="font-medium">Pflichtfeld</label>
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="resultsVisibleToPlayers" 
                    name="resultsVisibleToPlayers" 
                    checked={newQuestion.resultsVisibleToPlayers} 
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label htmlFor="resultsVisibleToPlayers" className="font-medium">
                    Ergebnisse für Spieler sichtbar
                  </label>
                </div>
                
                <div className="flex gap-2">
                  {editMode ? (
                    <>
                      <button 
                        type="submit" 
                        className="px-4 py-2 bg-green-500 text-white rounded"
                        disabled={loading}
                      >
                        {loading ? "Wird gespeichert..." : "Aktualisieren"}
                      </button>
                      <button 
                        type="button" 
                        onClick={handleCancel}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
                        disabled={loading}
                      >
                        Abbrechen
                      </button>
                    </>
                  ) : (
                    <button 
                      type="submit" 
                      className="px-4 py-2 bg-blue-500 text-white rounded"
                      disabled={loading}
                    >
                      {loading ? "Wird erstellt..." : "Frage erstellen"}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
          
          {/* Liste der vorhandenen Fragen */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Vorhandene Fragen</h2>
              
              {questions.length === 0 ? (
                <p className="text-gray-500">Keine Fragen vorhanden. Erstelle eine neue Frage.</p>
              ) : (
                <div className="space-y-4">
                  {questions.map((question) => (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold">{question.question}</h3>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEdit(question)}
                            className="p-1 bg-blue-500 text-white rounded"
                            title="Bearbeiten"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => confirmDelete(question.id)}
                            className="p-1 bg-red-500 text-white rounded"
                            title="Löschen"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Typ: {question.type}</p>
                        {(question.type === "options" || question.type === "checkbox") && question.options && (
                          <div>
                            <p className="font-medium mt-1">Optionen:</p>
                            <ul className="list-disc list-inside">
                              {question.options.map((opt, idx) => (
                                <li key={idx}>{opt}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2">
                          {question.required && (
                            <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                              Pflichtfeld
                            </span>
                          )}
                          {question.resultsVisibleToPlayers && (
                            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              Ergebnisse sichtbar für Spieler
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Bestätigungsdialog für Löschung */}
        {showConfirmDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md">
              <h3 className="text-xl font-bold mb-4">Frage löschen?</h3>
              <p className="mb-4">Bist du sicher, dass du diese Frage löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.</p>
              <div className="flex justify-end space-x-2">
                <button 
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
                >
                  Abbrechen
                </button>
                <button 
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded"
                >
                  Löschen
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      
    </div>
  );
}
