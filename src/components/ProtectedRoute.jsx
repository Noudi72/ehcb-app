import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";


const ProtectedRoute = ({ children, coachOnly = false }) => {
  const { user, isCoach, loading } = useAuth();

  // Wenn noch geladen wird, Ladeanzeige zeigen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade...</p>
        </div>
      </div>
    );
  }

  // Wenn nicht authentifiziert, umleiten zum Login
  if (!user) {
    return <Navigate to="/coach-login" replace />;
  }

  // Wenn coachOnly und kein Coach, Zugriff verweigern
  if (coachOnly && !isCoach) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8fafc]">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-lg w-full text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-4V8m-3 4h6" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Zugriff verweigert</h1>
            <p className="text-gray-600 mb-6">Du musst als Coach angemeldet sein, um auf diese Seite zuzugreifen.</p>
          </div>
        </main>
        
      </div>
    );
  }

  // Authentifiziert und entweder kein Coach benötigt oder ist Coach
  return children;
};

export default ProtectedRoute;
