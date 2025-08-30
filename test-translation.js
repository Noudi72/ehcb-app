// Test der DeepL AI-Übersetzung
import { translationService } from '../src/services/TranslationService.js';

console.log('🚀 DeepL AI-Übersetzung Test');

// Test verschiedene Übersetzungen
const testTexts = [
  'Wie findest du das neue Trainingskonzept?',
  'Was sollten wir Coaches verbessern?',
  'Bist du zufrieden mit deiner Leistung?'
];

// Teste Übersetzungen
testTexts.forEach(async (text) => {
  console.log('\n📝 Original (DE):', text);
  
  const frenchTranslation = await translationService.translateText(text, 'fr');
  console.log('🇫🇷 Französisch:', frenchTranslation);
  
  const englishTranslation = await translationService.translateText(text, 'en');
  console.log('🇬🇧 Englisch:', englishTranslation);
});

// Zeige Cache-Statistiken
setTimeout(() => {
  console.log('\n📊 Übersetzungs-Cache:', translationService.getCacheStats());
}, 2000);
