import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSportFood } from "../context/SportFoodContext";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Header from "../components/Header";
import BackButton from "../components/BackButton";


export default function SportFoodManager() {
  const { 
    foodItems, 
    loading, 
    error, 
    fetchFoodItems, 
    addCategory, 
    updateCategory, 
    deleteCategory, 
    addFoodItem, 
    updateFoodItem, 
    deleteFoodItem,
    initializeDefaultData 
  } = useSportFood();
  const { isCoach } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  // State für das Bearbeiten/Hinzufügen von Kategorien und Einträgen
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [newItemData, setNewItemData] = useState({
    name: "",
    description: "",
    time: ""
  });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);

  // Überprüfen, ob der Benutzer Coach ist
  useEffect(() => {
    if (!isCoach) {
      navigate("/");
      return;
    }
    
    // Wenn keine Daten vorhanden sind, initialisieren
    if (foodItems.length === 0) {
      initializeDefaultData();
    }
  }, [isCoach, navigate, foodItems.length, initializeDefaultData]);

  // Funktion zum Öffnen des Kategoriebearbeitungs-Modal
  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategoryName(category.category);
  };

  // Funktion zum Speichern der bearbeiteten Kategorie
  const handleSaveCategory = async () => {
    if (!newCategoryName.trim()) return;

    await updateCategory(editingCategory.id, { category: newCategoryName });
    setEditingCategory(null);
    setNewCategoryName("");
  };

  // Funktion zum Öffnen des "Kategorie hinzufügen"-Modal
  const handleAddCategoryClick = () => {
    setIsAddingCategory(true);
    setNewCategoryName("");
  };

  // Funktion zum Speichern der neuen Kategorie
  const handleSaveNewCategory = async () => {
    if (!newCategoryName.trim()) return;

    await addCategory({ category: newCategoryName });
    setIsAddingCategory(false);
    setNewCategoryName("");
  };

  // Funktion zum Löschen einer Kategorie
  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm("Sind Sie sicher, dass Sie diese Kategorie löschen möchten?")) {
      await deleteCategory(categoryId);
      if (selectedCategory && selectedCategory.id === categoryId) {
        setSelectedCategory(null);
      }
    }
  };

  // Funktion zum Öffnen des Item-Bearbeitungs-Modal
  const handleEditItem = (category, item, index) => {
    setEditingItem({ category, item, index });
    setNewItemData({ ...item });
  };

  // Funktion zum Speichern des bearbeiteten Items
  const handleSaveItem = async () => {
    if (!newItemData.name.trim() || !newItemData.description.trim() || !newItemData.time.trim()) return;

    await updateFoodItem(
      editingItem.category.id, 
      editingItem.index, 
      newItemData
    );
    setEditingItem(null);
    setNewItemData({
      name: "",
      description: "",
      time: ""
    });
  };

  // Funktion zum Öffnen des "Item hinzufügen"-Modal
  const handleAddItemClick = (category) => {
    setSelectedCategory(category);
    setIsAddingItem(true);
    setNewItemData({
      name: "",
      description: "",
      time: ""
    });
  };

  // Funktion zum Speichern des neuen Items
  const handleSaveNewItem = async () => {
    if (!newItemData.name.trim() || !newItemData.description.trim() || !newItemData.time.trim()) return;

    await addFoodItem(selectedCategory.id, newItemData);
    setIsAddingItem(false);
    setNewItemData({
      name: "",
      description: "",
      time: ""
    });
  };

  // Funktion zum Löschen eines Items
  const handleDeleteItem = async (categoryId, itemIndex) => {
    if (window.confirm("Sind Sie sicher, dass Sie diese Empfehlung löschen möchten?")) {
      await deleteFoodItem(categoryId, itemIndex);
    }
  };

  // Wenn die Daten geladen werden
  if (loading && foodItems.length === 0) {
    return (
      <div className={`min-h-screen flex flex-col font-sans ${isDarkMode ? 'bg-gray-900' : 'bg-[#f8fafc]'}`}>
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
            isDarkMode ? 'border-blue-400' : 'border-[#0a2240]'
          }`}></div>
          <p className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Laden...</p>
        </main>
        
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans ${isDarkMode ? 'bg-gray-900' : 'bg-[#f8fafc]'}`}>
      <Header />
      <BackButton to="/coach/dashboard" />
      <main className="flex-1 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-[#0a2240]'}`}>Sport Food Manager</h1>
            <a
              href="https://www.sponser.ch/chde/"
              target="_blank"
              rel="noopener noreferrer"
              className={`text-sm flex items-center mt-1 hover:underline ${
                isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`}
            >
              <span>Zur Sponser Bestellseite</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <button
              onClick={handleAddCategoryClick}
              className={`px-4 py-2 rounded-lg transition ${
                isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-[#0a2240] text-white hover:bg-blue-900'
              }`}
            >
              Kategorie hinzufügen
            </button>
          </div>

        {error && (
          <div className={`mb-6 px-4 py-3 rounded ${
            isDarkMode ? 'bg-red-900 border-red-700 text-red-300' : 'bg-red-100 border-red-400 text-red-700'
          }`}>
            {error}
          </div>
        )}

        {foodItems.map((category) => (
          <div key={category.id} className={`mb-8 rounded-lg shadow-md p-5 border ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-blue-400' : 'text-[#0a2240]'}`}>{category.category}</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditCategory(category)}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
                >
                  Bearbeiten
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
                >
                  Löschen
                </button>
                <button
                  onClick={() => handleAddItemClick(category)}
                  className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition"
                >
                  Empfehlung hinzufügen
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              {category.items.map((item, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 transition ${
                    isDarkMode ? 'border-gray-600 bg-gray-700 hover:bg-gray-600' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`font-medium text-lg ${isDarkMode ? 'text-white' : ''}`}>{item.name}</h3>
                      <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{item.description}</p>
                      <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.time}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditItem(category, item, index)}
                        className={`px-2 py-1 text-xs rounded transition ${
                          isDarkMode ? 'bg-blue-800 text-blue-200 hover:bg-blue-700' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        }`}
                      >
                        Bearbeiten
                      </button>
                      <button
                        onClick={() => handleDeleteItem(category.id, index)}
                        className={`px-2 py-1 text-xs rounded transition ${
                          isDarkMode ? 'bg-red-800 text-red-200 hover:bg-red-700' : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        Löschen
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {category.items.length === 0 && (
                <p className={`italic text-center py-4 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Keine Empfehlungen in dieser Kategorie
                </p>
              )}
            </div>
          </div>
        ))}
        
        {foodItems.length === 0 && (
          <div className="text-center py-8">
            <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Es sind noch keine Sport Food-Kategorien definiert.</p>
            <button
              onClick={initializeDefaultData}
              className={`px-4 py-2 rounded-lg transition ${
                isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-[#0a2240] text-white hover:bg-blue-900'
              }`}
            >
              Standard-Daten laden
            </button>
          </div>
        )}
        </div>

        {/* Modal für Kategoriebearbeitung */}
        {editingCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`rounded-lg p-6 w-full max-w-md ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h2 className={`text-xl font-semibold mb-4 ${
                isDarkMode ? 'text-white' : ''
              }`}>Kategorie bearbeiten</h2>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Kategoriename"
                className={`w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'
                }`}
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setEditingCategory(null)}
                  className={`px-4 py-2 border rounded-lg transition ${
                    isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSaveCategory}
                  className={`px-4 py-2 rounded-lg transition ${
                    isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-[#0a2240] text-white hover:bg-blue-900'
                  }`}
                >
                  Speichern
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal für neue Kategorie */}
        {isAddingCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`rounded-lg p-6 w-full max-w-md ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h2 className={`text-xl font-semibold mb-4 ${
                isDarkMode ? 'text-white' : ''
              }`}>Neue Kategorie hinzufügen</h2>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Kategoriename"
                className={`w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'
                }`}
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsAddingCategory(false)}
                  className={`px-4 py-2 border rounded-lg transition ${
                    isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSaveNewCategory}
                  className={`px-4 py-2 rounded-lg transition ${
                    isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-[#0a2240] text-white hover:bg-blue-900'
                  }`}
                >
                  Speichern
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal für Itembearbeitung */}
        {editingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`rounded-lg p-6 w-full max-w-md ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h2 className={`text-xl font-semibold mb-4 ${
                isDarkMode ? 'text-white' : ''
              }`}>Empfehlung bearbeiten</h2>
              <div className="space-y-3">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Name</label>
                  <input
                    type="text"
                    value={newItemData.name}
                    onChange={(e) => setNewItemData({ ...newItemData, name: e.target.value })}
                    placeholder="Name der Empfehlung"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Beschreibung</label>
                  <textarea
                    value={newItemData.description}
                    onChange={(e) => setNewItemData({ ...newItemData, description: e.target.value })}
                    placeholder="Beschreibung"
                    rows="3"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Zeitpunkt</label>
                  <input
                    type="text"
                    value={newItemData.time}
                    onChange={(e) => setNewItemData({ ...newItemData, time: e.target.value })}
                    placeholder="z.B. 30 Minuten vor dem Training"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setEditingItem(null)}
                  className={`px-4 py-2 border rounded-lg transition ${
                    isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSaveItem}
                  className={`px-4 py-2 rounded-lg transition ${
                    isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-[#0a2240] text-white hover:bg-blue-900'
                  }`}
                >
                  Speichern
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal für neues Item */}
        {isAddingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`rounded-lg p-6 w-full max-w-md ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <h2 className={`text-xl font-semibold mb-4 ${
                isDarkMode ? 'text-white' : ''
              }`}>Neue Empfehlung hinzufügen</h2>
              <div className="space-y-3">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Name</label>
                  <input
                    type="text"
                    value={newItemData.name}
                    onChange={(e) => setNewItemData({ ...newItemData, name: e.target.value })}
                    placeholder="Name der Empfehlung"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Beschreibung</label>
                  <textarea
                    value={newItemData.description}
                    onChange={(e) => setNewItemData({ ...newItemData, description: e.target.value })}
                    placeholder="Beschreibung"
                    rows="3"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>Zeitpunkt</label>
                  <input
                    type="text"
                    value={newItemData.time}
                    onChange={(e) => setNewItemData({ ...newItemData, time: e.target.value })}
                    placeholder="z.B. 30 Minuten vor dem Training"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsAddingItem(false)}
                  className={`px-4 py-2 border rounded-lg transition ${
                    isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleSaveNewItem}
                  className={`px-4 py-2 rounded-lg transition ${
                    isDarkMode ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-[#0a2240] text-white hover:bg-blue-900'
                  }`}
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
