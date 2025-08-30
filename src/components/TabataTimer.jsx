import React, { useState, useEffect, useRef } from 'react';

const TabataTimer = ({ workout, onClose, trainingMode = "joggen" }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isWorkPhase, setIsWorkPhase] = useState(true);
  const [totalRounds, setTotalRounds] = useState(8); // Default Tabata is 8 rounds
  const [workTime, setWorkTime] = useState(20); // Default work time in seconds
  const [restTime, setRestTime] = useState(10); // Default rest time in seconds
  const [countdown, setCountdown] = useState(null); // 3-2-1-Go countdown
  const [currentSet, setCurrentSet] = useState(0); // Current set (0-indexed)
  const [totalSets, setTotalSets] = useState(1); // Default is 1 set
  const [betweenSetsRestTime, setBetweenSetsRestTime] = useState(60); // Default rest time between sets in seconds

  // Parse workout instructions to set proper values or use default values
  useEffect(() => {
    if (workout) {
      // Parse instruction string to get rounds, work time, and rest time
      const instructionText = workout.instruction.toLowerCase();
      
      let foundIntervalStructure = false;
      
      // Extract sets
      const setsMatch = instructionText.match(/(\d+)\s*(?:sets|sätze|einheiten)/i);
      if (setsMatch && setsMatch[1]) {
        setTotalSets(parseInt(setsMatch[1]));
      }
      
      // Extract set rest time
      const setRestMatch = instructionText.match(/(\d+)\s*sekunden\s*(?:satzpause|pause zwischen sätzen)/i);
      if (setRestMatch && setRestMatch[1]) {
        setBetweenSetsRestTime(parseInt(setRestMatch[1]));
      }
      
      // Extract rounds
      const roundsMatch = instructionText.match(/(\d+)\s*(?:runden|wiederholungen|durchgänge)/i);
      if (roundsMatch && roundsMatch[1]) {
        setTotalRounds(parseInt(roundsMatch[1]));
        foundIntervalStructure = true;
      }
      
      // Extract work time
      const workTimeMatch = instructionText.match(/(\d+)\s*sekunden\s*(?:maximale|hohe|intensive|arbeit)/i);
      if (workTimeMatch && workTimeMatch[1]) {
        setWorkTime(parseInt(workTimeMatch[1]));
        foundIntervalStructure = true;
      } else {
        // Alternative Muster für Arbeitszeit
        const altWorkTimeMatch = instructionText.match(/(\d+)\s*sekunden\s*(?:sprint|intensiv|belastung)/i);
        if (altWorkTimeMatch && altWorkTimeMatch[1]) {
          setWorkTime(parseInt(altWorkTimeMatch[1]));
          foundIntervalStructure = true;
        }
      }
      
      // Extract rest time
      const restTimeMatch = instructionText.match(/(\d+)\s*sekunden\s*(?:pause|erholung|ruhe|regeneration)/i);
      if (restTimeMatch && restTimeMatch[1]) {
        setRestTime(parseInt(restTimeMatch[1]));
        foundIntervalStructure = true;
      }
      
      // Wenn kein Intervall-Muster erkannt wurde, prüfen wir nach Minuten-Angaben
      if (!foundIntervalStructure) {
        const minutesMatch = instructionText.match(/(\d+)(?:-\d+)?\s*minuten/i);
        if (minutesMatch && minutesMatch[1]) {
          // Für kontinuierliche Trainings ohne Intervalle setzen wir einen Timer mit einer Runde
          setTotalRounds(1);
          // Wir verwenden die Minutenangabe als Arbeitsdauer und keine Pause
          setWorkTime(parseInt(minutesMatch[1]) * 60);
          setRestTime(0);
        } else {
          // Falls keine Zeit-Angabe gefunden wurde, verwenden wir Standardwerte
          // für ein grundlegendes Intervalltraining
          setTotalRounds(8);
          setWorkTime(30);
          setRestTime(30);
        }
      }
    }
    
    // Set initial time
    setTimeLeft(workTime);
  }, [workout]);

  // Timer logic
  useEffect(() => {
    let interval = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Wenn es keine Pausen gibt (kontinuierliches Training)
      if (restTime === 0) {
        const nextRound = rounds + 1;
        if (nextRound < totalRounds) {
          setRounds(nextRound);
          setTimeLeft(workTime);
          playBeep();
        } else {
          // Set beendet, prüfen auf nächsten Set
          const nextSet = currentSet + 1;
          if (nextSet < totalSets) {
            // Nächster Set beginnt nach einer Pause zwischen Sets
            setIsWorkPhase(false); // Wir sind in der Pause zwischen Sets
            setTimeLeft(betweenSetsRestTime);
            setCurrentSet(nextSet);
            setRounds(0); // Runden für neuen Set zurücksetzen
            playBeep();
            // Zeige Hinweis auf nächsten Set an
            setCountdown(`Set ${nextSet + 1}!`);
            setTimeout(() => {
              setCountdown(null);
            }, 2000);
          } else {
            // Gesamtes Workout beendet
            setIsActive(false);
            playFinishSound();
          }
        }
      } 
      // Bei Intervalltraining mit Pausen
      else if (isWorkPhase) {
        // Arbeitsphase beendet, Pause beginnt
        setIsWorkPhase(false);
        setTimeLeft(restTime);
        playBeep();
      } else {
        // Pause beendet, nächste Runde beginnt oder nächster Set
        const nextRound = rounds + 1;
        if (nextRound < totalRounds) {
          // Nächste Runde im aktuellen Set
          setRounds(nextRound);
          setIsWorkPhase(true);
          setTimeLeft(workTime);
          playBeep();
        } else {
          // Set beendet, prüfen auf nächsten Set
          const nextSet = currentSet + 1;
          if (nextSet < totalSets) {
            // Setze Timer für die Pause zwischen Sets
            setTimeLeft(betweenSetsRestTime);
            setCurrentSet(nextSet);
            setRounds(0); // Runden für neuen Set zurücksetzen
            // Wir bleiben in der Pause-Phase bis zum Start des nächsten Sets
            // Zeige Hinweis auf nächsten Set an
            setCountdown(`Set ${nextSet + 1}!`);
            setTimeout(() => {
              setCountdown(null);
              // Nach der Anzeige des Set-Hinweises setzen wir die Arbeitsphase
              setIsWorkPhase(true);
              setTimeLeft(workTime);
              playBeep();
            }, 2000);
          } else {
            // Gesamtes Workout beendet
            setIsActive(false);
            playFinishSound();
          }
        }
      }
    }
    
    return () => clearInterval(interval);
  }, [isActive, timeLeft, isWorkPhase, rounds, totalRounds, workTime, restTime, currentSet, totalSets, betweenSetsRestTime]);

  // Visual countdown instead of sound
  const playBeep = () => {
    // Start visual countdown
    startCountdown();
  };

  const playFinishSound = () => {
    // Show completion message
    setCountdown("Fertig!");
    setTimeout(() => {
      setCountdown(null);
    }, 2000);
  };
  
  // Visual countdown function
  const startCountdown = () => {
    setCountdown("3");
    
    setTimeout(() => {
      setCountdown("2");
      
      setTimeout(() => {
        setCountdown("1");
        
        setTimeout(() => {
          setCountdown("Los!");
          
          setTimeout(() => {
            setCountdown(null);
          }, 800);
        }, 800);
      }, 800);
    }, 800);
  };

  const startTimer = () => {
    // Show countdown before actually starting the timer
    startCountdown();
    
    // Start timer after countdown finishes (3.2 seconds)
    setTimeout(() => {
      setIsActive(true);
    }, 3200);
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setRounds(0);
    setCurrentSet(0);
    setIsWorkPhase(true);
    setTimeLeft(workTime);
  };

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{workout?.name || "Training Timer"}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className={`mb-4 px-3 py-2 rounded-lg text-sm ${
          trainingMode === "hometrainer" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"
        }`}>
          <div className="font-medium">Trainingsmodus: {trainingMode === "hometrainer" ? "Hometrainer" : "Joggen"}</div>
          {trainingMode === "hometrainer" && (
            <div className="mt-1">Pulsfrequenz: +10% gegenüber Joggen</div>
          )}
        </div>

        <div className="bg-gray-100 rounded-lg p-6 mb-6">
          {countdown ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-10 rounded-lg">
              <div className={`text-6xl font-bold ${
                countdown === "Los!" ? "text-green-500" : 
                countdown === "Fertig!" ? "text-blue-500" : "text-white"
              }`}>
                {countdown}
              </div>
            </div>
          ) : null}
          
          <div className="text-center">
            {totalSets > 1 && (
              <div className="mb-2">
                <div className="text-lg font-medium">Set</div>
                <div className="text-2xl font-bold">{currentSet + 1} / {totalSets}</div>
              </div>
            )}
            <div className="text-lg font-medium">Runde</div>
            <div className="text-3xl font-bold">{rounds + 1} / {totalRounds}</div>
          </div>
          
          {/* Phase-Anzeige nur anzeigen, wenn es tatsächlich Pausen gibt */}
          {(restTime > 0 || (totalSets > 1 && !isWorkPhase && rounds === 0)) && (
            <div className="text-center mt-4">
              <div className="text-lg font-medium">Phase</div>
              <div className="text-xl font-semibold">
                {isWorkPhase ? (
                  <span className="text-red-600">ARBEIT</span>
                ) : (
                  rounds === 0 && currentSet > 0 ? (
                    <span className="text-blue-600">SET PAUSE</span>
                  ) : (
                    <span className="text-green-600">PAUSE</span>
                  )
                )}
              </div>
            </div>
          )}
          
          <div className="text-center mt-6">
            <div className="text-5xl font-bold mb-2">{formatTime(timeLeft)}</div>
          </div>
          
          <div className="flex justify-center space-x-4 mt-6">
            {!isActive ? (
              <button 
                onClick={startTimer}
                className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
              >
                {rounds === 0 && timeLeft === workTime ? "Start" : "Fortsetzen"}
              </button>
            ) : (
              <button 
                onClick={pauseTimer}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700"
              >
                Pause
              </button>
            )}
            
            <button 
              onClick={resetTimer}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700"
            >
              Zurücksetzen
            </button>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <div className="text-sm text-gray-600 mb-2">Timer-Einstellungen:</div>
          <div className={restTime > 0 ? "grid grid-cols-3 gap-2" : "grid grid-cols-2 gap-2"}>
            <div className="col-span-1">
              <label className="block text-xs text-gray-500">Runden</label>
              <input 
                type="number" 
                value={totalRounds}
                onChange={(e) => setTotalRounds(parseInt(e.target.value))}
                className="w-full px-2 py-1 border rounded text-sm"
                min="1"
                disabled={isActive}
              />
            </div>
            <div className="col-span-1">
              <label className="block text-xs text-gray-500">
                {restTime > 0 ? "Arbeit (s)" : "Zeit (s)"}
              </label>
              <input 
                type="number" 
                value={workTime}
                onChange={(e) => setWorkTime(parseInt(e.target.value))}
                className="w-full px-2 py-1 border rounded text-sm"
                min="5"
                disabled={isActive}
              />
            </div>
            {restTime > 0 && (
              <div className="col-span-1">
                <label className="block text-xs text-gray-500">Pause (s)</label>
                <input 
                  type="number" 
                  value={restTime}
                  onChange={(e) => setRestTime(parseInt(e.target.value))}
                  className="w-full px-2 py-1 border rounded text-sm"
                  min="0"
                  disabled={isActive}
                />
              </div>
            )}
          </div>
          
          {/* Option um zwischen kontinuierlichem Timer und Intervalltraining zu wechseln */}
          <div className="mt-3 flex items-center">
            <label className="flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={restTime > 0}
                onChange={() => {
                  if (restTime > 0) {
                    // Wechsel zu kontinuierlichem Timer
                    setRestTime(0);
                    // Wenn es ein längeres Workout ist, setze auf eine Runde
                    if (workTime > 60) {
                      setTotalRounds(1);
                    }
                  } else {
                    // Wechsel zu Intervalltraining
                    setRestTime(30);
                  }
                }}
                className="mr-2 h-4 w-4 text-blue-600"
                disabled={isActive}
              />
              <span className="text-xs text-gray-600">
                Intervalltraining mit Pausen
              </span>
            </label>
          </div>

          {/* Sets Einstellungen */}
          <div className="mt-4 border-t pt-3">
            <div className="text-sm text-gray-600 mb-2">Sets Einstellungen:</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-1">
                <label className="block text-xs text-gray-500">Anzahl Sets</label>
                <input 
                  type="number" 
                  value={totalSets}
                  onChange={(e) => setTotalSets(parseInt(e.target.value) || 1)}
                  className="w-full px-2 py-1 border rounded text-sm"
                  min="1"
                  disabled={isActive}
                />
              </div>
              <div className="col-span-1">
                <label className="block text-xs text-gray-500">Pause zwischen Sets (s)</label>
                <input 
                  type="number" 
                  value={betweenSetsRestTime}
                  onChange={(e) => setBetweenSetsRestTime(parseInt(e.target.value) || 30)}
                  className="w-full px-2 py-1 border rounded text-sm"
                  min="0"
                  disabled={isActive || totalSets <= 1}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Audio entfernt, visuelle Anzeige wird stattdessen verwendet */}
      </div>
    </div>
  );
};

export default TabataTimer;
