import React, { useState, useEffect } from "react";
import { useUmfrage } from "../context/UmfrageContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Header from "../components/Header";
import BackButton from "../components/BackButton";

// Survey Status Badge Component
const StatusBadge = ({ status, isDarkMode }) => {
  const statusConfig = {
    'draft': {
      label: 'Entwurf',
      icon: '📝',
      color: isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'
    },
    'active': {
      label: 'Aktiv',
      icon: '✅',
      color: isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'
    },
    'scheduled': {
      label: 'Geplant',
      icon: '📅',
      color: isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'
    },
    'completed': {
      label: 'Abgeschlossen',
      icon: '🏁',
      color: isDarkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-800'
    },
    'closed': {
      label: 'Geschlossen',
      icon: '🔒',
      color: isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800'
    }
  };

  const config = statusConfig[status] || statusConfig.draft;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  );
};

// Survey Priority Badge
const PriorityBadge = ({ priority, isDarkMode }) => {
  const priorityConfig = {
    'low': {
      label: 'Niedrig',
      icon: '🟢',
      color: isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'
    },
    'medium': {
      label: 'Mittel',
      icon: '🟡',
      color: isDarkMode ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800'
    },
    'high': {
      label: 'Hoch',
      icon: '🔴',
      color: isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800'
    }
  };

  const config = priorityConfig[priority] || priorityConfig.medium;

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      {config.icon} {config.label}
    </span>
  );
};

// Survey Card Component
function SurveyCard({ survey, onEdit, onView, onDelete, onDuplicate, onToggleStatus, isDarkMode }) {
  const [showActions, setShowActions] = useState(false);
  
  const getResponseRate = () => {
    if (!survey.totalRecipients || survey.totalRecipients === 0) return 0;
    return Math.round((survey.responseCount / survey.totalRecipients) * 100);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <StatusBadge status={survey.status} isDarkMode={isDarkMode} />
            {survey.priority && (
              <PriorityBadge priority={survey.priority} isDarkMode={isDarkMode} />
            )}
          </div>
          
          <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {survey.title}
          </h3>
          
          {survey.description && (
            <p className={`text-sm mb-3 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {survey.description}
            </p>
          )}
        </div>
        
        {showActions && (
          <div className="flex flex-col space-y-1 ml-4">
            <button
              onClick={() => onView(survey)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-blue-900 text-blue-300 hover:bg-blue-800' 
                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              }`}
              title="Anzeigen"
            >
              👁️ Anzeigen
            </button>
            
            <button
              onClick={() => onEdit(survey)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-green-900 text-green-300 hover:bg-green-800' 
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
              }`}
              title="Bearbeiten"
            >
              ✏️ Bearbeiten
            </button>
            
            <button
              onClick={() => onDuplicate(survey)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-yellow-900 text-yellow-300 hover:bg-yellow-800' 
                  : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
              }`}
              title="Duplizieren"
            >
              📋 Kopieren
            </button>
            
            <button
              onClick={() => onDelete(survey)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-red-900 text-red-300 hover:bg-red-800' 
                  : 'bg-red-100 text-red-800 hover:bg-red-200'
              }`}
              title="Löschen"
            >
              🗑️ Löschen
            </button>
          </div>
        )}
      </div>

      {/* Survey Info Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            📊 Fragen
          </p>
          <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {survey.questions?.length || 0}
          </p>
        </div>
        
        <div>
          <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            👥 Antworten
          </p>
          <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {survey.responseCount || 0}
          </p>
        </div>
        
        <div>
          <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            📈 Rücklaufquote
          </p>
          <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {getResponseRate()}%
          </p>
        </div>
        
        <div>
          <p className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            📅 Erstellt
          </p>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {formatDate(survey.createdAt)}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      {survey.totalRecipients > 0 && (
        <div className="mb-4">
          <div className={`w-full bg-gray-200 rounded-full h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getResponseRate()}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-200">
        <span>
          {survey.endDate && survey.status === 'active' && (
            <>⏰ Endet: {formatDate(survey.endDate)}</>
          )}
          {survey.status === 'draft' && '📝 In Bearbeitung'}
          {survey.status === 'completed' && '✅ Abgeschlossen'}
        </span>
        <span>
          ID: {survey.id?.slice(-6) || 'XXXXXX'}
        </span>
      </div>
    </div>
  );
}

// Survey Form Modal (simplified version)
function SurveyFormModal({ survey, isOpen, onClose, onSave, isDarkMode }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'draft',
    priority: 'medium'
  });

  useEffect(() => {
    if (survey) {
      setFormData({
        title: survey.title || '',
        description: survey.description || '',
        status: survey.status || 'draft',
        priority: survey.priority || 'medium'
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'draft',
        priority: 'medium'
      });
    }
  }, [survey, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onSave({
        ...survey,
        ...formData,
        updatedAt: new Date().toISOString()
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`max-w-lg w-full rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {survey ? '✏️ Umfrage bearbeiten' : '➕ Neue Umfrage'}
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
                📝 Titel *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="z.B. Trainings-Feedback Woche 12"
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                📄 Beschreibung
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Kurze Beschreibung der Umfrage..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  📊 Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="draft">📝 Entwurf</option>
                  <option value="active">✅ Aktiv</option>
                  <option value="scheduled">📅 Geplant</option>
                  <option value="completed">🏁 Abgeschlossen</option>
                  <option value="closed">🔒 Geschlossen</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  🎯 Priorität
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="low">🟢 Niedrig</option>
                  <option value="medium">🟡 Mittel</option>
                  <option value="high">🔴 Hoch</option>
                </select>
              </div>
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
              {survey ? '💾 Aktualisieren' : '✨ Erstellen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SurveyManager() {
  const { surveys = [], createSurvey, updateSurvey, deleteSurvey, fetchSurveys } = useUmfrage();
  const { user, isCoach } = useAuth();
  const { isDarkMode } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
  }, [isCoach, fetchSurveys]);

  // Filter und Suche
  const filteredSurveys = surveys.filter(survey => {
    const matchesSearch = survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (survey.description && survey.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;
    
    if (filterStatus === "all") return true;
    return survey.status === filterStatus;
  });

  // Gruppierung nach Status
  const surveysByStatus = {
    active: filteredSurveys.filter(s => s.status === 'active'),
    draft: filteredSurveys.filter(s => s.status === 'draft'),
    completed: filteredSurveys.filter(s => s.status === 'completed'),
    scheduled: filteredSurveys.filter(s => s.status === 'scheduled'),
    closed: filteredSurveys.filter(s => s.status === 'closed')
  };

  const handleCreateSurvey = () => {
    setSelectedSurvey(null);
    setShowModal(true);
  };

  const handleEditSurvey = (survey) => {
    setSelectedSurvey(survey);
    setShowModal(true);
  };

  const handleViewSurvey = (survey) => {
    // Navigate to survey details or edit view
    window.location.href = `/coach/survey/${survey.id}`;
  };

  const handleDuplicateSurvey = (survey) => {
    setSelectedSurvey({
      ...survey,
      id: undefined,
      title: `${survey.title} (Kopie)`,
      status: 'draft'
    });
    setShowModal(true);
  };

  const handleDeleteSurvey = async (survey) => {
    if (window.confirm(`Möchtest du die Umfrage "${survey.title}" wirklich löschen?`)) {
      try {
        await deleteSurvey(survey.id);
        await fetchSurveys();
      } catch (err) {
        setError("Fehler beim Löschen der Umfrage");
        console.error(err);
      }
    }
  };

  const handleSaveSurvey = async (surveyData) => {
    try {
      if (surveyData.id) {
        await updateSurvey(surveyData.id, surveyData);
      } else {
        await createSurvey(surveyData);
      }
      setShowModal(false);
      await fetchSurveys();
    } catch (err) {
      setError("Fehler beim Speichern der Umfrage");
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
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                📊 Umfrage-Center
              </h1>
              <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Verwalte und organisiere alle Team-Umfragen
              </p>
            </div>
            
            <button
              onClick={handleCreateSurvey}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ➕ Neue Umfrage
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {Object.entries(surveysByStatus).map(([status, statusSurveys]) => {
            const statusConfig = {
              active: { label: 'Aktiv', icon: '✅', color: isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700' },
              draft: { label: 'Entwürfe', icon: '📝', color: isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700' },
              completed: { label: 'Fertig', icon: '🏁', color: isDarkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-700' },
              scheduled: { label: 'Geplant', icon: '📅', color: isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700' },
              closed: { label: 'Beendet', icon: '🔒', color: isDarkMode ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-700' }
            };
            
            const config = statusConfig[status];
            
            return (
              <div key={status} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${config.color} mr-3`}>
                    {config.icon}
                  </div>
                  <div>
                    <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {statusSurveys.length}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {config.label}
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
              <option value="active">✅ Aktive</option>
              <option value="draft">📝 Entwürfe</option>
              <option value="scheduled">📅 Geplante</option>
              <option value="completed">🏁 Abgeschlossene</option>
              <option value="closed">🔒 Geschlossene</option>
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
                onView={handleViewSurvey}
                onDelete={handleDeleteSurvey}
                onDuplicate={handleDuplicateSurvey}
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

      {/* Survey Form Modal */}
      <SurveyFormModal
        survey={selectedSurvey}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveSurvey}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
                <h2 className={`ml-3 text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Umfrage erstellen</h2>
              </div>
              <p className={`mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Neue Umfragen mit ausgewählten Fragen zusammenstellen</p>
              <div className="flex justify-end">
                <span className="text-blue-600 text-sm font-medium group-hover:underline">Erstellen »</span>
              </div>
            </div>
          </Link>
          
          {/* Fragen verwalten */}
          <Link to="/coach/questions" className="group">
            <div className={`rounded-lg shadow-md p-6 hover:shadow-lg transition-all border-b-4 border-transparent group-hover:border-purple-500 ${
              isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white'
            }`}>
              <div className="flex items-center mb-4">
                <div className={`rounded-full p-3 group-hover:bg-purple-200 transition-colors ${
                  isDarkMode ? 'bg-purple-900 group-hover:bg-purple-800' : 'bg-purple-100'
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className={`ml-3 text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Fragen verwalten</h2>
              </div>
              <p className={`mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Eigene Fragen erstellen, bearbeiten und kategorisieren</p>
              <div className="flex justify-end">
                <span className="text-purple-600 text-sm font-medium group-hover:underline">Verwalten »</span>
              </div>
            </div>
          </Link>
          
          {/* Aktive Umfragen */}
          <Link to="/coach/active-surveys" className="group">
            <div className={`rounded-lg shadow-md p-6 hover:shadow-lg transition-all border-b-4 border-transparent group-hover:border-green-500 ${
              isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white'
            }`}>
              <div className="flex items-center mb-4">
                <div className={`rounded-full p-3 group-hover:bg-green-200 transition-colors ${
                  isDarkMode ? 'bg-green-900 group-hover:bg-green-800' : 'bg-green-100'
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className={`ml-3 text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Aktive Umfragen</h2>
              </div>
              <p className={`mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Umfragen aktivieren, deaktivieren und Sichtbarkeit steuern</p>
              <div className="flex justify-end">
                <span className="text-green-600 text-sm font-medium group-hover:underline">Aktivieren »</span>
              </div>
            </div>
          </Link>
          
          {/* Umfrageergebnisse ansehen */}
          <Link to="/umfrage-results" className="group">
            <div className={`rounded-lg shadow-md p-6 hover:shadow-lg transition-all border-b-4 border-transparent group-hover:border-amber-500 ${
              isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white'
            }`}>
              <div className="flex items-center mb-4">
                <div className={`rounded-full p-3 group-hover:bg-amber-200 transition-colors ${
                  isDarkMode ? 'bg-amber-900 group-hover:bg-amber-800' : 'bg-amber-100'
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h2 className={`ml-3 text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Umfrageergebnisse</h2>
              </div>
              <p className={`mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Alle Umfrageergebnisse mit detaillierten Statistiken ansehen</p>
              <div className="flex justify-end">
                <span className="text-amber-600 text-sm font-medium group-hover:underline">Ansehen »</span>
              </div>
            </div>
          </Link>
          
          {/* Vorlagen verwalten */}
          <Link to="/coach/survey-templates" className="group">
            <div className={`rounded-lg shadow-md p-6 hover:shadow-lg transition-all border-b-4 border-transparent group-hover:border-indigo-500 ${
              isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white'
            }`}>
              <div className="flex items-center mb-4">
                <div className={`rounded-full p-3 group-hover:bg-indigo-200 transition-colors ${
                  isDarkMode ? 'bg-indigo-900 group-hover:bg-indigo-800' : 'bg-indigo-100'
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                </div>
                <h2 className={`ml-3 text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Vorlagen</h2>
              </div>
              <p className={`mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Wiederverwendbare Umfragevorlagen erstellen und speichern</p>
              <div className="flex justify-end">
                <span className="text-indigo-600 text-sm font-medium group-hover:underline">Vorlagen »</span>
              </div>
            </div>
          </Link>
          
          {/* Dashboard */}
          <Link to="/coach/dashboard" className="group">
            <div className={`rounded-lg shadow-md p-6 hover:shadow-lg transition-all border-b-4 border-transparent group-hover:border-red-500 ${
              isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white'
            }`}>
              <div className="flex items-center mb-4">
                <div className={`rounded-full p-3 group-hover:bg-red-200 transition-colors ${
                  isDarkMode ? 'bg-red-900 group-hover:bg-red-800' : 'bg-red-100'
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className={`ml-3 text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Dashboard</h2>
              </div>
              <p className={`mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Übersicht über alle Umfragen und Teilnahmeraten</p>
              <div className="flex justify-end">
                <span className="text-red-600 text-sm font-medium group-hover:underline">Dashboard öffnen »</span>
              </div>
            </div>
          </Link>
        </div>
        
        <div className={`p-6 rounded-lg border ${
          isDarkMode ? 'bg-blue-900 border-blue-700' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100'
        }`}>
          <h3 className={`text-lg font-semibold mb-2 flex items-center ${
            isDarkMode ? 'text-blue-300' : 'text-blue-800'
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Hinweise zur Umfrage-Verwaltung
          </h3>
          <ul className={`list-disc pl-5 space-y-2 ${
            isDarkMode ? 'text-blue-200' : 'text-gray-700'
          }`}>
            <li>Verwenden Sie <span className={`font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>Fragen verwalten</span>, um neue Fragen zu erstellen.</li>
            <li>Mit <span className={`font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>Umfrage erstellen</span> können Sie bestehende Fragen zu neuen Umfragen zusammenstellen.</li>
            <li>Umfragen sind erst sichtbar für Spieler, wenn Sie diese in <span className={`font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>Aktive Umfragen</span> aktivieren.</li>
            <li>Bei <span className={`font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>anonymen Umfragen</span> werden die Namen der Teilnehmer nicht mit den Antworten verknüpft.</li>
            <li>Sie können steuern, ob Spieler die Ergebnisse einer Umfrage sehen können.</li>
          </ul>
          
          <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-blue-600' : 'border-blue-200'}`}>
            <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>Neu in dieser Version:</h4>
            <ul className={`list-disc pl-5 space-y-1 ${isDarkMode ? 'text-blue-200' : 'text-gray-700'}`}>
              <li>Anonyme Umfragen für vertrauliches Feedback</li>
              <li>Detaillierte Statistiken für jede Frage</li>
              <li>Verbesserte Benutzeroberfläche für mehr Übersichtlichkeit</li>
            </ul>
          </div>
        </div>
      </main>
      
    </div>
  );
}
