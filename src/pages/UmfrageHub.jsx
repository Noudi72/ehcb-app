import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUmfrage } from "../context/UmfrageContext";
import { useTheme } from "../context/ThemeContext";
import Header from "../components/Header";
import BackButton from "../components/BackButton";


export default function UmfrageHub() {
  const { currentUser } = useAuth();
  const { surveys, responses, loading, error, fetchSurveys, fetchResponses } = useUmfrage();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("aktiv");
  const [activeSurveys, setActiveSurveys] = useState([]);
  const [completedSurveys, setCompletedSurveys] = useState([]);
  const [userResponses, setUserResponses] = useState({});

  useEffect(() => {
    fetchSurveys();
    fetchResponses();
  }, [fetchSurveys, fetchResponses]);

  // Umfragen filtern und nach Status sortieren
  useEffect(() => {
    if (surveys && surveys.length > 0 && responses) {
      // Nur aktive Umfragen für Spieler anzeigen
      let userAvailableSurveys = surveys.filter(survey => survey.active);

      // Prüfen, welche Umfragen der Benutzer bereits beantwortet hat
      const userCompletedSurveyIds = new Set();
      const userResponseMap = {};

      if (currentUser) {
        responses.forEach(response => {
          if (response.userId === currentUser.id) {
            userCompletedSurveyIds.add(response.surveyId);
            userResponseMap[response.surveyId] = response;
          }
        });
      }

      // Umfragen nach beantwortet/nicht beantwortet sortieren
      const completed = userAvailableSurveys.filter(survey => userCompletedSurveyIds.has(survey.id));
      const active = userAvailableSurveys.filter(survey => !userCompletedSurveyIds.has(survey.id));

      setActiveSurveys(active);
      setCompletedSurveys(completed);
      setUserResponses(userResponseMap);
    }
  }, [surveys, responses, currentUser]);

  if (!currentUser) {
    return (
      <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-[#f8fafc]'}`}>
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center justify-center">
          <div className={`w-full max-w-2xl p-8 rounded-lg shadow-md text-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h1 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-blue-400' : 'text-[#0a2240]'}`}>Bitte anmelden</h1>
            <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Um an Umfragen teilzunehmen, musst du dich zuerst anmelden.</p>
            <Link to="/login" className={`px-5 py-2 rounded-md inline-block ${
              isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-[#0a2240] text-white hover:bg-[#083056]'
            }`}>
              Zur Anmeldung
            </Link>
          </div>
        </main>

      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-[#f8fafc]'}`}>
      <Header />
      <BackButton to="/" />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-[#0a2240]'}`}>Umfragen</h1>
        <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Hier findest du alle Umfragen für dich als {currentUser?.isCoach ? 'Coach' : 'Spieler'}.</p>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${isDarkMode ? 'border-blue-400' : 'border-[#0a2240]'}`}></div>
          </div>
        ) : error ? (
          <div className={`p-4 rounded-md ${isDarkMode ? 'bg-red-900 border-red-700 text-red-300 border' : 'bg-red-50 border-red-200 text-red-600'}`}>
            {error}
          </div>
        ) : (
          <div>
            {currentUser.isCoach ? (
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  to="/coach/survey-manager"
                  className={`p-5 rounded-lg shadow-md border-l-4 border-blue-600 hover:shadow-lg transition-shadow ${
                    isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`p-3 rounded-full mr-4 ${isDarkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Umfragen verwalten</h2>
                      <p className={`text-gray-600 ${isDarkMode ? 'text-gray-400' : ''}`}>Umfragen erstellen, aktivieren oder bearbeiten</p>
                    </div>
                  </div>
                </Link>

                <Link
                  to="/umfrage-results"
                  className={`p-5 rounded-lg shadow-md border-l-4 border-green-600 hover:shadow-lg transition-shadow ${
                    isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`p-3 rounded-full mr-4 ${isDarkMode ? 'bg-green-900' : 'bg-green-100'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Umfrageergebnisse</h2>
                      <p className={`text-gray-600 ${isDarkMode ? 'text-gray-400' : ''}`}>Auswertungen und Statistiken ansehen</p>
                    </div>
                  </div>
                </Link>
              </div>
            ) : (
              <>
                <div className={`mb-6 flex border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                  <button
                    className={`px-4 py-2 ${
                      activeTab === "aktiv"
                        ? `text-blue-600 border-b-2 border-blue-600 font-medium ${isDarkMode ? 'text-blue-400' : ''}`
                        : `${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`
                    }`}
                    onClick={() => setActiveTab("aktiv")}
                  >
                    Offene Umfragen {activeSurveys.length > 0 && <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                      isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'
                    }`}>{activeSurveys.length}</span>}
                  </button>
                  <button
                    className={`px-4 py-2 ${
                      activeTab === "beantwortet"
                        ? `text-blue-600 border-b-2 border-blue-600 font-medium ${isDarkMode ? 'text-blue-400' : ''}`
                        : `${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`
                    }`}
                    onClick={() => setActiveTab("beantwortet")}
                  >
                    Beantwortete Umfragen
                  </button>
                  <button
                    className={`px-4 py-2 ${
                      activeTab === "ergebnisse"
                        ? `text-blue-600 border-b-2 border-blue-600 font-medium ${isDarkMode ? 'text-blue-400' : ''}`
                        : `${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`
                    }`}
                    onClick={() => setActiveTab("ergebnisse")}
                  >
                    Ergebnisse
                  </button>
                </div>

                {activeTab === "aktiv" && (
                  activeSurveys.length === 0 ? (
                    <div className={`p-6 rounded-lg border text-center ${
                      isDarkMode ? 'bg-yellow-900 border-yellow-700 text-yellow-300' : 'bg-yellow-50 border-yellow-200 text-gray-700'
                    }`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-yellow-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="mb-2">Aktuell gibt es keine offenen Umfragen für dich.</p>
                      <p className={`${isDarkMode ? 'text-yellow-400' : 'text-gray-500'}`}>Schau später noch einmal vorbei.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {activeSurveys.map(survey => (
                        <div
                          key={survey.id}
                          className={`rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${
                            isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white'
                          }`}
                          onClick={() => navigate(`/umfrage?id=${survey.id}`)}
                        >
                          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-white flex justify-between items-center">
                            <h3 className="font-medium">Umfrage</h3>
                            <span className="text-xs bg-blue-700 px-2 py-0.5 rounded-full">Neu</span>
                          </div>
                          <div className="p-4">
                            <h3 className={`font-semibold text-lg mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{survey.title}</h3>
                            <p className={`text-sm line-clamp-2 mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{survey.description || "Keine Beschreibung verfügbar"}</p>
                            <div className="flex justify-between items-center">
                              <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{new Date(survey.createdAt).toLocaleDateString()}</span>
                              <button className={`px-3 py-1 rounded text-sm ${
                                isDarkMode ? 'bg-blue-900 text-blue-300 hover:bg-blue-800' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              }`}>
                                Teilnehmen
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {activeTab === "beantwortet" && (
                  completedSurveys.length === 0 ? (
                    <div className={`p-6 rounded-lg border text-center ${
                      isDarkMode ? 'bg-gray-800 border-gray-600 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-700'
                    }`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="mb-2">Du hast noch keine Umfragen beantwortet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {completedSurveys.map(survey => (
                        <div
                          key={survey.id}
                          className={`rounded-lg shadow-md overflow-hidden ${
                            isDarkMode ? 'bg-gray-800' : 'bg-white'
                          }`}
                        >
                          <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 text-white flex justify-between items-center">
                            <h3 className="font-medium">Umfrage</h3>
                            <span className="text-xs bg-green-700 px-2 py-0.5 rounded-full">Beantwortet</span>
                          </div>
                          <div className="p-4">
                            <h3 className={`font-semibold text-lg mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{survey.title}</h3>
                            <p className={`text-sm line-clamp-2 mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{survey.description || "Keine Beschreibung verfügbar"}</p>
                            <div className="flex justify-between items-center">
                              <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                                Beantwortet am: {new Date(userResponses[survey.id]?.createdAt).toLocaleDateString()}
                              </span>
                              {survey.resultsVisibleToPlayers && (
                                <Link
                                  to={`/umfrage-results?id=${survey.id}`}
                                  className={`px-3 py-1 rounded text-sm ${
                                    isDarkMode ? 'bg-green-900 text-green-300 hover:bg-green-800' : 'bg-green-100 text-green-700 hover:bg-green-200'
                                  }`}
                                >
                                  Ergebnisse
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {activeTab === "ergebnisse" && (
                  <div>
                    {surveys.filter(s => s.resultsVisibleToPlayers).length === 0 ? (
                      <div className={`p-6 rounded-lg border text-center ${
                        isDarkMode ? 'bg-gray-800 border-gray-600 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-700'
                      }`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <p className="mb-2">Keine Umfrageergebnisse verfügbar.</p>
                        <p className={`${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Der Coach entscheidet, wann Ergebnisse sichtbar gemacht werden.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {surveys
                          .filter(survey => survey.resultsVisibleToPlayers)
                          .map(survey => (
                            <div
                              key={survey.id}
                              className={`rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${
                                isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white'
                              }`}
                              onClick={() => navigate(`/umfrage-results?id=${survey.id}`)}
                            >
                              <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-2 text-white flex justify-between items-center">
                                <h3 className="font-medium">Ergebnisse</h3>
                                <span className="text-xs bg-purple-700 px-2 py-0.5 rounded-full">
                                  {userResponses[survey.id] ? "Teilgenommen" : "Nicht teilgenommen"}
                                </span>
                              </div>
                              <div className="p-4">
                                <h3 className={`font-semibold text-lg mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{survey.title}</h3>
                                <p className={`text-sm line-clamp-2 mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{survey.description || "Keine Beschreibung verfügbar"}</p>
                                <div className="flex justify-between items-center">
                                  <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{new Date(survey.createdAt).toLocaleDateString()}</span>
                                  <button className={`px-3 py-1 rounded text-sm ${
                                    isDarkMode ? 'bg-purple-900 text-purple-300 hover:bg-purple-800' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                  }`}>
                                    Statistik ansehen
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

    </div>
  );
}
