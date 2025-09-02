import React, { useState, useEffect } from "react";
import { useUmfrage } from "../context/UmfrageContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNotification } from "../context/NotificationContext";
import useAutoRefresh from "../hooks/useAutoRefresh";
import Header from "../components/Header";
import BackButton from "../components/BackButton";
import { useNavigate } from "react-router-dom";

// Survey Card Component
function SurveyCard({ survey, onEdit, onDelete, onToggleStatus, isDarkMode, onSendNotification, onQuickSettings }) {
  const [showActions, setShowActions] = useState(false);
  const navigate = useNavigate();

  const handleViewResults = () => {
    navigate(`/coach/survey-results/${survey.id}`);
  };

  // Bestimme Status
  const status = survey.status || (survey.active ? 'active' : 'inactive');
  const title = survey.title || 'Unbenannte Umfrage';

  return (
    <div 
      className={`rounded-xl border p-6 transition-all hover:shadow-lg ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
          : 'bg-white border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-3 mb-2">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
              status === 'active' 
                ? (isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800')
                : (isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-800')
            }`}>
              {status === 'active' ? '🟢 Online' : '⚫ Offline'}
            </span>
            {survey.anonymous && (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                isDarkMode ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800'
              }`}>
                🔒 Anonym
              </span>
            )}
          </div>
          
          <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h3>
          
          {survey.description && (
            <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {survey.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
            <span>📊 {survey.questions?.length || 0} Fragen</span>
            <span>👥 {survey.responses?.length || 0} Antworten</span>
            <span>📅 {new Date(survey.createdAt || Date.now()).toLocaleDateString('de-DE')}</span>
            <span>
              {survey.anonymityLevel === 'anonymous' && '🕶️ Anonym'}
              {survey.anonymityLevel === 'coaches-only' && '👨‍💼 Coaches'}
              {survey.anonymityLevel === 'public' && '👥 Öffentlich'}
              {(!survey.anonymityLevel && survey.anonymous !== false) && '🕶️ Anonym'}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile-friendly Action Buttons */}
      <div className="grid grid-cols-3 gap-2 md:hidden">
        {/* Mobile: 3 Spalten Layout */}
        <button
          onClick={() => onToggleStatus(survey)}
          className={`flex items-center justify-center px-2 py-2 text-xs font-medium rounded-lg transition-colors ${
            status === 'active'
              ? (isDarkMode ? 'bg-orange-900 text-orange-300 hover:bg-orange-800' : 'bg-orange-100 text-orange-800 hover:bg-orange-200')
              : (isDarkMode ? 'bg-green-900 text-green-300 hover:bg-green-800' : 'bg-green-100 text-green-800 hover:bg-green-200')
          }`}
          title={status === 'active' ? 'Offline stellen' : 'Online stellen'}
        >
          <span className="mr-1">{status === 'active' ? '⏸️' : '▶️'}</span>
          <span>{status === 'active' ? 'Offline' : 'Online'}</span>
        </button>
        
        <button
          onClick={() => onEdit(survey)}
          className={`flex items-center justify-center px-2 py-2 text-xs font-medium rounded-lg transition-colors ${
            isDarkMode 
              ? 'bg-yellow-900 text-yellow-300 hover:bg-yellow-800' 
              : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
          }`}
          title="Bearbeiten"
        >
          <span className="mr-1">✏️</span>
          <span>Bearbeiten</span>
        </button>
        
        <button
          onClick={() => onQuickSettings(survey)}
          className={`flex items-center justify-center px-2 py-2 text-xs font-medium rounded-lg transition-colors ${
            isDarkMode 
              ? 'bg-purple-900 text-purple-300 hover:bg-purple-800' 
              : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
          }`}
          title="Schnell-Einstellungen"
        >
          <span className="mr-1">⚙️</span>
          <span>Einstellungen</span>
        </button>
        
        {status === 'active' && (
          <button
            onClick={() => onSendNotification(survey)}
            className={`flex items-center justify-center px-2 py-2 text-xs font-medium rounded-lg transition-colors ${
              isDarkMode 
                ? 'bg-indigo-900 text-indigo-300 hover:bg-indigo-800' 
                : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
            }`}
            title="Benachrichtigung senden"
          >
            <span className="mr-1">📱</span>
            <span>Push</span>
          </button>
        )}
        
        <button
          onClick={handleViewResults}
          className={`flex items-center justify-center px-2 py-2 text-xs font-medium rounded-lg transition-colors ${
            isDarkMode 
              ? 'bg-blue-900 text-blue-300 hover:bg-blue-800' 
              : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
          }`}
          title="Ergebnisse anzeigen"
        >
          <span className="mr-1">📊</span>
          <span>Ergebnisse</span>
        </button>
        
        <button
          onClick={() => onDelete(survey)}
          className={`flex items-center justify-center px-2 py-2 text-xs font-medium rounded-lg transition-colors ${
            isDarkMode 
              ? 'bg-red-900 text-red-300 hover:bg-red-800' 
              : 'bg-red-100 text-red-800 hover:bg-red-200'
          }`}
          title="Löschen"
        >
          <span className="mr-1">🗑️</span>
          <span>Löschen</span>
        </button>
      </div>

      {/* Desktop: Horizontal Action Buttons */}
      <div className="hidden md:flex items-center gap-2 flex-wrap">
        <button
          onClick={() => onToggleStatus(survey)}
          className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            status === 'active'
              ? (isDarkMode ? 'bg-orange-900 text-orange-300 hover:bg-orange-800' : 'bg-orange-100 text-orange-800 hover:bg-orange-200')
              : (isDarkMode ? 'bg-green-900 text-green-300 hover:bg-green-800' : 'bg-green-100 text-green-800 hover:bg-green-200')
          }`}
          title={status === 'active' ? 'Offline stellen' : 'Online stellen'}
        >
          <span className="mr-1">{status === 'active' ? '⏸️' : '▶️'}</span>
          {status === 'active' ? 'Offline stellen' : 'Online stellen'}
        </button>
        
        {status === 'active' && (
          <button
            onClick={() => onSendNotification(survey)}
            className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              isDarkMode 
                ? 'bg-purple-900 text-purple-300 hover:bg-purple-800' 
                : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
            }`}
            title="Benachrichtigung senden"
          >
            <span className="mr-1">📱</span>
            Push-Benachrichtigung
          </button>
        )}
        
        <button
          onClick={handleViewResults}
          className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            isDarkMode 
              ? 'bg-blue-900 text-blue-300 hover:bg-blue-800' 
              : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
          }`}
          title="Ergebnisse anzeigen"
        >
          <span className="mr-1">�</span>
          Ergebnisse anzeigen
        </button>
        
        <button
          onClick={() => onEdit(survey)}
          className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            isDarkMode 
              ? 'bg-yellow-900 text-yellow-300 hover:bg-yellow-800' 
              : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
          }`}
          title="Umfrage bearbeiten"
        >
          <span className="mr-1">✏️</span>
          Bearbeiten
        </button>
        
        <button
          onClick={() => onQuickSettings(survey)}
          className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            isDarkMode 
              ? 'bg-purple-900 text-purple-300 hover:bg-purple-800' 
              : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
          }`}
          title="Schnell-Einstellungen (Anonymität etc.)"
        >
          <span className="mr-1">⚙️</span>
          Einstellungen
        </button>
        
        <button
          onClick={() => onDelete(survey)}
          className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            isDarkMode 
              ? 'bg-red-900 text-red-300 hover:bg-red-800' 
              : 'bg-red-100 text-red-800 hover:bg-red-200'
          }`}
          title="Umfrage löschen"
        >
          <span className="mr-1">🗑️</span>
          Löschen
        </button>
      </div>

      {/* Survey Questions Preview */}
      {survey.questions && survey.questions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className={`text-xs font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Verwendete Fragen:
          </p>
          <div className="text-xs text-gray-500">
            {survey.questions.length} Fragen zugeordnet
          </div>
        </div>
      )}
    </div>
  );
}
// Quick Survey Settings Modal Component  
function QuickSettingsModal({ survey, isOpen, onClose, onSave, isDarkMode }) {
  const [anonymityLevel, setAnonymityLevel] = useState('anonymous');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (survey && isOpen) {
      setAnonymityLevel(survey.anonymityLevel || 'anonymous');
    }
  }, [survey, isOpen]);

  const handleSave = async () => {
    if (!survey) return;
    
    setSaving(true);
    try {
      const updatedSurvey = {
        ...survey,
        anonymityLevel: anonymityLevel,
        anonymous: anonymityLevel === 'anonymous'
      };
      
      await onSave(updatedSurvey);
      onClose();
    } catch (error) {
      console.error('Error updating survey settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`max-w-md w-full rounded-lg shadow-xl ${
        isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">
            ⚙️ Schnell-Einstellungen: {survey?.title || 'Umfrage'}
          </h3>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">
              🔒 Anonymitäts-Einstellungen
            </label>
            <div className="space-y-3">
              <label className="flex items-start cursor-pointer">
                <input
                  type="radio"
                  name="quickAnonymity"
                  value="anonymous"
                  checked={anonymityLevel === "anonymous"}
                  onChange={(e) => setAnonymityLevel(e.target.value)}
                  className="mr-3 mt-1"
                />
                <div>
                  <div className="font-medium">🕶️ Vollständig anonym</div>
                  <div className="text-sm text-gray-500">Namen werden nicht erfasst</div>
                </div>
              </label>
              <label className="flex items-start cursor-pointer">
                <input
                  type="radio"
                  name="quickAnonymity"
                  value="coaches-only"
                  checked={anonymityLevel === "coaches-only"}
                  onChange={(e) => setAnonymityLevel(e.target.value)}
                  className="mr-3 mt-1"
                />
                <div>
                  <div className="font-medium">👨‍💼 Namen nur für Coaches</div>
                  <div className="text-sm text-gray-500">Spieler sehen anonyme Ergebnisse</div>
                </div>
              </label>
              <label className="flex items-start cursor-pointer">
                <input
                  type="radio"
                  name="quickAnonymity"
                  value="public"
                  checked={anonymityLevel === "public"}
                  onChange={(e) => setAnonymityLevel(e.target.value)}
                  className="mr-3 mt-1"
                />
                <div>
                  <div className="font-medium">👥 Namen für alle sichtbar</div>
                  <div className="text-sm text-gray-500">Vollständig transparent</div>
                </div>
              </label>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              disabled={saving}
            >
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={saving}
            >
              {saving ? 'Speichert...' : '💾 Speichern'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
// Push Notification Modal Component
function PushNotificationModal({ survey, isOpen, onClose, onSend, isDarkMode }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (survey && isOpen) {
      setMessage(`📋 Neue Umfrage "${survey.title || 'Umfrage'}" ist verfügbar! Bitte fülle sie aus.`);
    }
  }, [survey, isOpen]);

  const handleSend = async () => {
    if (!message.trim()) return;
    
    setSending(true);
    try {
      await onSend(survey, message);
      onClose();
    } catch (error) {
      console.error('Fehler beim Senden der Benachrichtigung:', error);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen || !survey) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`max-w-md w-full rounded-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            📱 Push-Benachrichtigung senden
          </h3>
          <button
            onClick={onClose}
            className={`p-1 rounded ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
          >
            ❌
          </button>
        </div>
        
        <div className="mb-4">
          <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Umfrage: <strong>{survey.title || 'Unbenannte Umfrage'}</strong>
          </p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
            placeholder="Benachrichtigungstext eingeben..."
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              isDarkMode 
                ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            }`}
            disabled={sending}
          >
            Abbrechen
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !message.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? '📤 Wird gesendet...' : '📱 Senden'}
          </button>
        </div>
      </div>
    </div>
  );
}

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
  const { 
    surveys = [], 
    fetchSurveys, 
    deleteSurvey,
    updateSurvey,
    forceCleanReload
  } = useUmfrage();
  const { user, isCoach } = useAuth();
  const { isDarkMode } = useTheme();
  const { sendNotificationToTeam } = useNotification();
  const navigate = useNavigate();
  
  // Auto-refresh surveys when component mounts
  useAutoRefresh();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showQuickSettingsModal, setShowQuickSettingsModal] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);

  // Force refresh function with nuclear option
  const handleForceRefresh = async () => {
    console.log('🧹 Manual force refresh triggered');
    setLoading(true);
    
    // Check if this is a double-click within 2 seconds for nuclear reset
    const now = Date.now();
    const lastClick = localStorage.getItem('lastRefreshClick');
    
    if (lastClick && (now - parseInt(lastClick)) < 2000) {
      // NUCLEAR RESET on double-click
      console.log('💥 NUCLEAR RESET - Double click detected!');
      localStorage.removeItem('lastRefreshClick');
      
      try {
        // Import and execute nuclear reset
        const { performNuclearReset } = await import('../utils/serviceWorkerReset');
        await performNuclearReset();
      } catch (error) {
        console.error('Nuclear reset failed:', error);
        // Fallback to manual reset
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
        }
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload(true);
      }
    } else {
      // Normal refresh
      localStorage.setItem('lastRefreshClick', now.toString());
      await forceCleanReload();
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await fetchSurveys();
      } catch (err) {
        setError("Fehler beim Laden der Daten");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (isCoach) {
      loadData();
    }
  }, [isCoach, fetchSurveys]);

  // Filter und Suche für Umfragen
  const filteredSurveys = surveys.filter(survey => {
    const title = survey.title || 'Unbenannte Umfrage';
    const description = survey.description || '';
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (filterType === "all") return true;
    if (filterType === "active") {
      const status = survey.status || (survey.active ? 'active' : 'inactive');
      return status === 'active';
    }
    if (filterType === "inactive") {
      const status = survey.status || (survey.active ? 'active' : 'inactive');
      return status === 'inactive';
    }
    return true;
  });

  const handleCreateSurvey = () => {
    navigate('/coach/survey-editor');
  };

  const handleEditSurvey = (survey) => {
    navigate(`/coach/survey-editor/${survey.id}`);
  };

  const handleDeleteSurvey = async (survey) => {
    const title = survey.title || 'Unbenannte Umfrage';
    if (window.confirm(`Möchtest du die Umfrage "${title}" wirklich löschen?`)) {
      try {
        await deleteSurvey(survey.id);
        await fetchSurveys();
      } catch (err) {
        setError("Fehler beim Löschen der Umfrage");
        console.error(err);
      }
    }
  };

  const handleToggleSurveyStatus = async (survey) => {
    try {
      const currentStatus = survey.status || (survey.active ? 'active' : 'inactive');
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      const updatedSurvey = {
        ...survey,
        status: newStatus,
        active: newStatus === 'active'
      };
      
      await updateSurvey(survey.id, updatedSurvey);
      await fetchSurveys();
    } catch (err) {
      setError("Fehler beim Ändern des Status");
      console.error(err);
    }
  };

  const handleSendNotification = (survey) => {
    setSelectedSurvey(survey);
    setShowNotificationModal(true);
  };

  const handleQuickSettings = (survey) => {
    setSelectedSurvey(survey);
    setShowQuickSettingsModal(true);
  };

  const handleSaveQuickSettings = async (updatedSurvey) => {
    try {
      await updateSurvey(updatedSurvey.id, updatedSurvey);
      console.log('✅ Survey settings updated:', updatedSurvey);
    } catch (error) {
      console.error('❌ Error updating survey settings:', error);
      setError("Fehler beim Aktualisieren der Einstellungen");
    }
  };

  const handleSendPushNotification = async (survey, message) => {
    try {
      // Verwende das Team aus der Umfrage oder 'all' als Fallback
      const targetTeams = survey.targetTeams || ['all'];
      
      await sendNotificationToTeam(targetTeams, {
        title: "📋 Umfrage-Erinnerung",
        message: message,
        type: "survey",
        contentId: survey.id
      });
      
      setError(""); // Clear any previous errors
      // Optional: Success feedback could be added here
    } catch (error) {
      setError("Fehler beim Senden der Benachrichtigung");
      console.error('Fehler beim Senden der Push-Benachrichtigung:', error);
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
                � Umfragen Management
              </h1>
              <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Verwalte deine Umfragen und deren Status - Online/Offline schalten und Push-Benachrichtigungen senden
              </p>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleForceRefresh}
                className="inline-flex items-center px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                disabled={loading}
                title="🔄 Einfachklick: Aktualisieren | 💥 Doppelklick: Nuclear Reset (alle Caches löschen)"
              >
                🔄 {loading ? 'Lädt...' : 'Aktualisieren'}
              </button>
              
              <button
                onClick={handleCreateSurvey}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ➕ Neue Umfrage
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'} mr-3`}>
                📋
              </div>
              <div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {surveys.length}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Umfragen gesamt
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'} mr-3`}>
                🟢
              </div>
              <div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {surveys.filter(s => (s.status || (s.active ? 'active' : 'inactive')) === 'active').length}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Online
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} mr-3`}>
                ⚫
              </div>
              <div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {surveys.filter(s => (s.status || (s.active ? 'active' : 'inactive')) === 'inactive').length}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Offline
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-700'} mr-3`}>
                📊
              </div>
              <div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {surveys.reduce((acc, survey) => acc + (survey.responses?.length || 0), 0)}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Antworten
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Suche und Filter */}
        <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="🔍 Umfragen durchsuchen..."
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
              <option value="all">Alle Status</option>
              <option value="active">🟢 Online</option>
              <option value="inactive">⚫ Offline</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${isDarkMode ? 'border-white' : 'border-gray-900'}`}></div>
          </div>
        ) : filteredSurveys.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className={`mt-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
              Keine Umfragen gefunden
            </h3>
            <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {searchTerm || filterType !== 'all' 
                ? 'Versuche deine Suchkriterien zu ändern.' 
                : 'Erstelle deine erste Umfrage, um zu beginnen.'}
            </p>
            {(!searchTerm && filterType === 'all') && (
              <button
                onClick={handleCreateSurvey}
                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ✨ Erste Umfrage erstellen
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSurveys.map((survey) => (
              <SurveyCard
                key={survey.id}
                survey={survey}
                onEdit={handleEditSurvey}
                onDelete={handleDeleteSurvey}
                onToggleStatus={handleToggleSurveyStatus}
                onSendNotification={handleSendNotification}
                onQuickSettings={handleQuickSettings}
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

      {/* Push Notification Modal */}
      <PushNotificationModal
        survey={selectedSurvey}
        isOpen={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        onSend={handleSendPushNotification}
        isDarkMode={isDarkMode}
      />

      {/* Quick Settings Modal */}
      <QuickSettingsModal
        survey={selectedSurvey}
        isOpen={showQuickSettingsModal}
        onClose={() => setShowQuickSettingsModal(false)}
        onSave={handleSaveQuickSettings}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
