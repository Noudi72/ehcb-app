import { supabase } from './src/config/supabase-api.js';

async function checkSupabaseTables() {
  console.log('=== SUPABASE TABELLEN CHECK ===');
  
  // Check surveys
  try {
    const { data: surveys, error } = await supabase.from('surveys').select('*');
    console.log('✅ Surveys:', surveys?.length || 0, 'Einträge');
    surveys?.forEach(s => console.log('  -', s.title || s.name || 'Unnamed'));
  } catch (e) {
    console.log('❌ Surveys Tabelle fehlt oder Fehler:', e.message);
  }
  
  // Check sport_food or similar
  try {
    const { data: sportFood, error } = await supabase.from('sport_food').select('*');
    console.log('✅ Sport Food:', sportFood?.length || 0, 'Einträge');
  } catch (e) {
    console.log('❌ Sport Food Tabelle fehlt:', e.message);
  }
  
  // Check food_items
  try {
    const { data: foodItems, error } = await supabase.from('food_items').select('*');
    console.log('✅ Food Items:', foodItems?.length || 0, 'Einträge');
  } catch (e) {
    console.log('❌ Food Items Tabelle fehlt:', e.message);
  }
  
  // Check cardio_programs
  try {
    const { data: cardio, error } = await supabase.from('cardio_programs').select('*');
    console.log('✅ Cardio Programs:', cardio?.length || 0, 'Einträge');
  } catch (e) {
    console.log('❌ Cardio Programs Tabelle fehlt:', e.message);
  }
  
  // Check questions
  try {
    const { data: questions, error } = await supabase.from('questions').select('*');
    console.log('✅ Questions:', questions?.length || 0, 'Einträge');
  } catch (e) {
    console.log('❌ Questions Tabelle fehlt:', e.message);
  }
  
  process.exit(0);
}

checkSupabaseTables();
