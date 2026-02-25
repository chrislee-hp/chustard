import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, useI18n, useToast } from '../contexts'
import { useApi } from '../hooks'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

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
      const res = await post<{ token: string; tableId: string; sessionId: string; storeId: string }>('/api/table/login', {
        storeId,
        tableNumber: parseInt(tableNumber),
        password,
      })
      localStorage.setItem('table_auth', JSON.stringify({ storeId, tableNumber, password }))
      login(res.token, res.tableId, res.sessionId, res.storeId)
      navigate('/menu')
    } catch {
      showToast(t('error.loginFailed'), 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-10 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">{t('login')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeId">{t('storeId')}</Label>
              <Input id="storeId" type="text" value={storeId} onChange={e => setStoreId(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tableNumber">{t('tableNumber')}</Label>
              <Input id="tableNumber" type="number" value={tableNumber} onChange={e => setTableNumber(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <Button type="submit" disabled={!isValid || isLoading} className="w-full">
              {isLoading ? '...' : t('login')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
