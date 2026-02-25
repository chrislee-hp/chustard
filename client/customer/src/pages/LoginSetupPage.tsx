import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, useI18n, useToast } from '../contexts'
import { useApi } from '../hooks'

export function LoginSetupPage() {
  const [storeId, setStoreId] = useState('')
  const [tableNumber, setTableNumber] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { login } = useAuth()
  const { t } = useI18n()
  const { showToast } = useToast()
  const { post } = useApi()
  const navigate = useNavigate()

  const isValid = storeId && tableNumber && password

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    setIsLoading(true)
    try {
      const res = await post<{ token: string; tableId: string; sessionId: string }>('/api/table/login', {
        storeId,
        tableNumber: parseInt(tableNumber),
        password,
      })
      localStorage.setItem('table_auth', JSON.stringify({ storeId, tableNumber, password }))
      login(res.token, res.tableId, res.sessionId)
      navigate('/menu')
    } catch {
      showToast(t('error.loginFailed'), 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 320, margin: '40px auto', padding: 16 }}>
      <h1 style={{ textAlign: 'center', marginBottom: 24 }}>{t('login')}</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <label>
          {t('storeId')}
          <input type="text" value={storeId} onChange={e => setStoreId(e.target.value)} style={{ width: '100%', padding: 8, marginTop: 4 }} />
        </label>
        <label>
          {t('tableNumber')}
          <input type="number" value={tableNumber} onChange={e => setTableNumber(e.target.value)} style={{ width: '100%', padding: 8, marginTop: 4 }} />
        </label>
        <label>
          {t('password')}
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: 8, marginTop: 4 }} />
        </label>
        <button type="submit" disabled={!isValid || isLoading} style={{ padding: 12, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: isValid ? 'pointer' : 'not-allowed' }}>
          {isLoading ? '...' : t('login')}
        </button>
      </form>
    </div>
  )
}
