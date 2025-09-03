import React, { createContext, useState, useContext, useEffect } from "react";
import { users } from "../config/supabase-api";

// Erstellen des Auth-Kontexts
const AuthContext = createContext();

// Benutzerdefinierter Hook für den Zugriff auf den Auth-Kontext
export const useAuth = () => useContext(AuthContext);

// Auth Provider Komponente
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Überprüfen, ob ein Benutzer in localStorage gespeichert ist
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }
    setLoading(false);
  }, []);
  
  // Login-Funktion
  const login = async (username, password, existingUser = null) => {
    try {
      if (existingUser) {
        // Für Spieler-Login mit vordefiniertem User-Objekt
        const { password, ...userWithoutPassword } = existingUser;
        setUser(userWithoutPassword);
        localStorage.setItem("user", JSON.stringify(userWithoutPassword));
        return true;
      }

      // Fallback für Coach-Login wenn Server nicht verfügbar ist
      const fallbackCoachCredentials = {
        username: "coach",
        password: "Coach7274"
      };

      if (username === fallbackCoachCredentials.username && password === fallbackCoachCredentials.password) {
        const coachUser = {
          id: "1",
          username: "coach",
          role: "coach",
          active: true
        };
        setUser(coachUser);
        localStorage.setItem("user", JSON.stringify(coachUser));
        return true;
      }

      try {
        // Benutzer aus Supabase abrufen (für Coach-Login)
        const allUsers = await users.getAll();
        
        // Überprüfen, ob die Anmeldedaten korrekt sind
        const matchedUser = allUsers.find(
          (u) => u.username === username && u.password === password
        );
        
        if (matchedUser) {
          // Prüfen ob User aktiv ist (nur für Spieler, Coaches sind immer aktiv)
          if (matchedUser.role === "player" && matchedUser.active === false) {
            console.error("Player account deactivated");
            return false;
          }

          // Benutzerpasswort aus dem Objekt entfernen
          const { password, ...userWithoutPassword } = matchedUser;
          
          // Benutzer im State speichern
          setUser(userWithoutPassword);
          
          // Benutzer im localStorage speichern
          localStorage.setItem("user", JSON.stringify(userWithoutPassword));
          return true;
        } else {
          return false;
        }
      } catch (apiError) {
        console.warn("API nicht verfügbar, verwende Fallback für Coach-Login:", apiError.message);
        // Falls API nicht verfügbar, versuche nochmal mit Fallback
        if (username === fallbackCoachCredentials.username && password === fallbackCoachCredentials.password) {
          const coachUser = {
            id: "1",
            username: "coach",
            role: "coach",
            active: true
          };
          setUser(coachUser);
          localStorage.setItem("user", JSON.stringify(coachUser));
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };
  
  // Logout-Funktion
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };
  
  // Werte, die dem Context zur Verfügung gestellt werden
  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isCoach: user?.role === "coach",
    currentUser: user, // Für Abwärtskompatibilität
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
