import { useEffect, useRef, useCallback } from 'react'

interface SSEHandlers {
  onOrderStatusChanged?: (data: { orderId: string; status: string }) => void
  onTableCompleted?: () => void
  onError?: (error: Event) => void
}

export function useSSE(url: string | null, handlers: SSEHandlers) {
  const eventSourceRef = useRef<EventSource | null>(null)
  const reconnectTimeoutRef = useRef<number | null>(null)
  const handlersRef = useRef(handlers)

  // handlers를 ref로 관리하여 재연결 방지
  useEffect(() => {
    handlersRef.current = handlers
  }, [handlers])

  const connect = useCallback(() => {
    if (!url) return

    const es = new EventSource(url)
    eventSourceRef.current = es

    es.addEventListener('order:status-changed', (e) => {
      handlersRef.current.onOrderStatusChanged?.(JSON.parse(e.data))
    })

    es.addEventListener('table:completed', () => {
      handlersRef.current.onTableCompleted?.()
    })

    es.onerror = (e) => {
      handlersRef.current.onError?.(e)
      es.close()
      reconnectTimeoutRef.current = window.setTimeout(connect, 3000)
    }
  }, [url])

  useEffect(() => {
    connect()
    return () => {
      eventSourceRef.current?.close()
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
    }
  }, [connect])

  const close = useCallback(() => {
    eventSourceRef.current?.close()
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current)
  }, [])

  return { close }
}
