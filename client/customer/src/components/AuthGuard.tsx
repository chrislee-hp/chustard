import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts'
import { useApi } from '../hooks'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, login, logout } = useAuth()
  const [checking, setChecking] = useState(true)
  const { post } = useApi()
  const location = useLocation()

  useEffect(() => {
    const tryAutoLogin = async () => {
      const saved = localStorage.getItem('table_auth')
      if (!saved) {
        setChecking(false)
        return
      }
      try {
        const { storeId, tableNumber, password } = JSON.parse(saved)
        const res = await post<{ token: string; tableId: string; sessionId: string }>('/api/table/login', {
          storeId,
          tableNumber: parseInt(tableNumber),
          password,
        })
        login(res.token, res.tableId, res.sessionId)
      } catch {
        localStorage.removeItem('table_auth')
        logout()
      } finally {
        setChecking(false)
      }
    }

    if (!isAuthenticated) {
      tryAutoLogin()
    } else {
      setChecking(false)
    }
  }, [isAuthenticated, login, logout, post])

  if (checking) return <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div>
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />
  return <>{children}</>
}
