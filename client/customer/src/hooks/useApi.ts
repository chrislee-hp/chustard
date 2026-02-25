import { useCallback } from 'react'
import axios from 'axios'
import { useAuth } from '../contexts'

export function useApi() {
  const { token } = useAuth()

  const request = useCallback(async <T>(method: string, url: string, data?: unknown): Promise<T> => {
    const response = await axios.request<T>({
      method,
      url,
      data,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
    return response.data
  }, [token])

  const get = useCallback(<T>(url: string) => request<T>('GET', url), [request])
  const post = useCallback(<T>(url: string, data: unknown) => request<T>('POST', url, data), [request])
  const put = useCallback(<T>(url: string, data: unknown) => request<T>('PUT', url, data), [request])
  const del = useCallback(<T>(url: string) => request<T>('DELETE', url), [request])

  return { get, post, put, del }
}
