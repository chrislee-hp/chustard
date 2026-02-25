import type { ToastType } from '../types'

interface Props {
  message: string
  type: ToastType
  onClose: () => void
}

export function Toast({ message, type, onClose }: Props) {
  const bgColor = type === 'success' ? '#4caf50' : '#f44336'
  return (
    <div style={{ background: bgColor, color: '#fff', padding: '12px 16px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
      <span>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>×</button>
    </div>
  )
}
