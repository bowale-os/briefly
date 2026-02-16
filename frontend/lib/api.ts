import axios, { AxiosInstance } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export interface LoginCredentials {
  username: string
  password: string
}

export interface SignupCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
}

export interface User {
  id: string
  email: string
}

export const authAPI = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const formData = new URLSearchParams()
    formData.append('username', credentials.username)
    formData.append('password', credentials.password)
    
    const { data } = await axios.post(`${API_BASE_URL}/auth/login`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    return data
  },

  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    const { data } = await axios.post(`${API_BASE_URL}/auth/signup`, credentials)
    return data
  },

  async getMe(): Promise<User> {
    const { data } = await api.get('/users/me')
    return data
  },
}

// Briefings API
export interface Briefing {
  id: string
  search_history_id: string
  city: string | null
  country: string
  script: string
  audio_filename: string
  query: string
  persona: string
  user_id: string
  audio_url: string
  created_at: string
}

export interface BriefingsResponse {
  briefings: Briefing[]
}

export interface CreateBriefingRequest {
  query: string
  persona: string
}

export const briefingsAPI = {
  async getBriefings(userId: string): Promise<Briefing[]> {
    const { data } = await api.get<BriefingsResponse>(`/users/${userId}/briefings`)
    console.log(data)
    return data.briefings
  },

  async createBriefing(request: CreateBriefingRequest): Promise<Briefing> {
    const { data } = await api.post('/breakdown/narration', request)
    return data
  },

  //when would i need to use this??
  // async getBriefingById(userId: string, briefingId: string): Promise<Briefing | null> {
  //   const briefings = await this.getBriefings(userId)
  //   return briefings.find(b => b.id === briefingId) || null
  // },
}

export default api