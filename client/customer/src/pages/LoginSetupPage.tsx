import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, useI18n, useToast } from '../contexts'
import { useApi } from '../hooks'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Sparkles } from 'lucide-react'

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
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm glass-effect border-0 shadow-2xl animate-in fade-in zoom-in duration-500">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {t('login')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeId" className="text-sm font-medium">{t('storeId')}</Label>
              <Input 
                id="storeId" 
                type="text" 
                value={storeId} 
                onChange={e => setStoreId(e.target.value)}
                className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tableNumber" className="text-sm font-medium">{t('tableNumber')}</Label>
              <Input 
                id="tableNumber" 
                type="number" 
                value={tableNumber} 
                onChange={e => setTableNumber(e.target.value)}
                className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">{t('password')}</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                className="border-purple-200 focus:border-purple-400 focus:ring-purple-400"
              />
            </div>
            <Button 
              type="submit" 
              disabled={!isValid || isLoading} 
              className="w-full gradient-primary hover:opacity-90 transition-opacity shadow-lg"
            >
              {isLoading ? '...' : t('login')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
