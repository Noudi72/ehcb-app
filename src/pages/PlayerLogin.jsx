import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Header from "../components/Header";
import BackButton from "../components/BackButton";
import { API_BASE_URL } from "../config/api";

export default function PlayerLogin() {
  const [formData, setFormData] = useState({
    name: "",
    playerNumber: "",
    mainTeam: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { login } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const teams = [
    { id: "u16-elit", name: "U16-Elit" },
    { id: "u18-elit", name: "U18-Elit" },
    { id: "u21-elit", name: "U21-Elit" }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Erstelle einen eindeutigen Username basierend auf Namen
      const username = `${formData.name.toLowerCase().replace(/\s+/g, "")}`;
      
      // Prüfe ob User bereits existiert
      const response = await fetch(`${API_BASE_URL}/users`);
      const users = await response.json();
      const existingUser = users.find(u => u.username === username);

      if (existingUser) {
        if (existingUser.status === "pending") {
          setError("Du hast dich bereits registriert und wartest auf Genehmigung vom Coach.");
          setLoading(false);
          return;
        } else if (existingUser.status === "approved") {
          // User kann sich einloggen
          await login(user.username, "", existingUser);
          navigate("/");
          return;
        } else if (existingUser.status === "rejected") {
          setError("Deine Registrierung wurde abgelehnt. Bitte wende dich an den Coach.");
          setLoading(false);
          return;
        }
      }

      // Erstelle neue Registrierung
      const newUser = {
        username: username,
        name: formData.name,
        playerNumber: formData.playerNumber,
        mainTeam: formData.mainTeam, // Hauptteam vom Spieler gewählt
        role: "player",
        status: "pending", // Warten auf Coach-Genehmigung
        teams: [], // Wird vom Coach zugewiesen
        active: false, // Wird erst nach Genehmigung aktiviert
        createdAt: new Date().toISOString()
      };

      const createResponse = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newUser)
      });

      if (!createResponse.ok) {
        throw new Error("Fehler beim Erstellen der Registrierung");
      }

      setSuccess("Registrierung erfolgreich! Du wirst benachrichtigt, sobald ein Coach deine Registrierung genehmigt hat.");
      
      // Form zurücksetzen
      setFormData({
        name: "",
        playerNumber: "",
        mainTeam: ""
      });

    } catch (err) {
      setError("Fehler bei der Registrierung: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-[#f8fafc]'}`}>
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className={`w-full max-w-md rounded-lg shadow-md p-6 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-[#0a2240]'}`}>Spieler Registrierung</h1>
            <BackButton to="/" />
          </div>

          <div className="mb-4 text-center">
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Coach? <a href="/coach-login" className={`hover:underline font-medium ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`}>Hier anmelden</a>
            </p>
          </div>
          
          <p className={`mb-6 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Registriere dich für die Team-App.<br/>
            <span className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Ein Coach wird deine Registrierung prüfen und dir Teams zuweisen.</span>
          </p>

          {error && (
            <div className={`px-4 py-3 rounded mb-4 ${
              isDarkMode ? 'bg-red-900 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {error}
            </div>
          )}

          {success && (
            <div className={`px-4 py-3 rounded mb-4 ${
              isDarkMode ? 'bg-green-900 border-green-700 text-green-300' : 'bg-green-50 border-green-200 text-green-700'
            }`}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Vollständiger Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'
                }`}
                placeholder="z.B. Max Mustermann"
              />
            </div>

            <div>
              <label htmlFor="mainTeam" className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Hauptteam *
              </label>
              <select
                id="mainTeam"
                name="mainTeam"
                value={formData.mainTeam}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              >
                <option value="">Wähle dein Hauptteam</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Dein Hauptteam hilft dem Coach bei der Team-Zuweisung
              </p>
            </div>

            <div>
              <label htmlFor="playerNumber" className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Trikotnummer (optional)
              </label>
              <input
                type="number"
                id="playerNumber"
                name="playerNumber"
                value={formData.playerNumber}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'
                }`}
                placeholder="z.B. 7"
                min="1"
                max="99"
              />
            </div>

            <div className={`p-4 rounded-lg border ${
              isDarkMode ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-start">
                <svg className={`w-5 h-5 mt-0.5 mr-2 ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-500'
                }`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className={`text-sm font-medium ${
                    isDarkMode ? 'text-blue-300' : 'text-blue-800'
                  }`}>Nach der Registrierung:</p>
                  <ul className={`text-sm mt-1 space-y-1 ${
                    isDarkMode ? 'text-blue-200' : 'text-blue-700'
                  }`}>
                    <li>• Ein Coach prüft deine Anmeldung</li>
                    <li>• Du wirst den passenden Teams zugewiesen</li>
                    <li>• Du erhältst Zugang zur App nach Genehmigung</li>
                  </ul>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded-md transition-colors disabled:opacity-50 ${
                isDarkMode
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-[#0a2240] text-white hover:bg-[#083056]'
              }`}
            >
              {loading ? "Wird registriert..." : "Registrierung absenden"}
            </button>
          </form>
        </div>
      </main>
      
      
    </div>
  );
}
