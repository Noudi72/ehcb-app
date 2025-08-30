import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Header from "../components/Header";
import BackButton from "../components/BackButton";

export default function CoachLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!username || !password) {
      setError("Bitte füllen Sie alle Felder aus");
      return;
    }

    try {
      const success = await login(username, password);
      if (success) {
        // Kurze Verzögerung, damit der Auth-State aktualisiert wird
        setTimeout(() => {
          navigate("/coach/dashboard");
        }, 100);
      } else {
        setError("Ungültige Anmeldedaten. Bitte überprüfen Sie Benutzername und Passwort.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans ${
      isDarkMode ? 'bg-gray-900' : 'bg-[#f8fafc]'
    }`}>
      <Header />
      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <div className={`w-full max-w-md rounded-lg shadow-md p-8 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h1 className={`text-2xl font-bold ${
              isDarkMode ? 'text-blue-400' : 'text-[#0a2240]'
            }`}>Coach Anmeldung</h1>
            <BackButton to="/" />
          </div>

          <div className="mb-4 text-center">
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Spieler? <a href="/player-login" className={`${
                isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:underline'
              } font-medium`}>Hier anmelden</a>
            </p>
          </div>
          
          {error && (
            <div className={`mb-4 px-4 py-3 rounded relative ${
              isDarkMode
                ? 'bg-red-900 border-red-700 text-red-300 border'
                : 'bg-red-100 border-red-400 text-red-700 border'
            }`}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Benutzername
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'
                }`}
              />
            </div>
            
            <div>
              <label htmlFor="password" className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Passwort
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'
                }`}
              />
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                className={`w-full py-3 font-semibold rounded-lg shadow-md focus:outline-none ${
                  isDarkMode
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-[#0a2240] text-white hover:bg-[#081a32]'
                }`}
              >
                Anmelden
              </button>
            </div>
          </form>
          
          <div className={`mt-6 text-center text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <p>Der Coach-Zugang ist nur für autorisierte Teammitglieder.</p>
          </div>
        </div>
      </main>
      
    </div>
  );
}
