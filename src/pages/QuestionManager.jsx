import React, { useState, useEffect } from "react";
import { useUmfrage } from "../context/UmfrageContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Header from "../components/Header";
import BackButton from "../components/BackButton";

// Question Type Icons
const QuestionTypeIcon = ({ type, className = "w-5 h-5" }) => {
  const icons = {
    text: "📝",
    rating: "⭐",
    multiple_choice: "☑️",
    yes_no: "❓",
    scale: "📊"
  };
  return <span className={className}>{icons[type] || "📝"}</span>;
};

// Question Type Badge
const QuestionTypeBadge = ({ type, isDarkMode }) => {
  const typeLabels = {
    text: 'Text',
    rating: 'Bewertung',
    multiple_choice: 'Multiple Choice',
    yes_no: 'Ja/Nein',
    scale: 'Skala'
  };

  const typeColors = {
    text: isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800',
    rating: isDarkMode ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800',
    multiple_choice: isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800',
    yes_no: isDarkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-800',
    scale: isDarkMode ? 'bg-orange-900 text-orange-300' : 'bg-orange-100 text-orange-800'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${typeColors[type] || typeColors.text}`}>
      <QuestionTypeIcon type={type} className="w-3 h-3 mr-1" />
      {typeLabels[type] || 'Andere'}
    </span>
  );
};

// Question Card Component
function QuestionCard({ question, onEdit, onDelete, onDuplicate, isDarkMode }) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div 
      className={`rounded-xl border p-6 transition-all hover:shadow-lg ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
          : 'bg-white border-gray-200 hover:border-gray-300'
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-3 mb-2">
            <QuestionTypeBadge type={question.type} isDarkMode={isDarkMode} />
            {question.required && (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800'
              }`}>
                ⚠️ Pflichtfeld
              </span>
            )}
          </div>
          
          <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {question.question}
          </h3>
          
          {question.description && (
            <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {question.description}
            </p>
          )}
        </div>
        
        {showActions && (
          <div className="flex flex-col space-y-1 min-w-0 flex-shrink-0">
            <button
              onClick={() => onEdit(question)}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                isDarkMode 
                  ? 'bg-blue-900 text-blue-300 hover:bg-blue-800' 
                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              }`}
              title="Bearbeiten"
            >
              ✏️
            </button>
            
            <button
              onClick={() => onDuplicate(question)}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                isDarkMode 
                  ? 'bg-green-900 text-green-300 hover:bg-green-800' 
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
              }`}
              title="Duplizieren"
            >
              📋
            </button>
            
            <button
              onClick={() => onDelete(question)}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                isDarkMode 
                  ? 'bg-red-900 text-red-300 hover:bg-red-800' 
                  : 'bg-red-100 text-red-800 hover:bg-red-200'
              }`}
              title="Löschen"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {/* Question Options Preview */}
      {(question.type === 'multiple_choice' || question.type === 'scale') && question.options && (
        <div className="mt-3">
          <p className={`text-xs font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Optionen:
          </p>
          <div className="flex flex-wrap gap-1">
            {question.options.slice(0, 3).map((option, index) => (
              <span
                key={index}
                className={`inline-block px-2 py-1 rounded text-xs ${
                  isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {option}
              </span>
            ))}
            {question.options.length > 3 && (
              <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                +{question.options.length - 3} weitere
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 mt-4 pt-3 border-t border-gray-200">
        <span>
          Erstellt: {new Date(question.createdAt || Date.now()).toLocaleDateString('de-DE')}
        </span>
        <span>
          ID: {question.id?.slice(-6) || 'XXXXXX'}
        </span>
      </div>
    </div>
  );
}

// Question Form Modal
function QuestionFormModal({ question, isOpen, onClose, onSave, isDarkMode }) {
  const [formData, setFormData] = useState({
    question: '',
    description: '',
    type: 'text',
    required: false,
    options: []
  });
  const [newOption, setNewOption] = useState('');

  useEffect(() => {
    if (question) {
      setFormData({
        question: question.question || '',
        description: question.description || '',
        type: question.type || 'text',
        required: question.required || false,
        options: question.options || []
      });
    } else {
      setFormData({
        question: '',
        description: '',
        type: 'text',
        required: false,
        options: []
      });
    }
  }, [question, isOpen]);

  const handleAddOption = () => {
    if (newOption.trim()) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, newOption.trim()]
      }));
      setNewOption('');
    }
  };

  const handleRemoveOption = (index) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.question.trim()) {
      onSave({
        ...question,
        ...formData,
        updatedAt: new Date().toISOString()
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-lg ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {question ? '✏️ Frage bearbeiten' : '➕ Neue Frage erstellen'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className={`p-2 rounded-lg ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              ❌
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                📝 Frage *
              </label>
              <input
                type="text"
                value={formData.question}
                onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="z.B. Wie zufrieden warst du mit dem Training?"
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                📄 Beschreibung (optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Zusätzliche Erklärung zur Frage..."
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                🔧 Fragetyp
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value, options: [] }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="text">📝 Textantwort</option>
                <option value="rating">⭐ Bewertung (1-5 Sterne)</option>
                <option value="multiple_choice">☑️ Multiple Choice</option>
                <option value="yes_no">❓ Ja/Nein</option>
                <option value="scale">📊 Skala (1-10)</option>
              </select>
            </div>

            {(formData.type === 'multiple_choice') && (
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  📋 Antwortoptionen
                </label>
                <div className="space-y-2">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className={`flex-1 px-3 py-2 rounded border ${
                        isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-gray-50 border-gray-200'
                      }`}>
                        {option}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        className="px-2 py-2 text-red-600 hover:bg-red-100 rounded"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
                      className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Neue Option hinzufügen..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOption())}
                    />
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      ➕ Hinzufügen
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                id="required"
                checked={formData.required}
                onChange={(e) => setFormData(prev => ({ ...prev, required: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="required" className={`ml-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                ⚠️ Pflichtfeld (muss beantwortet werden)
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              ❌ Abbrechen
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {question ? '💾 Aktualisieren' : '✨ Erstellen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function QuestionManager() {
  const { questions = [], createQuestion, updateQuestion, deleteQuestion, fetchQuestions } = useUmfrage();
  const { user, isCoach } = useAuth();
  const { isDarkMode } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        await fetchQuestions();
      } catch (err) {
        setError("Fehler beim Laden der Fragen");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (isCoach) {
      loadQuestions();
    }
  }, [isCoach, fetchQuestions]);

  // Filter und Suche
  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (question.description && question.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;
    
    if (filterType === "all") return true;
    return question.type === filterType;
  });

  const handleCreateQuestion = () => {
    setSelectedQuestion(null);
    setShowModal(true);
  };

  const handleEditQuestion = (question) => {
    setSelectedQuestion(question);
    setShowModal(true);
  };

  const handleDuplicateQuestion = (question) => {
    setSelectedQuestion({
      ...question,
      id: undefined,
      question: `${question.question} (Kopie)`
    });
    setShowModal(true);
  };

  const handleDeleteQuestion = async (question) => {
    if (window.confirm(`Möchtest du die Frage "${question.question}" wirklich löschen?`)) {
      try {
        await deleteQuestion(question.id);
        await fetchQuestions();
      } catch (err) {
        setError("Fehler beim Löschen der Frage");
        console.error(err);
      }
    }
  };

  const handleSaveQuestion = async (questionData) => {
    try {
      if (questionData.id) {
        await updateQuestion(questionData.id, questionData);
      } else {
        await createQuestion(questionData);
      }
      setShowModal(false);
      await fetchQuestions();
    } catch (err) {
      setError("Fehler beim Speichern der Frage");
      console.error(err);
    }
  };

  if (!isCoach) {
    return (
      <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className={`max-w-md p-6 rounded-lg shadow-lg text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h1 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>🚫 Zugriff verweigert</h1>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Nur Coaches können Fragen verwalten.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header />
      <BackButton to="/coach/dashboard" />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                📚 Fragen-Bibliothek
              </h1>
              <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Verwalte und organisiere deine Umfrage-Fragen
              </p>
            </div>
            
            <button
              onClick={handleCreateQuestion}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ➕ Neue Frage
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'} mr-3`}>
                📊
              </div>
              <div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {questions.length}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Fragen gesamt
                </p>
              </div>
            </div>
          </div>

          {['text', 'rating', 'multiple_choice'].map(type => {
            const count = questions.filter(q => q.type === type).length;
            const typeLabels = {
              text: 'Text-Fragen',
              rating: 'Bewertungen',
              multiple_choice: 'Multiple Choice'
            };
            const typeIcons = {
              text: '📝',
              rating: '⭐',
              multiple_choice: '☑️'
            };
            return (
              <div key={type} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} mr-3`}>
                    {typeIcons[type]}
                  </div>
                  <div>
                    <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {count}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {typeLabels[type]}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Suche und Filter */}
        <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="🔍 Fragen durchsuchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">Alle Fragetypen</option>
              <option value="text">📝 Textantwort</option>
              <option value="rating">⭐ Bewertung</option>
              <option value="multiple_choice">☑️ Multiple Choice</option>
              <option value="yes_no">❓ Ja/Nein</option>
              <option value="scale">📊 Skala</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${isDarkMode ? 'border-white' : 'border-gray-900'}`}></div>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h3 className={`mt-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
              Keine Fragen gefunden
            </h3>
            <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {searchTerm || filterType !== 'all' 
                ? 'Versuche deine Suchkriterien zu ändern.' 
                : 'Erstelle deine erste Frage, um zu beginnen.'}
            </p>
            {(!searchTerm && filterType === 'all') && (
              <button
                onClick={handleCreateQuestion}
                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ✨ Erste Frage erstellen
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuestions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onEdit={handleEditQuestion}
                onDelete={handleDeleteQuestion}
                onDuplicate={handleDuplicateQuestion}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            ❌ {error}
          </div>
        )}
      </main>

      {/* Question Form Modal */}
      <QuestionFormModal
        question={selectedQuestion}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveQuestion}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
