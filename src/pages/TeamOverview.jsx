import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Header from "../components/Header";
import BackButton from "../components/BackButton";
import { users, teams } from "../config/supabase-api";

export default function TeamOverview() {
  const { teamName } = useParams();
  const { user, isCoach } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTeams();
    fetchPlayers();
  }, [teamName]);

  const fetchTeams = async () => {
    try {
      const data = await teams.getAll();
      setTeams(data);
    } catch (err) {
      console.error("Fehler beim Laden der Teams:", err);
    }
  };

  const fetchPlayers = async () => {
    try {
      const data = await users.getAll();
      
      // Filtere Spieler für das aktuelle Team
      const teamPlayers = data.filter(user => {
        if (user.role !== "player" || !user.active) return false;
        
        // Prüfe sowohl neue teams Array als auch alte team Feld
        if (Array.isArray(user.teams)) {
          return user.teams.includes(teamName);
        } else if (user.team) {
          return user.team === teamName;
        }
        return false;
      });
      
      setPlayers(teamPlayers);
    } catch (err) {
      setError("Fehler beim Laden der Spieler");
    } finally {
      setLoading(false);
    }
  };

  const addPlayerToTeam = async (playerId, newTeamId) => {
    try {
      // Hole aktuelle Spielerdaten
      const player = await users.getById(playerId);
      
      let updatedTeams;
      if (Array.isArray(player.teams)) {
        // Füge Team hinzu, falls nicht bereits vorhanden
        updatedTeams = player.teams.includes(newTeamId) 
          ? player.teams 
          : [...player.teams, newTeamId];
      } else {
        // Konvertiere altes Format zu neuem Array-Format
        updatedTeams = player.team ? [player.team, newTeamId] : [newTeamId];
      }

      await users.update(playerId, {
        teams: updatedTeams
      });

      // Aktualisiere die lokale Liste
      fetchPlayers();
    } catch (err) {
      setError("Fehler beim Hinzufügen des Spielers: " + err.message);
    }
  };

  const removePlayerFromTeam = async (playerId) => {
    try {
      const player = await users.getById(playerId);
      
      let updatedTeams;
      if (Array.isArray(player.teams)) {
        updatedTeams = player.teams.filter(team => team !== teamName);
      } else {
        // Falls altes Format, entferne das Team komplett
        updatedTeams = [];
      }

      await users.update(playerId, {
        teams: updatedTeams
      });

      // Aktualisiere die lokale Liste
      fetchPlayers();
    } catch (err) {
      setError("Fehler beim Entfernen des Spielers: " + err.message);
    }
  };

  const getTeamDisplayName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : teamId;
  };

  const getPlayerTeams = (player) => {
    if (Array.isArray(player.teams)) {
      return player.teams.map(teamId => getTeamDisplayName(teamId)).join(", ");
    } else if (player.team) {
      return getTeamDisplayName(player.team);
    }
    return "Kein Team";
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
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-[#0a2240]'}`}>
              Team: {getTeamDisplayName(teamName)}
            </h1>
            <BackButton to="/coach/dashboard" />
          </div>

          {error && (
            <div className={`border px-4 py-3 rounded mb-4 ${isDarkMode ? 'bg-red-900/20 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}>
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-10">
              <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto ${isDarkMode ? 'border-blue-400' : 'border-[#0a2240]'}`}></div>
              <p className={`mt-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Lade Spieler...</p>
            </div>
          ) : players.length === 0 ? (
            <div className="text-center py-10">
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Keine Spieler in diesem Team gefunden.</p>
              <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Spieler können über die "Neue Registrierungen" diesem Team zugewiesen werden.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
                <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Name
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Trikotnummer
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Alle Teams
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Hauptteam
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Registriert
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
                  {players.map((player) => (
                    <tr key={player.id}>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {player.name}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        {player.playerNumber || "-"}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        {getPlayerTeams(player)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {player.mainTeam ? (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
                            {getTeamDisplayName(player.mainTeam)}
                          </span>
                        ) : (
                          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-400'}>Nicht gesetzt</span>
                        )}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                        {new Date(player.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              addPlayerToTeam(player.id, e.target.value);
                              e.target.value = "";
                            }
                          }}
                          className={`border rounded px-2 py-1 text-xs ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'border-gray-300 text-blue-600 hover:text-blue-900'}`}
                        >
                          <option value="">Team hinzufügen</option>
                          {teams.filter(team => {
                            const playerTeams = Array.isArray(player.teams) ? player.teams : (player.team ? [player.team] : []);
                            return !playerTeams.includes(team.id);
                          }).map(team => (
                            <option key={team.id} value={team.id}>
                              {team.name}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => removePlayerFromTeam(player.id)}
                          className={`hover:underline ${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900'}`}
                        >
                          Entfernen
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      
      
    </div>
  );
}
