import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import Header from "../components/Header";
import BackButton from "../components/BackButton";
import { API_BASE_URL } from "../config/api";

export default function RegistrationStatus() {
  const { t } = useLanguage();
  const { isDarkMode } = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [searchData, setSearchData] = useState({
    name: "",
    mainTeam: ""
  });
  const [userStatus, setUserStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const teams = [
    { id: "u16-elit", name: "U16-Elit" },
    { id: "u18-elit", name: "U18-Elit" },
    { id: "u21-elit", name: "U21-Elit" }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setUserStatus(null);

    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      const users = await response.json();
      
      // Suche nach Benutzer mit Name und mainTeam
      const user = users.find(u => 
        u.name.toLowerCase() === searchData.name.toLowerCase() && 
        u.mainTeam === searchData.mainTeam &&
        u.role === "player"
      );

      if (user) {
        setUserStatus(user);
      } else {
        setError(t('registrationStatus.notFound'));
      }
    } catch (err) {
      setError(t('registrationStatus.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (userStatus && userStatus.status === "approved") {
      try {
        // Automatischer Login für genehmigte Spieler
        await login(userStatus.username, "", userStatus);
        navigate("/");
      } catch (err) {
        setError(t('registrationStatus.loginError'));
      }
    }
  };

  const handleChange = (e) => {
    setSearchData({
      ...searchData,
      [e.target.name]: e.target.value
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return isDarkMode ? "text-yellow-400" : "text-yellow-600";
      case "approved":
        return isDarkMode ? "text-green-400" : "text-green-600";
      case "rejected":
        return isDarkMode ? "text-red-400" : "text-red-600";
      default:
        return isDarkMode ? "text-gray-400" : "text-gray-600";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return "🟡";
      case "approved":
        return "✅";
      case "rejected":
        return "❌";
      default:
        return "❓";
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case "pending":
        return t('registrationStatus.pending');
      case "approved":
        return t('registrationStatus.approved');
      case "rejected":
        return t('registrationStatus.rejected');
      default:
        return t('registrationStatus.unknown');
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-[#f8fafc]'}`}>
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className={`w-full max-w-md rounded-lg shadow-md p-6 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-[#0a2240]'}`}>
              {t('registrationStatus.title')}
            </h1>
            <BackButton to="/" />
          </div>

          <p className={`mb-6 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('registrationStatus.description')}
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
                {t('registrationStatus.fullName')} *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={searchData.name}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'
                }`}
                placeholder={t('registrationStatus.namePlaceholder')}
              />
            </div>

            <div>
              <label htmlFor="mainTeam" className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {t('registrationStatus.mainTeam')} *
              </label>
              <select
                id="mainTeam"
                name="mainTeam"
                value={searchData.mainTeam}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                }`}
              >
                <option value="">{t('registrationStatus.selectTeam')}</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
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
              {loading ? t('registrationStatus.checking') : t('registrationStatus.checkStatus')}
            </button>
          </form>

          {userStatus && (
            <div className={`mt-6 p-4 rounded-lg border ${
              isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="text-center">
                <div className="text-4xl mb-2">
                  {getStatusIcon(userStatus.status)}
                </div>
                <h3 className={`text-lg font-semibold mb-2 ${getStatusColor(userStatus.status)}`}>
                  {getStatusMessage(userStatus.status)}
                </h3>
                
                {userStatus.status === "pending" && (
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('registrationStatus.pendingMessage')}
                  </p>
                )}
                
                {userStatus.status === "approved" && (
                  <div className="space-y-3">
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('registrationStatus.approvedMessage')}
                    </p>
                    <button
                      onClick={handleLogin}
                      className={`w-full py-2 px-4 rounded-md transition-colors ${
                        isDarkMode
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {t('registrationStatus.loginNow')}
                    </button>
                  </div>
                )}
                
                {userStatus.status === "rejected" && (
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('registrationStatus.rejectedMessage')}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('registrationStatus.newRegistration')}{' '}
              <a 
                href="/player-login" 
                className={`hover:underline font-medium ${
                  isDarkMode ? 'text-blue-400' : 'text-blue-600'
                }`}
              >
                {t('registrationStatus.registerHere')}
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
