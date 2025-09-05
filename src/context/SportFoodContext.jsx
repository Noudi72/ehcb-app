import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { sportFood } from "../config/supabase-api";

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
      console.log('🍎 Loading sport food data...');
      
      // Kategorien und Items getrennt abrufen
      const categories = await sportFood.getAllCategories();
      const items = await sportFood.getAllItems();
      
      console.log('📊 Loaded categories:', categories?.length || 0);
      console.log('📊 Loaded items:', items?.length || 0);
      
      if (!categories || categories.length === 0) {
        console.log('⚠️ No categories found, using default data');
        setFoodItems(defaultFoodItems);
        setError(null);
        return;
      }
      
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
      
      console.log('✅ Organized sport food data:', organizedData.length, 'categories');
      setFoodItems(organizedData);
      setError(null);
    } catch (err) {
      console.error("❌ Fehler beim Laden der Sport Food-Daten:", err);
      setError("Fehler beim Laden der Ernährungsempfehlungen.");
      
      // Wenn noch keine Daten in der DB vorhanden sind, verwenden wir die Standarddaten
      console.log('🔄 Using fallback default data');
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
      const response = await sportFood.createCategory(newCategory);
      
      const newFormattedCategory = {
        id: response.id,
        category: response.name,
        description: response.description,
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
      
      const response = await sportFood.updateCategory(id, updatedCategoryData);
      
      const updatedCategory = {
        ...existingCategory,
        category: response.name,
        description: response.description
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
      const itemsToDelete = await sportFood.getItemsByCategory(id);
      for (const item of itemsToDelete) {
        await sportFood.deleteItem(item.id);
      }
      
      // Dann die Kategorie löschen
      await sportFood.deleteCategory(id);
      
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
      
      const response = await sportFood.createItem(newItem);
      
      const formattedNewItem = {
        id: response.id,
        name: response.name,
        description: response.description,
        benefits: response.benefits,
        time: response.time
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
      
      const response = await sportFood.updateItem(itemId, updatedItemData);
      
      // Lokalen State aktualisieren
      const itemIndex = category.items.findIndex(item => item.id === itemId);
      if (itemIndex === -1) return null;
      
      const updatedItems = [...category.items];
      updatedItems[itemIndex] = {
        id: response.id,
        name: response.name,
        description: response.description,
        benefits: response.benefits,
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
      await sportFood.deleteItem(itemId);
      
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
      const categories = await sportFood.getAllCategories();
      
      if (categories.length === 0) {
        // Wenn keine Kategorien vorhanden sind, füge die Standarddaten hinzu
        for (const item of defaultFoodItems) {
          // Kategorie erstellen
          const categoryResponse = await sportFood.createCategory({
            name: item.category,
            description: item.category + " - Ernährungsempfehlungen"
          });
          
          // Items für diese Kategorie erstellen
          for (const foodItem of item.items) {
            await sportFood.createItem({
              categoryId: categoryResponse.id,
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
