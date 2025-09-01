import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUmfrage } from "../context/UmfrageContext";
import Header from "../components/Header";
import BackButton from "../components/BackButton";
import PendingRegistrations from "../components/PendingRegistrations";
import PushNotificationSettings from "../components/PushNotificationSettings";
import { API_BASE_URL } from "../config/api";

export default function CoachDashboard() {
  const { user, logout, isCoach } = useAuth();
  const { surveys, responses, questions, fetchSurveys, fetchResponses, fetchQuestions } = useUmfrage();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeSurveys: 0,
    totalResponses: 0,
    totalQuestions: 0,
    participationRate: 0
  });
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetchSurveys();
    fetchResponses();
    fetchQuestions();
    fetchPendingRegistrations();
  }, [fetchSurveys, fetchResponses, fetchQuestions]);

  const fetchPendingRegistrations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`);
      const users = await response.json();
      const pending = users.filter(u => u.role === "player" && u.status === "pending");
      setPendingCount(pending.length);
    } catch (error) {
      console.error("Fehler beim Laden der ausstehenden Registrierungen:", error);
    }
  };

  useEffect(() => {
    if (surveys && responses && questions) {
      const activeSurveys = surveys.filter(s => s.active).length;
      const totalResponses = responses.length;
      const totalQuestions = questions.length;
      
      // Berechne Teilnahmequote (vereinfacht)
      const expectedResponses = activeSurveys * 20; // Annahme: 20 Spieler im Team
      const participationRate = expectedResponses > 0 ? Math.round((totalResponses / expectedResponses) * 100) : 0;
      
      setStats({
        activeSurveys,
        totalResponses,
        totalQuestions,
        participationRate: Math.min(participationRate, 100)
      });
    }
  }, [surveys, responses, questions]);

  // Umfrage-Management Bereiche
  const surveyManagementItems = [
    {
      title: "Umfragen verwalten",
      description: "Umfragen erstellen, bearbeiten und verwalten",
      icon: "edit",
      path: "/coach/questions",
      color: "bg-purple-500 hover:bg-purple-600",
      iconBg: "bg-purple-100 group-hover:bg-purple-200",
      iconColor: "text-purple-600",
      borderColor: "group-hover:border-purple-500"
    },
    {
      title: "Aktive Umfragen",
      description: "Umfragen aktivieren, deaktivieren und Sichtbarkeit steuern",
      icon: "check-circle",
      path: "/coach/active-surveys",
      color: "bg-green-500 hover:bg-green-600",
      iconBg: "bg-green-100 group-hover:bg-green-200",
      iconColor: "text-green-600",
      borderColor: "group-hover:border-green-500"
    },
    {
      title: "Umfrage-Ergebnisse",
      description: "Ansicht und Analyse aller Umfrageergebnisse",
      icon: "chart-bar",
      path: "/umfrage-results",
      color: "bg-red-500 hover:bg-red-600",
      iconBg: "bg-red-100 group-hover:bg-red-200",
      iconColor: "text-red-600",
      borderColor: "group-hover:border-red-500"
    }
  ];

  // Team Navigation Bereiche
  const teamItems = [
    {
      title: "U16-Elit",
      description: "Spieler des U16-Elit Teams verwalten",
      icon: "users",
      path: "/coach/team/u16-elit",
      color: "bg-blue-500 hover:bg-blue-600",
      iconBg: "bg-blue-100 group-hover:bg-blue-200",
      iconColor: "text-blue-600",
      borderColor: "group-hover:border-blue-500"
    },
    {
      title: "U18-Elit",
      description: "Spieler des U18-Elit Teams verwalten",
      icon: "users",
      path: "/coach/team/u18-elit",
      color: "bg-purple-500 hover:bg-purple-600",
      iconBg: "bg-purple-100 group-hover:bg-purple-200",
      iconColor: "text-purple-600",
      borderColor: "group-hover:border-purple-500"
    },
    {
      title: "U21-Elit",
      description: "Spieler des U21-Elit Teams verwalten",
      icon: "users",
      path: "/coach/team/u21-elit",
      color: "bg-emerald-500 hover:bg-emerald-600",
      iconBg: "bg-emerald-100 group-hover:bg-emerald-200",
      iconColor: "text-emerald-600",
      borderColor: "group-hover:border-emerald-500"
    }
  ];

  // Weitere Management Bereiche
  const otherManagementItems = [
    {
      title: "Neue Registrierungen",
      description: "Spieler-Registrierungen prüfen und Teams zuweisen",
      icon: "bell",
      path: "#pending-registrations",
      color: "bg-yellow-500 hover:bg-yellow-600",
      badge: pendingCount > 0 ? pendingCount : null,
      badgeColor: "bg-red-500"
    },
    {
      title: "Spieler-Reflexionen",
      description: "Reflexionen der Spieler einsehen",
      icon: "message-circle",
      path: "/coach/reflexionen",
      color: "bg-indigo-500 hover:bg-indigo-600"
    },
    {
      title: "Statistiken",
      description: "Umfassende Statistiken und Auswertungen",
      icon: "trending-up",
      path: "/coach/statistics",
      color: "bg-teal-500 hover:bg-teal-600"
    },
    {
      title: "Sport & Ernährung",
      description: "Ernährungstipps und Sportpläne verwalten",
      icon: "apple",
      path: "/coach/sportfood",
      color: "bg-orange-500 hover:bg-orange-600"
    },
    {
      title: "News-Manager",
      description: "Neuigkeiten und Ankündigungen verwalten",
      icon: "newspaper",
      path: "/coach/news-manager",
      color: "bg-pink-500 hover:bg-pink-600"
    },
    {
      title: "Cardio-Manager",
      description: "Cardio-Programme erstellen und verwalten",
      icon: "activity",
      path: "/cardio-manager",
      color: "bg-cyan-500 hover:bg-cyan-600"
    },
    {
      title: "Benutzer-Verwaltung",
      description: "Spieler verwalten und Zugriff kontrollieren",
      icon: "user-check",
      path: "/coach/user-manager",
      color: "bg-gray-500 hover:bg-gray-600"
    }
  ];

  const handleNavigate = (path) => {
    if (path === "#pending-registrations") {
      // Scroll zur Pending Registrations Sektion
      document.getElementById("pending-registrations")?.scrollIntoView({ 
        behavior: "smooth" 
      });
    } else {
      navigate(path);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Icon-Rendering Funktion
  const renderIcon = (iconName, className = "h-6 w-6") => {
    const iconPaths = {
      plus: "M12 6v6m0 0v6m0-6h6m-6 0H6",
      question: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      "check-circle": "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      "chart-bar": "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
      users: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z",
      bell: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
      "message-circle": "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
      "trending-up": "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
      apple: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
      newspaper: "M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z",
      activity: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
      "user-check": "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7zM9 11l2 2 4-4"
    };

    return (
      <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPaths[iconName] || iconPaths.question} />
      </svg>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-gray-900 font-sans transition-colors duration-300">
      <Header />
      <div className="px-4 py-4">
        <BackButton to="/" />
      </div>
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6 transition-colors duration-300">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[#0a2240] dark:text-blue-400 mb-2">Coach Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300">Willkommen zurück, {user?.name || user?.username}!</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 transition-colors"
            >
              Abmelden
            </button>
          </div>
          
          {/* Schnellübersicht Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.activeSurveys}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Aktive Umfragen</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.totalResponses}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Gesammelte Antworten</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalQuestions}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Verfügbare Fragen</div>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.participationRate}%</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Teilnahmequote</div>
            </div>
          </div>

          {/* Umfrage-Management Bereich */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#0a2240] dark:text-blue-400 mb-4">Umfrage-Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {surveyManagementItems.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleNavigate(item.path)}
                  className="group cursor-pointer bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-lg dark:hover:shadow-xl transition-all duration-200 border-b-4 border-transparent hover:border-gray-300 dark:hover:border-gray-500"
                  style={{"--hover-border": item.borderColor}}
                >
                  <div className="flex items-center mb-3">
                    <div className={`w-12 h-12 ${item.iconBg} rounded-lg flex items-center justify-center transition-colors`}>
                      {renderIcon(item.icon, `h-6 w-6 ${item.iconColor}`)}
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Team Navigation */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#0a2240] dark:text-blue-400 mb-4">Team-Navigation</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {teamItems.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleNavigate(item.path)}
                  className="group cursor-pointer bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:shadow-lg dark:hover:shadow-xl transition-all duration-200 border-b-4 border-transparent hover:border-gray-300 dark:hover:border-gray-500"
                  style={{"--hover-border": item.borderColor}}
                >
                  <div className="flex items-center mb-3">
                    <div className={`w-12 h-12 ${item.iconBg} rounded-lg flex items-center justify-center transition-colors`}>
                      {renderIcon(item.icon, `h-6 w-6 ${item.iconColor}`)}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Weitere Management-Bereiche */}
          <div>
            <h2 className="text-xl font-bold text-[#0a2240] dark:text-blue-400 mb-4">Weitere Verwaltung</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherManagementItems.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleNavigate(item.path)}
                  className="cursor-pointer bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:shadow-lg dark:hover:shadow-xl transition-all duration-200 transform hover:scale-105 relative"
                >
                  {item.badge && (
                    <div className={`absolute -top-2 -right-2 ${item.badgeColor} text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center z-10`}>
                      {item.badge}
                    </div>
                  )}
                  <div className={`w-16 h-16 ${item.color} rounded-lg flex items-center justify-center text-white mb-4 transition-colors`}>
                    {renderIcon(item.icon, "h-8 w-8 text-white")}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Registrations Sektion */}
          <div id="pending-registrations" className="mt-8">
            <PendingRegistrations />
          </div>

          {/* Push-Benachrichtigungen Einstellungen */}
          <div className="mt-8">
            <PushNotificationSettings />
          </div>
        </div>
      </main>
      
      
    </div>
  );
}
