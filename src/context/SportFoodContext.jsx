import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

// SportFood-Kontext erstellen
const SportFoodContext = createContext();

// Hook für den einfachen Zugriff auf den SportFood-Kontext
export const useSportFood = () => useContext(SportFoodContext);

// SportFood-Provider-Komponente
export const SportFoodProvider = ({ children }) => {
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Daten aus der API abrufen
  const fetchFoodItems = useCallback(async () => {
    setLoading(true);
    try {
      // Kategorien und Items getrennt abrufen
      const categoriesResponse = await axios.get(`${API_BASE_URL}/sport-food-categories`);
      const itemsResponse = await axios.get(`${API_BASE_URL}/sport-food-items`);
      
      // Daten strukturieren
      const categories = categoriesResponse.data;
      const items = itemsResponse.data;
      
      // Items nach Kategorie gruppieren
      const organizedData = categories.map(category => {
        const categoryItems = items.filter(item => item.categoryId === category.id);
        return {
          id: category.id,
          category: category.name,
          description: category.description,
          items: categoryItems.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            benefits: item.benefits,
            time: "30-60 Minuten" // Standard-Zeit, falls nicht definiert
          }))
        };
      });
      
      setFoodItems(organizedData);
      setError(null);
    } catch (err) {
      console.error("Fehler beim Laden der Sport Food-Daten:", err);
      setError("Fehler beim Laden der Ernährungsempfehlungen.");
      
      // Wenn noch keine Daten in der DB vorhanden sind, verwenden wir die Standarddaten
      setFoodItems(defaultFoodItems);
    } finally {
      setLoading(false);
    }
  }, []);

  // Beim Mounten der Komponente die Daten abrufen, aber nur einmal
  useEffect(() => {
    fetchFoodItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Neue Kategorie hinzufügen
  const addCategory = async (categoryData) => {
    setLoading(true);
    try {
      const newCategory = {
        name: categoryData.category,
        description: categoryData.description || ""
      };
      const response = await axios.post(`${API_BASE_URL}/sport-food-categories`, newCategory);
      
      const newFormattedCategory = {
        id: response.data.id,
        category: response.data.name,
        description: response.data.description,
        items: []
      };
      
      setFoodItems([...foodItems, newFormattedCategory]);
      setError(null);
      return newFormattedCategory;
    } catch (err) {
      console.error("Fehler beim Hinzufügen der Kategorie:", err);
      setError("Fehler beim Speichern der neuen Kategorie.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Kategorie aktualisieren
  const updateCategory = async (id, categoryData) => {
    setLoading(true);
    try {
      const existingCategory = foodItems.find(item => item.id === id);
      if (!existingCategory) return null;
      
      const updatedCategoryData = {
        name: categoryData.category,
        description: categoryData.description || existingCategory.description
      };
      
      const response = await axios.put(`${API_BASE_URL}/sport-food-categories/${id}`, updatedCategoryData);
      
      const updatedCategory = {
        ...existingCategory,
        category: response.data.name,
        description: response.data.description
      };
      
      setFoodItems(foodItems.map(item => item.id === id ? updatedCategory : item));
      setError(null);
      return updatedCategory;
    } catch (err) {
      console.error("Fehler beim Aktualisieren der Kategorie:", err);
      setError("Fehler beim Aktualisieren der Kategorie.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Kategorie löschen
  const deleteCategory = async (id) => {
    setLoading(true);
    try {
      // Zuerst alle Items in dieser Kategorie löschen
      const itemsToDelete = await axios.get(`${API_BASE_URL}/sport-food-items?categoryId=${id}`);
      for (const item of itemsToDelete.data) {
        await axios.delete(`${API_BASE_URL}/sport-food-items/${item.id}`);
      }
      
      // Dann die Kategorie löschen
      await axios.delete(`${API_BASE_URL}/sport-food-categories/${id}`);
      
      setFoodItems(foodItems.filter(item => item.id !== id));
      setError(null);
      return true;
    } catch (err) {
      console.error("Fehler beim Löschen der Kategorie:", err);
      setError("Fehler beim Löschen der Kategorie.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Empfehlung zu einer Kategorie hinzufügen
  const addFoodItem = async (categoryId, itemData) => {
    setLoading(true);
    try {
      const category = foodItems.find(item => item.id === categoryId);
      if (!category) return null;
      
      const newItem = {
        categoryId: categoryId,
        name: itemData.name,
        description: itemData.description,
        benefits: itemData.benefits || "",
        time: itemData.time || "30-60 Minuten"
      };
      
      const response = await axios.post(`${API_BASE_URL}/sport-food-items`, newItem);
      
      const formattedNewItem = {
        id: response.data.id,
        name: response.data.name,
        description: response.data.description,
        benefits: response.data.benefits,
        time: response.data.time
      };
      
      // Lokalen State aktualisieren
      const updatedCategory = {
        ...category,
        items: [...category.items, formattedNewItem]
      };
      
      setFoodItems(foodItems.map(item => item.id === categoryId ? updatedCategory : item));
      setError(null);
      return updatedCategory;
    } catch (err) {
      console.error("Fehler beim Hinzufügen der Empfehlung:", err);
      setError("Fehler beim Speichern der neuen Empfehlung.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Empfehlung in einer Kategorie aktualisieren
  const updateFoodItem = async (categoryId, itemId, itemData) => {
    setLoading(true);
    try {
      const category = foodItems.find(item => item.id === categoryId);
      if (!category) return null;
      
      const updatedItemData = {
        categoryId: categoryId,
        name: itemData.name,
        description: itemData.description,
        benefits: itemData.benefits || "",
        time: itemData.time || "30-60 Minuten"
      };
      
      const response = await axios.put(`${API_BASE_URL}/sport-food-items/${itemId}`, updatedItemData);
      
      // Lokalen State aktualisieren
      const itemIndex = category.items.findIndex(item => item.id === itemId);
      if (itemIndex === -1) return null;
      
      const updatedItems = [...category.items];
      updatedItems[itemIndex] = {
        id: response.data.id,
        name: response.data.name,
        description: response.data.description,
        benefits: response.data.benefits,
        time: response.data.time
      };
      
      const updatedCategory = {
        ...category,
        items: updatedItems
      };
      
      setFoodItems(foodItems.map(item => item.id === categoryId ? updatedCategory : item));
      setError(null);
      return updatedCategory;
    } catch (err) {
      console.error("Fehler beim Aktualisieren der Empfehlung:", err);
      setError("Fehler beim Aktualisieren der Empfehlung.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Empfehlung aus einer Kategorie entfernen
  const deleteFoodItem = async (categoryId, itemId) => {
    setLoading(true);
    try {
      const category = foodItems.find(item => item.id === categoryId);
      if (!category) return false;
      
      // Item aus der Datenbank löschen
      await axios.delete(`${API_BASE_URL}/sport-food-items/${itemId}`);
      
      // Lokalen State aktualisieren
      const updatedItems = category.items.filter(item => item.id !== itemId);
      const updatedCategory = {
        ...category,
        items: updatedItems
      };
      
      setFoodItems(foodItems.map(item => item.id === categoryId ? updatedCategory : item));
      setError(null);
      return true;
    } catch (err) {
      console.error("Fehler beim Löschen der Empfehlung:", err);
      setError("Fehler beim Löschen der Empfehlung.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Standard-Ernährungsempfehlungen
  const defaultFoodItems = [
    {
      category: "Vor dem Training",
      items: [
        {
          name: "Proteinreicher Snack",
          description: "Griechischer Joghurt mit Beeren und Honig",
          time: "1-2 Stunden vor dem Training"
        },
        {
          name: "Leichte Mahlzeit",
          description: "Vollkornbrot mit Hühnchen und Gemüse",
          time: "2-3 Stunden vor dem Training"
        },
        {
          name: "Kohlenhydrate für Energie",
          description: "Banane und eine Handvoll Nüsse",
          time: "30-60 Minuten vor dem Training"
        }
      ]
    },
    {
      category: "Nach dem Training",
      items: [
        {
          name: "Sofortige Regeneration",
          description: "Proteinshake mit Banane und Haferflocken",
          time: "Innerhalb von 30 Minuten nach dem Training"
        },
        {
          name: "Komplette Mahlzeit",
          description: "Lachs mit Süßkartoffeln und grünem Gemüse",
          time: "1-2 Stunden nach dem Training"
        },
        {
          name: "Nächtliche Regeneration",
          description: "Hüttenkäse mit Honig oder Quark vor dem Schlafengehen",
          time: "Vor dem Schlafengehen"
        }
      ]
    },
    {
      category: "Am Spieltag",
      items: [
        {
          name: "Frühstück",
          description: "Haferflocken mit Bananen, Beeren und Honig",
          time: "3-4 Stunden vor dem Spiel"
        },
        {
          name: "Pre-Game Meal",
          description: "Pasta mit Tomatensauce und mageres Protein",
          time: "2-3 Stunden vor dem Spiel"
        },
        {
          name: "Während des Spiels",
          description: "Sportgetränk mit Elektrolyten, Energieriegel bei Pausen",
          time: "Während des Spiels"
        }
      ]
    }
  ];

  const initializeDefaultData = async () => {
    setLoading(true);
    try {
      // Prüfen, ob Kategorien existieren
      const categoriesResponse = await axios.get(`${API_BASE_URL}/sport-food-categories`);
      
      if (categoriesResponse.data.length === 0) {
        // Wenn keine Kategorien vorhanden sind, füge die Standarddaten hinzu
        for (const item of defaultFoodItems) {
          // Kategorie erstellen
          const categoryResponse = await axios.post(`${API_BASE_URL}/sport-food-categories`, {
            name: item.category,
            description: item.category + " - Ernährungsempfehlungen"
          });
          
          // Items für diese Kategorie erstellen
          for (const foodItem of item.items) {
            await axios.post(`${API_BASE_URL}/sport-food-items`, {
              categoryId: categoryResponse.data.id,
              name: foodItem.name,
              description: foodItem.description,
              benefits: foodItem.benefits || "",
              time: foodItem.time || "30-60 Minuten"
            });
          }
        }
        
        // Daten erneut abrufen
        await fetchFoodItems();
      }
      setError(null);
    } catch (err) {
      console.error("Fehler beim Initialisieren der Standarddaten:", err);
      setError("Fehler beim Initialisieren der Daten.");
    } finally {
      setLoading(false);
    }
  };

  const value = {
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
  };

  return (
    <SportFoodContext.Provider value={value}>
      {children}
    </SportFoodContext.Provider>
  );
};
