import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, getToken, setToken } from '../../lib/api'
import type { User } from '../../types'

interface AuthState {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (v: { name: string; username: string; email: string; password: string }) => Promise<void>
  loginWithGoogle: (credential: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(!!getToken())

  useEffect(() => {
    if (!getToken()) return
    api<User>('/users/me')
      .then(setUser)
      .catch(() => setToken(null))
      .finally(() => setLoading(false))
  }, [])

  const accept = ({ token, user }: { token: string; user: User }) => {
    setToken(token)
    setUser(user)
  }

  const value: AuthState = {
    user,
    loading,
    login: async (email, password) => accept(await api('/auth/login', { email, password })),
    register: async (v) => accept(await api('/auth/register', v)),
    loginWithGoogle: async (credential) => accept(await api('/auth/google', { credential })),
    logout: () => {
      setToken(null)
      setUser(null)
    },
  }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
