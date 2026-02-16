import { User } from './api'

export const TOKEN_KEY = 'auth_token'
export const USER_KEY = 'user'

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function removeAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function setUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getUser(): User | null {
  const userStr = localStorage.getItem(USER_KEY)
  if (!userStr) return null
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

export function removeUser(): void {
  localStorage.removeItem(USER_KEY)
}

export function logout(): void {
  // Clear localStorage
  removeAuthToken()
  removeUser()
  
  // Clear all app stores - ADD THESE
  if (typeof window !== 'undefined') {
    // Clear your briefing store
    const clearBriefings = (window as any).clearBriefings
    if (clearBriefings) clearBriefings()
    
    // Or if using zustand directly:
    // useBriefingStore.getState().clearAll()
    
    // Clear any auth store/context
    localStorage.removeItem('zustand') // if zustand persists
  }
  
  // Hard reload instead of redirect - CLEARS ALL STATE
  window.location.href = '/login'
}

export function isAuthenticated(): boolean {
  return !!getAuthToken()
}