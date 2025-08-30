import React from "react";
import { useTheme } from "../context/ThemeContext";
import BackButton from "../components/BackButton";


export default function Teamkalender() {
  const { isDarkMode } = useTheme();
  // Beispieldaten für den Teamkalender
  const currentMonth = "August 2025";
  const events = [
    {
      date: "2025-08-25",
      time: "18:00 - 20:00",
      type: "Training",
      location: "Eisstadion Biel",
      details: "Fokus: Powerplay/Penalty Kill"
    },
    {
      date: "2025-08-27",
      time: "18:00 - 20:00",
      type: "Training",
      location: "Eisstadion Biel",
      details: "Fokus: Defensivspiel"
    },
    {
      date: "2025-08-29",
      time: "19:30 - 22:00",
      type: "Heimspiel",
      location: "Eisstadion Biel",
      details: "vs. HC Davos U18",
      important: true
    },
    {
      date: "2025-08-31",
      time: "16:00 - 18:00",
      type: "Training",
      location: "Eisstadion Biel",
      details: "Regeneration"
    },
    {
      date: "2025-09-02",
      time: "18:00 - 20:00",
      type: "Training",
      location: "Eisstadion Biel",
      details: "Fokus: Angriffsspiel"
    },
    {
      date: "2025-09-04",
      time: "17:30 - 21:00",
      type: "Auswärtsspiel",
      location: "Zürich",
      details: "vs. ZSC Lions U18",
      important: true
    }
  ];

  // Gruppieren der Events nach Datum
  const groupedEvents = events.reduce((acc, event) => {
    const date = new Date(event.date);
    const formattedDate = date.toLocaleDateString('de-CH', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
    
    if (!acc[formattedDate]) {
      acc[formattedDate] = [];
    }
    
    acc[formattedDate].push(event);
    return acc;
  }, {});

  return (
    <div className={`min-h-screen flex flex-col font-sans ${isDarkMode ? 'bg-gray-900' : 'bg-[#f8fafc]'}`}>
      <div className={`px-4 py-4 flex items-center justify-between rounded-b-3xl shadow-md ${
        isDarkMode ? 'bg-gray-800' : 'bg-[#0a2240]'
      }`}>
        <div className="flex items-center space-x-3">
          <BackButton to="/" />
          <img
            src="/ehcb_logo.png"
            alt="EHCB Logo"
            className="h-12 w-12 object-contain"
          />
          <div>
            <div className={`font-semibold text-base leading-none ${
              isDarkMode ? 'text-gray-200' : 'text-white'
            }`}>
              EHC BIEL-BIENNE
            </div>
            <div className={`text-2xl font-bold leading-tight tracking-tight ${
              isDarkMode ? 'text-blue-400' : 'text-[#ffd342]'
            }`}>
              U18-ELIT
            </div>
          </div>
        </div>
        <div>
          <svg width="32" height="32" fill="none">
            <rect y="7" width="32" height="3" rx="1.5" fill={isDarkMode ? "#9CA3AF" : "#fff"}/>
            <rect y="15" width="32" height="3" rx="1.5" fill={isDarkMode ? "#9CA3AF" : "#fff"}/>
            <rect y="23" width="32" height="3" rx="1.5" fill={isDarkMode ? "#9CA3AF" : "#fff"}/>
          </svg>
        </div>
      </div>

      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="flex justify-between items-center mb-6">
            <button className={`p-2 ${isDarkMode ? 'text-blue-400' : 'text-[#0a2240]'}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h1 className={`text-xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-[#0a2240]'}`}>{currentMonth}</h1>
            <button className={`p-2 ${isDarkMode ? 'text-blue-400' : 'text-[#0a2240]'}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {Object.entries(groupedEvents).map(([date, events], index) => (
              <div key={index}>
                <h2 className={`text-lg font-semibold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>{date}</h2>
                <div className="space-y-3">
                  {events.map((event, idx) => (
                    <div 
                      key={idx} 
                      className={`rounded-lg shadow-md border-l-4 ${
                        isDarkMode ? 'bg-gray-800' : 'bg-white'
                      } ${
                        event.type === 'Training' ? 'border-blue-500' : 
                        event.type === 'Heimspiel' ? 'border-green-500' : 
                        'border-orange-500'
                      } p-3`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className={`font-medium flex items-center ${
                            isDarkMode ? 'text-white' : 'text-gray-800'
                          }`}>
                            {event.type}
                            {event.important && (
                              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                                isDarkMode ? 'bg-red-800 text-red-200' : 'bg-red-100 text-red-800'
                              }`}>
                                Wichtig
                              </span>
                            )}
                          </h3>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{event.time}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          isDarkMode ? 'bg-gray-700 text-gray-200' : 'bg-[#0a2240] text-white'
                        }`}>
                          {new Date(event.date).getDate()}
                        </span>
                      </div>
                      <p className={`text-sm mt-1.5 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{event.location}</p>
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>{event.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 flex space-x-2 justify-center">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-blue-500 rounded-full inline-block mr-1"></span>
              <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Training</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full inline-block mr-1"></span>
              <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Heimspiel</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-orange-500 rounded-full inline-block mr-1"></span>
              <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Auswärtsspiel</span>
            </div>
          </div>
        </div>
      </main>

      
    </div>
  );
}
