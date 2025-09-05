import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
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
  const [filter, setFilter] = useState("all"); // all, active, inactive, pending, approved

  useEffect(() => {
    fetchUsers();
    fetchTeams();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersData = await usersAPI.getAll();
      setUsers(usersData.filter(u => u.role === "player")); // Nur Spieler anzeigen
    } catch (err) {
      setError("Fehler beim Laden der Benutzer");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const teamsData = await teamsAPI.getAll();
      // Sicherstellen, dass data ein Array ist
      setTeams(Array.isArray(teamsData) ? teamsData : []);
    } catch (err) {
      console.error("Fehler beim Laden der Teams:", err);
      // Fallback: Leeres Array setzen
      setTeams([]);
    }
  };

  const toggleUserActive = async (userId, currentStatus) => {
    try {
      const updatedUser = await usersAPI.update(userId, {
        active: !currentStatus
      });

      if (updatedUser) {
        // Aktualisiere die lokale Liste
        setUsers(users.map(u => 
          u.id === userId ? { ...u, active: !currentStatus } : u
        ));
      }
    } catch (err) {
      setError("Fehler beim Aktualisieren des Benutzerstatus: " + err.message);
    }
  };

  const deleteUser = async (userId, userName) => {
    if (!window.confirm(`Bist du sicher, dass du den Benutzer "${userName}" dauerhaft löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.`)) {
      return;
    }

    try {
      await usersAPI.delete(userId);

      // Entferne den Benutzer aus der lokalen Liste
      setUsers(users.filter(u => u.id !== userId));
      setError(""); // Clear any previous errors
    } catch (err) {
      setError("Fehler beim Löschen des Benutzers: " + err.message);
    }
  };

  const getTeamNames = (teamIds) => {
    if (!teamIds || !Array.isArray(teamIds)) {
      // Backward compatibility - falls noch das alte single team format verwendet wird
      if (typeof teamIds === 'string') {
        const team = Array.isArray(teams) ? teams.find(t => t.id === teamIds) : null;
        return team ? team.name : teamIds;
      }
      return "-";
    }
    
    return teamIds.map(teamId => {
      const team = Array.isArray(teams) ? teams.find(t => t.id === teamId) : null;
      return team ? team.name : teamId;
    }).join(", ");
  };

  const filteredUsers = users.filter(user => {
    if (filter === "active") return user.active && user.status === "approved";
    if (filter === "inactive") return !user.active || user.status === "rejected";
    if (filter === "pending") return user.status === "pending";
    if (filter === "approved") return user.status === "approved";
    return true;
  });

  const addTestUsers = async () => {
    const testUsers = [
      {
        name: 'Max Mustermann',
        username: 'max.mustermann',
        email: 'max@ehcb.ch',
        role: 'player',
        teams: ['U18-Elit'],
        active: true
      },
      {
        name: 'Anna Schmidt',
        username: 'anna.schmidt',
        email: 'anna@ehcb.ch',
        role: 'player',
        teams: ['U16-Elit'],
        active: true
      },
      {
        name: 'Tom Weber',
        username: 'tom.weber',
        email: 'tom@ehcb.ch',
        role: 'player',
        teams: ['U21-Elit'],
        active: false
      }
    ];

    try {
      setLoading(true);
      for (const testUser of testUsers) {
        await usersAPI.create(testUser);
      }
      await fetchUsers(); // Reload the user list
      setError(""); // Clear any errors
      alert('Testbenutzer wurden erfolgreich hinzugefügt!');
    } catch (err) {
      setError('Fehler beim Hinzufügen der Testbenutzer: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-[#0a2240]'}`}>Benutzer-Verwaltung</h1>
            <div className="flex gap-2">
              <button
                onClick={addTestUsers}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
              >
                + Testdaten hinzufügen
              </button>
              <BackButton to="/coach/dashboard" />
            </div>
          </div>

          {error && (
            <div className={`border px-4 py-3 rounded mb-4 ${
              isDarkMode ? 'bg-red-900 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {error}
            </div>
          )}

          {/* Filter */}
          <div className="mb-6">
            <div className="flex flex-wrap space-x-2 gap-y-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === "all" 
                    ? isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white'
                    : isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Alle ({users.length})
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === "pending" 
                    ? isDarkMode ? 'bg-yellow-600 text-white' : 'bg-yellow-600 text-white'
                    : isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Ausstehend ({users.filter(u => u.status === "pending").length})
              </button>
              <button
                onClick={() => setFilter("approved")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === "approved" 
                    ? isDarkMode ? 'bg-green-600 text-white' : 'bg-green-600 text-white'
                    : isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Genehmigt ({users.filter(u => u.status === "approved").length})
              </button>
              <button
                onClick={() => setFilter("active")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === "active" 
                    ? isDarkMode ? 'bg-green-600 text-white' : 'bg-green-600 text-white'
                    : isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Aktiv ({users.filter(u => u.active && u.status === "approved").length})
              </button>
              <button
                onClick={() => setFilter("inactive")}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  filter === "inactive" 
                    ? isDarkMode ? 'bg-red-600 text-white' : 'bg-red-600 text-white'
                    : isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Inaktiv ({users.filter(u => !u.active || u.status === "rejected").length})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-10">
              <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto ${
                isDarkMode ? 'border-blue-400' : 'border-[#0a2240]'
              }`}></div>
              <p className={`mt-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Lade Benutzer...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-10">
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Keine Benutzer gefunden.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className={`min-w-full divide-y ${
                isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
              }`}>
                <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Name
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Passwort
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Teams
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Trikotnummer
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Registriert
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Status
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${
                  isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
                }`}>
                  {filteredUsers.map((user) => {
                    const rowColor = user.status === "pending" ? (isDarkMode ? "bg-yellow-900" : "bg-yellow-50") : 
                                   user.status === "rejected" ? (isDarkMode ? "bg-red-900" : "bg-red-50") : 
                                   !user.active ? (isDarkMode ? "bg-gray-700" : "bg-gray-50") : "";
                    
                    return (
                      <tr key={user.id} className={rowColor}>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {user.name}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-mono ${
                          isDarkMode ? 'text-blue-300' : 'text-blue-600'
                        }`}>
                          {user.password || "-"}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          {getTeamNames(user.teams || user.team) || (user.status === "pending" ? "Noch nicht zugewiesen" : "-")}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          {user.playerNumber || "-"}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.status === "pending" 
                              ? isDarkMode ? "bg-yellow-800 text-yellow-200" : "bg-yellow-100 text-yellow-800"
                              : user.status === "approved" && user.active
                              ? isDarkMode ? "bg-green-800 text-green-200" : "bg-green-100 text-green-800"
                              : user.status === "rejected"
                              ? isDarkMode ? "bg-red-800 text-red-200" : "bg-red-100 text-red-800"
                              : isDarkMode ? "bg-gray-700 text-gray-200" : "bg-gray-100 text-gray-800"
                          }`}>
                            {user.status === "pending" ? "Ausstehend" : 
                             user.status === "approved" && user.active ? "Aktiv" :
                             user.status === "rejected" ? "Abgelehnt" :
                             user.active ? "Aktiv" : "Deaktiviert"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {user.status === "pending" ? (
                            <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Warten auf Genehmigung</span>
                          ) : (
                            <div className="flex flex-col space-y-1">
                              <button
                                onClick={() => toggleUserActive(user.id, user.active)}
                                className={`${
                                  user.active 
                                    ? isDarkMode ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-900"
                                    : isDarkMode ? "text-green-400 hover:text-green-300" : "text-green-600 hover:text-green-900"
                                } hover:underline text-left`}
                              >
                                {user.active ? "Deaktivieren" : "Aktivieren"}
                              </button>
                              <button
                                onClick={() => deleteUser(user.id, user.name)}
                                className={`hover:underline font-medium text-left ${
                                  isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900'
                                }`}
                                title="Benutzer dauerhaft löschen"
                              >
                                Löschen
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      
      
    </div>
  );
}
