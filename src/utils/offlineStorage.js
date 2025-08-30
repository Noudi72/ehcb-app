// Vereinfachter Offline Storage Manager für PWA
class OfflineStorageManager {
  constructor() {
    this.isInitialized = false;
  }

  async init() {
    console.log("OfflineStorage initialisiert (vereinfacht)");
    this.isInitialized = true;
    return Promise.resolve();
  }

  async syncWithServer() {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      console.log("Offline - Synchronisierung wird später versucht");
      return;
    }
    console.log("Synchronisierung gestartet (vereinfacht)");
    return Promise.resolve();
  }

  async saveReflectionOffline(reflection) {
    console.log("Reflexion offline gespeichert (vereinfacht)");
    return Promise.resolve();
  }

  async saveSurveyOffline(survey) {
    console.log("Umfrage offline gespeichert (vereinfacht)");
    return Promise.resolve();
  }
}

// Singleton-Export
const offlineStorage = new OfflineStorageManager();
export default offlineStorage;
