import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  role: string
  themePreference: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  logout: () => void
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      setUser: (user) => set({ user }),
      logout: () => {
        set({ user: null })
        // Remove token from localStorage for cross-domain authentication
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
        }
      },
      checkAuth: async () => {
        set({ isLoading: true })
        try {
          const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
          console.log('[AuthStore] checkAuth - token from localStorage:', token ? 'present' : 'not present')
          
          const headers: Record<string, string> = {}
          if (token) {
            headers['Authorization'] = `Bearer ${token}`
          }
          
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
            credentials: 'include',
            headers,
          })
          
          console.log('[AuthStore] checkAuth - response status:', response.status)
          
          if (response.ok) {
            const data = await response.json()
            set({ user: data.data.user })
          } else {
            console.log('[AuthStore] checkAuth - response not ok, clearing user')
            set({ user: null })
          }
        } catch (error) {
          console.error('[AuthStore] checkAuth - error:', error)
          set({ user: null })
        } finally {
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
)
