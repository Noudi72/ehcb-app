import React, { useState, useEffect } from "react";
import { useUmfrage } from "../context/UmfrageContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNotification } from "../context/NotificationContext";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import BackButton from "../components/BackButton";

// Status Badge Component
const StatusBadge = ({ status, isDarkMode }) => {
  const isActive = status === 'active' || status === true;
  
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
      isActive
        ? (isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800')
        : (isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-800')
    }`}>
      {isActive ? '🟢 Aktiv' : '⚫ Inaktiv'}
    </span>
  );
};

// Push Notification Modal
function PushNotificationModal({ survey, isOpen, onClose, onSend, isDarkMode }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen && survey) {
      setMessage(`Erinnerung: Bitte fülle die Umfrage "${survey.title}" aus. Dein Feedback ist wichtig für uns! 🏀`);
    }
  }, [isOpen, survey]);

  const handleSend = async () => {
    if (!message.trim()) return;
    
    setSending(true);
    try {
      await onSend(survey, message);
      onClose();
      setMessage('');
    } catch (error) {
      console.error('Error sending notification:', error);
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`max-w-md w-full rounded-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            📲 Push-Benachrichtigung senden
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
            Umfrage: <strong>{survey?.title}</strong>
          </p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Nachricht für die Spieler..."
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              isDarkMode 
                ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Abbrechen
          </button>
          <button
            onClick={handleSend}
            disabled={sending || !message.trim()}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
              sending || !message.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {sending ? '📤 Sende...' : '📲 Senden'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Modern Survey Card
function SurveyCard({ survey, onToggleStatus, onToggleVisibility, onToggleAnonymity, onSendNotification, isDarkMode }) {
  const [showActions, setShowActions] = useState(false);
  const navigate = useNavigate();

  const handleViewResults = () => {
    navigate(`/coach/survey-results/${survey.id}`);
  };

  const isActive = survey.status === 'active' || survey.active;
  const responsesCount = survey.responses?.length || 0;

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
            <StatusBadge status={isActive ? 'active' : 'inactive'} isDarkMode={isDarkMode} />
            {survey.resultsVisibleToPlayers && (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'
              }`}>
                👁️ Sichtbar
              </span>
            )}
            {survey.anonymous && (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                isDarkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-800'
              }`}>
                🔒 Anonym
              </span>
            )}
          </div>
          
          <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {survey.title}
          </h3>
          
          {survey.description && (
            <p className={`text-sm mb-3 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {survey.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
            <span>📊 {survey.questions?.length || 0} Fragen</span>
            <span>👥 {responsesCount} Antworten</span>
            <span>📅 {new Date(survey.createdAt || Date.now()).toLocaleDateString('de-DE')}</span>
          </div>
        </div>
        
        {showActions && (
          <div className="flex flex-col space-y-1 min-w-0 flex-shrink-0">
            <button
              onClick={() => onToggleStatus(survey)}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                isActive
                  ? (isDarkMode ? 'bg-orange-900 text-orange-300 hover:bg-orange-800' : 'bg-orange-100 text-orange-800 hover:bg-orange-200')
                  : (isDarkMode ? 'bg-green-900 text-green-300 hover:bg-green-800' : 'bg-green-100 text-green-800 hover:bg-green-200')
              }`}
              title={isActive ? 'Deaktivieren' : 'Aktivieren'}
            >
              {isActive ? '⏸️' : '▶️'}
            </button>
            
            <button
              onClick={() => onToggleVisibility(survey)}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                survey.resultsVisibleToPlayers
                  ? (isDarkMode ? 'bg-blue-900 text-blue-300 hover:bg-blue-800' : 'bg-blue-100 text-blue-800 hover:bg-blue-200')
                  : (isDarkMode ? 'bg-gray-900 text-gray-300 hover:bg-gray-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200')
              }`}
              title="Ergebnisse für Spieler"
            >
              👁️
            </button>
            
            <button
              onClick={() => onToggleAnonymity(survey)}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                survey.anonymous
                  ? (isDarkMode ? 'bg-purple-900 text-purple-300 hover:bg-purple-800' : 'bg-purple-100 text-purple-800 hover:bg-purple-200')
                  : (isDarkMode ? 'bg-gray-900 text-gray-300 hover:bg-gray-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200')
              }`}
              title="Anonymität umschalten"
            >
              🔒
            </button>

            {isActive && (
              <button
                onClick={() => onSendNotification(survey)}
                className={`px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                  isDarkMode 
                    ? 'bg-indigo-900 text-indigo-300 hover:bg-indigo-800' 
                    : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
                }`}
                title="Push-Benachrichtigung senden"
              >
                📲
              </button>
            )}
            
            <button
              onClick={handleViewResults}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                isDarkMode 
                  ? 'bg-green-900 text-green-300 hover:bg-green-800' 
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
              }`}
              title="Ergebnisse anzeigen"
            >
              📊
            </button>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {isActive && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {responsesCount}
              </p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Antworten
              </p>
            </div>
            <div>
              <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {Math.round((responsesCount / Math.max(1, survey.targetResponseCount || 20)) * 100)}%
              </p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Teilnahme
              </p>
            </div>
            <div>
              <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {survey.questions?.length || 0}
              </p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Fragen
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ActiveSurveyManager() {
  const { 
    surveys = [], 
    updateSurvey,
    fetchSurveys,
    loading, 
    error 
  } = useUmfrage();
  
  const { user, isCoach } = useAuth();
  const { isDarkMode } = useTheme();
  const { sendNotification } = useNotification();
  const navigate = useNavigate();
  
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  useEffect(() => {
    if (isCoach) {
      fetchSurveys();
    }
  }, [isCoach, fetchSurveys]);

  // Filter surveys
  const filteredSurveys = surveys.filter(survey => {
    const matchesSearch = survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (survey.description && survey.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;
    
    if (filterStatus === "all") return true;
    const isActive = survey.status === 'active' || survey.active;
    return filterStatus === "active" ? isActive : !isActive;
  });

  const activeSurveys = filteredSurveys.filter(s => s.status === 'active' || s.active);
  const inactiveSurveys = filteredSurveys.filter(s => !(s.status === 'active' || s.active));

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  const toggleSurveyStatus = async (survey) => {
    try {
      const isCurrentlyActive = survey.status === 'active' || survey.active;
      const updateData = {
        ...survey,
        active: !isCurrentlyActive,
        status: !isCurrentlyActive ? 'active' : 'inactive'
      };
      
      await updateSurvey(survey.id, updateData);
      showSuccess(`Umfrage "${survey.title}" wurde ${!isCurrentlyActive ? 'aktiviert' : 'deaktiviert'}`);
      fetchSurveys();
    } catch (error) {
      console.error("Fehler beim Aktualisieren der Umfrage:", error);
      alert("Fehler beim Ändern des Umfragestatus");
    }
  };

  const toggleResultsVisibility = async (survey) => {
    try {
      const updateData = {
        ...survey,
        resultsVisibleToPlayers: !survey.resultsVisibleToPlayers
      };
      
      await updateSurvey(survey.id, updateData);
      showSuccess(`Ergebnissichtbarkeit für "${survey.title}" wurde ${!survey.resultsVisibleToPlayers ? 'aktiviert' : 'deaktiviert'}`);
      fetchSurveys();
    } catch (error) {
      console.error("Fehler beim Aktualisieren der Umfrage:", error);
      alert("Fehler beim Ändern der Ergebnissichtbarkeit");
    }
  };

  const toggleAnonymity = async (survey) => {
    try {
      const updateData = {
        ...survey,
        anonymous: !survey.anonymous
      };
      
      await updateSurvey(survey.id, updateData);
      showSuccess(`Anonymität für "${survey.title}" wurde ${!survey.anonymous ? 'aktiviert' : 'deaktiviert'}`);
      fetchSurveys();
    } catch (error) {
      console.error("Fehler beim Aktualisieren der Umfrage:", error);
      alert("Fehler beim Ändern der Anonymität");
    }
  };

  const handleSendNotification = (survey) => {
    setSelectedSurvey(survey);
    setShowNotificationModal(true);
  };

  const sendPushNotification = async (survey, message) => {
    try {
      // Send notification to all team members
      await sendNotification({
        title: `Umfrage-Erinnerung: ${survey.title}`,
        message: message,
        type: 'survey_reminder',
        surveyId: survey.id,
        targetAudience: 'team_members',
        urgent: false
      });

      showSuccess(`Push-Benachrichtigung für "${survey.title}" wurde an alle Teammitglieder gesendet`);
    } catch (error) {
      console.error("Fehler beim Senden der Push-Benachrichtigung:", error);
      alert("Fehler beim Senden der Benachrichtigung");
    }
  };

  if (!isCoach) {
    return (
      <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className={`max-w-md p-6 rounded-lg shadow-lg text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h1 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>🚫 Zugriff verweigert</h1>
            <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Nur Coaches können Umfragen verwalten.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header />
      <BackButton to="/coach/dashboard" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                📊 Umfrage-Management
              </h1>
              <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Verwalte aktive und inaktive Umfragen • Sende Push-Benachrichtigungen an Spieler
              </p>
            </div>
            
            <button
              onClick={() => navigate('/coach/survey-editor')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ➕ Neue Umfrage erstellen
            </button>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            ✅ {successMessage}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'} mr-3`}>
                📊
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
                  {activeSurveys.length}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Aktive Umfragen
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-700'} mr-3`}>
                👥
              </div>
              <div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {surveys.reduce((acc, survey) => acc + (survey.responses?.length || 0), 0)}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Antworten gesamt
                </p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-100 text-indigo-700'} mr-3`}>
                📲
              </div>
              <div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {activeSurveys.length}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Push verfügbar
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
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
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">Alle Umfragen</option>
              <option value="active">🟢 Nur aktive</option>
              <option value="inactive">⚫ Nur inaktive</option>
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${isDarkMode ? 'border-white' : 'border-gray-900'}`}></div>
          </div>
        ) : (
          <>
            {/* Active Surveys */}
            {activeSurveys.length > 0 && (
              <div className="mb-8">
                <h2 className={`text-xl font-bold mb-4 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  🟢 Aktive Umfragen ({activeSurveys.length})
                  <span className="ml-2 text-sm font-normal text-gray-500">Push-Benachrichtigungen verfügbar</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {activeSurveys.map((survey) => (
                    <SurveyCard
                      key={survey.id}
                      survey={survey}
                      onToggleStatus={toggleSurveyStatus}
                      onToggleVisibility={toggleResultsVisibility}
                      onToggleAnonymity={toggleAnonymity}
                      onSendNotification={handleSendNotification}
                      isDarkMode={isDarkMode}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Inactive Surveys */}
            {inactiveSurveys.length > 0 && (
              <div className="mb-8">
                <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ⚫ Inaktive Umfragen ({inactiveSurveys.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {inactiveSurveys.map((survey) => (
                    <SurveyCard
                      key={survey.id}
                      survey={survey}
                      onToggleStatus={toggleSurveyStatus}
                      onToggleVisibility={toggleResultsVisibility}
                      onToggleAnonymity={toggleAnonymity}
                      onSendNotification={handleSendNotification}
                      isDarkMode={isDarkMode}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredSurveys.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className={`mt-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  Keine Umfragen gefunden
                </h3>
                <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Versuche deine Suchkriterien zu ändern.' 
                    : 'Erstelle deine erste Umfrage, um zu beginnen.'}
                </p>
                {(!searchTerm && filterStatus === 'all') && (
                  <button
                    onClick={() => navigate('/coach/survey-editor')}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    ✨ Erste Umfrage erstellen
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            ❌ {error}
          </div>
        )}

        {/* Push Notification Modal */}
        <PushNotificationModal
          survey={selectedSurvey}
          isOpen={showNotificationModal}
          onClose={() => setShowNotificationModal(false)}
          onSend={sendPushNotification}
          isDarkMode={isDarkMode}
        />
      </main>
    </div>
  );
}
