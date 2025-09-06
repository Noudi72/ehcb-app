import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import TabataTimer from "../components/TabataTimer";
import Header from "../components/Header";
import BackButton from "../components/BackButton";
import { cardio } from "../config/supabase-api";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function CardioProgram() {
  const { isCoach } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [showTimer, setShowTimer] = useState(false);
  const [trainingMode, setTrainingMode] = useState("joggen"); // "joggen" oder "hometrainer"
  const [cardioProgramme, setCardioProgramme] = useState([]);
  const [loading, setLoading] = useState(true);
  // References for PDF generation
  const programRefs = useRef([]);

  useEffect(() => {
    fetchCardioPrograms();
  }, []);

  const fetchCardioPrograms = async () => {
    try {
      console.log('🏃 Loading cardio programs...');
      setLoading(true);
      const data = await cardio.getAll();
      console.log('📊 Cardio data received:', data?.length || 0);
      
      if (data && data.length > 0) {
        setCardioProgramme(data);
        console.log('✅ Using Supabase/JSON cardio data');
      } else {
        console.log('🔄 No data from API, using fallback programs');
        // Fallback zu den hardcoded Programmen
        setCardioProgramme([
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
      ]);
      }
    } catch (error) {
      console.error("❌ Fehler beim Laden der Cardio-Programme:", error);
      // Fallback zu den hardcoded Programmen
      console.log('🔄 Using fallback cardio programs due to error');
      setCardioProgramme([
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
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkoutClick = (workout) => {
    setSelectedWorkout(workout);
    // Zeige immer die Option an, den Timer zu starten (für alle Workout-Typen)
  };

  const handleCloseTimer = () => {
    setShowTimer(false);
  };

  const handleManageProgramsClick = () => {
    navigate('/cardio-manager');
  };
  
  const generatePDF = async (program, index) => {
    const programElement = programRefs.current[index];
    
    if (!programElement) return;
    
    // Create a spinner or loading indicator
    const loadingElement = document.createElement('div');
    loadingElement.innerText = 'Generiere PDF...';
    loadingElement.style.position = 'absolute';
    loadingElement.style.top = '50%';
    loadingElement.style.left = '50%';
    loadingElement.style.transform = 'translate(-50%, -50%)';
    loadingElement.style.backgroundColor = 'white';
    loadingElement.style.padding = '10px';
    loadingElement.style.borderRadius = '5px';
    loadingElement.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.3)';
    loadingElement.style.zIndex = '9999';
    document.body.appendChild(loadingElement);
    
    try {
      // Get current date
      const date = new Date().toLocaleDateString('de-DE');
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Define colors
      const primaryColor = [10, 34, 64]; // #0a2240 dark blue
      const accentColor = [255, 211, 66]; // #ffd342 yellow
      
      // Create header with logo placeholder (would need to be replaced with actual EHC logo)
      pdf.setFillColor(...primaryColor);
      pdf.rect(0, 0, 210, 25, 'F');
      
      pdf.setFont(undefined, 'bold');
      pdf.setTextColor(255, 255, 255); // White
      pdf.setFontSize(16);
      pdf.text('EHC Biel - Cardio Trainingsprogramm', 15, 15);
      
      // Add training mode box
      pdf.setDrawColor(...primaryColor);
      pdf.setFillColor(245, 245, 245); // Light gray background
      pdf.roundedRect(15, 30, 180, 20, 3, 3, 'FD');
      
      pdf.setFont(undefined, 'bold');
      pdf.setTextColor(...primaryColor);
      pdf.setFontSize(12);
      pdf.text(`Trainingsmodus: ${trainingMode === "hometrainer" ? "Hometrainer" : "Joggen"}`, 20, 40);
      
      // Add date
      pdf.setFont(undefined, 'normal');
      pdf.text(`Datum: ${date}`, 20, 45);
      
      // Calculate height needed for title box
      pdf.setFontSize(14);
      const titleWidth = pdf.getStringUnitWidth(program.title) * 14 / pdf.internal.scaleFactor;
      const titleBoxHeight = titleWidth > 170 ? 18 : 12; // Taller box if title is long
      
      // Add program title and description
      pdf.setFillColor(...primaryColor);
      pdf.rect(15, 55, 180, titleBoxHeight, 'F');
      
      pdf.setFont(undefined, 'bold');
      pdf.setTextColor(255, 255, 255); // White
      pdf.setFontSize(14);
      
      // Handle potentially long title with wrap
      const wrappedTitle = pdf.splitTextToSize(program.title, 170);
      pdf.text(wrappedTitle, 20, titleBoxHeight > 12 ? 62 : 63);
      
      // Position for description depends on title
      const descriptionY = 55 + titleBoxHeight + 10;
      
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(10);
      const descriptionLines = pdf.splitTextToSize(program.description, 170);
      pdf.text(descriptionLines, 20, descriptionY);
      
      let yPosition = descriptionY + (descriptionLines.length * 5) + 5;
      
      // Add workouts
      program.workouts.forEach((workout, idx) => {
        // Check if we need a new page
        if (yPosition > 260) {
          pdf.addPage();
          yPosition = 20;
        }
        
        // Calculate height needed for workout name
        pdf.setFontSize(12);
        const nameWidth = pdf.getStringUnitWidth(workout.name) * 12 / pdf.internal.scaleFactor;
        const nameBoxHeight = nameWidth > 170 ? 14 : 8; // Taller box if name is long
        
        // Workout header
        pdf.setDrawColor(...primaryColor);
        pdf.setFillColor(240, 240, 240);
        pdf.roundedRect(15, yPosition, 180, nameBoxHeight, 2, 2, 'FD');
        
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(...primaryColor);
        pdf.setFontSize(12);
        
        // Handle potentially long workout name with wrap
        const wrappedName = pdf.splitTextToSize(workout.name, 170);
        pdf.text(wrappedName, 20, yPosition + (nameBoxHeight > 8 ? 6 : 5.5));
        yPosition += nameBoxHeight + 8;
        
        // Instructions
        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(60, 60, 60);
        pdf.setFontSize(10);
        
        const wrappedInstructions = pdf.splitTextToSize(workout.instruction, 170);
        pdf.text(wrappedInstructions, 20, yPosition);
        yPosition += wrappedInstructions.length * 5 + 5;
        
        // Calculate intensity based on training mode
        let intensityText = workout.intensity;
        if (trainingMode === "hometrainer" && workout.intensity.includes('%')) {
          // Erste Prozentangaben aktualisieren
          intensityText = workout.intensity.replace(/(\d+)(-\d+)?%/g, (match) => {
            const parts = match.replace('%', '').split('-');
            if (parts.length === 2) {
              const min = Math.min(100, Math.round(parseInt(parts[0]) * 1.1));
              const max = Math.min(100, Math.round(parseInt(parts[1]) * 1.1));
              return `${min}-${max}%`;
            } else {
              const value = Math.min(100, Math.round(parseInt(parts[0]) * 1.1));
              return `${value}%`;
            }
          });
          
          // Hometrainer-Hinweis als separaten Text hinzufügen
          intensityText += " (Hometrainer)";
        }
        
        // Calculate text widths for proper box sizing
        pdf.setFont(undefined, 'normal');
        pdf.setFontSize(10);
        
        // Format the intensity text differently to ensure proper display
        let formattedIntensityText = intensityText;
        if (intensityText.includes('(Hometrainer)')) {
          // Wenn wir einen Hometrainer-Text haben, formatieren wir ihn besser
          formattedIntensityText = intensityText.replace('(Hometrainer)', '\n(Hometrainer)');
        }
        
        // Handle potentially long intensity text with more space
        const wrappedIntensity = pdf.splitTextToSize(formattedIntensityText, 70);
        // Add more space per line for intensity
        const intensityHeight = wrappedIntensity.length * 6 + 6;
        
        // Handle potentially long frequency text
        const wrappedFrequency = pdf.splitTextToSize(workout.frequency, 50);
        const frequencyHeight = wrappedFrequency.length * 6 + 6;
        
        // Use the taller box height for both boxes, with minimum height
        const boxHeight = Math.max(intensityHeight, frequencyHeight, 16);
        
        // Draw separate boxes with more space
        pdf.setDrawColor(200, 200, 200);
        pdf.setFillColor(248, 248, 248);
        
        // First box - Intensity
        pdf.roundedRect(20, yPosition - 2, 170, boxHeight, 2, 2, 'FD');
        
        // Intensity label
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(...primaryColor);
        pdf.text('Intensität:', 25, yPosition + 5);
        
        // Intensity value
        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(60, 60, 60);
        pdf.text(wrappedIntensity, 60, yPosition + 5);
        
        // Update vertical position for next box
        yPosition += boxHeight + 6;
        
        // Second box - Frequency
        pdf.setDrawColor(200, 200, 200);
        pdf.setFillColor(248, 248, 248);
        pdf.roundedRect(20, yPosition - 2, 170, Math.max(frequencyHeight, 16), 2, 2, 'FD');
        
        // Frequency label
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(...primaryColor);
        pdf.text('Häufigkeit:', 25, yPosition + 5);
        
        // Frequency value
        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(60, 60, 60);
        pdf.text(wrappedFrequency, 60, yPosition + 5);
        
        // Update yPosition based on the frequency box height plus some padding
        yPosition += Math.max(frequencyHeight, 16) + 14;
        
        // Add separator line between workouts
        if (idx < program.workouts.length - 1) {
          pdf.setDrawColor(220, 220, 220);
          pdf.line(20, yPosition - 5, 190, yPosition - 5);
        }
      });
      
      // Add footer with important notes
      pdf.setDrawColor(...primaryColor);
      pdf.setFillColor(245, 245, 245);
      pdf.roundedRect(15, 270, 180, 20, 3, 3, 'FD');
      
      pdf.setFont(undefined, 'bold');
      pdf.setTextColor(...primaryColor);
      pdf.setFontSize(9);
      pdf.text('Wichtig:', 20, 277);
      
      pdf.setFont(undefined, 'normal');
      pdf.setTextColor(80, 80, 80);
      pdf.setFontSize(9);
      
      // Split the footer notes to ensure they fit
      const footerNote1 = 'Alle Programme sollten nach entsprechendem Aufwärmen durchgeführt werden.';
      const footerNote2 = 'Passe die Intensität deinem aktuellen Fitnesslevel an.';
      
      const wrappedNote1 = pdf.splitTextToSize(footerNote1, 150);
      const wrappedNote2 = pdf.splitTextToSize(footerNote2, 150);
      
      pdf.text(wrappedNote1, 40, 277);
      pdf.text(wrappedNote2, 40, 277 + wrappedNote1.length * 4 + 1);
      
      // Save the PDF
      pdf.save(`EHC-Biel_${program.title.replace(/\s/g, '_')}_${trainingMode}.pdf`);
    } catch (error) {
      console.error('Fehler beim Generieren des PDFs:', error);
      alert('Beim Generieren des PDFs ist ein Fehler aufgetreten. Bitte versuche es erneut.');
    } finally {
      // Remove the loading indicator
      if (loadingElement && loadingElement.parentNode) {
        document.body.removeChild(loadingElement);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-gray-900 font-sans transition-colors duration-300">
      <Header />
      <div className="px-4 py-4">
        <BackButton />
      </div>

      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cardio Programme</h1>
            {isCoach && (
              <button
                onClick={handleManageProgramsClick}
                className="px-4 py-2 bg-[#0a2240] dark:bg-blue-600 text-white rounded-lg hover:bg-blue-900 dark:hover:bg-blue-700 transition-colors duration-300 shadow-sm hover:shadow-md"
              >
                Programme verwalten
              </button>
            )}
          </div>
          
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-md p-4 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-md dark:hover:shadow-lg">
            <h3 className="font-medium text-gray-800 dark:text-gray-100 mb-2">Trainingsmodus auswählen:</h3>
            <div className="flex">
              <button
                onClick={() => setTrainingMode("joggen")}
                className={`flex-1 py-2 px-3 rounded-l-lg border-2 transition-all duration-300 ${
                  trainingMode === "joggen"
                    ? "bg-[#0a2240] dark:bg-blue-600 text-white border-[#0a2240] dark:border-blue-600 shadow-sm"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-sm"
                }`}
              >
                Joggen
              </button>
              <button
                onClick={() => setTrainingMode("hometrainer")}
                className={`flex-1 py-2 px-3 rounded-r-lg border-2 transition-all duration-300 ${
                  trainingMode === "hometrainer"
                    ? "bg-[#0a2240] dark:bg-blue-600 text-white border-[#0a2240] dark:border-blue-600 shadow-sm"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 hover:shadow-sm"
                }`}
              >
                Hometrainer
              </button>
            </div>
            {trainingMode === "hometrainer" && (
              <div className="mt-2 text-sm text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-200 dark:border-blue-700">
                <span className="font-medium">Hinweis:</span> Im Hometrainer-Modus sollte der Puls ca. 10% höher sein als beim Joggen.
              </div>
            )}
          </div>
          
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0a2240] dark:border-blue-600 mx-auto shadow-sm"></div>
              <p className="mt-3 text-gray-600 dark:text-gray-300">Lade Cardio-Programme...</p>
            </div>
          ) : cardioProgramme.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-600 dark:text-gray-300">Keine Cardio-Programme verfügbar.</p>
            </div>
          ) : (
            <>
            <div className="space-y-6">
            {cardioProgramme.map((program, index) => (
              <div 
                key={index} 
                ref={el => programRefs.current[index] = el}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-lg dark:hover:shadow-2xl hover:-translate-y-0.5 dark:hover:-translate-y-0.5"
              >
                <div className="bg-[#0a2240] dark:bg-blue-900 px-4 py-3">
                  <h2 className="text-lg font-bold text-white">{program.title}</h2>
                  <p className="text-sm text-[#ffd342] dark:text-yellow-300">{program.description}</p>
                </div>
                
                <div className="p-4 space-y-4">
                  {program.workouts.map((workout, wIndex) => (
                    <div 
                      key={wIndex} 
                      className="border-l-4 border-[#0a2240] dark:border-blue-600 pl-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300"
                      onClick={() => handleWorkoutClick(workout)}
                    >
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{workout.name}</h3>
                      <p className="text-sm text-gray-700 dark:text-gray-200 mt-1">{workout.instruction}</p>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600 shadow-sm dark:shadow-md">
                          <span className="font-medium text-gray-800 dark:text-gray-100">Intensität:</span> <span className="text-gray-600 dark:text-blue-300">{
                            trainingMode === "hometrainer" && workout.intensity.includes('%') 
                              ? workout.intensity.replace(/(\d+)(-\d+)?%/g, (match) => {
                                  // Extrahieren der Prozentzahlen und Erhöhung um 10%
                                  const parts = match.replace('%', '').split('-');
                                  if (parts.length === 2) {
                                    // Bereichsangabe (z.B. "60-70%")
                                    const min = Math.min(100, Math.round(parseInt(parts[0]) * 1.1));
                                    const max = Math.min(100, Math.round(parseInt(parts[1]) * 1.1));
                                    return `${min}-${max}% (Hometrainer)`;
                                  } else {
                                    // Einzelwert (z.B. "85%")
                                    const value = Math.min(100, Math.round(parseInt(parts[0]) * 1.1));
                                    return `${value}% (Hometrainer)`;
                                  }
                                })
                              : workout.intensity
                          }</span>
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600 shadow-sm dark:shadow-md">
                          <span className="font-medium text-gray-800 dark:text-gray-100">Häufigkeit:</span> <span className="text-gray-600 dark:text-blue-300">{workout.frequency}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-center">
                        <button 
                          className="px-3 py-1 bg-[#ffd342] hover:bg-yellow-400 dark:bg-blue-600 dark:hover:bg-blue-700 text-[#0a2240] dark:text-white text-sm font-medium rounded transition-all duration-300 shadow-sm hover:shadow-md"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedWorkout(workout);
                            setShowTimer(true);
                          }}
                        >
                          Timer starten
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-sm text-right border-t border-gray-200 dark:border-gray-600 transition-colors duration-300">
                  <button 
                    className="text-[#0a2240] dark:text-blue-300 font-medium hover:underline flex items-center gap-1 ml-auto transition-all duration-300 hover:text-blue-600 dark:hover:text-blue-200"
                    onClick={() => generatePDF(program, index)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 stroke-current text-[#0a2240] dark:text-blue-400" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF
                  </button>
                </div>
              </div>
            ))}
            </div>
            
            <div className="mt-8 p-4 bg-[#ffd342] bg-opacity-20 dark:bg-yellow-900/20 rounded-lg text-center border border-[#ffd342] dark:border-yellow-700 shadow-sm dark:shadow-md transition-all duration-300 hover:shadow-md dark:hover:shadow-lg">
              <h3 className="font-semibold text-[#0a2240] dark:text-yellow-300">Wichtig:</h3>
              <p className="text-sm mt-1 text-gray-700 dark:text-gray-200">
                Alle Programme sollten nach entsprechendem Aufwärmen durchgeführt werden. Passe die Intensität deinem aktuellen Fitnesslevel an.
              </p>
            </div>
            </>
          )}
        </div>
      </main>

      {showTimer && selectedWorkout && (
        <TabataTimer 
          workout={selectedWorkout} 
          onClose={handleCloseTimer}
          trainingMode={trainingMode}
        />
      )}
    </div>
  );
}
