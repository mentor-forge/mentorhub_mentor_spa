import type { 
  Resource,
  ResourceInput,
  ResourceUpdate,

  Path,
  PathInput,
  PathUpdate,

  Plan,
  PlanInput,
  PlanUpdate,

  Encounter,
  EncounterInput,
  EncounterUpdate,

  EventInput,

  ProfileDetail,
  Mentee,
  MenteeUpdate,
  MentorDashboardProfile,

  ConfigResponse,
  Error,
  InfiniteScrollParams,
  InfiniteScrollResponse
} from './types'
import { redirectToIdpLogin } from '@mentor-forge/mentorhub_spa_utils'

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
    
    // Handle 401 Unauthorized - clear invalid token and redirect to IdP login
    if (response.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('token_expires_at')
      redirectToIdpLogin()
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

  async getResources(params?: InfiniteScrollParams): Promise<InfiniteScrollResponse<Resource>> {
    const queryParams = new URLSearchParams()
    if (params?.name) queryParams.append('name', params.name)
    if (params?.after_id) queryParams.append('after_id', params.after_id)
    if (params?.limit) queryParams.append('limit', String(params.limit))
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by)
    if (params?.order) queryParams.append('order', params.order)
    
    const query = queryParams.toString()
    return request<InfiniteScrollResponse<Resource>>(`/resource${query ? `?${query}` : ''}`)
  },

  async getResource(resourceId: string): Promise<Resource> {
    return request<Resource>(`/resource/${resourceId}`)
  },

  async createResource(data: ResourceInput): Promise<{ _id: string }> {
    return request<{ _id: string }>('/resource', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async updateResource(resourceId: string, data: ResourceUpdate): Promise<Resource> {
    return request<Resource>(`/resource/${resourceId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },


  async getPaths(params?: InfiniteScrollParams): Promise<InfiniteScrollResponse<Path>> {
    const queryParams = new URLSearchParams()
    if (params?.name) queryParams.append('name', params.name)
    if (params?.after_id) queryParams.append('after_id', params.after_id)
    if (params?.limit) queryParams.append('limit', String(params.limit))
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by)
    if (params?.order) queryParams.append('order', params.order)
    
    const query = queryParams.toString()
    return request<InfiniteScrollResponse<Path>>(`/path${query ? `?${query}` : ''}`)
  },

  async getPath(pathId: string): Promise<Path> {
    return request<Path>(`/path/${pathId}`)
  },

  async createPath(data: PathInput): Promise<{ _id: string }> {
    return request<{ _id: string }>('/path', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async updatePath(pathId: string, data: PathUpdate): Promise<Path> {
    return request<Path>(`/path/${pathId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },


  async getPlans(params?: InfiniteScrollParams): Promise<InfiniteScrollResponse<Plan>> {
    const queryParams = new URLSearchParams()
    if (params?.name) queryParams.append('name', params.name)
    if (params?.after_id) queryParams.append('after_id', params.after_id)
    if (params?.limit) queryParams.append('limit', String(params.limit))
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by)
    if (params?.order) queryParams.append('order', params.order)
    
    const query = queryParams.toString()
    return request<InfiniteScrollResponse<Plan>>(`/plan${query ? `?${query}` : ''}`)
  },

  async getPlan(planId: string): Promise<Plan> {
    return request<Plan>(`/plan/${planId}`)
  },

  async createPlan(data: PlanInput): Promise<{ _id: string }> {
    return request<{ _id: string }>('/plan', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async updatePlan(planId: string, data: PlanUpdate): Promise<Plan> {
    return request<Plan>(`/plan/${planId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },


  async getEncounters(params?: InfiniteScrollParams): Promise<InfiniteScrollResponse<Encounter>> {
    const queryParams = new URLSearchParams()
    if (params?.name) queryParams.append('name', params.name)
    if (params?.after_id) queryParams.append('after_id', params.after_id)
    if (params?.limit) queryParams.append('limit', String(params.limit))
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by)
    if (params?.order) queryParams.append('order', params.order)
    
    const query = queryParams.toString()
    return request<InfiniteScrollResponse<Encounter>>(`/encounter${query ? `?${query}` : ''}`)
  },

  async getEncounter(encounterId: string): Promise<Encounter> {
    return request<Encounter>(`/encounter/${encounterId}`)
  },

  async createEncounter(data: EncounterInput): Promise<{ _id: string }> {
    return request<{ _id: string }>('/encounter', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async updateEncounter(encounterId: string, data: EncounterUpdate): Promise<Encounter> {
    return request<Encounter>(`/encounter/${encounterId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },



  // Create endpoints — POST only (no Event UI pages; retained for future use)

  async createEvent(data: EventInput): Promise<{ _id: string }> {
    return request<{ _id: string }>('/event', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },



  // Consume endpoints

  /** Mentor Dashboard — assigned mentee cards for the current user (GET /api/Profile). */
  async getProfiles(): Promise<MentorDashboardProfile[]> {
    return request<MentorDashboardProfile[]>('/profile')
  },

  async getProfile(profileId: string): Promise<ProfileDetail> {
    return request<ProfileDetail>(`/profile/${profileId}`)
  },

  async updateMentee(menteeId: string, data: MenteeUpdate): Promise<Mentee> {
    return request<Mentee>(`/mentee/${menteeId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },


}

export { ApiError }
