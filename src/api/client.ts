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

  ProfileDetail,
  ProfilePropertiesResponse,
  Mentee,
  MenteeUpdate,

  ConfigResponse,
  Error,
  ListParams
} from './types'
import { redirectToIdpLogin, useAuth } from '@mentor-forge/mentorhub_spa_utils'

const API_BASE = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/api`
const DEFAULT_LIST_OFFSET = 0
const DEFAULT_LIST_SIZE = 20

function listHeaders(params?: ListParams): Record<string, string> {
  return {
    offset: String(params?.offset ?? DEFAULT_LIST_OFFSET),
    size: String(params?.size ?? DEFAULT_LIST_SIZE),
  }
}

function appendListQuery(queryParams: URLSearchParams, params?: ListParams) {
  if (params?.sort_by) queryParams.append('sort_by', params.sort_by)
  if (params?.order) queryParams.append('order', params.order)
  if (params?.name) queryParams.append('name', params.name)
}

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
      const { logout } = useAuth()
      logout()
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
    appendListQuery(queryParams, params)

    const query = queryParams.toString()
    return request<Plan[]>(`/plan${query ? `?${query}` : ''}`, {
      headers: listHeaders(params),
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



  // Consume endpoints

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
