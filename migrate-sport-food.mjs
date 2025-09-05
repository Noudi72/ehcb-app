import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function migrateSportFoodData() {
  console.log('=== SPORT FOOD MIGRATION ===')
  
  // Read db.json
  const dbData = JSON.parse(fs.readFileSync('./db.json', 'utf8'))
  
  // Migrate sport food items
  const sportFoodItems = dbData['sport-food-items']
  console.log('📦 Migriere', sportFoodItems.length, 'Sport Food Items...')
  
  for (const item of sportFoodItems) {
    try {
      const { data, error } = await supabase
        .from('sport_food_items')
        .insert({
          name: item.name,
          category_id: item.categoryId,
          description: item.description,
          benefits: item.benefits
        })
      
      if (error) {
        console.error('❌ Fehler bei Item:', item.name, error.message)
      } else {
        console.log('✅ Migriert:', item.name)
      }
    } catch (e) {
      console.error('❌ Exception bei Item:', item.name, e.message)
    }
  }
  
  // Check cardio programs table
  try {
    const { data: cardio, error } = await supabase.from('cardio_programs').select('*')
    console.log('📊 Cardio Programs in Supabase:', cardio?.length || 0, 'Einträge')
  } catch (e) {
    console.log('❌ Cardio Programs Tabelle fehlt:', e.message)
  }
  
  console.log('✅ Migration abgeschlossen')
  process.exit(0)
}

migrateSportFoodData()
