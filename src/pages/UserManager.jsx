import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Header from "../components/Header";
import BackButton from "../components/BackButton";
import { users as usersAPI, teams as teamsAPI } from "../config/supabase-api";

export default function UserManager() {
  const { user, isCoach } = useAuth();
  const { isDarkMode } = useTheme();
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState("all");
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchTeams();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersData = await usersAPI.getAll();
      setUsers(usersData.filter(u => u.role === "player"));
    } catch (err) {
      setError("Fehler beim Laden der Spieler");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const teamsData = await teamsAPI.getAll();
      setTeams(Array.isArray(teamsData) ? teamsData : []);
    } catch (err) {
      console.error("Fehler beim Laden der Teams:", err);
      setTeams([]);
    }
  };

  const showSuccess = (message) => {
    setSuccess(message);
    setError("");
    setTimeout(() => setSuccess(""), 5000);
  };

  const showError = (message) => {
    setError(message);
    setSuccess("");
  };

  const toggleUserActive = async (userId, currentStatus) => {
    try {
      const updatedUser = await usersAPI.update(userId, {
        active: !currentStatus
      });

      if (updatedUser) {
        setUsers(users.map(u => 
          u.id === userId ? { ...u, active: !currentStatus } : u
        ));
        showSuccess(`Spieler wurde ${!currentStatus ? 'aktiviert' : 'deaktiviert'}`);
      }
    } catch (err) {
      showError("Fehler beim Aktualisieren des Status: " + err.message);
    }
  };

  const deleteUser = async (userId, userName) => {
    if (!window.confirm(`Bist du sicher, dass du "${userName}" dauerhaft löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.`)) {
      return;
    }

    try {
      await usersAPI.delete(userId);
      setUsers(users.filter(u => u.id !== userId));
      showSuccess(`Spieler "${userName}" wurde gelöscht`);
    } catch (err) {
      showError("Fehler beim Löschen: " + err.message);
    }
  };

  const startEdit = (player) => {
    setEditingUser({
      id: player.id,
      name: player.name,
      username: player.username,
      teams: player.teams || [],
      active: player.active,
      status: player.status || "approved"
    });
    setShowEditModal(true);
  };

  const saveUser = async () => {
    if (!editingUser.name.trim() || !editingUser.username.trim()) {
      showError("Name und Benutzername sind erforderlich");
      return;
    }

    try {
      const updatedUser = await usersAPI.update(editingUser.id, {
        name: editingUser.name,
        username: editingUser.username,
        teams: editingUser.teams,
        active: editingUser.active,
        status: editingUser.status
      });

      if (updatedUser) {
        setUsers(users.map(u => 
          u.id === editingUser.id ? { ...u, ...editingUser } : u
        ));
        showSuccess("Spieler wurde erfolgreich aktualisiert");
        setShowEditModal(false);
        setEditingUser(null);
      }
    } catch (err) {
      showError("Fehler beim Speichern: " + err.message);
    }
  };

  const filteredUsers = users.filter(user => {
    if (filter === "active") return user.active && user.status === "approved";
    if (filter === "inactive") return !user.active || user.status === "rejected";
    if (filter === "pending") return user.status === "pending";
    if (filter === "approved") return user.status === "approved";
    return true;
  });

  if (!user || !isCoach) {
    return (
      <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-[#f8fafc]'}`}>
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className={`w-full max-w-3xl rounded-lg shadow p-6 text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h1 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>Zugriff verweigert</h1>
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : ''}`}>Du musst als Coach angemeldet sein, um auf diese Seite zuzugreifen.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-[#f8fafc]'}`}>
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className={`shadow-md rounded-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-[#0a2240]'}`}>👥 Spielerverwaltung</h1>
              <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Verwalte Spieler, bearbeite Teams und kontrolliere den Zugang (ohne E-Mail)
              </p>
            </div>
            <BackButton to="/coach/dashboard" />
          </div>

          {success && (
            <div className={`border px-4 py-3 rounded mb-4 ${
              isDarkMode ? 'bg-green-900 border-green-700 text-green-300' : 'bg-green-50 border-green-200 text-green-700'
            }`}>
              ✅ {success}
            </div>
          )}

          {error && (
            <div className={`border px-4 py-3 rounded mb-4 ${
              isDarkMode ? 'bg-red-900 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              ❌ {error}
            </div>
          )}

          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "all" 
                    ? 'bg-blue-600 text-white' 
                    : isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🔵 Alle ({users.length})
              </button>
              <button
                onClick={() => setFilter("active")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "active" 
                    ? 'bg-green-600 text-white' 
                    : isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ✅ Aktiv ({users.filter(u => u.active && u.status === "approved").length})
              </button>
              <button
                onClick={() => setFilter("inactive")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "inactive" 
                    ? 'bg-red-600 text-white' 
                    : isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ❌ Inaktiv ({users.filter(u => !u.active || u.status === "rejected").length})
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "pending" 
                    ? 'bg-yellow-600 text-white' 
                    : isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ⏳ Wartend ({users.filter(u => u.status === "pending").length})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Lade Spieler...
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Keine Spieler gefunden
              </h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {filter === "all" ? "Es sind noch keine Spieler registriert." : `Keine Spieler mit dem Filter "${filter}" gefunden.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((player) => (
                <div 
                  key={player.id}
                  className={`border rounded-lg p-6 hover:shadow-lg transition-shadow ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                        player.active && player.status === "approved" ? 'bg-green-500' : 
                        player.status === "pending" ? 'bg-yellow-500' : 'bg-red-500'
                      }`}>
                        {player.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {player.name}
                        </h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          @{player.username}
                        </p>
                      </div>
                    </div>
                    
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      player.active && player.status === "approved" 
                        ? 'bg-green-100 text-green-800' 
                        : player.status === "pending"
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {player.active && player.status === "approved" ? "Aktiv" : 
                       player.status === "pending" ? "Wartend" : "Inaktiv"}
                    </span>
                  </div>

                  <div className="mb-4">
                    <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Teams:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {player.teams && player.teams.length > 0 ? (
                        player.teams.map((teamId, index) => {
                          const team = teams.find(t => t.id === teamId);
                          return (
                            <span 
                              key={index}
                              className={`px-2 py-1 rounded text-xs ${
                                isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {team?.name || teamId}
                            </span>
                          );
                        })
                      ) : (
                        <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                          Kein Team zugewiesen
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEdit(player)}
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
                    >
                      ✏️ Bearbeiten
                    </button>
                    <button
                      onClick={() => toggleUserActive(player.id, player.active)}
                      className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                        player.active 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {player.active ? '⏸️' : '▶️'}
                    </button>
                    <button
                      onClick={() => deleteUser(player.id, player.name)}
                      className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm font-medium transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showEditModal && editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`max-w-md w-full rounded-lg p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Spieler bearbeiten
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Name *
                  </label>
                  <input
                    type="text"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Benutzername * (für Login, ohne E-Mail)
                  </label>
                  <input
                    type="text"
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="z.B. max.muster"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Teams
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {teams.map((team) => (
                      <label key={team.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editingUser.teams.includes(team.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditingUser({
                                ...editingUser,
                                teams: [...editingUser.teams, team.id]
                              });
                            } else {
                              setEditingUser({
                                ...editingUser,
                                teams: editingUser.teams.filter(t => t !== team.id)
                              });
                            }
                          }}
                          className="mr-2"
                        />
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                          {team.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Status
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editingUser.active}
                        onChange={(e) => setEditingUser({...editingUser, active: e.target.checked})}
                        className="mr-2"
                      />
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Aktiv</span>
                    </label>
                    <select
                      value={editingUser.status}
                      onChange={(e) => setEditingUser({...editingUser, status: e.target.value})}
                      className={`px-3 py-1 border rounded ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="approved">Genehmigt</option>
                      <option value="pending">Wartend</option>
                      <option value="rejected">Abgelehnt</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                  className={`px-4 py-2 rounded transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                      : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                  }`}
                >
                  Abbrechen
                </button>
                <button
                  onClick={saveUser}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                  Speichern
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
