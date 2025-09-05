import React, { createContext, useState, useContext, useEffect, useCallback } from "react";

// SportFood-Kontext erstellen
const SportFoodContext = createContext();

// Hook für den einfachen Zugriff auf den SportFood-Kontext
export const useSportFood = () => useContext(SportFoodContext);

// SportFood-Provider-Komponente
export const SportFoodProvider = ({ children }) => {
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Direkte API-Calls zu JSON Server
  const loadSportFoodData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🍎 Loading sport food data from JSON Server...');
      
      // Kategorien laden
      const categoriesResponse = await fetch('http://localhost:3001/sport-food-categories');
      if (!categoriesResponse.ok) {
        throw new Error('Failed to fetch categories');
      }
      const categories = await categoriesResponse.json();
      console.log('📊 Categories loaded:', categories?.length || 0);
      
      // Items laden  
      const itemsResponse = await fetch('http://localhost:3001/sport-food-items');
      if (!itemsResponse.ok) {
        throw new Error('Failed to fetch items');
      }
      const items = await itemsResponse.json();
      console.log('📊 Items loaded:', items?.length || 0);
      
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
            time: "30-60 Minuten" // Standard-Zeit
          }))
        };
      });
      
      console.log('✅ Organized sport food data:', organizedData.length, 'categories');
      setFoodItems(organizedData);
      
    } catch (err) {
      console.error("❌ Fehler beim Laden der Sport Food-Daten:", err);
      setError("Fehler beim Laden der Ernährungsempfehlungen.");
      
      // Fallback zu Default-Daten
      console.log('🔄 Using fallback default data');
      setFoodItems(defaultFoodItems);
    } finally {
      setLoading(false);
    }
  }, []);

  // Beim ersten Laden die Daten abrufen
  useEffect(() => {
    loadSportFoodData();
  }, [loadSportFoodData]);

  // Neue Kategorie hinzufügen
  const addCategory = async (categoryData) => {
    setLoading(true);
    try {
      console.log("SportFoodContext: Füge neue Kategorie hinzu:", categoryData);
      
      const newCategory = {
        id: `cat${Date.now()}`, // Temporäre ID
        name: categoryData.category,
        description: categoryData.description || ""
      };
      
      // POST an JSON Server
      const response = await fetch('http://localhost:3001/sport-food-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const savedCategory = await response.json();
      console.log("SportFoodContext: Kategorie gespeichert:", savedCategory);
      
      const newFormattedCategory = {
        id: savedCategory.id,
        category: savedCategory.name,
        description: savedCategory.description,
        items: []
      };
      
      setFoodItems([...foodItems, newFormattedCategory]);
      setError(null);
      return newFormattedCategory;
    } catch (err) {
      console.error("SportFoodContext: Fehler beim Hinzufügen der Kategorie:", err);
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
      console.log("SportFoodContext: Aktualisiere Kategorie:", id, categoryData);
      
      const existingCategory = foodItems.find(item => item.id === id);
      if (!existingCategory) {
        console.warn("SportFoodContext: Kategorie nicht gefunden:", id);
        return null;
      }
      
      const updatedCategoryData = {
        id: id,
        name: categoryData.category,
        description: categoryData.description || existingCategory.description
      };
      
      // PUT an JSON Server
      const response = await fetch(`http://localhost:3001/sport-food-categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCategoryData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const savedCategory = await response.json();
      console.log("SportFoodContext: Kategorie aktualisiert:", savedCategory);
      
      const updatedCategory = {
        ...existingCategory,
        category: savedCategory.name,
        description: savedCategory.description
      };
      
      setFoodItems(foodItems.map(item => item.id === id ? updatedCategory : item));
      setError(null);
      return updatedCategory;
    } catch (err) {
      console.error("SportFoodContext: Fehler beim Aktualisieren der Kategorie:", err);
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
      console.log("SportFoodContext: Lösche Kategorie:", id);
      
      // Zuerst alle Items in dieser Kategorie löschen
      try {
        const itemsResponse = await fetch(`http://localhost:3001/sport-food-items?categoryId=${id}`);
        if (itemsResponse.ok) {
          const itemsToDelete = await itemsResponse.json();
          console.log("SportFoodContext: Items zum Löschen gefunden:", itemsToDelete.length);
          
          for (const item of itemsToDelete) {
            await fetch(`http://localhost:3001/sport-food-items/${item.id}`, {
              method: 'DELETE'
            });
          }
        }
      } catch (itemError) {
        console.warn("SportFoodContext: Fehler beim Löschen der Items:", itemError);
      }
      
      // Dann die Kategorie löschen
      const response = await fetch(`http://localhost:3001/sport-food-categories/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      console.log("SportFoodContext: Kategorie gelöscht:", id);
      setFoodItems(foodItems.filter(item => item.id !== id));
      setError(null);
      return true;
    } catch (err) {
      console.error("SportFoodContext: Fehler beim Löschen der Kategorie:", err);
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
      console.log("SportFoodContext: Füge Food Item hinzu:", categoryId, itemData);
      
      const category = foodItems.find(item => item.id === categoryId);
      if (!category) {
        console.warn("SportFoodContext: Kategorie nicht gefunden:", categoryId);
        return null;
      }
      
      const newItem = {
        id: `item${Date.now()}`, // Temporäre ID
        categoryId: categoryId,
        name: itemData.name,
        description: itemData.description,
        benefits: itemData.benefits || "",
        time: itemData.time || "30-60 Minuten"
      };
      
      // POST an JSON Server
      const response = await fetch('http://localhost:3001/sport-food-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const savedItem = await response.json();
      console.log("SportFoodContext: Food Item gespeichert:", savedItem);
      
      const formattedNewItem = {
        id: savedItem.id,
        name: savedItem.name,
        description: savedItem.description,
        benefits: savedItem.benefits,
        time: savedItem.time
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
      console.error("SportFoodContext: Fehler beim Hinzufügen der Empfehlung:", err);
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
      console.log("SportFoodContext: Aktualisiere Food Item:", categoryId, itemId, itemData);
      
      const category = foodItems.find(item => item.id === categoryId);
      if (!category) {
        console.warn("SportFoodContext: Kategorie nicht gefunden:", categoryId);
        return null;
      }
      
      const updatedItemData = {
        id: itemId,
        categoryId: categoryId,
        name: itemData.name,
        description: itemData.description,
        benefits: itemData.benefits || "",
        time: itemData.time || "30-60 Minuten"
      };
      
      // PUT an JSON Server
      const response = await fetch(`http://localhost:3001/sport-food-items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedItemData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const savedItem = await response.json();
      console.log("SportFoodContext: Food Item aktualisiert:", savedItem);
      
      // Lokalen State aktualisieren
      const itemIndex = category.items.findIndex(item => item.id === itemId);
      if (itemIndex === -1) {
        console.warn("SportFoodContext: Item nicht in Kategorie gefunden:", itemId);
        return null;
      }
      
      const updatedItems = [...category.items];
      updatedItems[itemIndex] = {
        id: savedItem.id,
        name: savedItem.name,
        description: savedItem.description,
        benefits: savedItem.benefits,
        time: savedItem.time
      };
      
      const updatedCategory = {
        ...category,
        items: updatedItems
      };
      
      setFoodItems(foodItems.map(item => item.id === categoryId ? updatedCategory : item));
      setError(null);
      return updatedCategory;
    } catch (err) {
      console.error("SportFoodContext: Fehler beim Aktualisieren der Empfehlung:", err);
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
      console.log("SportFoodContext: Lösche Food Item:", categoryId, itemId);
      
      const category = foodItems.find(item => item.id === categoryId);
      if (!category) {
        console.warn("SportFoodContext: Kategorie nicht gefunden:", categoryId);
        return false;
      }
      
      // Item aus der Datenbank löschen
      const response = await fetch(`http://localhost:3001/sport-food-items/${itemId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      console.log("SportFoodContext: Food Item gelöscht:", itemId);
      
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
      console.error("SportFoodContext: Fehler beim Löschen der Empfehlung:", err);
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
      console.log("SportFoodContext: Initialisiere Standard-Daten");
      
      // Prüfen, ob Kategorien existieren
      const categoriesResponse = await fetch('http://localhost:3001/sport-food-categories');
      if (!categoriesResponse.ok) {
        throw new Error(`HTTP ${categoriesResponse.status}: ${categoriesResponse.statusText}`);
      }
      
      const categories = await categoriesResponse.json();
      console.log("SportFoodContext: Existierende Kategorien:", categories.length);
      
      if (categories.length === 0) {
        console.log("SportFoodContext: Keine Kategorien vorhanden, erstelle Standard-Daten");
        
        // Wenn keine Kategorien vorhanden sind, füge die Standarddaten hinzu
        for (const item of defaultFoodItems) {
          // Kategorie erstellen
          const categoryData = {
            id: `cat_${item.category.toLowerCase().replace(/\s+/g, '_')}`,
            name: item.category,
            description: item.category + " - Ernährungsempfehlungen"
          };
          
          const categoryResponse = await fetch('http://localhost:3001/sport-food-categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(categoryData)
          });
          
          if (!categoryResponse.ok) {
            throw new Error(`Fehler beim Erstellen der Kategorie: ${categoryResponse.status}`);
          }
          
          const savedCategory = await categoryResponse.json();
          console.log("SportFoodContext: Kategorie erstellt:", savedCategory.name);
          
          // Items für diese Kategorie erstellen
          for (const foodItem of item.items) {
            const itemData = {
              id: `item_${savedCategory.id}_${foodItem.name.toLowerCase().replace(/\s+/g, '_')}`,
              categoryId: savedCategory.id,
              name: foodItem.name,
              description: foodItem.description,
              benefits: foodItem.benefits || "",
              time: foodItem.time || "30-60 Minuten"
            };
            
            const itemResponse = await fetch('http://localhost:3001/sport-food-items', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(itemData)
            });
            
            if (!itemResponse.ok) {
              console.warn("SportFoodContext: Fehler beim Erstellen des Items:", itemResponse.status);
            } else {
              const savedItem = await itemResponse.json();
              console.log("SportFoodContext: Item erstellt:", savedItem.name);
            }
          }
        }
        
        console.log("SportFoodContext: Standard-Daten erstellt, lade Daten neu");
        // Daten erneut abrufen
        await loadSportFoodData();
      } else {
        console.log("SportFoodContext: Kategorien bereits vorhanden, lade vorhandene Daten");
        await loadSportFoodData();
      }
      setError(null);
    } catch (err) {
      console.error("SportFoodContext: Fehler beim Initialisieren der Standarddaten:", err);
      setError("Fehler beim Initialisieren der Daten.");
      
      // Fallback zu lokalen Default-Daten
      console.log("SportFoodContext: Verwende lokale Default-Daten als Fallback");
      const formattedDefaultData = defaultFoodItems.map((category, index) => ({
        id: `local_cat${index + 1}`,
        category: category.category,
        description: category.category + " - Ernährungsempfehlungen",
        items: category.items.map((item, itemIndex) => ({
          id: `local_item${index}_${itemIndex}`,
          name: item.name,
          description: item.description,
          benefits: item.benefits || "",
          time: item.time || "30-60 Minuten"
        }))
      }));
      
      setFoodItems(formattedDefaultData);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    foodItems,
    loading,
    error,
    fetchFoodItems: loadSportFoodData, // Alias für Kompatibilität
    loadSportFoodData,
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
