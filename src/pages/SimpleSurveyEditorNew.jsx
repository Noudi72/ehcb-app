import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import BackButton from "../components/BackButton";
import { useTheme } from "../context/ThemeContext";
import { useUmfrage } from "../context/UmfrageContext-new";

export default function SimpleSurveyEditorNew() {
  const navigate = useNavigate();
  const { surveyId } = useParams(); // Get surveyId from URL for editing
  const { isDarkMode } = useTheme();
  const { surveys, createSurvey, updateSurvey, getSurveyById } = useUmfrage();
  
  const [surveyTitle, setSurveyTitle] = useState("");
  const [anonymityLevel, setAnonymityLevel] = useState("anonymous"); // anonymous, coaches-only, coaches-private, public
  const [targetTeams, setTargetTeams] = useState(["u18-elit"]); // Default to U18-Elit
  const [questions, setQuestions] = useState([
    {
      id: `q_${Date.now()}`,
      text: "",
      type: "multiple-choice",
      options: ["", ""],
      required: false
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Load existing survey data if editing
  useEffect(() => {
    if (surveyId) {
      loadSurveyData(surveyId);
    }
  }, [surveyId]);

  const loadSurveyData = async (id) => {
    try {
      console.log('📥 Loading survey data for ID:', id);
      const surveyData = await getSurveyById(id);
      
      if (!surveyData) {
        console.warn('⚠️ Survey not found, redirecting to create new survey');
        navigate('/survey-editor');
        return;
      }
      
      console.log('✅ Loaded survey data:', surveyData);
      
      setSurveyTitle(surveyData.title || "");
      setAnonymityLevel(surveyData.anonymityLevel || "anonymous");
      setTargetTeams(surveyData.targetTeams || ["u18-elit"]);
      
      // Questions are already included in surveyData from Supabase
      if (surveyData.questions && surveyData.questions.length > 0) {
        console.log('📥 Loading questions from survey data:', surveyData.questions);
        
        const loadedQuestions = surveyData.questions.map(questionData => ({
          id: questionData.id,
          text: questionData.content || questionData.text || "",
          type: questionData.type || "multiple-choice",
          options: questionData.options || ["", ""],
          required: questionData.required || false
        }));
        
        setQuestions(loadedQuestions);
        console.log('✅ Loaded questions:', loadedQuestions);
      }
      
    } catch (error) {
      console.error('❌ Error loading survey:', error);
      alert(`Fehler beim Laden der Umfrage: ${error.message}`);
    }
  };

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

  // Option hinzufügen
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

  // SIMPLIFIED SAVE - Direct API call without context
  const handleSave = async () => {
    console.log('🚀 Supabase Save gestartet');
    
    // Validation
    const validQuestions = questions.filter(q => q.text.trim());
    if (validQuestions.length === 0) {
      alert("Bitte geben Sie mindestens eine Frage ein.");
      return;
    }

    setLoading(true);
    setSuccessMessage("");

    try {
      const finalTitle = surveyTitle.trim() || `Umfrage vom ${new Date().toLocaleDateString('de-DE')}`;
      
      // Prepare survey data for Supabase
      const surveyData = {
        title: finalTitle,
        description: "",
        questions: validQuestions.map(q => ({
          content: q.text,
          type: q.type,
          options: q.type === 'multiple-choice' ? q.options.filter(opt => opt.trim()) : [],
          required: q.required || false
        })),
        resultsVisibleToPlayers: false,
        anonymous: anonymityLevel === "anonymous",
        anonymityLevel: anonymityLevel,
        targetTeams: targetTeams,
        active: true
      };

      console.log('📤 Survey data for Supabase:', surveyData);

      let result;
      if (surveyId) {
        // Update existing survey
        console.log('📝 Updating survey:', surveyId);
        result = await updateSurvey(surveyId, surveyData);
      } else {
        // Create new survey
        console.log('✨ Creating new survey');
        result = await createSurvey(surveyData);
      }

      if (result) {
        console.log('✅ SUCCESS:', result);
        setSuccessMessage(surveyId ? "✅ Umfrage erfolgreich aktualisiert!" : "✅ Umfrage erfolgreich erstellt!");
        
        // Navigate back after 2 seconds
        setTimeout(() => {
          navigate('/coach/surveys');
        }, 2000);
      }

    } catch (error) {
      console.error('❌ Supabase Save Error:', error);
      alert(`Fehler beim Speichern: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans ${isDarkMode ? 'bg-gray-900' : 'bg-[#f8fafc]'}`}>
      <Header />
      <BackButton to="/coach/surveys" />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className={`rounded-xl shadow-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex justify-between items-center mb-6">
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {surveyId ? "📝 Umfrage bearbeiten" : "🚀 Neue Umfrage (Direct Save)"}
            </h1>
          </div>

          {successMessage && (
            <div className={`mb-4 border px-4 py-3 rounded ${
              isDarkMode 
                ? 'bg-green-900 border-green-700 text-green-300' 
                : 'bg-green-100 border-green-400 text-green-700'
            }`}>
              {successMessage}
            </div>
          )}

          <div className="space-y-6">
            {/* Titel */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-700'}`}>
                📋 Umfragetitel (optional)
              </label>
              <input
                type="text"
                value={surveyTitle}
                onChange={(e) => setSurveyTitle(e.target.value)}
                placeholder="z.B. 'Training Feedback'"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            {/* Anonymitäts-Einstellungen */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-700'}`}>
                🔒 Anonymitäts-Einstellungen
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="anonymity"
                    value="anonymous"
                    checked={anonymityLevel === "anonymous"}
                    onChange={(e) => setAnonymityLevel(e.target.value)}
                    className="mr-2"
                  />
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>🕶️ <strong>Vollständig anonym</strong> - Namen werden nicht erfasst</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="anonymity"
                    value="coaches-only"
                    checked={anonymityLevel === "coaches-only"}
                    onChange={(e) => setAnonymityLevel(e.target.value)}
                    className="mr-2"
                  />
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>👨‍💼 <strong>Namen nur für Coaches sichtbar</strong> - Spieler sehen anonyme Ergebnisse</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="anonymity"
                    value="coaches-private"
                    checked={anonymityLevel === "coaches-private"}
                    onChange={(e) => setAnonymityLevel(e.target.value)}
                    className="mr-2"
                  />
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>🔐 <strong>Nur für Coaches sichtbar (mit Namen)</strong> - Spieler können keine Ergebnisse sehen</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="anonymity"
                    value="public"
                    checked={anonymityLevel === "public"}
                    onChange={(e) => setAnonymityLevel(e.target.value)}
                    className="mr-2"
                  />
                  <span className={`text-sm ${isDarkMode ? 'text-gray-100' : 'text-gray-700'}`}>👥 <strong>Namen für alle sichtbar</strong> - Vollständig transparent</span>
                </label>
              </div>
            </div>

            {/* Team-Auswahl */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-700'}`}>
                🏒 Ziel-Teams auswählen
              </label>
              <div className="space-y-2">
                {["u16-elit", "u18-elit", "u21-elit"].map(teamId => (
                  <label key={teamId} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={targetTeams.includes(teamId)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setTargetTeams([...targetTeams, teamId]);
                        } else {
                          setTargetTeams(targetTeams.filter(t => t !== teamId));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                      {teamId === "u16-elit" ? "U16-Elit" : 
                       teamId === "u18-elit" ? "U18-Elit" : 
                       "U21-Elit"}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Fragen */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Fragen</h3>
                <button
                  onClick={addQuestion}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  + Frage hinzufügen
                </button>
              </div>

              {questions.map((question, questionIndex) => (
                <div key={question.id} className={`border rounded-lg p-4 mb-4 ${
                  isDarkMode ? 'border-gray-600 bg-gray-750' : 'border-gray-200 bg-white'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Frage {questionIndex + 1}</h4>
                    {questions.length > 1 && (
                      <button
                        onClick={() => removeQuestion(question.id)}
                        className={`text-sm ${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'}`}
                      >
                        ❌
                      </button>
                    )}
                  </div>

                  {/* Fragetext */}
                  <div className="mb-3">
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-700'}`}>
                      Fragetext *
                    </label>
                    <input
                      type="text"
                      value={question.text}
                      onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                      placeholder="z.B. 'Wie zufrieden warst du mit dem heutigen Training?'"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>

                  {/* Fragetyp */}
                  <div className="mb-3">
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-700'}`}>
                      Antworttyp
                    </label>
                    <select
                      value={question.type}
                      onChange={(e) => updateQuestion(question.id, { type: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="multiple-choice">Multiple Choice</option>
                      <option value="text">Textantwort</option>
                      <option value="rating">Bewertung (1-5 Sterne)</option>
                      <option value="yes-no">Ja/Nein</option>
                    </select>
                  </div>

                  {/* Optionen für Multiple Choice */}
                  {question.type === 'multiple-choice' && (
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-700'}`}>
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
                            className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              isDarkMode 
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            }`}
                          />
                          {question.options.length > 2 && (
                            <button
                              onClick={() => removeOption(question.id, optionIndex)}
                              className={`px-2 ${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'}`}
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => addOption(question.id)}
                        className={`text-sm ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                      >
                        + Option hinzufügen
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Buttons */}
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
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Wird gespeichert..." : (surveyId ? "📝 Aktualisieren" : "🚀 Direct Save")}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
