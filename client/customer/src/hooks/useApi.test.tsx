import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useApi } from './useApi'
import { AuthProvider } from '../contexts'
import axios from 'axios'
import { ReactNode } from 'react'

vi.mock('axios')

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
)

describe('useApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('GET 요청 성공', async () => {
    (axios.request as Mock).mockResolvedValueOnce({ data: { id: 1 } })
    
    const { result } = renderHook(() => useApi(), { wrapper })
    const response = await result.current.get('/api/test')
    
    expect(response).toEqual({ id: 1 })
    expect(axios.request).toHaveBeenCalledWith(expect.objectContaining({
      method: 'GET',
      url: '/api/test'
    }))
  })

  it('POST 요청 성공', async () => {
    (axios.request as Mock).mockResolvedValueOnce({ data: { success: true } })
    
    const { result } = renderHook(() => useApi(), { wrapper })
    const response = await result.current.post('/api/test', { name: 'test' })
    
    expect(response).toEqual({ success: true })
  })

  it('요청 실패 시 에러 throw', async () => {
    (axios.request as Mock).mockRejectedValueOnce(new Error('Network Error'))
    
    const { result } = renderHook(() => useApi(), { wrapper })
    
    await expect(result.current.get('/api/test')).rejects.toThrow('Network Error')
  })
})
