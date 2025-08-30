import React, { useState, useEffect, useMemo } from "react";
import { useReflexion } from "../context/ReflexionContext";
import { useTheme } from "../context/ThemeContext";
import Header from "../components/Header";
import BackButton from "../components/BackButton";


export default function StatisticsPage() {
  const { reflections, loading, error, fetchReflections } = useReflexion();
  const { isDarkMode } = useTheme();
  const [selectedPlayer, setSelectedPlayer] = useState("all");
  const [timeRange, setTimeRange] = useState("30"); // Tage
  const [chartType, setChartType] = useState("line"); // line oder bar
  
  useEffect(() => {
    fetchReflections();
  }, [fetchReflections]);
  
  // Liste aller Spieler extrahieren
  const players = useMemo(() => {
    const playerNames = [...new Set(reflections.map(r => r.name))];
    return playerNames.sort();
  }, [reflections]);
  
  // Daten nach Zeitraum filtern
  const filteredData = useMemo(() => {
    const now = new Date();
    const pastDate = new Date(now.setDate(now.getDate() - parseInt(timeRange)));
    
    let filteredReflections = reflections.filter(r => new Date(r.date) >= pastDate);
    
    if (selectedPlayer !== "all") {
      filteredReflections = filteredReflections.filter(r => r.name === selectedPlayer);
    }
    
    return filteredReflections;
  }, [reflections, selectedPlayer, timeRange]);
  
  // Durchschnittswerte berechnen
  const averages = useMemo(() => {
    if (filteredData.length === 0) return { mood: 0, energy: 0, intensity: 0, performance: 0 };
    
    const sum = filteredData.reduce(
      (acc, r) => ({
        mood: acc.mood + r.mood,
        energy: acc.energy + r.energy,
        intensity: acc.intensity + r.intensity,
        performance: acc.performance + r.performance
      }),
      { mood: 0, energy: 0, intensity: 0, performance: 0 }
    );
    
    return {
      mood: (sum.mood / filteredData.length).toFixed(1),
      energy: (sum.energy / filteredData.length).toFixed(1),
      intensity: (sum.intensity / filteredData.length).toFixed(1),
      performance: (sum.performance / filteredData.length).toFixed(1)
    };
  }, [filteredData]);
  
  // Trends berechnen (Vergleich mit vorherigem Zeitraum)
  const trends = useMemo(() => {
    const now = new Date();
    const pastDate = new Date(now.setDate(now.getDate() - parseInt(timeRange)));
    const earlierDate = new Date(now.setDate(now.getDate() - parseInt(timeRange)));
    
    let currentPeriod = reflections.filter(r => 
      new Date(r.date) >= pastDate
    );
    
    let previousPeriod = reflections.filter(r => 
      new Date(r.date) < pastDate && new Date(r.date) >= earlierDate
    );
    
    if (selectedPlayer !== "all") {
      currentPeriod = currentPeriod.filter(r => r.name === selectedPlayer);
      previousPeriod = previousPeriod.filter(r => r.name === selectedPlayer);
    }
    
    if (currentPeriod.length === 0 || previousPeriod.length === 0) {
      return { mood: 0, energy: 0, intensity: 0, performance: 0 };
    }
    
    const currentAvg = currentPeriod.reduce(
      (acc, r) => ({
        mood: acc.mood + r.mood,
        energy: acc.energy + r.energy,
        intensity: acc.intensity + r.intensity,
        performance: acc.performance + r.performance
      }),
      { mood: 0, energy: 0, intensity: 0, performance: 0 }
    );
    
    const previousAvg = previousPeriod.reduce(
      (acc, r) => ({
        mood: acc.mood + r.mood,
        energy: acc.energy + r.energy,
        intensity: acc.intensity + r.intensity,
        performance: acc.performance + r.performance
      }),
      { mood: 0, energy: 0, intensity: 0, performance: 0 }
    );
    
    return {
      mood: ((currentAvg.mood / currentPeriod.length) - 
             (previousAvg.mood / previousPeriod.length)).toFixed(1),
      energy: ((currentAvg.energy / currentPeriod.length) - 
               (previousAvg.energy / previousPeriod.length)).toFixed(1),
      intensity: ((currentAvg.intensity / currentPeriod.length) - 
                 (previousAvg.intensity / previousPeriod.length)).toFixed(1),
      performance: ((currentAvg.performance / currentPeriod.length) - 
                   (previousAvg.performance / previousPeriod.length)).toFixed(1)
    };
  }, [reflections, selectedPlayer, timeRange]);
  
  // Zeitliche Gruppierung für Grafiken
  const chartData = useMemo(() => {
    if (filteredData.length === 0) return [];
    
    // Nach Datum gruppieren
    const groupedByDate = filteredData.reduce((acc, reflection) => {
      const date = new Date(reflection.date).toLocaleDateString();
      
      if (!acc[date]) {
        acc[date] = {
          date,
          count: 0,
          mood: 0,
          energy: 0,
          intensity: 0,
          performance: 0
        };
      }
      
      acc[date].count += 1;
      acc[date].mood += reflection.mood;
      acc[date].energy += reflection.energy;
      acc[date].intensity += reflection.intensity;
      acc[date].performance += reflection.performance;
      
      return acc;
    }, {});
    
    // Durchschnitte pro Tag berechnen und in ein Array umwandeln
    return Object.values(groupedByDate)
      .map(day => ({
        date: day.date,
        mood: (day.mood / day.count).toFixed(1),
        energy: (day.energy / day.count).toFixed(1),
        intensity: (day.intensity / day.count).toFixed(1),
        performance: (day.performance / day.count).toFixed(1)
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [filteredData]);
  
  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-[#f8fafc]'}`}>
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className={`spinner-border ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} role="status">
            <span className="sr-only">Wird geladen...</span>
          </div>
        </div>
        
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-[#f8fafc]'}`}>
      <Header />
      <BackButton to="/" />
      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <div className={`w-full max-w-4xl rounded-2xl shadow-xl border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h1 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-blue-400' : 'text-[#0a2240]'}`}>Statistiken und Trends</h1>
      
      {error && (
        <div className={`mb-4 border px-4 py-3 rounded relative ${isDarkMode ? 'bg-red-900/20 border-red-700 text-red-300' : 'bg-red-100 border-red-400 text-red-700'}`}>
          {error}
        </div>
      )}
      
      {/* Filter-Optionen */}
      <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Spieler
            </label>
            <select
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            >
              <option value="all">Alle Spieler</option>
              {players.map(player => (
                <option key={player} value={player}>{player}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Zeitraum
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            >
              <option value="7">Letzte Woche</option>
              <option value="14">Letzte 2 Wochen</option>
              <option value="30">Letzter Monat</option>
              <option value="90">Letzte 3 Monate</option>
              <option value="180">Letzte 6 Monate</option>
              <option value="365">Letztes Jahr</option>
            </select>
          </div>
          
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Diagrammtyp
            </label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            >
              <option value="line">Liniendiagramm</option>
              <option value="bar">Balkendiagramm</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Durchschnittswerte */}
      <div className={`p-6 rounded-lg shadow-md mb-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-blue-400' : 'text-[#0a2240]'}`}>
          Durchschnittswerte {selectedPlayer === "all" ? "aller Spieler" : `von ${selectedPlayer}`}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Stimmung"
            value={averages.mood}
            trend={trends.mood}
            color="bg-blue-500"
            isDarkMode={isDarkMode}
          />
          
          <StatCard
            title="Energie-Level"
            value={averages.energy}
            trend={trends.energy}
            color="bg-green-500"
            isDarkMode={isDarkMode}
          />
          
          <StatCard
            title="Intensität"
            value={averages.intensity}
            trend={trends.intensity}
            color="bg-purple-500"
            isDarkMode={isDarkMode}
          />
          
          <StatCard
            title="Leistungsbeurteilung"
            value={averages.performance}
            trend={trends.performance}
            color="bg-yellow-500"
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
      
      {/* Zeitverlauf (Chart) */}
      <div className={`p-6 rounded-lg shadow-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <h2 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-blue-400' : 'text-[#0a2240]'}`}>
          Zeitlicher Verlauf {selectedPlayer === "all" ? "aller Spieler" : `von ${selectedPlayer}`}
        </h2>
        
        {chartData.length === 0 ? (
          <div className={`text-center py-10 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Keine Daten für die ausgewählten Filterkriterien
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-blue-400' : 'text-[#0a2240]'}`}>
                {chartType === 'line' ? 'Liniendiagramm' : 'Balkendiagramm'}: Zeitlicher Verlauf
              </h3>
              
              {/* Visualisierung ohne externe Bibliothek */}
              <div className={`relative h-64 border p-4 rounded-lg ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                <div className={`absolute left-0 top-0 bottom-0 flex flex-col justify-between px-2 py-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span className="text-xs">10</span>
                  <span className="text-xs">5</span>
                  <span className="text-xs">0</span>
                </div>
                
                <div className="absolute left-10 right-4 bottom-4 top-4">
                  {/* Y-Achse Linien */}
                  <div className={`absolute left-0 right-0 top-0 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}></div>
                  <div className={`absolute left-0 right-0 top-1/2 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}></div>
                  <div className={`absolute left-0 right-0 bottom-0 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}></div>
                  
                  {chartType === 'line' ? (
                    /* Liniendiagramm */
                    <div className="h-full w-full flex items-end">
                      <div className="h-full flex-1 flex items-end">
                        {/* Stimmung */}
                        <div className="relative flex-1 group">
                          {chartData.map((day, index) => (
                            <React.Fragment key={index}>
                              {index < chartData.length - 1 && (
                                <div 
                                  className="absolute bg-blue-500" 
                                  style={{
                                    height: '2px',
                                    left: `${(index / (chartData.length - 1)) * 100}%`,
                                    width: `${(1 / (chartData.length - 1)) * 100}%`,
                                    bottom: `${day.mood * 10}%`,
                                    transform: `rotate(${Math.atan2(
                                      (chartData[index + 1].mood - day.mood) * 10, 
                                      (1 / (chartData.length - 1)) * 100
                                    ) * (180 / Math.PI)}deg)`,
                                    transformOrigin: 'left bottom'
                                  }}
                                ></div>
                              )}
                              <div 
                                className="absolute w-3 h-3 rounded-full bg-blue-500 border-2 border-white"
                                style={{
                                  left: `${(index / (chartData.length - 1)) * 100}%`,
                                  bottom: `${day.mood * 10}%`,
                                  transform: 'translate(-50%, 50%)'
                                }}
                              ></div>
                            </React.Fragment>
                          ))}
                        </div>
                        
                        {/* Energie */}
                        <div className="relative flex-1 group">
                          {chartData.map((day, index) => (
                            <React.Fragment key={index}>
                              {index < chartData.length - 1 && (
                                <div 
                                  className="absolute bg-green-500" 
                                  style={{
                                    height: '2px',
                                    left: `${(index / (chartData.length - 1)) * 100}%`,
                                    width: `${(1 / (chartData.length - 1)) * 100}%`,
                                    bottom: `${day.energy * 10}%`,
                                    transform: `rotate(${Math.atan2(
                                      (chartData[index + 1].energy - day.energy) * 10, 
                                      (1 / (chartData.length - 1)) * 100
                                    ) * (180 / Math.PI)}deg)`,
                                    transformOrigin: 'left bottom'
                                  }}
                                ></div>
                              )}
                              <div 
                                className="absolute w-3 h-3 rounded-full bg-green-500 border-2 border-white"
                                style={{
                                  left: `${(index / (chartData.length - 1)) * 100}%`,
                                  bottom: `${day.energy * 10}%`,
                                  transform: 'translate(-50%, 50%)'
                                }}
                              ></div>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Balkendiagramm */
                    <div className="h-full w-full flex items-end">
                      {chartData.map((day, index) => (
                        <div key={index} className="flex-1 h-full flex flex-col justify-end space-y-1">
                          <div 
                            className="w-4 mx-auto bg-blue-500 rounded-t"
                            style={{ height: `${day.mood * 10}%` }}
                            title={`Stimmung: ${day.mood}/10`}
                          ></div>
                          <div 
                            className="w-4 mx-auto bg-green-500 rounded-t"
                            style={{ height: `${day.energy * 10}%` }}
                            title={`Energie: ${day.energy}/10`}
                          ></div>
                          <div 
                            className="w-4 mx-auto bg-purple-500 rounded-t"
                            style={{ height: `${day.intensity * 10}%` }}
                            title={`Intensität: ${day.intensity}/10`}
                          ></div>
                          <div 
                            className="w-4 mx-auto bg-yellow-500 rounded-t"
                            style={{ height: `${day.performance * 10}%` }}
                            title={`Leistung: ${day.performance}/10`}
                          ></div>
                          <div className="text-xs text-gray-500 transform -rotate-45 origin-top-left mt-2">
                            {day.date.split('/')[0]}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Legende */}
              <div className="flex justify-center mt-4 space-x-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded mr-1"></div>
                  <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Stimmung</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-1"></div>
                  <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Energie</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-purple-500 rounded mr-1"></div>
                  <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Intensität</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded mr-1"></div>
                  <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Leistung</span>
                </div>
              </div>
            </div>
            
            {/* Tabellendarstellung für detaillierte Daten */}
            <div className="mt-8">
              <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-blue-400' : 'text-[#0a2240]'}`}>Detaillierte Daten</h3>
              <div className="overflow-x-auto">
                <table className={`min-w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <thead>
                    <tr>
                      <th className={`py-2 px-4 border-b bg-gray-50 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-300' : 'border-gray-200 text-gray-500'}`}>
                        Datum
                      </th>
                      <th className={`py-2 px-4 border-b bg-gray-50 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-300' : 'border-gray-200 text-gray-500'}`}>
                        Stimmung
                      </th>
                      <th className={`py-2 px-4 border-b bg-gray-50 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-300' : 'border-gray-200 text-gray-500'}`}>
                        Energie
                      </th>
                      <th className={`py-2 px-4 border-b bg-gray-50 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-300' : 'border-gray-200 text-gray-500'}`}>
                        Intensität
                      </th>
                      <th className={`py-2 px-4 border-b bg-gray-50 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-300' : 'border-gray-200 text-gray-500'}`}>
                        Leistung
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.map((day, index) => (
                      <tr key={index} className={index % 2 === 0 ? (isDarkMode ? "bg-gray-700" : "bg-gray-50") : (isDarkMode ? "bg-gray-800" : "bg-white")}>
                        <td className={`py-2 px-4 border-b ${isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-900'}`}>
                          {day.date}
                        </td>
                        <td className={`py-2 px-4 border-b ${isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-900'}`}>
                          {day.mood}
                        </td>
                        <td className={`py-2 px-4 border-b ${isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-900'}`}>
                          {day.energy}
                        </td>
                        <td className={`py-2 px-4 border-b ${isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-900'}`}>
                          {day.intensity}
                        </td>
                        <td className={`py-2 px-4 border-b ${isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-900'}`}>
                          {day.performance}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
        </div>
      </main>
      
    </div>
  );
}

// Statistische Karte für einzelne Metriken
function StatCard({ title, value, trend, color, isDarkMode }) {
  return (
    <div className={`rounded-lg p-4 border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
      <h3 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{title}</h3>
      <div className="flex items-end mt-2">
        <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{value}</div>
        <div className={`text-sm ml-2 mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>/ 10</div>
      </div>
      
      <div className={`w-full rounded-full h-2 mt-2 mb-2 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
        <div
          className={`${color} h-2 rounded-full`}
          style={{ width: `${value * 10}%` }}
        ></div>
      </div>
      
      {trend !== 0 && (
        <div className={`text-sm mt-1 ${parseFloat(trend) > 0 ? (isDarkMode ? 'text-green-400' : 'text-green-600') : (isDarkMode ? 'text-red-400' : 'text-red-600')}`}>
          {parseFloat(trend) > 0 ? '↑' : '↓'} {Math.abs(trend)} im Vergleich zum vorherigen Zeitraum
        </div>
      )}
    </div>
  );
}
