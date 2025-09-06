import React, { useState, useEffect } from "react";
import { useUmfrage } from "../context/UmfrageContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Header from "../components/Header";
import BackButton from "../components/BackButton";
import { useNavigate } from "react-router-dom";

// Status Badge Component
const StatusBadge = ({ survey, isDarkMode }) => {
  // Einheitliche Status-Bestimmung: Priorität auf 'active' Feld, da es das primäre Feld ist
  // Falls 'status' explizit gesetzt ist, verwende es, ansonsten nutze 'active'
  const status = survey.status || (survey.active === true ? 'active' : 'inactive');
  
  const statusConfig = {
    active: {
      label: 'Aktiv',
      icon: '🟢',
      className: isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'
    },
    inactive: {
      label: 'Inaktiv',
      icon: '⚫',
      className: isDarkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-800'
    },
    draft: {
      label: 'Entwurf',
      icon: '📝',
      className: isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'
    },
    completed: {
      label: 'Abgeschlossen',
      icon: '✅',
      className: isDarkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-800'
    }
  };

  const config = statusConfig[status] || statusConfig.inactive;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}>
      {config.icon} {config.label}
    </span>
  );
};

// Survey Card Component
function SurveyCard({ survey, onEdit, onDelete, onToggleStatus, onViewResults, isDarkMode }) {
  const [showActions, setShowActions] = useState(false);
  const navigate = useNavigate();

  const handleViewResults = () => {
    navigate(`/coach/survey-results/${survey.id}`);
  };

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
            <StatusBadge survey={survey} isDarkMode={isDarkMode} />
            {survey.anonymous && (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                isDarkMode ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800'
              }`}>
                🔒 Anonym
              </span>
            )}
          </div>
          
          <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {survey.title || 'Unbenannte Umfrage'}
          </h3>
          
          {survey.description && (
            <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {survey.description}
            </p>
          )}

          <div className={`flex items-center gap-4 text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <span>📊 {survey.questions?.length || 0} Fragen</span>
            <span>👥 {survey.responses?.length || 0} Antworten</span>
            <span>📅 {new Date(survey.createdAt || Date.now()).toLocaleDateString('de-DE')}</span>
          </div>
        </div>
        
        {showActions && (
          <div className="flex flex-col space-y-1 min-w-0 flex-shrink-0">
            <button
              onClick={() => onEdit(survey)}
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
              onClick={handleViewResults}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                isDarkMode 
                  ? 'bg-green-900 text-green-300 hover:bg-green-800' 
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
              }`}
              title="Ergebnisse"
            >
              📊
            </button>
            
            <button
              onClick={() => onToggleStatus(survey)}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                (survey.status === 'active' || survey.active)
                  ? (isDarkMode ? 'bg-orange-900 text-orange-300 hover:bg-orange-800' : 'bg-orange-100 text-orange-800 hover:bg-orange-200')
                  : (isDarkMode ? 'bg-green-900 text-green-300 hover:bg-green-800' : 'bg-green-100 text-green-800 hover:bg-green-200')
              }`}
              title={(survey.status === 'active' || survey.active) ? 'Deaktivieren' : 'Aktivieren'}
            >
              {(survey.status === 'active' || survey.active) ? '⏸️' : '▶️'}
            </button>
            
            <button
              onClick={() => onDelete(survey)}
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

      {/* Survey Preview */}
      {survey.questions && survey.questions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className={`text-xs font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Vorschau der Fragen:
          </p>
          <div className="space-y-1">
            {survey.questions.slice(0, 2).map((question, index) => (
              <p key={index} className={`text-xs truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {index + 1}. {question.question}
              </p>
            ))}
            {survey.questions.length > 2 && (
              <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                +{survey.questions.length - 2} weitere Fragen...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Quick Actions Component
function QuickActions({ onCreate, onManageQuestions, isDarkMode }) {
  const navigate = useNavigate();

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-8`}>
      <button
        onClick={onCreate}
        className={`p-6 rounded-xl border-2 border-dashed transition-all hover:shadow-lg ${
          isDarkMode 
            ? 'border-gray-600 hover:border-blue-500 bg-gray-800 hover:bg-gray-750' 
            : 'border-gray-300 hover:border-blue-500 bg-white hover:bg-blue-50'
        }`}
      >
        <div className="text-center">
          <div className="text-3xl mb-2">➕</div>
          <h3 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Neue Umfrage
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Erstelle eine neue Umfrage für dein Team
          </p>
        </div>
      </button>

      <button
        onClick={onManageQuestions}
        className={`p-6 rounded-xl border transition-all hover:shadow-lg ${
          isDarkMode 
            ? 'border-gray-700 bg-gray-800 hover:bg-gray-750' 
            : 'border-gray-200 bg-white hover:bg-gray-50'
        }`}
      >
        <div className="text-center">
          <div className="text-3xl mb-2">📚</div>
          <h3 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Fragen-Bibliothek
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Verwalte deine wiederverwendbaren Fragen
          </p>
        </div>
      </button>

      <button
        onClick={() => navigate('/coach/survey-analytics')}
        className={`p-6 rounded-xl border transition-all hover:shadow-lg ${
          isDarkMode 
            ? 'border-gray-700 bg-gray-800 hover:bg-gray-750' 
            : 'border-gray-200 bg-white hover:bg-gray-50'
        }`}
      >
        <div className="text-center">
          <div className="text-3xl mb-2">📊</div>
          <h3 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Analytics
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Übersicht über alle Umfrage-Ergebnisse
          </p>
        </div>
      </button>
    </div>
  );
}

export default function UmfrageHub() {
  const { surveys = [], fetchSurveys, deleteSurvey, updateSurvey } = useUmfrage();
  const { user, isCoach } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const loadSurveys = async () => {
      try {
        setLoading(true);
        await fetchSurveys();
      } catch (err) {
        setError("Fehler beim Laden der Umfragen");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (isCoach) {
      loadSurveys();
    }
  }, [isCoach]); // FIXED: Removed fetchSurveys dependency

  // Filter und Suche
  const filteredSurveys = surveys.filter(survey => {
    // Sichere Überprüfung auf title Eigenschaft
    const title = survey.title || 'Unbenannte Umfrage';
    const description = survey.description || '';
    
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (filterStatus === "all") return true;
    
    // Sichere Überprüfung auf status - falls nicht vorhanden, verwende active als Fallback
    const status = survey.status || (survey.active ? 'active' : 'inactive');
    return status === filterStatus;
  });

  // Gruppiere Umfragen
  const activeSurveys = filteredSurveys.filter(s => {
    const status = s.status || (s.active ? 'active' : 'inactive');
    return status === 'active';
  });
  const inactiveSurveys = filteredSurveys.filter(s => {
    const status = s.status || (s.active ? 'active' : 'inactive');
    return status !== 'active';
  });

  const handleCreateSurvey = () => {
    navigate('/coach/survey-editor');
  };

  const handleManageQuestions = () => {
    navigate('/coach/questions');
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

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(new Set());

  const handleToggleStatus = async (survey) => {
    // Verhindere mehrfache gleichzeitige Updates
    if (isUpdatingStatus.has(survey.id)) {
      console.log('Update already in progress for survey', survey.id);
      return;
    }

    try {
      setIsUpdatingStatus(prev => new Set(prev).add(survey.id));
      
      // Bestimme aktuellen Status konsistent
      const currentStatus = survey.status || (survey.active === true ? 'active' : 'inactive');
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const newActive = newStatus === 'active';
      
      console.log(`Toggling survey ${survey.id} from ${currentStatus} to ${newStatus}`);
      
      // Update sowohl status als auch active für Kompatibilität
      const updatedSurvey = {
        ...survey,
        status: newStatus,
        active: newActive
      };
      
      // Optimistic update der lokalen State
      setSurveys(prevSurveys => 
        prevSurveys.map(s => 
          s.id === survey.id 
            ? { ...s, status: newStatus, active: newActive }
            : s
        )
      );
      
      await updateSurvey(survey.id, updatedSurvey);
      
      // Fetch fresh data nach dem Update
      await fetchSurveys();
    } catch (err) {
      setError("Fehler beim Ändern des Status");
      console.error("Toggle status error:", err);
      // Bei Fehler, lade die Surveys neu um den korrekten State wiederherzustellen
      await fetchSurveys();
    } finally {
      setIsUpdatingStatus(prev => {
        const newSet = new Set(prev);
        newSet.delete(survey.id);
        return newSet;
      });
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
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            📋 Umfrage-Zentrale
          </h1>
          <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Verwalte alle deine Umfragen und Fragen an einem Ort
          </p>
        </div>

        {/* Quick Actions */}
        <QuickActions 
          onCreate={handleCreateSurvey}
          onManageQuestions={handleManageQuestions}
          isDarkMode={isDarkMode}
        />

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
                📝
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
              <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-700'} mr-3`}>
                ⭐
              </div>
              <div>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {(surveys.reduce((acc, survey) => acc + (survey.responses?.length || 0), 0) / Math.max(surveys.length, 1)).toFixed(1)}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Ø Antworten
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
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">Alle Status</option>
              <option value="active">🟢 Aktiv</option>
              <option value="inactive">⚫ Inaktiv</option>
              <option value="draft">📝 Entwurf</option>
              <option value="completed">✅ Abgeschlossen</option>
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
            {/* Aktive Umfragen */}
            {activeSurveys.length > 0 && (
              <div className="mb-8">
                <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  🟢 Aktive Umfragen ({activeSurveys.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeSurveys.map((survey) => (
                    <SurveyCard
                      key={survey.id}
                      survey={survey}
                      onEdit={handleEditSurvey}
                      onDelete={handleDeleteSurvey}
                      onToggleStatus={handleToggleStatus}
                      isDarkMode={isDarkMode}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Inaktive Umfragen */}
            {inactiveSurveys.length > 0 && (
              <div className="mb-8">
                <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  📋 Weitere Umfragen ({inactiveSurveys.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {inactiveSurveys.map((survey) => (
                    <SurveyCard
                      key={survey.id}
                      survey={survey}
                      onEdit={handleEditSurvey}
                      onDelete={handleDeleteSurvey}
                      onToggleStatus={handleToggleStatus}
                      isDarkMode={isDarkMode}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredSurveys.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
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
                    onClick={handleCreateSurvey}
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
      </main>
    </div>
  );
}
