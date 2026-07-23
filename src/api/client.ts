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

  Event,
  EventInput,

  ProfileDetail,
  ProfilePropertiesResponse,
  Mentee,
  MenteeUpdate,
  MentorDashboardProfile,

  ConfigResponse,
  Error,
  ListParams
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

  async getResources(params?: ListParams): Promise<Resource[]> {
    const queryParams = new URLSearchParams()
    if (params?.name) queryParams.append('name', params.name)
    if (params?.description) queryParams.append('description', params.description)
    if (params?.status) queryParams.append('status', params.status)
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by)
    if (params?.order) queryParams.append('order', params.order)

    const query = queryParams.toString()
    return request<Resource[]>(`/resource${query ? `?${query}` : ''}`, {
      headers: {
        offset: String(params?.offset ?? 0),
        size: String(params?.size ?? 20),
      },
    })
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


  async getPaths(params?: ListParams): Promise<Path[]> {
    const queryParams = new URLSearchParams()
    if (params?.name) queryParams.append('name', params.name)
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by)
    if (params?.order) queryParams.append('order', params.order)

    const query = queryParams.toString()
    return request<Path[]>(`/path${query ? `?${query}` : ''}`, {
      headers: {
        offset: String(params?.offset ?? 0),
        size: String(params?.size ?? 20),
      },
    })
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


  async getPlans(params?: ListParams): Promise<Plan[]> {
    const queryParams = new URLSearchParams()
    if (params?.name) queryParams.append('name', params.name)
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by)
    if (params?.order) queryParams.append('order', params.order)

    const query = queryParams.toString()
    return request<Plan[]>(`/plan${query ? `?${query}` : ''}`, {
      headers: {
        offset: String(params?.offset ?? 0),
        size: String(params?.size ?? 20),
      },
    })
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



  async getEvents(params?: ListParams): Promise<Event[]> {
    const queryParams = new URLSearchParams()
    if (params?.type) queryParams.append('type', params.type)
    if (params?.profile_id) queryParams.append('profile_id', params.profile_id)
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by)
    if (params?.order) queryParams.append('order', params.order)

    const query = queryParams.toString()
    return request<Event[]>(`/event${query ? `?${query}` : ''}`, {
      headers: {
        offset: String(params?.offset ?? 0),
        size: String(params?.size ?? 20),
      },
    })
  },

  async getEvent(eventId: string): Promise<Event> {
    return request<Event>(`/event/${eventId}`)
  },

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

  async getProfileProperties(profileId: string): Promise<ProfilePropertiesResponse> {
    return request<ProfilePropertiesResponse>(`/profile/${profileId}/properties`)
  },

  async getMentee(profileId: string): Promise<Mentee> {
    return request<Mentee>(`/mentee/${profileId}`)
  },

  async updateMentee(menteeId: string, data: MenteeUpdate): Promise<Mentee> {
    return request<Mentee>(`/mentee/${menteeId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },


}

export { ApiError }
