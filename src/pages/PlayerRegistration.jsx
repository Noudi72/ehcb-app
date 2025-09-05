import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";
import { users } from "../config/supabase-api";
import Header from "../components/Header";
import BackButton from "../components/BackButton";

export default function PlayerRegistration() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    confirmPassword: "",
    team: "",
    jersey_number: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    setSuccess("");

    // Validation
    if (!formData.name.trim()) {
      setError("Bitte gib deinen vollständigen Namen ein");
      setLoading(false);
      return;
    }

    if (!formData.password || formData.password.length < 4) {
      setError("Passwort muss mindestens 4 Zeichen haben");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwörter stimmen nicht überein");
      setLoading(false);
      return;
    }

    try {
      console.log("📝 Spieler-Registrierung für:", formData.name);
      
      // Check if user already exists
      const allUsers = await users.getAll();
      const existingUser = allUsers.find(u => 
        u.name?.toLowerCase().trim() === formData.name.toLowerCase().trim()
      );

      if (existingUser) {
        setError("Ein Spieler mit diesem Namen existiert bereits. Bitte wähle einen anderen Namen oder melde dich an.");
        setLoading(false);
        return;
      }

            // Create new player (immediate access, no coach approval needed)
      const newUser = {
        name: formData.name.trim(),
        // password: formData.password, // Remove - column doesn't exist in Supabase
        role: "player",
        // status: "approved", // Remove - column doesn't exist in Supabase
        team: formData.team || "U18-Elit"
        // Remove jersey_number as it doesn't exist in Supabase schema
      };

      await users.create(newUser);

      setSuccess("Registrierung erfolgreich! Du kannst dich jetzt anmelden und die App nutzen.");
      
      // Clear form
      setFormData({
        name: "",
        password: "",
        confirmPassword: "",
        team: "",
        jersey_number: ""
      });

      // Auto-redirect after 3 seconds
      setTimeout(() => {
        navigate("/player-login");
      }, 3000);

    } catch (err) {
      console.error("❌ Registrierungsfehler:", err);
      setError("Fehler bei der Registrierung: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        
        <div className="max-w-md mx-auto mt-8">
          <div className={`p-8 rounded-lg shadow-lg ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
            <h1 className="text-2xl font-bold text-center mb-6">
              Spieler Registrierung
            </h1>
            
            <p className={`text-sm text-center mb-6 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              Registriere dich für die Team-App.
              <br />
              Nach der Registrierung kannst du sofort die App nutzen.
            </p>

            {error && (
              <div className="bg-red-500 text-white p-3 rounded mb-4 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-500 text-white p-3 rounded mb-4 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Vollständiger Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="z.B. Max Mustermann"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Passwort wählen *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mindestens 4 Zeichen"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Passwort bestätigen *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Passwort wiederholen"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Hauptteam
                </label>
                <select
                  name="team"
                  value={formData.team}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? "bg-gray-700 border-gray-600 text-white" 
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="">Team auswählen</option>
                  <option value="U18-Elit">U18-Elit</option>
                  <option value="U20-Elit">U20-Elit</option>
                  <option value="U17">U17</option>
                  <option value="U15">U15</option>
                  <option value="U13">U13</option>
                </select>
                <p className={`text-xs mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Dein Hauptteam hilft dem Coach bei der Team-Zuweisung
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Trikotnummer (optional)
                </label>
                <input
                  type="number"
                  name="jersey_number"
                  value={formData.jersey_number}
                  onChange={handleChange}
                  placeholder="z.B. 72"
                  min="1"
                  max="99"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDarkMode 
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              </div>

              <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${isDarkMode ? "bg-blue-900 border-blue-700" : ""}`}>
                <h3 className={`font-medium mb-2 ${isDarkMode ? "text-blue-200" : "text-blue-800"}`}>
                  Nach der Registrierung:
                </h3>
                <ul className={`text-sm space-y-1 ${isDarkMode ? "text-blue-300" : "text-blue-700"}`}>
                  <li>• Du erhältst sofort Zugang zur App</li>
                  <li>• Du kannst alle Funktionen nutzen</li>
                  <li>• Coaches können dich verwalten und Teams zuweisen</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {loading ? "Registrierung läuft..." : "Registrierung absenden"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Bereits registriert?{" "}
                <button
                  onClick={() => navigate("/player-login")}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Hier anmelden
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
