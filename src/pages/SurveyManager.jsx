import React from "react";
import SurveyManagerOverview from "./SurveyManagerOverview";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Header from "../components/Header";
import BackButton from "../components/BackButton";


export default function SurveyManager() {
  const { user, isCoach } = useAuth();
  const { isDarkMode } = useTheme();
  
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
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-[#f8fafc]'} font-sans`}>
      <Header />
      <BackButton to="/coach/dashboard" />
      <main className="flex-1 container mx-auto px-4 py-6">
        <h1 className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-blue-400' : 'text-[#0a2240]'}`}>Umfrage-Verwaltung</h1>
        <p className={`mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Verwalte Umfragen, Fragen und Ergebnisse an einem zentralen Ort.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Umfragen erstellen */}
          <Link to="/coach/survey-editor" className="group">
            <div className={`rounded-lg shadow-md p-6 hover:shadow-lg transition-all border-b-4 border-transparent group-hover:border-blue-500 ${
              isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white'
            }`}>
              <div className="flex items-center mb-4">
                <div className={`rounded-full p-3 group-hover:bg-blue-200 transition-colors ${
                  isDarkMode ? 'bg-blue-900 group-hover:bg-blue-800' : 'bg-blue-100'
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h2 className={`ml-3 text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Umfrage erstellen</h2>
              </div>
              <p className={`mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Neue Umfragen mit ausgewählten Fragen zusammenstellen</p>
              <div className="flex justify-end">
                <span className="text-blue-600 text-sm font-medium group-hover:underline">Erstellen »</span>
              </div>
            </div>
          </Link>
          
          {/* Fragen verwalten */}
          <Link to="/coach/questions" className="group">
            <div className={`rounded-lg shadow-md p-6 hover:shadow-lg transition-all border-b-4 border-transparent group-hover:border-purple-500 ${
              isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white'
            }`}>
              <div className="flex items-center mb-4">
                <div className={`rounded-full p-3 group-hover:bg-purple-200 transition-colors ${
                  isDarkMode ? 'bg-purple-900 group-hover:bg-purple-800' : 'bg-purple-100'
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className={`ml-3 text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Fragen verwalten</h2>
              </div>
              <p className={`mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Eigene Fragen erstellen, bearbeiten und kategorisieren</p>
              <div className="flex justify-end">
                <span className="text-purple-600 text-sm font-medium group-hover:underline">Verwalten »</span>
              </div>
            </div>
          </Link>
          
          {/* Aktive Umfragen */}
          <Link to="/coach/active-surveys" className="group">
            <div className={`rounded-lg shadow-md p-6 hover:shadow-lg transition-all border-b-4 border-transparent group-hover:border-green-500 ${
              isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white'
            }`}>
              <div className="flex items-center mb-4">
                <div className={`rounded-full p-3 group-hover:bg-green-200 transition-colors ${
                  isDarkMode ? 'bg-green-900 group-hover:bg-green-800' : 'bg-green-100'
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className={`ml-3 text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Aktive Umfragen</h2>
              </div>
              <p className={`mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Umfragen aktivieren, deaktivieren und Sichtbarkeit steuern</p>
              <div className="flex justify-end">
                <span className="text-green-600 text-sm font-medium group-hover:underline">Aktivieren »</span>
              </div>
            </div>
          </Link>
          
          {/* Umfrageergebnisse ansehen */}
          <Link to="/umfrage-results" className="group">
            <div className={`rounded-lg shadow-md p-6 hover:shadow-lg transition-all border-b-4 border-transparent group-hover:border-amber-500 ${
              isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white'
            }`}>
              <div className="flex items-center mb-4">
                <div className={`rounded-full p-3 group-hover:bg-amber-200 transition-colors ${
                  isDarkMode ? 'bg-amber-900 group-hover:bg-amber-800' : 'bg-amber-100'
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h2 className={`ml-3 text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Umfrageergebnisse</h2>
              </div>
              <p className={`mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Alle Umfrageergebnisse mit detaillierten Statistiken ansehen</p>
              <div className="flex justify-end">
                <span className="text-amber-600 text-sm font-medium group-hover:underline">Ansehen »</span>
              </div>
            </div>
          </Link>
          
          {/* Vorlagen verwalten */}
          <Link to="/coach/survey-templates" className="group">
            <div className={`rounded-lg shadow-md p-6 hover:shadow-lg transition-all border-b-4 border-transparent group-hover:border-indigo-500 ${
              isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white'
            }`}>
              <div className="flex items-center mb-4">
                <div className={`rounded-full p-3 group-hover:bg-indigo-200 transition-colors ${
                  isDarkMode ? 'bg-indigo-900 group-hover:bg-indigo-800' : 'bg-indigo-100'
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                </div>
                <h2 className={`ml-3 text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Vorlagen</h2>
              </div>
              <p className={`mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Wiederverwendbare Umfragevorlagen erstellen und speichern</p>
              <div className="flex justify-end">
                <span className="text-indigo-600 text-sm font-medium group-hover:underline">Vorlagen »</span>
              </div>
            </div>
          </Link>
          
          {/* Dashboard */}
          <Link to="/coach/dashboard" className="group">
            <div className={`rounded-lg shadow-md p-6 hover:shadow-lg transition-all border-b-4 border-transparent group-hover:border-red-500 ${
              isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white'
            }`}>
              <div className="flex items-center mb-4">
                <div className={`rounded-full p-3 group-hover:bg-red-200 transition-colors ${
                  isDarkMode ? 'bg-red-900 group-hover:bg-red-800' : 'bg-red-100'
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className={`ml-3 text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Dashboard</h2>
              </div>
              <p className={`mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Übersicht über alle Umfragen und Teilnahmeraten</p>
              <div className="flex justify-end">
                <span className="text-red-600 text-sm font-medium group-hover:underline">Dashboard öffnen »</span>
              </div>
            </div>
          </Link>
        </div>
        
        <div className={`p-6 rounded-lg border ${
          isDarkMode ? 'bg-blue-900 border-blue-700' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100'
        }`}>
          <h3 className={`text-lg font-semibold mb-2 flex items-center ${
            isDarkMode ? 'text-blue-300' : 'text-blue-800'
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Hinweise zur Umfrage-Verwaltung
          </h3>
          <ul className={`list-disc pl-5 space-y-2 ${
            isDarkMode ? 'text-blue-200' : 'text-gray-700'
          }`}>
            <li>Verwenden Sie <span className={`font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>Fragen verwalten</span>, um neue Fragen zu erstellen.</li>
            <li>Mit <span className={`font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>Umfrage erstellen</span> können Sie bestehende Fragen zu neuen Umfragen zusammenstellen.</li>
            <li>Umfragen sind erst sichtbar für Spieler, wenn Sie diese in <span className={`font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>Aktive Umfragen</span> aktivieren.</li>
            <li>Bei <span className={`font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>anonymen Umfragen</span> werden die Namen der Teilnehmer nicht mit den Antworten verknüpft.</li>
            <li>Sie können steuern, ob Spieler die Ergebnisse einer Umfrage sehen können.</li>
          </ul>
          
          <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-blue-600' : 'border-blue-200'}`}>
            <h4 className={`font-medium mb-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>Neu in dieser Version:</h4>
            <ul className={`list-disc pl-5 space-y-1 ${isDarkMode ? 'text-blue-200' : 'text-gray-700'}`}>
              <li>Anonyme Umfragen für vertrauliches Feedback</li>
              <li>Detaillierte Statistiken für jede Frage</li>
              <li>Verbesserte Benutzeroberfläche für mehr Übersichtlichkeit</li>
            </ul>
          </div>
        </div>
      </main>
      
      <SurveyManagerOverview />
    </div>
  );
}
