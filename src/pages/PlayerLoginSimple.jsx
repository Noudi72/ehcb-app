import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { API_BASE_URL } from "../config/api";
import Header from "../components/Header";
import BackButton from "../components/BackButton";

export default function PlayerLoginSimple() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("🔐 Spieler-Login Versuch:", formData.name);
      
      // Lade alle User
      const response = await fetch(`${API_BASE_URL}/users`);
      const users = await response.json();
      
      // Suche Spieler nach Name (case insensitive)
      const player = users.find(u => 
        u.role === "player" && 
        u.name?.toLowerCase().trim() === formData.name.toLowerCase().trim()
      );

      if (!player) {
        setError("Spieler nicht gefunden. Bitte überprüfe deinen Namen oder registriere dich zuerst.");
        setLoading(false);
        return;
      }

      if (player.status !== "approved") {
        setError("Dein Account ist noch nicht freigegeben. Bitte wende dich an einen Coach.");
        setLoading(false);
        return;
      }

      if (!player.active) {
        setError("Dein Account ist deaktiviert. Bitte wende dich an einen Coach.");
        setLoading(false);
        return;
      }

      // Passwort prüfen (einfacher Vergleich)
      if (player.password !== formData.password) {
        setError("Falsches Passwort. Bitte versuche es erneut.");
        setLoading(false);
        return;
      }

      console.log("✅ Spieler-Login erfolgreich:", player.name);
      
      // Login erfolgreich
      await login(player.username || player.name.toLowerCase().replace(/\s+/g, ""), "", player);
      navigate("/");
      
    } catch (error) {
      console.error("❌ Login-Fehler:", error);
      setError("Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className={`w-full max-w-md p-6 rounded-lg shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <BackButton />
          
          <h1 className={`text-2xl font-bold text-center mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            🏒 Spieler Anmeldung
          </h1>
          
          <p className={`text-center text-sm mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Melde dich mit deinem Namen und Passwort an.
          </p>

          {error && (
            <div className={`px-4 py-3 rounded mb-4 ${
              isDarkMode ? 'bg-red-900 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Dein Name *
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
              <label htmlFor="password" className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Passwort *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'
                }`}
                placeholder="Dein Passwort"
              />
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
              {loading ? "Anmelden..." : "Anmelden"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Noch nicht registriert?{" "}
              <button
                onClick={() => navigate("/player-login")}
                className="text-blue-600 hover:underline font-medium"
              >
                Hier registrieren
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
