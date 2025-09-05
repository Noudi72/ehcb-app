import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import Header from "../components/Header";
import BackButton from "../components/BackButton";
import { users } from "../config/supabase-api";

export default function PlayerLogin() {
  const { t } = useLanguage();
  const [playerName, setPlayerName] = useState("");
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const availableTeams = [
    { id: "u16-elit", name: "U16-Elit" },
    { id: "u18-elit", name: "U18-Elit" },
    { id: "u21-elit", name: "U21-Elit" }
  ];

  const handleTeamChange = (teamId) => {
    setSelectedTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!playerName.trim()) {
      setError("Bitte geben Sie Ihren Namen ein.");
      return;
    }

    if (selectedTeams.length === 0) {
      setError("Bitte wählen Sie mindestens ein Team aus.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Prüfe ob Spieler bereits existiert
      const existingUser = await users.getByName(playerName);
      
      if (existingUser) {
        // Spieler existiert bereits - aktualisiere Teams und logge ein
        const updatedUser = await users.update(existingUser.id, {
          teams: selectedTeams,
          last_login: new Date().toISOString()
        });
        await login(updatedUser || existingUser);
        navigate("/");
      } else {
        // Neuen Spieler erstellen und direkt einloggen
        const newUser = await users.create({
          username: playerName, // username für Supabase-Kompatibilität
          name: playerName,     // name für Anzeige
          role: "player",
          teams: selectedTeams
        });
        
        await login(newUser);
        navigate("/");
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      setError("Fehler beim Anmelden. Bitte versuchen Sie es erneut.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header />
      <BackButton />
      
      <main className="max-w-md mx-auto pt-20 px-4">
        <div className={`p-6 rounded-lg shadow-lg ${
          isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
        }`}>
          <h1 className={`text-2xl font-bold mb-6 text-center ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            🏒 Spieler Anmeldung
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="playerName" className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Spielername *
              </label>
              <input
                type="text"
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'
                }`}
                placeholder="z.B. testspieler2"
                disabled={loading}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Teams * (mindestens eines auswählen)
              </label>
              <div className="grid grid-cols-1 gap-2">
                {availableTeams.map(team => (
                  <label
                    key={team.id}
                    className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${
                      selectedTeams.includes(team.id)
                        ? isDarkMode
                          ? 'bg-blue-900 border-blue-600 text-blue-200'
                          : 'bg-blue-50 border-blue-500 text-blue-700'
                        : isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTeams.includes(team.id)}
                      onChange={() => handleTeamChange(team.id)}
                      disabled={loading}
                      className="mr-3"
                    />
                    <span className="font-medium">{team.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
              } text-white`}
            >
              {loading ? 'Anmelden...' : 'Anmelden'}
            </button>
          </form>

          <div className={`mt-6 p-4 rounded-md ${
            isDarkMode ? 'bg-gray-700' : 'bg-blue-50'
          }`}>
            <h3 className={`font-medium mb-2 ${
              isDarkMode ? 'text-blue-300' : 'text-blue-800'
            }`}>
              ℹ️ So einfach geht's:
            </h3>
            <ul className={`text-sm space-y-1 ${
              isDarkMode ? 'text-gray-300' : 'text-blue-700'
            }`}>
              <li>• Namen eingeben</li>
              <li>• Team(s) auswählen</li>
              <li>• Sofort Zugang zur App</li>
              <li>• Umfragen werden automatisch an Ihre Teams gesendet</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
