import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useI18n } from '../contexts'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { CheckCircle, ArrowRight } from 'lucide-react'

export function OrderSuccessPage() {
  const [countdown, setCountdown] = useState(5)
  const { t } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const orderId = location.state?.orderId
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (countdown <= 0) {
      navigate('/menu')
      return
    }
    timerRef.current = window.setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [countdown, navigate])

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-effect border-0 shadow-2xl text-center">
        <CardContent className="p-8 space-y-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-green-500 flex items-center justify-center animate-in zoom-in duration-500">
            <CheckCircle className="w-14 h-14 text-white" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-800">{t('orderSuccess')}</h2>
            {orderId && (
              <p className="text-gray-500">주문번호 #{String(orderId).slice(-6)}</p>
            )}
          </div>
          
          <p className="text-gray-600">
            주문이 접수되었습니다.<br/>
            잠시만 기다려주세요!
          </p>
          
          <div className="pt-4 space-y-3">
            <div className="text-sm text-gray-400">
              {countdown}초 후 메뉴 화면으로 이동합니다
            </div>
            <Button 
              onClick={() => navigate('/menu')}
              className="w-full gradient-food hover:opacity-90"
              size="lg"
            >
              메뉴로 돌아가기
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
