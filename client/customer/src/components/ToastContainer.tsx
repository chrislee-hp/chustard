import { useToast } from '../contexts'
import { Toast } from './Toast'

export function ToastContainer() {
  const { toasts, removeToast } = useToast()
  return (
    <div style={{ position: 'fixed', top: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 1000 }}>
      {toasts.map(t => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  )
}
