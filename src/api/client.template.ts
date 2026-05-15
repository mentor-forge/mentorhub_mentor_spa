import type { {% for item in service.data_domains.controls %}
  {{ item }},
  {{ item }}Input,
  {{ item }}Update,
{% endfor %}{% for item in service.data_domains.creates %}
  {{ item }},
  {{ item }}Input,
{% endfor %}{% for item in service.data_domains.consumes %}
  {{ item }},
{% endfor %}
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
{% for item in service.data_domains.controls %}
  async get{{ item }}s(params?: InfiniteScrollParams): Promise<InfiniteScrollResponse<{{ item }}>> {
    const queryParams = new URLSearchParams()
    if (params?.name) queryParams.append('name', params.name)
    if (params?.after_id) queryParams.append('after_id', params.after_id)
    if (params?.limit) queryParams.append('limit', String(params.limit))
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by)
    if (params?.order) queryParams.append('order', params.order)
    
    const query = queryParams.toString()
    return request<InfiniteScrollResponse<{{ item }}>>(`/{{ item | lower }}${query ? `?${query}` : ''}`)
  },

  async get{{ item }}({{ item | lower }}Id: string): Promise<{{ item }}> {
    return request<{{ item }}>(`/{{ item | lower }}/${{ "{" }}{{ item | lower }}Id{{ "}" }}`)
  },

  async create{{ item }}(data: {{ item }}Input): Promise<{ _id: string }> {
    return request<{ _id: string }>('/{{ item | lower }}', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async update{{ item }}({{ item | lower }}Id: string, data: {{ item }}Update): Promise<{{ item }}> {
    return request<{{ item }}>(`/{{ item | lower }}/${{ "{" }}{{ item | lower }}Id{{ "}" }}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

{% endfor %}

  // Create endpoints
{% for item in service.data_domains.creates %}
  async get{{ item }}s(params?: InfiniteScrollParams): Promise<InfiniteScrollResponse<{{ item }}>> {
    const queryParams = new URLSearchParams()
    if (params?.name) queryParams.append('name', params.name)
    if (params?.after_id) queryParams.append('after_id', params.after_id)
    if (params?.limit) queryParams.append('limit', String(params.limit))
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by)
    if (params?.order) queryParams.append('order', params.order)
    
    const query = queryParams.toString()
    return request<InfiniteScrollResponse<{{ item }}>>(`/{{ item | lower }}${query ? `?${query}` : ''}`)
  },

  async get{{ item }}({{ item | lower }}Id: string): Promise<{{ item }}> {
    return request<{{ item }}>(`/{{ item | lower }}/${{ "{" }}{{ item | lower }}Id{{ "}" }}`)
  },

  async create{{ item }}(data: {{ item }}Input): Promise<{ _id: string }> {
    return request<{ _id: string }>('/{{ item | lower }}', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

{% endfor %}

  // Consume endpoints
{% for item in service.data_domains.consumes %}
  async get{{ item }}s(params?: InfiniteScrollParams): Promise<InfiniteScrollResponse<{{ item }}>> {
    const queryParams = new URLSearchParams()
    if (params?.name) queryParams.append('name', params.name)
    if (params?.after_id) queryParams.append('after_id', params.after_id)
    if (params?.limit) queryParams.append('limit', String(params.limit))
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by)
    if (params?.order) queryParams.append('order', params.order)
    
    const query = queryParams.toString()
    return request<InfiniteScrollResponse<{{ item }}>>(`/{{ item | lower }}${query ? `?${query}` : ''}`)
  },

  async get{{ item }}({{ item | lower }}Id: string): Promise<{{ item }}> {
    return request<{{ item }}>(`/{{ item | lower }}/${{ "{" }}{{ item | lower }}Id{{ "}" }}`)
  },

{% endfor %}
}

export { ApiError }

