import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkAndFixData() {
  console.log('=== SUPABASE DATEN CHECK UND REPARATUR ===')
  
  // 1. Check surveys
  try {
    const { data: surveys, error } = await supabase.from('surveys').select('*')
    console.log('✅ Surveys:', surveys?.length || 0, 'Einträge')
    surveys?.forEach(s => console.log('  -', s.id, ':', s.title || s.name || 'Unnamed'))
    
    // Update survey title if it's "Unbenannte Umfrage"
    if (surveys?.length > 0) {
      const unnamedSurvey = surveys.find(s => s.title === 'Unbenannte Umfrage')
      if (unnamedSurvey) {
        console.log('🔧 Updating survey title to "Mental Game"...')
        const { data, error } = await supabase
          .from('surveys')
          .update({ title: 'Mental Game', description: 'Verbesserung der Spielvorbereitung und -performance' })
          .eq('id', unnamedSurvey.id)
        
        if (error) {
          console.error('❌ Failed to update survey:', error)
        } else {
          console.log('✅ Survey title updated successfully')
        }
      }
    }
  } catch (e) {
    console.log('❌ Surveys Fehler:', e.message)
  }
  
  // 2. Check sport food categories
  try {
    const { data: categories, error } = await supabase.from('sport_food_categories').select('*')
    console.log('✅ Sport Food Categories:', categories?.length || 0, 'Einträge')
  } catch (e) {
    console.log('❌ Sport Food Categories Tabelle fehlt:', e.message)
  }
  
  // 3. Check sport food items  
  try {
    const { data: items, error } = await supabase.from('sport_food_items').select('*')
    console.log('✅ Sport Food Items:', items?.length || 0, 'Einträge')
  } catch (e) {
    console.log('❌ Sport Food Items Tabelle fehlt:', e.message)
  }
  
  process.exit(0)
}

checkAndFixData()
