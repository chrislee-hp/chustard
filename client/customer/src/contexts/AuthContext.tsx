import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { AuthState } from '../types'

interface AuthContextType extends AuthState {
  login: (token: string, tableId: string, sessionId: string) => void
  logout: () => void
  setExpired: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    tableId: null,
    sessionId: null,
    isAuthenticated: false,
  })

  const login = useCallback((token: string, tableId: string, sessionId: string) => {
    setState({ token, tableId, sessionId, isAuthenticated: true })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('table_auth')
    setState({ token: null, tableId: null, sessionId: null, isAuthenticated: false })
  }, [])

  const setExpired = useCallback(() => {
    setState(prev => ({ ...prev, isAuthenticated: false }))
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, logout, setExpired }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
