import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import BackButton from "../components/BackButton";
import { API_BASE_URL } from "../config/api";

export default function SimpleSurveyEditorNew() {
  const navigate = useNavigate();
  const { surveyId } = useParams(); // Get surveyId from URL for editing
  
  const [surveyTitle, setSurveyTitle] = useState("");
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
      const response = await fetch(`${API_BASE_URL}/surveys/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const surveyData = await response.json();
      console.log('✅ Loaded survey data:', surveyData);
      
      setSurveyTitle(surveyData.title || "");
      
      // Load questions by their IDs from Questions API
      if (surveyData.questions && surveyData.questions.length > 0) {
        console.log('📥 Loading questions by IDs:', surveyData.questions);
        
        const loadedQuestions = [];
        
        for (const questionId of surveyData.questions) {
          try {
            const questionResponse = await fetch(`${API_BASE_URL}/questions/${questionId}`);
            
            if (questionResponse.ok) {
              const questionData = await questionResponse.json();
              console.log('✅ Loaded question:', questionData);
              
              loadedQuestions.push({
                id: questionData.id,
                text: questionData.text || "",
                type: questionData.type || "multiple-choice",
                options: questionData.options || ["", ""],
                required: questionData.required || false
              });
            } else {
              console.warn('⚠️ Could not load question:', questionId);
              // Create placeholder for missing question
              loadedQuestions.push({
                id: questionId,
                text: "",
                type: "multiple-choice",
                options: ["", ""],
                required: false
              });
            }
          } catch (err) {
            console.error('❌ Error loading question:', questionId, err);
            // Create placeholder for failed question
            loadedQuestions.push({
              id: questionId,
              text: "",
              type: "multiple-choice", 
              options: ["", ""],
              required: false
            });
          }
        }
        
        setQuestions(loadedQuestions);
        console.log('📝 All questions loaded:', loadedQuestions);
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
    console.log('🚀 NEUE VERSION: Direct Save gestartet');
    
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
      
      console.log('📤 Step 1: Speichere Fragen einzeln...');
      
      // Step 1: Save each question to Questions API and collect IDs
      const questionIds = [];
      
      for (const question of validQuestions) {
        console.log('💾 Speichere Frage:', question.text);
        
        const questionData = {
          text: question.text,
          type: question.type,
          options: question.type === 'multiple-choice' ? question.options.filter(opt => opt.trim()) : [],
          required: question.required || false
        };
        
        const questionResponse = await fetch(`${API_BASE_URL}/questions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(questionData)
        });
        
        if (!questionResponse.ok) {
          throw new Error(`Fehler beim Speichern der Frage: ${questionResponse.status}`);
        }
        
        const savedQuestion = await questionResponse.json();
        questionIds.push(savedQuestion.id);
        console.log('✅ Frage gespeichert mit ID:', savedQuestion.id);
      }
      
      console.log('📤 Step 2: Erstelle Umfrage mit Fragen-IDs:', questionIds);
      
      // Step 2: Create survey with question IDs
      const surveyData = {
        title: finalTitle,
        description: "",
        questions: questionIds, // Use IDs instead of full objects
        resultsVisibleToPlayers: false,
        anonymous: true,
        targetTeams: ["u18-elit"],
        active: true,
        createdAt: new Date().toISOString()
      };

      console.log('📤 Direct API Call (Survey):', surveyData);

      let response;
      if (surveyId) {
        // Update existing survey
        console.log('📝 Updating survey:', surveyId);
        response = await fetch(`${API_BASE_URL}/surveys/${surveyId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...surveyData, id: surveyId })
        });
      } else {
        // Create new survey
        console.log('✨ Creating new survey');
        response = await fetch(`${API_BASE_URL}/surveys`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(surveyData)
        });
      }

      console.log('📥 Response Status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ SUCCESS:', result);

      setSuccessMessage(surveyId ? "✅ Umfrage erfolgreich aktualisiert!" : "✅ Umfrage erfolgreich erstellt!");
      setLoading(false);

      // Navigate back after 2 seconds
      setTimeout(() => {
        navigate('/coach/surveys');
      }, 2000);

    } catch (error) {
      console.error('❌ Direct Save Error:', error);
      setLoading(false);
      alert(`Fehler beim Speichern: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] font-sans">
      <Header />
      <BackButton to="/coach/surveys" />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {surveyId ? "📝 Umfrage bearbeiten" : "🚀 Neue Umfrage (Direct Save)"}
            </h1>
          </div>

          {successMessage && (
            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {successMessage}
            </div>
          )}

          <div className="space-y-6">
            {/* Titel */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📋 Umfragetitel (optional)
              </label>
              <input
                type="text"
                value={surveyTitle}
                onChange={(e) => setSurveyTitle(e.target.value)}
                placeholder="z.B. 'Training Feedback'"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
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

                  {/* Optionen für Multiple Choice */}
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
