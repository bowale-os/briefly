import { create } from 'zustand'
import { User, Briefing } from '@/lib/api'
import { getAuthToken, getUser, setAuthToken, setUser, removeAuthToken, removeUser } from '@/lib/auth'

interface AuthState {
  token: string | null
  user: User | null
  setAuth: (token: string, user: User) => void
  clearAuth: () => void
  initAuth: () => void
}

interface PlayerState {
  currentBriefingId: string | null
  isPlaying: boolean
  progress: number
  duration: number
  playbackRate: number
  volume: number
  setCurrentBriefing: (id: string | null) => void
  setIsPlaying: (playing: boolean) => void
  setProgress: (progress: number) => void
  setDuration: (duration: number) => void
  setPlaybackRate: (rate: number) => void
  setVolume: (volume: number) => void
}

interface BriefingState {
  briefings: Briefing[]
  isLoading: boolean
  error: string | null
  setBriefings: (briefings: Briefing[]) => void
  addBriefing: (briefing: Briefing) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  setAuth: (token, user) => {
    setAuthToken(token)
    setUser(user)
    set({ token, user })
  },
  clearAuth: () => {
    removeAuthToken()
    removeUser()
    set({ token: null, user: null })
  },
  initAuth: () => {
    const token = getAuthToken()
    const user = getUser()
    if (token && user) {
      set({ token, user })
    }
  },
}))

export const usePlayerStore = create<PlayerState>((set) => ({
  currentBriefingId: null,
  isPlaying: false,
  progress: 0,
  duration: 0,
  playbackRate: 1.0,
  volume: 1.0,
  setCurrentBriefing: (id) => set({ currentBriefingId: id }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setProgress: (progress) => set({ progress }),
  setDuration: (duration) => set({ duration }),
  setPlaybackRate: (rate) => set({ playbackRate: rate }),
  setVolume: (volume) => set({ volume }),
}))

export const useBriefingStore = create<BriefingState>((set) => ({
  briefings: [],
  isLoading: false,
  error: null,
  setBriefings: (briefings) => set({ briefings, error: null }),
  addBriefing: (briefing) => set((state) => ({ 
    briefings: [briefing, ...state.briefings] 
  })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}))