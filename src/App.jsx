import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import Home from "./pages/Home";
import Reflexion from "./pages/Reflexion";
import Umfrage from "./pages/Umfrage";
import SimpleSurveyEditor from "./pages/SimpleSurveyEditor";
import UmfrageResults from "./pages/UmfrageResults";
import SportFood from "./pages/SportFood";
import SportFoodManager from "./pages/SportFoodManager";
import CardioProgram from "./pages/CardioProgram";
import CardioManager from "./pages/CardioManager";
import Teamkalender from "./pages/Teamkalender";
import News from "./pages/News";
import NewsManager from "./pages/NewsManager";
import Statistics from "./pages/Statistics";
import AITranslationDemo from "./pages/AITranslationDemo";
import AITranslationDemoSimple from "./pages/AITranslationDemoSimple";
import { AuthProvider } from "./context/AuthContext";
import { ReflexionProvider } from "./context/ReflexionContext";
import { NotificationProvider } from "./context/NotificationContext";
import { UmfrageProvider } from "./context/UmfrageContext";
import { SportFoodProvider } from "./context/SportFoodContext";
import { NewsProvider } from "./context/NewsContext";
import { ThemeProvider } from "./context/ThemeContext";
import Footer from "./components/Footer";
import CoachLogin from "./pages/CoachLogin";
import CoachDashboard from "./pages/CoachDashboard";
import TeamOverview from "./pages/TeamOverview";
import ReflexionDashboard from "./pages/ReflexionDashboard";
import QuestionManager from "./pages/QuestionManager";
import UmfrageHub from "./pages/UmfrageHub";
import CoachResultsView from "./pages/CoachResultsView";
import PlayerLogin from "./pages/PlayerLogin";
import UserManager from "./pages/UserManager";
import ProtectedRoute from "./components/ProtectedRoute";
import InstallPrompt from "./components/InstallPrompt";

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <ReflexionProvider>
            <UmfrageProvider>
              <SportFoodProvider>
                <NewsProvider>
                  <NotificationProvider>
                    <Router basename={import.meta.env.BASE_URL}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/reflexion" element={<Reflexion />} />
                  <Route path="/umfrage" element={<Umfrage />} />
                  <Route path="/umfrage-results" element={
                    <ProtectedRoute>
                      <UmfrageResults />
                    </ProtectedRoute>
                  } />
                  <Route path="/sportfood" element={<SportFood />} />
                  <Route path="/cardio" element={<CardioProgram />} />
                  {/* Teamkalender-Route zu Informationsseite umgeleitet */}
                  <Route path="/teamkalender" element={
                    <div className="min-h-screen flex flex-col bg-[#f8fafc] font-sans">
                      <div className="bg-[#0a2240] px-4 py-4 flex items-center justify-between rounded-b-3xl shadow-md">
                        <div className="flex items-center space-x-3">
                          <img
                            src={`${import.meta.env.BASE_URL}u18-team_app-icon.png`}
                            alt="EHCB Logo"
                            className="h-12 w-12 object-contain"
                          />
                          <div>
                            <div className="text-white font-semibold text-base leading-none">
                              EHC BIEL-BIENNE
                            </div>
                            <div className="text-[#ffd342] text-2xl font-bold leading-tight tracking-tight">
                              Spirit
                            </div>
                          </div>
                        </div>
                      </div>
                      <main className="flex-1 flex flex-col items-center px-4 py-8">
                        <div className="w-full max-w-md text-center">
                          <h1 className="text-xl font-bold text-[#0a2240] mb-4">Teamkalender-Information</h1>
                          <div className="bg-blue-50 p-6 rounded-lg shadow-md">
                            <p className="mb-4">Der Teamkalender ist aktuell nicht verfügbar.</p>
                            <p className="text-gray-700">Bitte prüfe deine MIH-Benachrichtigungen für aktuelle Terminpläne und Events.</p>
                            <button 
                              onClick={() => window.history.back()}
                              className="mt-6 px-4 py-2 bg-[#0a2240] text-white rounded-lg hover:bg-blue-900 transition"
                            >
                              Zurück
                            </button>
                          </div>
                        </div>
                      </main>
                    </div>
                  } />
                  <Route path="/news" element={<News />} />
                  <Route path="/coach-login" element={<CoachLogin />} />
                  <Route path="/player-login" element={<PlayerLogin />} />
                  <Route path="/coach/dashboard" element={
                    <ProtectedRoute coachOnly={true}>
                      <CoachDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/coach/team/:teamName" element={
                    <ProtectedRoute coachOnly={true}>
                      <TeamOverview />
                    </ProtectedRoute>
                  } />
                  <Route path="/coach/reflexionen" element={
                    <ProtectedRoute coachOnly={true}>
                      <ReflexionDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/coach/statistics" element={
                    <ProtectedRoute coachOnly={true}>
                      <Statistics />
                    </ProtectedRoute>
                  } />
                  <Route path="/coach/surveys" element={
                    <ProtectedRoute coachOnly={true}>
                      <QuestionManager />
                    </ProtectedRoute>
                  } />
                  <Route path="/coach/questions" element={
                    <ProtectedRoute coachOnly={true}>
                      <QuestionManager />
                    </ProtectedRoute>
                  } />
                  <Route path="/coach/active-surveys" element={
                    <ProtectedRoute coachOnly={true}>
                      <QuestionManager />
                    </ProtectedRoute>
                  } />
                  <Route path="/coach/user-manager" element={
                    <ProtectedRoute coachOnly={true}>
                      <UserManager />
                    </ProtectedRoute>
                  } />
                  <Route path="/coach/survey-editor" element={
                    <ProtectedRoute coachOnly={true}>
                      <SimpleSurveyEditor />
                    </ProtectedRoute>
                  } />
                  <Route path="/coach/survey-editor/:surveyId" element={
                    <ProtectedRoute coachOnly={true}>
                      <SimpleSurveyEditor />
                    </ProtectedRoute>
                  } />
                  <Route path="/coach/survey-results" element={
                    <ProtectedRoute coachOnly={true}>
                      <CoachResultsView />
                    </ProtectedRoute>
                  } />
                  <Route path="/coach/sportfood" element={
                    <ProtectedRoute coachOnly={true}>
                      <SportFoodManager />
                    </ProtectedRoute>
                  } />
                  <Route path="/coach/news-manager" element={
                    <ProtectedRoute coachOnly={true}>
                      <NewsManager />
                    </ProtectedRoute>
                  } />
                  <Route path="/cardio-manager" element={
                    <ProtectedRoute coachOnly={true}>
                      <CardioManager />
                    </ProtectedRoute>
                  } />
                </Routes>
              </Router>
              <Footer />
              <InstallPrompt />
              </NotificationProvider>
            </NewsProvider>
          </SportFoodProvider>
        </UmfrageProvider>
      </ReflexionProvider>
    </AuthProvider>
  </LanguageProvider>
</ThemeProvider>
  );
}
