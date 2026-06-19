import { create } from 'zustand'
import { User } from '@/types'

interface AuthStore {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null

  // Actions
  setUser: (user: User) => void
  setToken: (token: string) => void
  setAuth: (user: User, token: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  logout: () => void
  initialize: () => void
}

// Helper para cargar el usuario desde localStorage
const loadUserFromStorage = (): User | null => {
  try {
    // Intentar cargar con la nueva clave
    let userStr = localStorage.getItem('authUser')
    
    // Migración: Si no existe con la nueva clave, buscar con la antigua
    if (!userStr) {
      userStr = localStorage.getItem('user')
      if (userStr) {
        // Migrar a la nueva clave
        localStorage.setItem('authUser', userStr)
        localStorage.removeItem('user')
      }
    }
    
    return userStr ? JSON.parse(userStr) : null
  } catch (error) {
    console.error('Error loading user from localStorage:', error)
    return null
  }
}

// Helper para cargar el token desde localStorage con migración
const loadTokenFromStorage = (): string | null => {
  // Intentar cargar con la nueva clave
  let token = localStorage.getItem('authToken')
  
  // Migración: Si no existe con la nueva clave, buscar con la antigua
  if (!token) {
    token = localStorage.getItem('token')
    if (token) {
      // Migrar a la nueva clave
      localStorage.setItem('authToken', token)
      localStorage.removeItem('token')
    }
  }
  
  return token
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: loadUserFromStorage(),
  token: loadTokenFromStorage(),
  isLoading: false,
  error: null,

  setUser: (user) => {
    localStorage.setItem('authUser', JSON.stringify(user))
    set({ user })
  },
  setToken: (token) => {
    localStorage.setItem('authToken', token)
    set({ token })
  },
  setAuth: (user, token) => {
    localStorage.setItem('authUser', JSON.stringify(user))
    localStorage.setItem('authToken', token)
    set({ user, token })
  },
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  logout: () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    set({ user: null, token: null, error: null })
  },
  initialize: () => {
    const user = loadUserFromStorage()
    const token = loadTokenFromStorage()
    set({ user, token })
  },
}))
