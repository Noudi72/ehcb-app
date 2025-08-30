import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUmfrage } from "../context/UmfrageContext";
import Header from "../components/Header";
import PendingRegistrations from "../components/PendingRegistrations";
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
      title: "Umfrage erstellen",
      description: "Neue Umfragen mit ausgewählten Fragen zusammenstellen",
      icon: "�",
      path: "/coach/survey-editor",
      color: "bg-blue-500 hover:bg-blue-600",
      iconBg: "bg-blue-100 group-hover:bg-blue-200",
      iconColor: "text-blue-600",
      borderColor: "group-hover:border-blue-500"
    },
    {
      title: "Fragen verwalten",
      description: "Eigene Fragen erstellen, bearbeiten und kategorisieren",
      icon: "❓",
      path: "/coach/questions",
      color: "bg-purple-500 hover:bg-purple-600",
      iconBg: "bg-purple-100 group-hover:bg-purple-200",
      iconColor: "text-purple-600",
      borderColor: "group-hover:border-purple-500"
    },
    {
      title: "Aktive Umfragen",
      description: "Umfragen aktivieren, deaktivieren und Sichtbarkeit steuern",
      icon: "🔴",
      path: "/coach/active-surveys",
      color: "bg-green-500 hover:bg-green-600",
      iconBg: "bg-green-100 group-hover:bg-green-200",
      iconColor: "text-green-600",
      borderColor: "group-hover:border-green-500"
    },
    {
      title: "Umfrage-Ergebnisse",
      description: "Ansicht und Analyse aller Umfrageergebnisse",
      icon: "📊",
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
      icon: "🏒",
      path: "/coach/team/u16-elit",
      color: "bg-blue-500 hover:bg-blue-600",
      iconBg: "bg-blue-100 group-hover:bg-blue-200",
      iconColor: "text-blue-600",
      borderColor: "group-hover:border-blue-500"
    },
    {
      title: "U18-Elit",
      description: "Spieler des U18-Elit Teams verwalten",
      icon: "🏒",
      path: "/coach/team/u18-elit",
      color: "bg-purple-500 hover:bg-purple-600",
      iconBg: "bg-purple-100 group-hover:bg-purple-200",
      iconColor: "text-purple-600",
      borderColor: "group-hover:border-purple-500"
    },
    {
      title: "U21-Elit",
      description: "Spieler des U21-Elit Teams verwalten",
      icon: "🏒",
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
      icon: "🔔",
      path: "#pending-registrations",
      color: "bg-yellow-500 hover:bg-yellow-600",
      badge: pendingCount > 0 ? pendingCount : null,
      badgeColor: "bg-red-500"
    },
    {
      title: "Spieler-Reflexionen",
      description: "Reflexionen der Spieler einsehen",
      icon: "💭",
      path: "/coach/reflexionen",
      color: "bg-indigo-500 hover:bg-indigo-600"
    },
    {
      title: "Statistiken",
      description: "Umfassende Statistiken und Auswertungen",
      icon: "📈",
      path: "/coach/statistics",
      color: "bg-teal-500 hover:bg-teal-600"
    },
    {
      title: "Sport & Ernährung",
      description: "Ernährungstipps und Sportpläne verwalten",
      icon: "🥗",
      path: "/coach/sportfood",
      color: "bg-orange-500 hover:bg-orange-600"
    },
    {
      title: "News-Manager",
      description: "Neuigkeiten und Ankündigungen verwalten",
      icon: "📰",
      path: "/coach/news-manager",
      color: "bg-pink-500 hover:bg-pink-600"
    },
    {
      title: "Cardio-Manager",
      description: "Cardio-Programme erstellen und verwalten",
      icon: "🏃‍♂️",
      path: "/cardio-manager",
      color: "bg-cyan-500 hover:bg-cyan-600"
    },
    {
      title: "Benutzer-Verwaltung",
      description: "Spieler verwalten und Zugriff kontrollieren",
      icon: "👥",
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

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-[#0a2240] mb-2">Coach Dashboard</h1>
              <p className="text-gray-600">Willkommen zurück, {user?.name || user?.username}!</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              Abmelden
            </button>
          </div>
          
          {/* Schnellübersicht Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.activeSurveys}</div>
              <div className="text-sm text-gray-600">Aktive Umfragen</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.totalResponses}</div>
              <div className="text-sm text-gray-600">Gesammelte Antworten</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{stats.totalQuestions}</div>
              <div className="text-sm text-gray-600">Verfügbare Fragen</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{stats.participationRate}%</div>
              <div className="text-sm text-gray-600">Teilnahmequote</div>
            </div>
          </div>

          {/* Umfrage-Management Bereich */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#0a2240] mb-4">Umfrage-Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {surveyManagementItems.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleNavigate(item.path)}
                  className="group cursor-pointer bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-200 border-b-4 border-transparent hover:border-gray-300"
                  style={{"--hover-border": item.borderColor}}
                >
                  <div className="flex items-center mb-3">
                    <div className={`w-12 h-12 ${item.iconBg} rounded-lg flex items-center justify-center text-2xl transition-colors`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${item.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {item.icon === "📝" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />}
                        {item.icon === "❓" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />}
                        {item.icon === "🔴" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />}
                        {item.icon === "📊" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-1">{item.title}</h3>
                  <p className="text-gray-600 text-xs">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Team Navigation */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-[#0a2240] mb-4">Team-Navigation</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {teamItems.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleNavigate(item.path)}
                  className="group cursor-pointer bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 border-b-4 border-transparent hover:border-gray-300"
                  style={{"--hover-border": item.borderColor}}
                >
                  <div className="flex items-center mb-3">
                    <div className={`w-12 h-12 ${item.iconBg} rounded-lg flex items-center justify-center text-2xl transition-colors`}>
                      {item.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Weitere Management-Bereiche */}
          <div>
            <h2 className="text-xl font-bold text-[#0a2240] mb-4">Weitere Verwaltung</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherManagementItems.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleNavigate(item.path)}
                  className="cursor-pointer bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 transform hover:scale-105 relative"
                >
                  {item.badge && (
                    <div className={`absolute -top-2 -right-2 ${item.badgeColor} text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center z-10`}>
                      {item.badge}
                    </div>
                  )}
                  <div className={`w-16 h-16 ${item.color} rounded-lg flex items-center justify-center text-white text-2xl mb-4 transition-colors`}>
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Registrations Sektion */}
          <div id="pending-registrations" className="mt-8">
            <PendingRegistrations />
          </div>
        </div>
      </main>
      
      
    </div>
  );
}
