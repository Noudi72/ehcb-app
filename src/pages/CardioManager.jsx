import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import BackButton from "../components/BackButton";
import { API_BASE_URL } from "../config/api";


export default function CardioManager() {
  const { isCoach } = useAuth();
  const navigate = useNavigate();

  // Initial Cardio Programs Data
  const initialCardioProgramme = [
    {
      id: 1,
      title: "Grundlagenausdauer",
      description: "Aufbau der aeroben Ausdauer mit langen Einheiten",
      workouts: [
        {
          id: 1,
          name: "Dauerlauf",
          instruction: "30-45 Minuten kontinuierlicher Lauf in gemäßigtem Tempo",
          intensity: "60-70% der max. Herzfrequenz",
          frequency: "2-3x pro Woche"
        },
        {
          id: 2,
          name: "Fahrrad-Training",
          instruction: "45-60 Minuten Radfahren in kontinuierlichem Tempo",
          intensity: "60-70% der max. Herzfrequenz",
          frequency: "1-2x pro Woche"
        }
      ]
    },
    {
      id: 2,
      title: "Intervalltraining",
      description: "Verbesserung der anaeroben Schwelle und Erholungsfähigkeit",
      workouts: [
        {
          id: 3,
          name: "Sprint-Intervalle",
          instruction: "10x 30 Sekunden Sprint, 90 Sekunden Erholung",
          intensity: "90-100% Intensität in Sprints, langsames Joggen in Pausen",
          frequency: "1-2x pro Woche"
        },
        {
          id: 4,
          name: "Tabata-Training",
          instruction: "8 Runden: 20 Sekunden maximale Anstrengung, 10 Sekunden Pause",
          intensity: "Nahezu maximale Intensität",
          frequency: "1x pro Woche"
        }
      ]
    },
    {
      id: 3,
      title: "Eishockey-spezifische Ausdauer",
      description: "Simulation von Spielsituationen zur Verbesserung der Erholungsfähigkeit",
      workouts: [
        {
          id: 5,
          name: "Wechsel-Simulation",
          instruction: "45 Sekunden hohe Intensität (Sprints, Richtungswechsel), 90 Sekunden aktive Erholung, 10-12 Wiederholungen",
          intensity: "85-95% während der Arbeitsphase, 50-60% während der Erholung",
          frequency: "1-2x pro Woche"
        },
        {
          id: 6,
          name: "Agilitäts-Parcours",
          instruction: "Durchlaufen eines Parcours mit Richtungswechseln, Sprüngen und kurzen Sprints, 6-8 Durchgänge",
          intensity: "85-90% der maximalen Intensität",
          frequency: "1x pro Woche"
        }
      ]
    }
  ];

  // State
  const [cardioProgramme, setCardioProgramme] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProgram, setEditingProgram] = useState(null);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [isAddingProgram, setIsAddingProgram] = useState(false);
  const [isAddingWorkout, setIsAddingWorkout] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [newProgramData, setNewProgramData] = useState({ title: "", description: "" });
  const [newWorkoutData, setNewWorkoutData] = useState({
    name: "",
    instruction: "",
    intensity: "",
    frequency: "",
    joggenIntensity: "",
    hometrainerIntensity: ""
  });

  // Check if user is a coach and fetch data
  useEffect(() => {
    if (!isCoach) {
      navigate('/');
    } else {
      fetchCardioPrograms();
    }
  }, [isCoach, navigate]);

  const fetchCardioPrograms = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cardio-programs`);
      const data = await response.json();
      setCardioProgramme(data);
    } catch (error) {
      console.error("Fehler beim Laden der Cardio-Programme:", error);
      // Fallback zu den initial-Programmen wenn die API nicht verfügbar ist
      setCardioProgramme(initialCardioProgramme);
    } finally {
      setLoading(false);
    }
  };

  // Generate a new unique ID for programs or workouts
  const generateId = (type) => {
    if (type === 'program') {
      const ids = cardioProgramme.map(prog => prog.id);
      return Math.max(...ids, 0) + 1;
    } else {
      // Flatten all workout IDs
      const ids = cardioProgramme.flatMap(prog => prog.workouts.map(w => w.id));
      return Math.max(...ids, 0) + 1;
    }
  };

  // Handler functions for programs
  const handleAddProgram = () => {
    setIsAddingProgram(true);
    setNewProgramData({ title: "", description: "" });
  };

  const handleSaveNewProgram = async () => {
    if (!newProgramData.title || !newProgramData.description) return;
    
    const newProgram = {
      title: newProgramData.title,
      description: newProgramData.description,
      workouts: []
    };

    try {
      const response = await fetch(`${API_BASE_URL}/cardio-programs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newProgram)
      });

      if (response.ok) {
        const savedProgram = await response.json();
        setCardioProgramme([...cardioProgramme, savedProgram]);
        setIsAddingProgram(false);
        setNewProgramData({ title: "", description: "" });
      }
    } catch (error) {
      console.error("Fehler beim Speichern des Programms:", error);
    }
  };

  const handleEditProgram = (program) => {
    setEditingProgram(program);
    setNewProgramData({
      title: program.title,
      description: program.description
    });
  };

  const handleUpdateProgram = async () => {
    if (!newProgramData.title || !newProgramData.description) return;
    
    const updatedProgram = {
      ...editingProgram,
      title: newProgramData.title,
      description: newProgramData.description
    };

    try {
      const response = await fetch(`${API_BASE_URL}/cardio-programs/${editingProgram.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedProgram)
      });

      if (response.ok) {
        const updatedPrograms = cardioProgramme.map(program => {
          if (program.id === editingProgram.id) {
            return updatedProgram;
          }
          return program;
        });
        
        setCardioProgramme(updatedPrograms);
        setEditingProgram(null);
        setNewProgramData({ title: "", description: "" });
      }
    } catch (error) {
      console.error("Fehler beim Aktualisieren des Programms:", error);
    }
  };

  const handleDeleteProgram = async (programId) => {
    if (window.confirm("Sind Sie sicher, dass Sie dieses Programm löschen möchten?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/cardio-programs/${programId}`, {
          method: "DELETE"
        });

        if (response.ok) {
          const filteredPrograms = cardioProgramme.filter(program => program.id !== programId);
          setCardioProgramme(filteredPrograms);
        }
      } catch (error) {
        console.error("Fehler beim Löschen des Programms:", error);
      }
    }
  };

  // Handler functions for workouts
  const handleAddWorkout = (program) => {
    setSelectedProgram(program);
    setIsAddingWorkout(true);
    setNewWorkoutData({
      name: "",
      instruction: "",
      intensity: "",
      frequency: ""
    });
  };

  const handleSaveNewWorkout = async () => {
    if (!newWorkoutData.name || !newWorkoutData.instruction || !newWorkoutData.intensity || !newWorkoutData.frequency) return;
    
    const updatedProgram = {
      ...selectedProgram,
      workouts: [
        ...selectedProgram.workouts,
        {
          id: generateId('workout'),
          ...newWorkoutData
        }
      ]
    };

    try {
      const response = await fetch(`${API_BASE_URL}/cardio-programs/${selectedProgram.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedProgram)
      });

      if (response.ok) {
        const updatedPrograms = cardioProgramme.map(program => {
          if (program.id === selectedProgram.id) {
            return updatedProgram;
          }
          return program;
        });
        
        setCardioProgramme(updatedPrograms);
        setIsAddingWorkout(false);
        setNewWorkoutData({
          name: "",
          instruction: "",
          intensity: "",
          frequency: ""
        });
      }
    } catch (error) {
      console.error("Fehler beim Speichern der Übung:", error);
    }
  };

  const handleEditWorkout = (program, workout) => {
    setSelectedProgram(program);
    setEditingWorkout(workout);
    setNewWorkoutData({
      name: workout.name,
      instruction: workout.instruction,
      intensity: workout.intensity,
      frequency: workout.frequency
    });
  };

  const handleUpdateWorkout = async () => {
    if (!newWorkoutData.name || !newWorkoutData.instruction || !newWorkoutData.intensity || !newWorkoutData.frequency) return;
    
    const updatedProgram = {
      ...selectedProgram,
      workouts: selectedProgram.workouts.map(workout => {
        if (workout.id === editingWorkout.id) {
          return {
            ...workout,
            name: newWorkoutData.name,
            instruction: newWorkoutData.instruction,
            intensity: newWorkoutData.intensity,
            frequency: newWorkoutData.frequency
          };
        }
        return workout;
      })
    };

    try {
      const response = await fetch(`${API_BASE_URL}/cardio-programs/${selectedProgram.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedProgram)
      });

      if (response.ok) {
        const updatedPrograms = cardioProgramme.map(program => {
          if (program.id === selectedProgram.id) {
            return updatedProgram;
          }
          return program;
        });
        
        setCardioProgramme(updatedPrograms);
        setEditingWorkout(null);
        setNewWorkoutData({
          name: "",
          instruction: "",
          intensity: "",
          frequency: ""
        });
      }
    } catch (error) {
      console.error("Fehler beim Aktualisieren der Übung:", error);
    }
  };

  const handleDeleteWorkout = async (programId, workoutId) => {
    if (window.confirm("Sind Sie sicher, dass Sie diese Übung löschen möchten?")) {
      const targetProgram = cardioProgramme.find(p => p.id === programId);
      const updatedProgram = {
        ...targetProgram,
        workouts: targetProgram.workouts.filter(workout => workout.id !== workoutId)
      };

      try {
        const response = await fetch(`${API_BASE_URL}/cardio-programs/${programId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(updatedProgram)
        });

        if (response.ok) {
          const updatedPrograms = cardioProgramme.map(program => {
            if (program.id === programId) {
              return updatedProgram;
            }
            return program;
          });
          
          setCardioProgramme(updatedPrograms);
        }
      } catch (error) {
        console.error("Fehler beim Löschen der Übung:", error);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-gray-900 font-sans transition-colors duration-300">
      <Header />
      <BackButton to="/coach/dashboard" />
      <main className="flex-1 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-[#0a2240] dark:text-blue-400">Cardio Programme verwalten</h1>
            <button
              onClick={handleAddProgram}
              className="px-4 py-2 bg-[#0a2240] dark:bg-blue-600 text-white rounded-lg hover:bg-blue-900 dark:hover:bg-blue-700 transition"
            >
              Neues Programm
            </button>
          </div>

          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a2240] dark:border-blue-400 mx-auto"></div>
              <p className="mt-3 text-gray-600 dark:text-gray-300">Lade Cardio-Programme...</p>
            </div>
          ) : (
            <div className="space-y-8">
            {cardioProgramme.map((program) => (
              <div key={program.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-[#0a2240] dark:text-blue-400">{program.title}</h2>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{program.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditProgram(program)}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition"
                    >
                      Bearbeiten
                    </button>
                    <button
                      onClick={() => handleDeleteProgram(program.id)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 transition"
                    >
                      Löschen
                    </button>
                    <button
                      onClick={() => handleAddWorkout(program)}
                      className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 transition"
                    >
                      Übung hinzufügen
                    </button>
                  </div>
                </div>

                <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Übungen:</h3>
                <div className="space-y-4">
                  {program.workouts.map((workout) => (
                    <div
                      key={workout.id}
                      className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-lg text-gray-900 dark:text-white">{workout.name}</h3>
                          <p className="text-gray-600 dark:text-gray-300 mt-1">{workout.instruction}</p>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                              <span className="font-medium text-gray-900 dark:text-gray-200">Intensität:</span> <span className="text-gray-700 dark:text-gray-300">{workout.intensity}</span>
                            </div>
                            <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded">
                              <span className="font-medium text-gray-900 dark:text-gray-200">Häufigkeit:</span> <span className="text-gray-700 dark:text-gray-300">{workout.frequency}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleEditWorkout(program, workout)}
                            className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition"
                          >
                            Bearbeiten
                          </button>
                          <button
                            onClick={() => handleDeleteWorkout(program.id, workout.id)}
                            className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 transition"
                          >
                            Löschen
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {program.workouts.length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 italic text-center py-4">
                      Keine Übungen in diesem Programm
                    </p>
                  )}
                </div>
              </div>
            ))}
          
            {cardioProgramme.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-4">Es sind noch keine Cardio-Programme definiert.</p>
                <button
                  onClick={handleAddProgram}
                  className="px-4 py-2 bg-[#0a2240] dark:bg-blue-600 text-white rounded-lg hover:bg-blue-900 dark:hover:bg-blue-700 transition"
                >
                  Programm erstellen
                </button>
              </div>
            )}
            </div>
          )}
        </div>

        {/* Modal für Programm bearbeiten */}
        {editingProgram && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md transition-colors duration-300">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Programm bearbeiten</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titel</label>
                  <input
                    type="text"
                    value={newProgramData.title}
                    onChange={(e) => setNewProgramData({ ...newProgramData, title: e.target.value })}
                    placeholder="Programmtitel"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Beschreibung</label>
                  <textarea
                    value={newProgramData.description}
                    onChange={(e) => setNewProgramData({ ...newProgramData, description: e.target.value })}
                    placeholder="Programmbeschreibung"
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setEditingProgram(null)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleUpdateProgram}
                  className="px-4 py-2 bg-[#0a2240] dark:bg-blue-600 text-white rounded-lg hover:bg-blue-900 dark:hover:bg-blue-700 transition"
                >
                  Speichern
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal für neues Programm */}
        {isAddingProgram && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md transition-colors duration-300">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Neues Programm erstellen</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titel</label>
                  <input
                    type="text"
                    value={newProgramData.title}
                    onChange={(e) => setNewProgramData({ ...newProgramData, title: e.target.value })}
                    placeholder="Programmtitel"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Beschreibung</label>
                  <textarea
                    value={newProgramData.description}
                    onChange={(e) => setNewProgramData({ ...newProgramData, description: e.target.value })}
                    placeholder="Programmbeschreibung"
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsAddingProgram(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSaveNewProgram}
                  className="px-4 py-2 bg-[#0a2240] dark:bg-blue-600 text-white rounded-lg hover:bg-blue-900 dark:hover:bg-blue-700 transition"
                >
                  Speichern
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal für Übung bearbeiten */}
        {editingWorkout && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md transition-colors duration-300">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Übung bearbeiten</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    value={newWorkoutData.name}
                    onChange={(e) => setNewWorkoutData({ ...newWorkoutData, name: e.target.value })}
                    placeholder="Name der Übung"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Anleitung</label>
                  <textarea
                    value={newWorkoutData.instruction}
                    onChange={(e) => setNewWorkoutData({ ...newWorkoutData, instruction: e.target.value })}
                    placeholder="Durchführung der Übung"
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Intensität</label>
                  <input
                    type="text"
                    value={newWorkoutData.intensity}
                    onChange={(e) => setNewWorkoutData({ ...newWorkoutData, intensity: e.target.value })}
                    placeholder="z.B. 70-80% der max. Herzfrequenz"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Häufigkeit</label>
                  <input
                    type="text"
                    value={newWorkoutData.frequency}
                    onChange={(e) => setNewWorkoutData({ ...newWorkoutData, frequency: e.target.value })}
                    placeholder="z.B. 2-3x pro Woche"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setEditingWorkout(null)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleUpdateWorkout}
                  className="px-4 py-2 bg-[#0a2240] dark:bg-blue-600 text-white rounded-lg hover:bg-blue-900 dark:hover:bg-blue-700 transition"
                >
                  Speichern
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal für neue Übung */}
        {isAddingWorkout && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md transition-colors duration-300">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Neue Übung hinzufügen</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    value={newWorkoutData.name}
                    onChange={(e) => setNewWorkoutData({ ...newWorkoutData, name: e.target.value })}
                    placeholder="Name der Übung"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Anleitung</label>
                  <textarea
                    value={newWorkoutData.instruction}
                    onChange={(e) => setNewWorkoutData({ ...newWorkoutData, instruction: e.target.value })}
                    placeholder="Durchführung der Übung"
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Intensität</label>
                  <input
                    type="text"
                    value={newWorkoutData.intensity}
                    onChange={(e) => setNewWorkoutData({ ...newWorkoutData, intensity: e.target.value })}
                    placeholder="z.B. 70-80% der max. Herzfrequenz"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Häufigkeit</label>
                  <input
                    type="text"
                    value={newWorkoutData.frequency}
                    onChange={(e) => setNewWorkoutData({ ...newWorkoutData, frequency: e.target.value })}
                    placeholder="z.B. 2-3x pro Woche"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsAddingWorkout(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSaveNewWorkout}
                  className="px-4 py-2 bg-[#0a2240] dark:bg-blue-600 text-white rounded-lg hover:bg-blue-900 dark:hover:bg-blue-700 transition"
                >
                  Speichern
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      
    </div>
  );
}
