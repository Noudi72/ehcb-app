// Supabase API Wrapper
import { supabase } from '../lib/supabase.js'

// Auth Functions
export const auth = {
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  },

  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  }
}

// Survey Functions
export const surveys = {
  async getAll() {
    const { data, error } = await supabase
      .from('surveys')
      .select(`
        *,
        questions (
          id,
          content,
          options,
          type,
          required
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('surveys')
      .select(`
        *,
        questions (
          id,
          content,
          options,
          type,
          required
        )
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(survey) {
    const { data, error } = await supabase
      .from('surveys')
      .insert(survey)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('surveys')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase
      .from('surveys')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Question Functions
export const questions = {
  async getBySurveyId(surveyId) {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('survey_id', surveyId)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data
  },

  async create(question) {
    const { data, error } = await supabase
      .from('questions')
      .insert(question)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('questions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Survey Response Functions
export const responses = {
  async getAll() {
    const { data, error } = await supabase
      .from('survey_responses')
      .select(`
        *,
        surveys (
          id,
          title,
          team
        ),
        users (
          id,
          username,
          team
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getByUserId(userId) {
    if (userId === 'all') {
      return this.getAll()
    }
    
    const { data, error } = await supabase
      .from('survey_responses')
      .select(`
        *,
        surveys (
          id,
          title,
          team
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getBySurveyId(surveyId) {
    const { data, error } = await supabase
      .from('survey_responses')
      .select(`
        *,
        users (
          id,
          username,
          team
        )
      `)
      .eq('survey_id', surveyId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async create(response) {
    const { data, error } = await supabase
      .from('survey_responses')
      .insert(response)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async checkIfCompleted(userId, surveyId) {
    const { data, error } = await supabase
      .from('survey_responses')
      .select('id')
      .eq('user_id', userId)
      .eq('survey_id', surveyId)
      .maybeSingle()
    
    if (error) throw error
    return !!data
  }
}

// User Functions
export const users = {
  async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async getByUsername(username) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single()
    
    if (error) throw error
    return data
  },

  async getPending() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async create(user) {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  },

  async approve(id, teamAssignment = null) {
    const updates = { status: 'approved' }
    if (teamAssignment) {
      updates.teams = teamAssignment
    }
    
    return await this.update(id, updates)
  }
}

// Teams Functions
export const teams = {
  async getAll() {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) throw error
    return data
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(team) {
    const { data, error } = await supabase
      .from('teams')
      .insert(team)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// News Functions
export const news = {
  async getAll() {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(newsItem) {
    const { data, error } = await supabase
      .from('news')
      .insert({
        ...newsItem,
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('news')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase
      .from('news')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  },

  async getPublished() {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async publish(id) {
    return await this.update(id, { published: true })
  },

  async unpublish(id) {
    return await this.update(id, { published: false })
  }
}

// Cardio Functions
export const cardio = {
  async getAll() {
    const { data, error } = await supabase
      .from('cardio_programs')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('cardio_programs')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(program) {
    const { data, error } = await supabase
      .from('cardio_programs')
      .insert({
        ...program,
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('cardio_programs')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase
      .from('cardio_programs')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  },

  async getByTeam(teamId) {
    const { data, error } = await supabase
      .from('cardio_programs')
      .select('*')
      .contains('target_teams', [teamId])
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getActive() {
    const { data, error } = await supabase
      .from('cardio_programs')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
}

// SportFood Functions
export const sportFood = {
  // Categories
  async getAllCategories() {
    const { data, error } = await supabase
      .from('sport_food_categories')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) throw error
    return data
  },

  async createCategory(category) {
    const { data, error } = await supabase
      .from('sport_food_categories')
      .insert({
        ...category,
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateCategory(id, updates) {
    const { data, error } = await supabase
      .from('sport_food_categories')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteCategory(id) {
    const { error } = await supabase
      .from('sport_food_categories')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  },

  // Items
  async getAllItems() {
    const { data, error } = await supabase
      .from('sport_food_items')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) throw error
    return data
  },

  async getItemsByCategory(categoryId) {
    const { data, error } = await supabase
      .from('sport_food_items')
      .select('*')
      .eq('categoryId', categoryId)
      .order('name', { ascending: true })
    
    if (error) throw error
    return data
  },

  async createItem(item) {
    const { data, error } = await supabase
      .from('sport_food_items')
      .insert({
        ...item,
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateItem(id, updates) {
    const { data, error } = await supabase
      .from('sport_food_items')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteItem(id) {
    const { error } = await supabase
      .from('sport_food_items')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  }
}

// Notifications Functions

// Reflexions Functions
export const reflexions = {
  async getAll() {
    const { data, error } = await supabase
      .from('reflections')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('reflections')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(reflection) {
    const { data, error } = await supabase
      .from('reflections')
      .insert({
        ...reflection,
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('reflections')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase
      .from('reflections')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  }
}

// Notifications Functions
export const notifications = {
  async getAll() {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getByUserId(userId) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('userId', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async create(notification) {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        ...notification,
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async markAsRead(id) {
    const { data, error } = await supabase
      .from('notifications')
      .update({
        isRead: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  }
}

console.log('📡 Supabase API wrapper loaded')
