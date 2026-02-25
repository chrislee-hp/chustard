import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, useI18n, useToast } from '../contexts'
import { useApi } from '../hooks'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { UtensilsCrossed } from 'lucide-react'

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
      <Card className="w-full max-w-md glass-effect border-0 shadow-2xl animate-in fade-in zoom-in duration-500">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full gradient-food flex items-center justify-center shadow-lg">
              <UtensilsCrossed className="w-10 h-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-orange-600">
            맛있는 주문
          </CardTitle>
          <p className="text-gray-600">테이블 번호로 로그인하세요</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="storeId" className="text-sm font-semibold text-gray-700">{t('storeId')}</Label>
              <Input 
                id="storeId" 
                type="text" 
                value={storeId} 
                onChange={e => setStoreId(e.target.value)}
                className="border-orange-200 focus:border-orange-400 focus:ring-orange-400 h-12"
                placeholder="매장 ID를 입력하세요"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tableNumber" className="text-sm font-semibold text-gray-700">{t('tableNumber')}</Label>
              <Input 
                id="tableNumber" 
                type="number" 
                value={tableNumber} 
                onChange={e => setTableNumber(e.target.value)}
                className="border-orange-200 focus:border-orange-400 focus:ring-orange-400 h-12"
                placeholder="테이블 번호"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">{t('password')}</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                className="border-orange-200 focus:border-orange-400 focus:ring-orange-400 h-12"
                placeholder="비밀번호"
              />
            </div>
            <Button 
              type="submit" 
              disabled={!isValid || isLoading} 
              size="lg"
              className="w-full gradient-food hover:opacity-90 transition-opacity shadow-lg text-lg font-bold h-14 mt-6"
            >
              {isLoading ? '로그인 중...' : '시작하기'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
