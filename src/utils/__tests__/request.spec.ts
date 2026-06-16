import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'

const mockMessageError = vi.fn()

const mockInstance = {
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  },
  defaults: {},
}

class MockAxiosError extends Error {
  constructor(msg: string) {
    super(msg)
    this.name = 'AxiosError'
  }
}

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockInstance),
    AxiosError: MockAxiosError,
  },
  create: vi.fn(() => mockInstance),
  AxiosError: MockAxiosError,
}))

vi.mock('@/utils/message', () => ({
  message: { error: mockMessageError },
}))

let requestFulfilled: Function
let responseFulfilled: Function
let responseRejected: Function

beforeAll(async () => {
  await import('../request')
  requestFulfilled = mockInstance.interceptors.request.use.mock.calls[0][0]
  responseFulfilled = mockInstance.interceptors.response.use.mock.calls[0][0]
  responseRejected = mockInstance.interceptors.response.use.mock.calls[0][1]
})

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

describe('request utils', () => {
  it('get() 调用 http.get 并返回 data.data', async () => {
    const { get } = await import('../request')

    mockInstance.get.mockResolvedValue({
      data: { code: 200, data: { id: 1, name: 'test' }, message: 'ok' },
    })

    const result = await get('/api/user', { id: 1 })
    expect(mockInstance.get).toHaveBeenCalledWith('/api/user', { params: { id: 1 } })
    expect(result).toEqual({ id: 1, name: 'test' })
  })

  it('post() 调用 http.post 并返回 data.data', async () => {
    const { post } = await import('../request')

    mockInstance.post.mockResolvedValue({
      data: { code: 200, data: { token: 'abc' }, message: 'ok' },
    })

    const result = await post('/api/login', { username: 'admin', password: '123' })
    expect(mockInstance.post).toHaveBeenCalledWith('/api/login', { username: 'admin', password: '123' }, undefined)
    expect(result).toEqual({ token: 'abc' })
  })

  it('del() 调用 http.delete 并返回 data.data', async () => {
    const { del } = await import('../request')

    mockInstance.delete.mockResolvedValue({
      data: { code: 200, data: null, message: '删除成功' },
    })

    const result = await del('/api/article/1')
    expect(mockInstance.delete).toHaveBeenCalledWith('/api/article/1', undefined)
    expect(result).toBeNull()
  })

  describe('请求拦截器', () => {
    it('localStorage 有 token 时添加到请求头', () => {
      localStorage.setItem('token', 'my-token')

      const config = { headers: {} } as any
      const result = requestFulfilled(config)

      expect(result.headers.Authorization).toBe('Bearer my-token')
    })

    it('localStorage 无 token 时不添加请求头', () => {
      const config = { headers: {} } as any
      const result = requestFulfilled(config)

      expect(result.headers.Authorization).toBeUndefined()
    })
  })

  describe('响应拦截器', () => {
    it('code 为 200 时正常返回 response', () => {
      const response = { data: { code: 200, data: 'ok', message: '成功' } }
      const result = responseFulfilled(response)

      expect(result).toBe(response)
    })

    it('code 不为 200 时提示错误并 reject', async () => {
      const response = { data: { code: 401, data: null, message: '未登录' } }

      await expect(responseFulfilled(response)).rejects.toThrow('未登录')
      expect(mockMessageError).toHaveBeenCalledWith('未登录')
    })

    it('网络异常时调用 message.error', async () => {
      const error = new Error('Network Error')

      await expect(() => responseRejected(error)).rejects.toThrow('Network Error')
      expect(mockMessageError).toHaveBeenCalledWith('网络异常，请稍后重试')
    })
  })
})
