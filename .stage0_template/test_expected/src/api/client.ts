import type { 
  Control,
  ControlInput,
  ControlUpdate,

  Create,
  CreateInput,

  Consume,

  ConfigResponse,
  Error,
  InfiniteScrollParams,
  InfiniteScrollResponse
} from './types'

const API_BASE = '/api'

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: Error
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('access_token')
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let errorData: Error | null = null
    try {
      errorData = await response.json()
    } catch {
      // Ignore JSON parse errors
    }
    
    // Handle 401 Unauthorized - clear invalid token and redirect to login
    if (response.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('token_expires_at')
      // Redirect to login page, preserving current path for post-login redirect
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`
    }
    
    throw new ApiError(
      errorData?.error || `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      errorData || undefined
    )
  }

  // Handle empty responses
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as T
  }

  return response.json()
}

export const api = {
  // Config
  async getConfig(): Promise<ConfigResponse> {
    return request<ConfigResponse>('/config')
  },

  // Control endpoints
  // 🎯 API methods use InfiniteScrollParams and InfiniteScrollResponse types
  // Shapes used by spa_utils useInfiniteScroll

  async getControls(params?: InfiniteScrollParams): Promise<InfiniteScrollResponse<Control>> {
    const queryParams = new URLSearchParams()
    if (params?.name) queryParams.append('name', params.name)
    if (params?.after_id) queryParams.append('after_id', params.after_id)
    if (params?.limit) queryParams.append('limit', String(params.limit))
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by)
    if (params?.order) queryParams.append('order', params.order)
    
    const query = queryParams.toString()
    return request<InfiniteScrollResponse<Control>>(`/control${query ? `?${query}` : ''}`)
  },

  async getControl(controlId: string): Promise<Control> {
    return request<Control>(`/control/${controlId}`)
  },

  async createControl(data: ControlInput): Promise<{ _id: string }> {
    return request<{ _id: string }>('/control', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async updateControl(controlId: string, data: ControlUpdate): Promise<Control> {
    return request<Control>(`/control/${controlId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },



  // Create endpoints

  async getCreates(params?: InfiniteScrollParams): Promise<InfiniteScrollResponse<Create>> {
    const queryParams = new URLSearchParams()
    if (params?.name) queryParams.append('name', params.name)
    if (params?.after_id) queryParams.append('after_id', params.after_id)
    if (params?.limit) queryParams.append('limit', String(params.limit))
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by)
    if (params?.order) queryParams.append('order', params.order)
    
    const query = queryParams.toString()
    return request<InfiniteScrollResponse<Create>>(`/create${query ? `?${query}` : ''}`)
  },

  async getCreate(createId: string): Promise<Create> {
    return request<Create>(`/create/${createId}`)
  },

  async createCreate(data: CreateInput): Promise<{ _id: string }> {
    return request<{ _id: string }>('/create', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },



  // Consume endpoints

  async getConsumes(params?: InfiniteScrollParams): Promise<InfiniteScrollResponse<Consume>> {
    const queryParams = new URLSearchParams()
    if (params?.name) queryParams.append('name', params.name)
    if (params?.after_id) queryParams.append('after_id', params.after_id)
    if (params?.limit) queryParams.append('limit', String(params.limit))
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by)
    if (params?.order) queryParams.append('order', params.order)
    
    const query = queryParams.toString()
    return request<InfiniteScrollResponse<Consume>>(`/consume${query ? `?${query}` : ''}`)
  },

  async getConsume(consumeId: string): Promise<Consume> {
    return request<Consume>(`/consume/${consumeId}`)
  },


}

export { ApiError }
