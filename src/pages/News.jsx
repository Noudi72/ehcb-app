import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import BackButton from "../components/BackButton";
import LoadingSpinner from "../components/LoadingSpinner";
import KeyboardShortcuts from "../components/KeyboardShortcuts";
import { useAuth } from "../context/AuthContext";
import { useNews } from "../context/NewsContext";
import { useToast } from "../context/ToastContext";
import { useLanguage } from "../context/LanguageContext";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export default function News() {
  const { isCoach } = useAuth();
  const { newsItems, addNewsItem, deleteNewsItem, clearAllNews, loading, fetchNews } = useNews();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    title: "",
    date: new Date().toLocaleDateString('de-CH'),
    preview: "",
    type: "pdf",
    fileName: "",
    url: "",
    content: ""
  });

  // Funktion zum Herunterladen oder Öffnen von PDF-Dateien
  const handleDownloadPDF = (item) => {
    // Wenn eine hochgeladene Datei vorhanden ist
    if (item.filePath) {
      const isAbsolute = /^https?:\/\//i.test(item.filePath);
      const fullPath = isAbsolute ? item.filePath : `${API_BASE_URL}${item.filePath}`;
      window.open(fullPath, '_blank');
      return;
    }
    
    // Ansonsten dynamisch ein PDF aus dem Content generieren
    const doc = new jsPDF();
    
    // Titel und Datum
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(item.title, 20, 20);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "italic");
    doc.text(`Datum: ${item.date}`, 20, 30);
    
    // Logo
    // In einer Produktionsumgebung würde hier das Logo eingebunden werden
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("EHC BIEL-BIENNE U18-ELIT", 20, 40);
    
    // Inhalt
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const splitText = doc.splitTextToSize(item.content || "Keine Inhalte verfügbar", 170);
    doc.text(splitText, 20, 60);
    
    // Footer
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text("© EHC Biel-Bienne U18-Elit", 20, 280);
    
    doc.save(item.fileName);
  };

  // Funktion zum Öffnen von Video-Links oder hochgeladenen Videos
  const handleOpenVideo = (item) => {
    // Wenn eine hochgeladene Datei vorhanden ist
    if (item.filePath) {
      const isAbsolute = /^https?:\/\//i.test(item.filePath);
      const fullPath = isAbsolute ? item.filePath : `${API_BASE_URL}${item.filePath}`;
      window.open(fullPath, '_blank');
      return;
    }
    
    // Ansonsten externe URL öffnen
    window.open(item.url, '_blank');
  };

  // Funktion zum Anzeigen von Bildern
  const handleViewImage = (item) => {
    // Wenn eine hochgeladene Datei vorhanden ist
    if (item.filePath) {
      const isAbsolute = /^https?:\/\//i.test(item.filePath);
      const fullPath = isAbsolute ? item.filePath : `${API_BASE_URL}${item.filePath}`;
      window.open(fullPath, '_blank');
      return;
    }
    
    // Ansonsten externe URL öffnen
    window.open(item.url, '_blank');
  };

  // Funktion zum Öffnen von Links
  const handleOpenLink = (item) => {
    window.open(item.url, '_blank');
  };

  // Funktion zum Hinzufügen eines neuen News-Items
  const handleAddNewsItem = async () => {
    // Validierung
    if (!newItem.title || !newItem.preview || 
       (newItem.type === "pdf" && (!newItem.fileName || !newItem.content)) ||
       (newItem.type === "video" && !newItem.url) ||
       (newItem.type === "image" && !newItem.fileName && !newItem.url) ||
       (newItem.type === "link" && !newItem.url)) {
      toast.error("Bitte alle Pflichtfelder ausfüllen");
      return;
    }
    
    try {
      // Neues Item mit eindeutiger ID
      const newNewsItem = {
        ...newItem,
        id: Date.now()
      };
      
      // Zum Array hinzufügen über Context
      await addNewsItem(newNewsItem);
      
      // Erfolgs-Toast
      toast.success("News erfolgreich hinzugefügt!");
      
      // Form zurücksetzen
      setNewItem({
        title: "",
        date: new Date().toLocaleDateString('de-CH'),
        preview: "",
        type: "pdf",
        fileName: "",
        url: "",
        content: ""
      });
      
      // Form verstecken
      setShowAddForm(false);
    } catch (error) {
      toast.error("Fehler beim Hinzufügen der News");
      console.error("Error adding news:", error);
    }
  };  // Funktion zum Löschen eines News-Items (nur für Coaches)
  const handleDeleteNewsItem = async (itemId) => {
    if (window.confirm("Möchten Sie diesen Eintrag wirklich löschen?")) {
      try {
        await deleteNewsItem(itemId);
        toast.success("News erfolgreich gelöscht!");
      } catch (error) {
        toast.error("Fehler beim Löschen der News");
        console.error("Error deleting news:", error);
      }
    }
  };

  // Keyboard shortcuts (Quick Win 3)
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Only trigger shortcuts when not in input fields
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      // Ctrl+N: Create new news
      if (event.ctrlKey && event.key === 'n') {
        event.preventDefault();
        setShowAddForm(true);
        toast.info("Neue News erstellen (Strg+N)");
      }

      // Esc: Close form/cancel
      if (event.key === 'Escape') {
        event.preventDefault();
        if (showAddForm) {
          setShowAddForm(false);
          toast.info("Formular geschlossen (Esc)");
        }
      }

      // ? key: Show keyboard shortcuts
      if (event.key === '?') {
        event.preventDefault();
        // The KeyboardShortcuts component will handle this internally
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [fetchNews, toast, showAddForm]);

  if (loading) return <LoadingSpinner text="Lade News..." />;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-gray-900 font-sans transition-colors duration-300">
      <Header />
      <div className="px-4 py-4">
        <BackButton to="/" />
      </div>

      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">News & Downloads</h1>
            
            {isCoach && (
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="bg-[#0a2240] dark:bg-gray-800 text-white px-3 py-1 rounded-lg flex items-center text-sm hover:bg-blue-900 dark:hover:bg-gray-700 transition-colors"
                >
                  {showAddForm ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Abbrechen
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Neue Nachricht
                    </>
                  )}
                </button>
                
                {newsItems.length > 0 && (
                  <button 
                    onClick={() => {
                      if (window.confirm("Möchten Sie wirklich ALLE News löschen? Diese Aktion kann nicht rückgängig gemacht werden.")) {
                        clearAllNews();
                        toast.success("Alle News erfolgreich gelöscht!");
                      }
                    }}
                    className="bg-red-600 text-white px-3 py-1 rounded-lg flex items-center text-sm hover:bg-red-700 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Alle löschen
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Form zum Hinzufügen neuer News-Items (nur für Coaches) */}
          {isCoach && showAddForm && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6 transition-colors duration-300">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Neue Nachricht erstellen</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titel</label>
                <input 
                  type="text" 
                  value={newItem.title}
                  onChange={(e) => setNewItem({...newItem, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vorschautext</label>
                <textarea 
                  value={newItem.preview}
                  onChange={(e) => setNewItem({...newItem, preview: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows="2"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Typ</label>
                <select 
                  value={newItem.type}
                  onChange={(e) => setNewItem({...newItem, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="pdf">PDF-Dokument</option>
                  <option value="video">Video</option>
                </select>
              </div>
              
              {newItem.type === "pdf" && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dateiname (mit .pdf)</label>
                    <input 
                      type="text" 
                      value={newItem.fileName}
                      onChange={(e) => setNewItem({...newItem, fileName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="beispiel.pdf"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">PDF-Inhalt</label>
                    <textarea 
                      value={newItem.content}
                      onChange={(e) => setNewItem({...newItem, content: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      rows="5"
                    />
                  </div>
                </>
              )}
              
              {newItem.type === "video" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Video-URL</label>
                  <input
                    type="text" 
                    value={newItem.url}
                    onChange={(e) => setNewItem({...newItem, url: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    placeholder="https://example.com/video"
                  />
                </div>
              )}
              
              <div className="flex justify-end">
                <button 
                  onClick={handleAddNewsItem}
                  className="bg-[#0a2240] text-white px-4 py-2 rounded-lg hover:bg-[#0d2a4a] dark:bg-[#1a3a5a] dark:hover:bg-[#2a4a6a] transition-colors duration-300"
                >
                  Hinzufügen
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-lg overflow-hidden dark:bg-gray-800 dark:border dark:border-gray-700">
            {/* Loading-Anzeige */}
            {loading ? (
              <LoadingSpinner text="News werden geladen..." />
            ) : newsItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-300">Noch keine News verfügbar.</p>
                {isCoach && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Fügen Sie die erste News hinzu, um zu beginnen.
                  </p>
                )}
              </div>
            ) : (
              newsItems.map((item, index) => (
              <div 
                key={item.id} 
                className={`p-4 ${index !== newsItems.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{item.title}</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{item.date}</p>
                  </div>
                  <div className={`p-2 rounded-full ${
                    item.type === 'pdf' ? 'bg-red-100' : 
                    item.type === 'video' ? 'bg-blue-100' : 
                    item.type === 'image' ? 'bg-green-100' : 
                    'bg-purple-100'
                  }`}>
                    {item.type === 'pdf' ? (
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                        <path d="M14 3v4a1 1 0 001 1h4" stroke="#E53E3E" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" stroke="#E53E3E" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M9 14h6m-6 4h6" stroke="#E53E3E" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    ) : item.type === 'video' ? (
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                        <path d="M12 8v4l3 3m2-2c0 5-4 5-5 5s-5 0-5-5 4-5 5-5 5 0 5 5z" stroke="#3182CE" strokeWidth="2" strokeLinecap="round"/>
                        <rect x="6" y="4" width="12" height="16" rx="2" stroke="#3182CE" strokeWidth="2"/>
                      </svg>
                    ) : item.type === 'image' ? (
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="#10B981" strokeWidth="2"/>
                        <circle cx="9" cy="9" r="2" stroke="#10B981" strokeWidth="2"/>
                        <path d="M21 15l-3.086-3.086a2 2 0 00-2.828 0L6 21" stroke="#10B981" strokeWidth="2"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{item.preview}</p>
                
                <div className="mt-3 flex items-center justify-between">
                  <button 
                    onClick={() => {
                      if (item.type === 'pdf') {
                        handleDownloadPDF(item);
                      } else if (item.type === 'video') {
                        handleOpenVideo(item);
                      } else if (item.type === 'image') {
                        handleViewImage(item);
                      } else if (item.type === 'link') {
                        handleOpenLink(item);
                      }
                    }}
                    className="text-sm font-medium text-[#0a2240] hover:underline flex items-center dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <span>
                      {item.type === 'pdf' 
                        ? (item.filePath ? 'PDF öffnen' : 'Herunterladen') 
                        : item.type === 'video'
                        ? (item.filePath ? 'Video ansehen' : 'Video öffnen')
                        : item.type === 'image'
                        ? (item.filePath ? 'Bild ansehen' : 'Bild öffnen')
                        : 'Link öffnen'}
                    </span>
                    {item.type === 'pdf' ? (
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="ml-1">
                        <path d="M12 15V3m0 12l-4-4m4 4l4-4m5 8v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : item.type === 'video' ? (
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="ml-1">
                        <path d="M15 10l-5 3 5 3v-6z" fill="currentColor"/>
                        <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    ) : item.type === 'image' ? (
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="ml-1">
                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="9" cy="9" r="2" stroke="currentColor" strokeWidth="2"/>
                        <path d="M21 15l-3.086-3.086a2 2 0 00-2.828 0L6 21" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" className="ml-1">
                        <path d="M7 17L17 7M17 7H7m10 0v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    )}
                  </button>
                  
                  {isCoach && (
                    <button 
                      onClick={() => handleDeleteNewsItem(item.id)}
                      className="text-sm text-red-500 hover:underline flex items-center dark:text-red-400 dark:hover:text-red-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Löschen</span>
                    </button>
                  )}
                </div>
              </div>
              ))
            )}
          </div>
          
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4 dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-md font-semibold text-gray-700 mb-2 dark:text-gray-300">Benötigst du Hilfe?</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Falls du Probleme beim Öffnen der Dokumente hast oder weitere Informationen benötigst, 
              kontaktiere bitte den Teammanager unter <span className="text-[#0a2240] font-medium dark:text-blue-400">nguyaz@ehcb.ch</span>
            </p>
          </div>
        </div>
      </main>

      {/* Keyboard shortcuts help */}
      <KeyboardShortcuts />
      
    </div>
  );
}
