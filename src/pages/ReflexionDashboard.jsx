import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useReflexion } from "../context/ReflexionContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNotification } from "../context/NotificationContext";
import Header from "../components/Header";
import BackButton from "../components/BackButton";
import { API_BASE_URL } from "../config/api";


export default function ReflexionDashboard() {
  const { reflections, fetchReflections, loading, error } = useReflexion();
  const { logout } = useAuth();
  const { isDarkMode } = useTheme();
  const { sendNotification } = useNotification();
  const navigate = useNavigate();
  const [filterName, setFilterName] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  useEffect(() => {
    // Nur einmal beim Laden der Komponente ausführen
    fetchReflections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const deleteReflection = async (reflectionId, playerName) => {
    if (!window.confirm(`Bist du sicher, dass du die Reflexion von "${playerName}" dauerhaft löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/reflections/${reflectionId}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Fehler beim Löschen der Reflexion");
      }

      // Aktualisiere die Reflexionen, indem wir sie neu laden
      fetchReflections();
    } catch (err) {
      console.error("Fehler beim Löschen der Reflexion:", err);
      // Optionally show error message to user
    }
  };

  const sendReflectionReminder = async () => {
    try {
      await sendNotification({
        title: "Spielerreflexion ausfüllen",
        message: "Vergiss nicht, deine Spielerreflexion auszufüllen! Dein Feedback hilft uns allen, besser zu werden. �⭐",
        type: 'reflection_reminder',
        targetAudience: 'team_members',
        urgent: false
      });

      setSuccessMessage("Push-Benachrichtigung wurde an alle Spieler gesendet!");
      setTimeout(() => setSuccessMessage(""), 4000);
      setShowNotificationModal(false);
    } catch (error) {
      console.error("Fehler beim Senden der Push-Benachrichtigung:", error);
      alert("Fehler beim Senden der Benachrichtigung");
    }
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 4000);
  };
  
  // Filter der Reflexionen
  const filteredReflections = reflections.filter(reflexion => {
    const nameMatch = filterName ? 
      reflexion.name.toLowerCase().includes(filterName.toLowerCase()) : 
      true;
    
    const dateMatch = filterDate ? 
      new Date(reflexion.date).toLocaleDateString().includes(filterDate) : 
      true;
    
    return nameMatch && dateMatch;
  });
  
  // Sortierung nach Datum (neueste zuerst)
  const sortedReflections = [...filteredReflections].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <div className={`min-h-screen flex flex-col font-sans ${isDarkMode ? 'bg-gray-900' : 'bg-[#f8fafc]'}`}>
      <Header />
      <BackButton to="/coach/dashboard" />
      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <div className={`w-full max-w-4xl rounded-2xl shadow-xl border p-6 ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex justify-between items-center mb-6">
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-[#0a2240]'}`}>Spielerreflexionen Dashboard</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowNotificationModal(true)}
                className={`px-4 py-2 rounded-md hover:focus:outline-none flex items-center ${
                  isDarkMode ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
                title="Erinnerung an alle Spieler senden"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2L3 7v11a1 1 0 001 1h3v-7h6v7h3a1 1 0 001-1V7l-7-5z"/>
                </svg>
                📲 Erinnerung senden
              </button>
              <Link
                to="/coach/statistics"
                className={`px-4 py-2 rounded-md hover:focus:outline-none flex items-center ${
                  isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-[#0a2240] text-white hover:bg-[#081a32]'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                </svg>
                Statistiken
              </Link>
              <button
                onClick={() => fetchReflections()}
                className={`px-4 py-2 rounded-md hover:focus:outline-none ${
                  isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-[#0a2240] text-white hover:bg-[#081a32]'
                }`}
              >
                Aktualisieren
              </button>
              <button
                onClick={handleLogout}
                className={`px-4 py-2 rounded-md hover:focus:outline-none ${
                  isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Abmelden
              </button>
            </div>
          </div>
          
          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              ✅ {successMessage}
            </div>
          )}
          
          {error && (
            <div className={`mb-4 px-4 py-3 rounded relative ${
              isDarkMode ? 'bg-red-900 border-red-700 text-red-300' : 'bg-red-100 border-red-400 text-red-700'
            }`}>
              {error}
            </div>
          )}
          
          <div className={`p-4 mb-6 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Nach Namen filtern
                </label>
                <input
                  type="text"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  placeholder="Spielername eingeben..."
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    isDarkMode ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Nach Datum filtern
                </label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-10">
              <div className={`spinner-border ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} role="status">
                <span className="sr-only">Wird geladen...</span>
              </div>
            </div>
          ) : sortedReflections.length === 0 ? (
            <div className={`text-center py-10 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Keine Reflexionsdaten gefunden.
            </div>
          ) : (
            <div className="space-y-4">
              {sortedReflections.map((reflexion) => (
                <div key={reflexion.id} className={`border rounded-lg p-4 transition ${
                  isDarkMode ? 'border-gray-600 bg-gray-700 hover:bg-gray-600' : 'border-gray-200 hover:bg-gray-50'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{reflexion.name}</h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(reflexion.date).toLocaleDateString()} - {reflexion.type}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteReflection(reflexion.id, reflexion.name)}
                      className={`hover:underline text-sm font-medium ${
                        isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900'
                      }`}
                      title="Reflexion löschen"
                    >
                      Löschen
                    </button>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Stimmung: {reflexion.mood}/10</p>
                      <div className={`w-full rounded-full h-2 mt-1 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${reflexion.mood * 10}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Energie-Level: {reflexion.energy}/10</p>
                      <div className={`w-full rounded-full h-2 mt-1 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${reflexion.energy * 10}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Intensität: {reflexion.intensity}/10</p>
                      <div className={`w-full rounded-full h-2 mt-1 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{ width: `${reflexion.intensity * 10}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div>
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Leistungsbeurteilung: {reflexion.performance}/10</p>
                      <div className={`w-full rounded-full h-2 mt-1 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                        <div 
                          className="bg-yellow-500 h-2 rounded-full" 
                          style={{ width: `${reflexion.performance * 10}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Kommentar:</p>
                    <p className={`text-sm mt-1 p-2 border rounded ${
                      isDarkMode ? 'bg-gray-600 border-gray-500 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}>
                      {reflexion.comment || "Kein Kommentar abgegeben."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      {/* Push Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`max-w-md w-full rounded-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                📲 Reflexions-Erinnerung senden
              </h3>
              <button
                onClick={() => setShowNotificationModal(false)}
                className={`p-1 rounded ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                ❌
              </button>
            </div>

            <div className="mb-6">
              <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Möchtest du eine Push-Benachrichtigung an alle Spieler senden, um sie an das Ausfüllen ihrer Reflexion zu erinnern?
              </p>
              
              <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Nachricht:
                </p>
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  "Vergiss nicht, deine Spielerreflexion auszufüllen! Dein Feedback hilft uns allen, besser zu werden. �⭐"
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowNotificationModal(false)}
                className={`px-4 py-2 text-sm font-medium rounded-lg ${
                  isDarkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Abbrechen
              </button>
              <button
                onClick={sendReflectionReminder}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                📲 Erinnerung senden
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
