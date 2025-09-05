import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import BackButton from "../components/BackButton";

import { useAuth } from "../context/AuthContext";
import { useNews } from "../context/NewsContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import { news, users, notifications } from "../config/supabase-api";
import axios from "axios";

export default function NewsManager() {
  const { isCoach } = useAuth();
  const { newsItems, addNewsItem, updateNewsItem, deleteNewsItem } = useNews();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isCreating, setIsCreating] = useState(false);

  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    date: new Date().toLocaleDateString('de-CH'),
    preview: "",
    type: "pdf",
    fileName: "",
    url: "",
    content: "",
    file: null,
    filePath: "",
    targetTeams: [] // Neue Eigenschaft für Team-Zuordnung
  });

  // Prüfen, ob der Nutzer Coach ist, sonst umleiten
  useEffect(() => {
    if (!isCoach) {
      navigate("/news");
    }
  }, [isCoach, navigate]);

  // Formular für neuen Eintrag vorbereiten
  const handleAddNew = () => {
  setIsCreating(true);
    setEditingItem(null);
    setFormData({
      title: "",
      date: new Date().toLocaleDateString('de-CH'),
      preview: "",
      type: "pdf",
      fileName: "",
      url: "",
      content: "",
      file: null,
      filePath: "",
      targetTeams: []
    });
  };
  
  // Datei-Upload-Handler
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFormData({
        ...formData,
        file: selectedFile,
        fileName: selectedFile.name
      });
    }
  };
  
  // Datei hochladen
  const uploadFile = async () => {
    if (!formData.file) return null;
    
    // Railway API deaktiviert - Upload nicht verfügbar
    console.warn('🚫 File Upload deaktiviert (Railway API nicht verfügbar)');
    throw new Error('File Upload Service nicht verfügbar');
    
    /* DEAKTIVIERT:
    const fileType = formData.type;
    const endpoint = `${API_BASE_URL}/api/upload/${fileType}`;
    */
    
    const formDataObj = new FormData();
    formDataObj.append('file', formData.file);
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      console.log("Sende Datei an:", endpoint);
      const response = await axios.post(endpoint, formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      
      setIsUploading(false);
      
      if (response.data.success) {
        const urlOrPath = response.data.url || response.data.filePath || '';
        return {
          fileName: response.data.fileName,
          filePath: urlOrPath
        };
      }
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
      alert('Fehler beim Hochladen der Datei');
      return null;
    }
  };

  // Bestehendes Item zum Bearbeiten laden
  const handleEdit = (item) => {
  setIsCreating(true);
    setEditingItem(item.id);
    setFormData({...item});
  };

  // Änderungen im Formular verarbeiten
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Formular speichern (für neues oder bearbeitetes Item)
  const handleSave = async () => {
    // Validierung
    if (!formData.title || !formData.preview) {
      alert("Bitte Titel und Vorschautext ausfüllen");
      return;
    }
    
    if (formData.type === "pdf" && !formData.file && !formData.filePath && !formData.content) {
      alert("Bitte eine PDF-Datei hochladen oder Inhalt eingeben");
      return;
    }
    
    if (formData.type === "video" && !formData.file && !formData.url) {
      alert("Bitte eine Video-Datei hochladen oder eine URL eingeben");
      return;
    }
    
    let fileData = null;
    
    // Wenn eine neue Datei ausgewählt wurde, diese zuerst hochladen
    if (formData.file) {
      fileData = await uploadFile();
      if (!fileData && (formData.type === "pdf" && !formData.content) || 
          (formData.type === "video" && !formData.url)) {
        return; // Wenn Upload fehlgeschlagen und keine Alternative vorhanden ist
      }
    }
    
    const updatedFormData = {
      ...formData,
      fileName: fileData?.fileName || formData.fileName,
      filePath: fileData?.filePath || formData.filePath,
      file: null // Entfernen des File-Objekts aus den zu speichernden Daten
    };
    
    if (editingItem === null) {
      // Neues Item hinzufügen – ID vom Context vergeben lassen
      const savedItem = await addNewsItem({ ...updatedFormData });

      // Push-Nachricht für neue News senden
      try {
        await sendNotificationToTeams(savedItem.targetTeams || [], {
          title: `📰 Neue News: ${savedItem.title}`,
          message: savedItem.preview || `Neue Nachricht vom ${savedItem.date}`,
          type: 'news',
          contentId: savedItem.id
        });
      } catch (error) {
        console.error('Fehler beim Senden der Push-Nachricht:', error);
      }
    } else {
      // Bestehendes Item aktualisieren
      updateNewsItem({ ...updatedFormData, id: editingItem });
    }
    
  // Reset form
    setEditingItem(null);
  setIsCreating(false);
    setFormData({
      title: "",
      date: new Date().toLocaleDateString('de-CH'),
      preview: "",
      type: "pdf",
      fileName: "",
      url: "",
      content: "",
      file: null,
      filePath: "",
      targetTeams: []
    });
    
    // Erfolgsbenachrichtigung
    alert("News-Eintrag erfolgreich gespeichert!");
    
    // Optional: Zurück zur News-Übersicht navigieren
    // navigate("/news");
  };

  // Item löschen
  const handleDelete = (itemId) => {
    if (window.confirm("Möchten Sie diesen Eintrag wirklich löschen?")) {
      deleteNewsItem(itemId);
      
      // Falls gerade bearbeitet wird, Formular zurücksetzen
      if (editingItem === itemId) {
        setEditingItem(null);
        setFormData({
          title: "",
          date: new Date().toLocaleDateString('de-CH'),
          preview: "",
          type: "pdf",
          fileName: "",
          url: "",
          content: "",
          file: null,
          filePath: ""
        });
      }
    }
  };

  // Funktion zum Senden von Push-Nachrichten an spezifische Teams
  const sendNotificationToTeams = async (targetTeams, notificationData) => {
    try {
      // Hole alle User aus Supabase
      const allUsers = await users.getAll();

      // Filtere Spieler basierend auf den Ziel-Teams
      let targetUsers = [];
      
      if (targetTeams.length === 0 || targetTeams.includes('all')) {
        // Alle aktiven Spieler
        targetUsers = allUsers.filter(user => user.role === 'player' && user.active === true);
      } else {
        // Nur Spieler der ausgewählten Teams
        targetUsers = allUsers.filter(user => {
          if (user.role !== 'player' || user.active !== true) return false;
          
          // Prüfe sowohl teams Array als auch mainTeam Feld für Abwärtskompatibilität
          const userTeams = user.teams || (user.mainTeam ? [user.mainTeam] : []);
          return targetTeams.some(team => userTeams.includes(team));
        });
      }

      // Erstelle Benachrichtigung für jeden Ziel-User
      for (const user of targetUsers) {
        const notification = {
          userId: user.id,
          title: notificationData.title,
          message: notificationData.message,
          type: notificationData.type || 'info',
          contentId: notificationData.contentId,
          isRead: false,
          createdAt: new Date().toISOString()
        };

        await notifications.create(notification);
      }

      console.log(`Push-Nachrichten an ${targetUsers.length} Spieler gesendet`);
      return true;
    } catch (error) {
      console.error('Fehler beim Senden der Push-Nachrichten:', error);
      throw error;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans ${isDarkMode ? 'bg-gray-900' : 'bg-[#f8fafc]'}`}>
      <Header />
      <BackButton to="/coach/dashboard" />

      <main className="flex-1 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-[#0a2240]'}`}>News-Manager</h1>
            <div className="flex gap-3">
              <button 
                onClick={handleAddNew}
                className={`px-4 py-2 rounded-lg flex items-center ${
                  isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-[#0a2240] text-white'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Neue Nachricht
              </button>
            </div>
          </div>

          {/* Formular für neues/bearbeitetes Item */}
          {isCreating ? (
            <div className={`p-6 rounded-lg shadow-md mb-8 ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h2 className={`text-xl font-semibold mb-4 ${
                isDarkMode ? 'text-white' : ''
              }`}>
                {editingItem !== null ? "Nachricht bearbeiten" : "Neue Nachricht erstellen"}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Titel</label>
                  <input 
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Datum</label>
                  <input 
                    type="text"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Vorschautext</label>
                <textarea 
                  name="preview"
                  value={formData.preview}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'
                  }`}
                  rows="2"
                />
              </div>
              
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Typ</label>
                <select 
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="pdf">📄 PDF-Dokument</option>
                  <option value="video">🎥 Video</option>
                  <option value="image">🖼️ Bild (JPEG/PNG)</option>
                  <option value="link">🔗 Link/Website</option>
                </select>
              </div>

              {/* Team-Auswahl */}
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>Ziel-Teams</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.targetTeams.length === 0 || formData.targetTeams.includes('all')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({...formData, targetTeams: ['all']});
                        } else {
                          setFormData({...formData, targetTeams: []});
                        }
                      }}
                      className="mr-2"
                    />
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : ''}`}>Alle Teams</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.targetTeams.includes('u16-elit')}
                      onChange={(e) => {
                        let newTeams = formData.targetTeams.filter(t => t !== 'all');
                        if (e.target.checked) {
                          newTeams = [...newTeams, 'u16-elit'];
                        } else {
                          newTeams = newTeams.filter(t => t !== 'u16-elit');
                        }
                        setFormData({...formData, targetTeams: newTeams});
                      }}
                      className="mr-2"
                    />
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : ''}`}>U16-Elit</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.targetTeams.includes('u18-elit')}
                      onChange={(e) => {
                        let newTeams = formData.targetTeams.filter(t => t !== 'all');
                        if (e.target.checked) {
                          newTeams = [...newTeams, 'u18-elit'];
                        } else {
                          newTeams = newTeams.filter(t => t !== 'u18-elit');
                        }
                        setFormData({...formData, targetTeams: newTeams});
                      }}
                      className="mr-2"
                    />
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : ''}`}>U18-Elit</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.targetTeams.includes('u21-elit')}
                      onChange={(e) => {
                        let newTeams = formData.targetTeams.filter(t => t !== 'all');
                        if (e.target.checked) {
                          newTeams = [...newTeams, 'u21-elit'];
                        } else {
                          newTeams = newTeams.filter(t => t !== 'u21-elit');
                        }
                        setFormData({...formData, targetTeams: newTeams});
                      }}
                      className="mr-2"
                    />
                    <span className={`text-sm ${isDarkMode ? 'text-gray-300' : ''}`}>U21-Elit</span>
                  </label>
                </div>
                <p className={`text-xs mt-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {formData.targetTeams.length === 0 || formData.targetTeams.includes('all') 
                    ? 'News wird an alle Spieler gesendet' 
                    : `News wird nur an ${formData.targetTeams.length} Team(s) gesendet`}
                </p>
              </div>
              
              {formData.type === "pdf" && (
                <>
                  <div className={`mb-4 border p-4 rounded-lg ${
                    isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>PDF-Datei hochladen</label>
                    <input 
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className={`w-full ${isDarkMode ? 'text-white' : ''}`}
                    />
                    {formData.file && (
                      <div className={`mt-2 text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Ausgewählte Datei: {formData.file.name} ({Math.round(formData.file.size / 1024)} KB)
                      </div>
                    )}
                    {formData.filePath && !formData.file && (
                      <div className={`mt-2 text-sm flex items-center ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        <span className={`px-2 py-1 rounded-full mr-2 ${
                          isDarkMode ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800'
                        }`}>
                          Hochgeladen
                        </span>
                        {formData.fileName}
                      </div>
                    )}
                    {isUploading && (
                      <div className="mt-2">
                        <div className={`h-2 rounded-full ${
                          isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                        }`}>
                          <div 
                            className="h-full bg-blue-600 rounded-full" 
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <div className={`text-xs text-center mt-1 ${
                          isDarkMode ? 'text-gray-300' : ''
                        }`}>{uploadProgress}% hochgeladen</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <label className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      PDF-Inhalt (optional wenn Datei hochgeladen wird)
                    </label>
                    <textarea 
                      name="content"
                      value={formData.content || ""}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md ${
                        isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'
                      }`}
                      rows="8"
                      placeholder="Inhalt des PDF-Dokuments (falls keine Datei hochgeladen wird)"
                    />
                  </div>
                </>
              )}
              
              {formData.type === "video" && (
                <>
                  <div className={`mb-4 p-3 rounded-md border ${
                    isDarkMode ? 'bg-yellow-900 text-yellow-100 border-yellow-700' : 'bg-yellow-50 text-yellow-700 border-yellow-300'
                  }`}>
                    Hinweis: In der Live-Version werden Videos nicht direkt gespeichert. Bitte eine Video-URL angeben (z. B. OneDrive, YouTube oder Vimeo).
                  </div>
                  <div className={`mb-4 border p-4 rounded-lg ${
                    isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>Video-Datei hochladen</label>
                    <input 
                      type="file"
                      accept="video/*"
                      onChange={handleFileChange}
                      className={`w-full ${isDarkMode ? 'text-white' : ''}`}
                    />
                    {formData.file && (
                      <div className={`mt-2 text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Ausgewählte Datei: {formData.file.name} ({Math.round(formData.file.size / 1024 / 1024)} MB)
                      </div>
                    )}
                    {formData.filePath && !formData.file && (
                      <div className={`mt-2 text-sm flex items-center ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        <span className={`px-2 py-1 rounded-full mr-2 ${
                          isDarkMode ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800'
                        }`}>
                          Hochgeladen
                        </span>
                        {formData.fileName}
                      </div>
                    )}
                    {isUploading && (
                      <div className="mt-2">
                        <div className={`h-2 rounded-full ${
                          isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                        }`}>
                          <div 
                            className="h-full bg-blue-600 rounded-full" 
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <div className={`text-xs text-center mt-1 ${
                          isDarkMode ? 'text-gray-300' : ''
                        }`}>{uploadProgress}% hochgeladen</div>
                      </div>
                    )}
                  </div>
                
                  <div className="mb-4">
                    <label className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Video-URL (optional wenn Datei hochgeladen wird)
                    </label>
                    <input 
                      type="text"
                      name="url"
                      value={formData.url || ""}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md ${
                        isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'
                      }`}
                      placeholder="https://example.com/video"
                    />
                  </div>
                </>
              )}

              {formData.type === "image" && (
                <>
                  <div className={`mb-4 border p-4 rounded-lg ${
                    isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <label className={`block text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>🖼️ Bild-Datei hochladen (JPEG, PNG)</label>
                    <input 
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleFileChange}
                      className={`w-full ${isDarkMode ? 'text-white' : ''}`}
                    />
                    {formData.file && (
                      <div className={`mt-2 text-sm ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Ausgewählte Datei: {formData.file.name} ({Math.round(formData.file.size / 1024)} KB)
                      </div>
                    )}
                    {formData.filePath && !formData.file && (
                      <div className={`mt-2 text-sm flex items-center ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        <span className={`px-2 py-1 rounded-full mr-2 ${
                          isDarkMode ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800'
                        }`}>
                          Hochgeladen
                        </span>
                        {formData.fileName}
                      </div>
                    )}
                    {isUploading && (
                      <div className="mt-2">
                        <div className={`h-2 rounded-full ${
                          isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                        }`}>
                          <div 
                            className="h-full bg-blue-600 rounded-full" 
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <div className={`text-xs text-center mt-1 ${
                          isDarkMode ? 'text-gray-300' : ''
                        }`}>{uploadProgress}% hochgeladen</div>
                      </div>
                    )}
                  </div>
                
                  <div className="mb-4">
                    <label className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Bild-URL (optional wenn Datei hochgeladen wird)
                    </label>
                    <input 
                      type="text"
                      name="url"
                      value={formData.url || ""}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md ${
                        isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'
                      }`}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="mb-4">
                    <label className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Bildbeschreibung
                    </label>
                    <textarea 
                      name="content"
                      value={formData.content || ""}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md ${
                        isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'
                      }`}
                      rows="4"
                      placeholder="Beschreibung oder Bildunterschrift..."
                    />
                  </div>
                </>
              )}

              {formData.type === "link" && (
                <>
                  <div className="mb-4">
                    <label className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      🔗 Website-URL
                    </label>
                    <input 
                      type="url"
                      name="url"
                      value={formData.url || ""}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md ${
                        isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'
                      }`}
                      placeholder="https://www.example.com"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Link-Beschreibung
                    </label>
                    <textarea 
                      name="content"
                      value={formData.content || ""}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md ${
                        isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'
                      }`}
                      rows="4"
                      placeholder="Warum ist dieser Link interessant? Was finden die Spieler dort?"
                    />
                  </div>
                </>
              )}
              
              <div className="flex justify-end space-x-4">
                <button 
                  onClick={() => {
                    setIsCreating(false);
                    setEditingItem(null);
                    setFormData({
                      title: "",
                      date: new Date().toLocaleDateString('de-CH'),
                      preview: "",
                      type: "pdf",
                      fileName: "",
                      url: "",
                      content: ""
                    });
                  }}
                  className={`px-4 py-2 border rounded-lg ${
                    isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Abbrechen
                </button>
                <button 
                  onClick={handleSave}
                  className={`px-4 py-2 rounded-lg ${
                    isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-[#0a2240] text-white'
                  }`}
                >
                  {editingItem !== null ? "Aktualisieren" : "Speichern"}
                </button>
              </div>
            </div>
          ) : null}

          {/* Tabelle mit bestehenden News-Items */}
          <div className={`rounded-lg shadow-md overflow-hidden ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <table className={`min-w-full divide-y ${
              isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
            }`}>
              <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Titel
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Datum
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Typ
                  </th>
                  <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${
                isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
              }`}>
                {newsItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{item.title}</div>
                      <div className={`text-sm truncate max-w-xs ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>{item.preview}</div>
                      {(item.filePath || item.url) && (
                        <button
                          onClick={() => {
                            const isAbsolute = item.filePath && /^https?:\/{2}/i.test(item.filePath);
                            if (item.filePath) {
                              const full = isAbsolute ? item.filePath : `${API_BASE_URL || ''}${item.filePath}`;
                              window.open(full, '_blank');
                            } else if (item.url) {
                              window.open(item.url, '_blank');
                            }
                          }}
                          className={`mt-1 text-xs underline ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}
                        >
                          {item.type === 'pdf' ? 'PDF öffnen' : item.type === 'video' ? 'Video ansehen' : item.type === 'image' ? 'Bild ansehen' : 'Link öffnen'}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>{item.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.type === 'pdf' 
                          ? (isDarkMode ? 'bg-red-800 text-red-200' : 'bg-red-100 text-red-800')
                          : item.type === 'video'
                          ? (isDarkMode ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-800')
                          : item.type === 'image'
                          ? (isDarkMode ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-800')
                          : (isDarkMode ? 'bg-purple-800 text-purple-200' : 'bg-purple-100 text-purple-800')
                      }`}>
                        {item.type === 'pdf' ? 'PDF' : item.type === 'video' ? 'Video' : item.type === 'image' ? 'Bild' : 'Link'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleEdit(item)} 
                        className={`mr-4 ${
                          isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-indigo-600 hover:text-indigo-900'
                        }`}
                      >
                        Bearbeiten
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)} 
                        className={`${
                          isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900'
                        }`}
                      >
                        Löschen
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      
    </div>
  );
}
