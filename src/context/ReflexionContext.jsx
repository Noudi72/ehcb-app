import React, { createContext, useState, useContext, useCallback, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

// Erstellen des Reflexion-Kontexts
const ReflexionContext = createContext();

// Benutzerdefinierter Hook für den Zugriff auf den Reflexion-Kontext
export const useReflexion = () => useContext(ReflexionContext);

// Reflexion Provider Komponente
export const ReflexionProvider = ({ children }) => {
  const [reflections, setReflections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Alle Reflexionen abrufen mit useCallback, um die Funktion zu memoizen
  const fetchReflections = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/reflections`);
      setReflections(response.data);
      setError(null);
    } catch (err) {
      setError("Fehler beim Laden der Reflexionen");
      console.error("Fehler beim Laden der Reflexionen:", err);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Neue Reflexion hinzufügen
  const addReflexion = async (reflexionData) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/reflections`, {
        ...reflexionData,
        date: new Date().toISOString(),
      });
      setReflections([...reflections, response.data]);
      setError(null);
      return true;
    } catch (err) {
      setError("Fehler beim Speichern der Reflexion");
      console.error("Fehler beim Speichern der Reflexion:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Werte, die dem Context zur Verfügung gestellt werden
  const value = {
    reflections,
    loading,
    error,
    fetchReflections,
    addReflexion,
  };
  
  return (
    <ReflexionContext.Provider value={value}>
      {children}
    </ReflexionContext.Provider>
  );
};
