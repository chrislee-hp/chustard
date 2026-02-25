import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useI18n } from '../contexts'

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
    <div style={{ textAlign: 'center', padding: 40 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
      <h2>{t('orderSuccess')}</h2>
      {orderId && <p style={{ color: '#666' }}>Order #{orderId}</p>}
      <p style={{ marginTop: 24 }}>
        {countdown} {t('redirecting')}
      </p>
    </div>
  )
}
