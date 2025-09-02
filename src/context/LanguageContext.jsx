import React, { createContext, useContext, useState, useEffect } from 'react';
import { translateText } from '../config/translationService';

const translations = {
  de: {
    // Common translations
    "common": {
      "home": "Startseite",
      "reflexion": "Reflexion", 
      "survey": "Umfrage",
      "sportfood": "Sporternährung",
      "cardio": "Cardio-Programm",
      "news": "News",
      "login": "Anmelden",
      "logout": "Abmelden",
      "back": "Zurück",
      "next": "Weiter",
      "submit": "Absenden",
      "loading": "Lädt...",
      "backToHome": "Zurück zur Startseite"
    },
    // Header translations
    "header": {
      "title": "EHC Biel-Bienne",
      "subtitle": "Spirit",
      "coachArea": "Trainer-Bereich",
      "playerArea": "Spieler-Bereich",
      "logout": "Abmelden"
    },
    // Navigation translations
    "navigation": {
      "dashboard": "Dashboard"
    },
    // Home page translations
    "home": {
      "coachDashboard": "Trainer Dashboard",
      "loggedInAs": "Angemeldet als:",
      "firstTimeAccess": "Erstmaliger Zugang? Als Spieler anmelden und Team auswählen."
    },
    // Menu items
    "menu": {
      "reflexion": "Spielerreflexion",
      "reflexionSubtitle": "Nach jedem Training und Spiel",
      "survey": "Umfrage",
      "surveySubtitle": "Vom Spieler auszufüllen",
      "surveyResults": "Umfrageergebnisse",
      "surveyResultsSubtitle": "Freigegebene Umfragestatistiken",
      "sportFood": "Sport Food Guide",
      "sponserOrder": "Sponser Bestellung",
      "sponserOrderSubtitle": "Sponser Sport Food online bestellen",
      "cardio": "Cardio Programme",
      "news": "News",
      "newsSubtitle": "PDFs und Links herunterladen"
    },
    // Survey translations
    "survey": {
      "title": "Umfrage",
      "yourName": "Dein Name",
      "enterName": "Name eingeben...",
      "results": "Ergebnisse",
      "nameRequired": "Bitte gib deinen Namen ein",
      "selectSurveyRequired": "Bitte wähle eine Umfrage aus",
      "disclaimer": "Diese Umfrage ist nicht anonym. Dein Name wird mit deinen Antworten verknüpft und für den Coach sichtbar sein.",
      "anonymous": "Diese Umfrage ist anonym. Dein Name wird nicht mit den Antworten verknüpft.",
      "questionOf": "Frage",
      "of": "von",
      "previous": "Zurück",
      "next": "Weiter",
      "submit": "Absenden",
      "cancel": "Abbrechen",
      "thankYou": "Vielen Dank!",
      "submitted": "Deine Antworten wurden erfolgreich übermittelt.",
      "backToHome": "Zurück zur Startseite",
      "noActiveSurveys": "Derzeit sind keine aktiven Umfragen verfügbar.",
      "selectSurvey": "Bitte wähle eine Umfrage aus:",
      "startSurvey": "Umfrage starten",
      "chooseSurvey": "Umfrage auswählen",
      "questions": "Fragen",
      "selectToStart": "Wähle eine Umfrage aus, um zu beginnen",
      "backToSelection": "Zurück zur Auswahl"
    },
    // Reflexion translations
    "reflexion": {
      "title": "Spielerreflexion",
      "subtitle": "Nach jedem Training und Spiel",
      "name": "Name",
      "nameRequired": "Bitte geben Sie Ihren Namen ein.",
      "type": "Typ",
      "training": "Training",
      "game": "Spiel",
      "mood": "Stimmung",
      "energy": "Energie-Level",
      "intensity": "Intensität Training/Spiel",
      "performance": "Eigene Leistung",
      "comment": "Kommentar",
      "commentPlaceholder": "Beschreibe deine Gedanken zum Training/Spiel...",
      "commentRequired": "Ein Kommentar ist erforderlich.",
      "submit": "Reflexion absenden",
      "success": "Deine Reflexion wurde erfolgreich gespeichert!",
      "successRedirect": "Du wirst in wenigen Sekunden zur Startseite weitergeleitet...",
      "errorSaving": "Fehler beim Speichern der Reflexion. Bitte versuchen Sie es erneut.",
      "errorGeneral": "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.",
      "backToHome": "Zurück zur Startseite"
    },
    // PlayerLogin translations
    "playerLogin": {
      "title": "Spieler Registrierung",
      "coachPrompt": "Coach?",
      "coachLogin": "Hier anmelden",
      "description": "Registriere dich für die Team-App.",
      "approvalNote": "Ein Coach wird deine Registrierung prüfen und dir Teams zuweisen.",
      "fullName": "Vollständiger Name",
      "namePlaceholder": "z.B. Max Mustermann",
      "mainTeam": "Hauptteam",
      "selectTeam": "Wähle dein Hauptteam",
      "teamHelp": "Dein Hauptteam hilft dem Coach bei der Team-Zuweisung",
      "jerseyNumber": "Trikotnummer (optional)",
      "numberPlaceholder": "z.B. 7",
      "afterRegistration": "Nach der Registrierung:",
      "step1": "Ein Coach prüft deine Anmeldung",
      "step2": "Du wirst den passenden Teams zugewiesen",
      "step3": "Du erhältst Zugang zur App nach Genehmigung",
      "submit": "Registrierung absenden",
      "submitting": "Wird registriert...",
      "alreadyRegistered": "Du hast dich bereits registriert und wartest auf Genehmigung vom Coach.",
      "registrationRejected": "Deine Registrierung wurde abgelehnt. Bitte wende dich an den Coach.",
      "registrationError": "Fehler beim Erstellen der Registrierung",
      "registrationSuccess": "Registrierung erfolgreich! Du wirst benachrichtigt, sobald ein Coach deine Registrierung genehmigt hat.",
      "errorPrefix": "Fehler bei der Registrierung: "
    }
  },
  fr: {
    // Common translations
    "common": {
      "home": "Accueil",
      "reflexion": "Réflexion", 
      "survey": "Sondage",
      "sportfood": "Nutrition sportive",
      "cardio": "Programme cardio",
      "news": "Actualités",
      "login": "Se connecter",
      "logout": "Se déconnecter",
      "back": "Retour",
      "next": "Suivant",
      "submit": "Soumettre",
      "loading": "Chargement...",
      "backToHome": "Retour à l'accueil"
    },
    // Header translations
    "header": {
      "title": "EHC Biel-Bienne",
      "subtitle": "Spirit",
      "coachArea": "Espace Coach",
      "playerArea": "Espace Joueur",
      "logout": "Se déconnecter"
    },
    // Navigation translations
    "navigation": {
      "dashboard": "Tableau de bord"
    },
    // Home page translations
    "home": {
      "coachDashboard": "Tableau de bord Coach",
      "loggedInAs": "Connecté en tant que:",
      "firstTimeAccess": "Première connexion? Se connecter en tant que joueur et sélectionner l'équipe."
    },
    // Menu items
    "menu": {
      "reflexion": "Réflexion de joueur",
      "reflexionSubtitle": "Après chaque entraînement et match",
      "survey": "Sondage",
      "surveySubtitle": "À remplir par le joueur",
      "surveyResults": "Résultats du sondage",
      "surveyResultsSubtitle": "Statistiques de sondage publiées",
      "sportFood": "Guide Sport Food",
      "sponserOrder": "Commande Sponser",
      "sponserOrderSubtitle": "Commander Sponser Sport Food en ligne",
      "cardio": "Programmes Cardio",
      "news": "Actualités",
      "newsSubtitle": "Télécharger PDFs et liens"
    },
    // Survey translations
    "survey": {
      "title": "Sondage",
      "yourName": "Votre nom",
      "enterName": "Entrer le nom...",
      "results": "Résultats",
      "nameRequired": "Veuillez entrer votre nom",
      "selectSurveyRequired": "Veuillez sélectionner un sondage",
      "disclaimer": "Ce sondage n'est pas anonyme. Votre nom sera lié à vos réponses et visible pour l'entraîneur.",
      "anonymous": "Ce sondage est anonyme. Votre nom ne sera pas lié aux réponses.",
      "questionOf": "Question",
      "of": "de",
      "previous": "Précédent",
      "next": "Suivant",
      "submit": "Soumettre",
      "cancel": "Annuler",
      "thankYou": "Merci beaucoup!",
      "submitted": "Vos réponses ont été soumises avec succès.",
      "backToHome": "Retour à l'accueil",
      "noActiveSurveys": "Aucun sondage actif n'est actuellement disponible.",
      "selectSurvey": "Veuillez sélectionner un sondage:",
      "startSurvey": "Commencer le sondage",
      "chooseSurvey": "Choisir un sondage",
      "questions": "Questions",
      "selectToStart": "Sélectionnez un sondage pour commencer",
      "backToSelection": "Retour à la sélection"
    },
    // Reflexion translations
    "reflexion": {
      "title": "Réflexion de joueur",
      "subtitle": "Après chaque entraînement et match",
      "name": "Nom",
      "nameRequired": "Veuillez entrer votre nom.",
      "type": "Type",
      "training": "Entraînement",
      "game": "Match",
      "mood": "Humeur",
      "energy": "Niveau d'énergie",
      "intensity": "Intensité Entraînement/Match",
      "performance": "Performance personnelle",
      "comment": "Commentaire",
      "commentPlaceholder": "Décrivez vos pensées sur l'entraînement/match...",
      "commentRequired": "Un commentaire est requis.",
      "submit": "Soumettre la réflexion",
      "success": "Votre réflexion a été sauvegardée avec succès!",
      "successRedirect": "Vous serez redirigé vers l'accueil dans quelques secondes...",
      "errorSaving": "Erreur lors de la sauvegarde de la réflexion. Veuillez réessayer.",
      "errorGeneral": "Une erreur s'est produite. Veuillez réessayer plus tard.",
      "backToHome": "Retour à l'accueil"
    },
    // PlayerLogin translations
    "playerLogin": {
      "title": "Inscription Joueur",
      "coachPrompt": "Coach?",
      "coachLogin": "Se connecter ici",
      "description": "Inscrivez-vous pour l'application d'équipe.",
      "approvalNote": "Un coach examinera votre inscription et vous assignera aux équipes.",
      "fullName": "Nom complet",
      "namePlaceholder": "p.ex. Max Mustermann",
      "mainTeam": "Équipe principale",
      "selectTeam": "Choisissez votre équipe principale",
      "teamHelp": "Votre équipe principale aide le coach pour l'assignation d'équipe",
      "jerseyNumber": "Numéro de maillot (optionnel)",
      "numberPlaceholder": "p.ex. 7",
      "afterRegistration": "Après l'inscription:",
      "step1": "Un coach examine votre demande",
      "step2": "Vous serez assigné aux équipes appropriées",
      "step3": "Vous obtenez l'accès à l'app après approbation",
      "submit": "Soumettre l'inscription",
      "submitting": "Inscription en cours...",
      "alreadyRegistered": "Vous êtes déjà inscrit et attendez l'approbation du coach.",
      "registrationRejected": "Votre inscription a été rejetée. Veuillez contacter le coach.",
      "registrationError": "Erreur lors de la création de l'inscription",
      "registrationSuccess": "Inscription réussie! Vous serez notifié dès qu'un coach approuve votre inscription.",
      "errorPrefix": "Erreur lors de l'inscription: "
    }
  },
  en: {
    // Common translations
    "common": {
      "home": "Home",
      "reflexion": "Reflection", 
      "survey": "Survey",
      "sportfood": "Sports nutrition",
      "cardio": "Cardio program",
      "news": "News",
      "login": "Login",
      "logout": "Logout",
      "back": "Back",
      "next": "Next",
      "submit": "Submit",
      "loading": "Loading...",
      "backToHome": "Back to home"
    },
    // Header translations
    "header": {
      "title": "EHC Biel-Bienne",
      "subtitle": "Spirit",
      "coachArea": "Coach Area",
      "playerArea": "Player Area",
      "logout": "Logout"
    },
    // Navigation translations
    "navigation": {
      "dashboard": "Dashboard"
    },
    // Home page translations
    "home": {
      "coachDashboard": "Coach Dashboard",
      "loggedInAs": "Logged in as:",
      "firstTimeAccess": "First time access? Login as player and select team."
    },
    // Menu items
    "menu": {
      "reflexion": "Player Reflection",
      "reflexionSubtitle": "After each training and game",
      "survey": "Survey",
      "surveySubtitle": "To be filled by player",
      "surveyResults": "Survey Results",
      "surveyResultsSubtitle": "Released survey statistics",
      "sportFood": "Sport Food Guide",
      "sponserOrder": "Sponser Order",
      "sponserOrderSubtitle": "Order Sponser Sport Food online",
      "cardio": "Cardio Programs",
      "news": "News",
      "newsSubtitle": "Download PDFs and links"
    },
    // Survey translations
    "survey": {
      "title": "Survey",
      "yourName": "Your name",
      "enterName": "Enter name...",
      "results": "Results",
      "nameRequired": "Please enter your name",
      "selectSurveyRequired": "Please select a survey",
      "disclaimer": "This survey is not anonymous. Your name will be linked to your answers and visible to the coach.",
      "anonymous": "This survey is anonymous. Your name will not be linked to the answers.",
      "questionOf": "Question",
      "of": "of",
      "previous": "Previous",
      "next": "Next",
      "submit": "Submit",
      "cancel": "Cancel",
      "thankYou": "Thank you!",
      "submitted": "Your answers have been submitted successfully.",
      "backToHome": "Back to Home",
      "noActiveSurveys": "No active surveys are currently available.",
      "selectSurvey": "Please select a survey:",
      "startSurvey": "Start Survey",
      "chooseSurvey": "Choose a survey",
      "questions": "Questions",
      "selectToStart": "Select a survey to start",
      "backToSelection": "Back to selection"
    },
    // Reflexion translations
    "reflexion": {
      "title": "Player Reflection",
      "subtitle": "After each training and game",
      "name": "Name",
      "nameRequired": "Please enter your name.",
      "type": "Type",
      "training": "Training",
      "game": "Game",
      "mood": "Mood",
      "energy": "Energy Level",
      "intensity": "Training/Game Intensity",
      "performance": "Own Performance",
      "comment": "Comment",
      "commentPlaceholder": "Describe your thoughts about the training/game...",
      "commentRequired": "A comment is required.",
      "submit": "Submit Reflection",
      "success": "Your reflection has been saved successfully!",
      "successRedirect": "You will be redirected to the home page in a few seconds...",
      "errorSaving": "Error saving reflection. Please try again.",
      "errorGeneral": "An error occurred. Please try again later.",
      "backToHome": "Back to Home"
    },
    // PlayerLogin translations
    "playerLogin": {
      "title": "Player Registration",
      "coachPrompt": "Coach?",
      "coachLogin": "Sign in here",
      "description": "Register for the team app.",
      "approvalNote": "A coach will review your registration and assign you to teams.",
      "fullName": "Full Name",
      "namePlaceholder": "e.g. Max Mustermann",
      "mainTeam": "Main Team",
      "selectTeam": "Choose your main team",
      "teamHelp": "Your main team helps the coach with team assignment",
      "jerseyNumber": "Jersey Number (optional)",
      "numberPlaceholder": "e.g. 7",
      "afterRegistration": "After registration:",
      "step1": "A coach reviews your application",
      "step2": "You will be assigned to appropriate teams",
      "step3": "You get app access after approval",
      "submit": "Submit Registration",
      "submitting": "Registering...",
      "alreadyRegistered": "You are already registered and waiting for coach approval.",
      "registrationRejected": "Your registration was rejected. Please contact the coach.",
      "registrationError": "Error creating registration",
      "registrationSuccess": "Registration successful! You will be notified once a coach approves your registration.",
      "errorPrefix": "Registration error: "
    }
  }
};

const languages = [
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' }
];

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('de');

  // Detect device information
  const getDeviceInfo = () => {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)|Android(?=.*\bMobile\b)(?=.*\bChrome\b)/i.test(userAgent);
    const isDesktop = !isMobile && !isTablet;

    return {
      isMobile,
      isTablet,
      isDesktop,
      userAgent,
      platform: navigator.platform,
      language: navigator.language || navigator.userLanguage
    };
  };

  // Auto-detect browser language on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('ehcb-language');
    
    if (savedLanguage) {
      setLanguage(savedLanguage);
    } else {
      // Auto-detect browser language
      const browserLang = navigator.language || navigator.userLanguage;
      const langCode = browserLang.split('-')[0].toLowerCase();
      
      // Check if we support this language
      const supportedLanguage = languages.find(lang => lang.code === langCode);
      
      if (supportedLanguage) {
        setLanguage(langCode);
        localStorage.setItem('ehcb-language', langCode);
      } else {
        setLanguage('de');
        localStorage.setItem('ehcb-language', 'de');
      }
    }
  }, []);

  const changeLanguage = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem('ehcb-language', newLang);
  };

  const t = (key, fallback = key) => {
    const keys = key.split('.');
    let translation = translations[language];
    
    for (const k of keys) {
      if (translation && typeof translation === 'object' && k in translation) {
        translation = translation[k];
      } else {
        // Fallback to German if not found in current language
        translation = translations['de'];
        for (const k of keys) {
          if (translation && typeof translation === 'object' && k in translation) {
            translation = translation[k];
          } else {
            return fallback;
          }
        }
        break;
      }
    }
    
    return translation || fallback;
  };

  // Dynamic translation function using AI
  const translateDynamic = async (text, targetLanguage = language, sourceLanguage = 'de') => {
    try {
      if (!text) return '';
      
      // If target language is same as source language, return as is
      if (targetLanguage === sourceLanguage) {
        return text;
      }
      
      console.log('translateDynamic called:', { text, targetLanguage, sourceLanguage });
      const translatedText = await translateText(text, targetLanguage, sourceLanguage);
      console.log('translateDynamic result:', translatedText);
      return translatedText || text;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text if translation fails
    }
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      changeLanguage, 
      t,
      translateDynamic,
      currentLanguage: languages.find(lang => lang.code === language),
      deviceInfo: getDeviceInfo(),
      languages
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Export the context itself for components that need direct access
export { LanguageContext };
