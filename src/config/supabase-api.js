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

console.log('📡 Supabase API wrapper loaded')
