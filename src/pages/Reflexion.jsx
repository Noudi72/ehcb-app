import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useReflexion } from "../context/ReflexionContext";
import { useLanguage } from "../context/LanguageContext";
import Header from "../components/Header";
import BackButton from "../components/BackButton";


export default function Reflexion() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    type: "training", // training oder spiel
    mood: 5, // Stimmung (1-10)
    energy: 5, // Energie-Level (1-10)
    intensity: 5, // Intensität (1-10)
    performance: 5, // Leistung (1-10)
    comment: "" // Kommentar
  });
  
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const { addReflexion } = useReflexion();
  const navigate = useNavigate();
  
  // Behandelt die Auswahl des Typs (Training/Spiel)
  const handleTypeChange = (type) => {
    setFormData({
      ...formData,
      type: type
    });
  };
  
  // Behandelt Änderungen bei Textfeldern und Selects
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  // Behandelt Änderungen bei Slidern
  const handleRangeChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: parseInt(e.target.value, 10)
    });
  };
  
  // Formular absenden
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name) {
      setError(t('reflexion.nameRequired'));
      return;
    }
    
    // Kommentar ist jetzt verpflichtend
    if (!formData.comment || formData.comment.trim() === '') {
      setError(t('reflexion.commentRequired'));
      return;
    }
    
    try {
      const success = await addReflexion(formData);
      if (success) {
        setSuccess(true);
        // Formular zurücksetzen
        setFormData({
          name: "",
          type: "training",
          mood: 5,
          energy: 5,
          intensity: 5,
          performance: 5,
          comment: ""
        });
        setError("");
        
        // Nach 3 Sekunden zur Startseite zurückkehren
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } else {
        setError(t('reflexion.errorSaving'));
      }
    } catch (err) {
      setError(t('reflexion.errorGeneral'));
      console.error("Fehler beim Absenden des Formulars:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-gray-900 font-sans transition-colors duration-300">
      <Header />
      <div className="px-4 py-4">
        <BackButton to="/" />
      </div>
      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
          <h1 className="text-2xl font-bold text-[#0a2240] dark:text-blue-400 mb-6">{t('reflexion.title')}</h1>
          
          {error && (
            <div className="mb-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded relative">
              {error}
            </div>
          )}
          
          {success ? (
            <div className="text-center py-6">
              <div className="mb-4 bg-green-100 dark:bg-green-900/20 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded relative">
                {t('reflexion.success')}
              </div>
              <p className="mb-4 text-gray-600 dark:text-gray-300">{t('reflexion.successRedirect')}</p>
              <Link 
                to="/"
                className="text-[#0a2240] dark:text-blue-400 font-semibold hover:underline"
              >
                {t('reflexion.backToHome')}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('reflexion.name')}*
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {t('reflexion.type')}*
                </label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => handleTypeChange('training')}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all duration-200 ${
                      formData.type === 'training'
                        ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-md'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    {t('reflexion.training')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('spiel')}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all duration-200 ${
                      formData.type === 'spiel'
                        ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-md'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    {t('reflexion.game')}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('reflexion.mood')}: {formData.mood}/10
                </label>
                <input
                  type="range"
                  name="mood"
                  min="1"
                  max="10"
                  value={formData.mood}
                  onChange={handleRangeChange}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                  <span>6</span>
                  <span>7</span>
                  <span>8</span>
                  <span>9</span>
                  <span>10</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('reflexion.energy')}: {formData.energy}/10
                </label>
                <input
                  type="range"
                  name="energy"
                  min="1"
                  max="10"
                  value={formData.energy}
                  onChange={handleRangeChange}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                  <span>6</span>
                  <span>7</span>
                  <span>8</span>
                  <span>9</span>
                  <span>10</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('reflexion.intensity')}: {formData.intensity}/10
                </label>
                <input
                  type="range"
                  name="intensity"
                  min="1"
                  max="10"
                  value={formData.intensity}
                  onChange={handleRangeChange}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                  <span>6</span>
                  <span>7</span>
                  <span>8</span>
                  <span>9</span>
                  <span>10</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('reflexion.performance')}: {formData.performance}/10
                </label>
                <input
                  type="range"
                  name="performance"
                  min="1"
                  max="10"
                  value={formData.performance}
                  onChange={handleRangeChange}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>1</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                  <span>6</span>
                  <span>7</span>
                  <span>8</span>
                  <span>9</span>
                  <span>10</span>
                </div>
              </div>
              
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('reflexion.comment')}*
                </label>
                <textarea
                  id="comment"
                  name="comment"
                  value={formData.comment}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    !formData.comment || formData.comment.trim() === '' 
                      ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  rows="3"
                  placeholder={t('reflexion.commentPlaceholder')}
                  required
                />
                {(!formData.comment || formData.comment.trim() === '') && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {t('reflexion.commentRequired')}
                  </p>
                )}
              </div>
              
              <div className="flex space-x-3">
                <Link
                  to="/"
                  className="flex-1 py-3 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-lg shadow-md hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none text-center transition-colors duration-300"
                >
                  {t('common.back')}
                </Link>
                <button
                  type="submit"
                  disabled={!formData.comment || formData.comment.trim() === ''}
                  className={`flex-1 py-3 font-semibold rounded-lg shadow-md focus:outline-none transition-all duration-200 ${
                    !formData.comment || formData.comment.trim() === ''
                      ? 'bg-gray-400 dark:bg-gray-600 text-gray-200 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-[#0a2240] dark:bg-blue-600 text-white hover:bg-[#081a32] dark:hover:bg-blue-700'
                  }`}
                >
                  {t('reflexion.submit')}
                </button>
              </div>
              
              <div className="mt-4 text-center">
                <Link
                  to="/coach-login"
                  className="inline-block px-6 py-2 bg-[#0a2240] dark:bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-[#081a32] dark:hover:bg-blue-700 transition-colors duration-200 shadow-md"
                >
                  {t('header.coachArea')}
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>
      
    </div>
  );
}
