// Type definitions based on OpenAPI spec

export interface Error {
  error: string
}

export interface Breadcrumb {
  from_ip: string
  by_user: string
  at_time: string
  correlation_id: string
}


// Resource Domain
export interface Resource {
  _id: string
  name: string
  description?: string
  status?: 'active' | 'archived'
  created: Breadcrumb
  saved: Breadcrumb
}

export interface ResourceInput {
  name: string
  description?: string
  status?: 'active' | 'archived'
}

export interface ResourceUpdate {
  name?: string
  description?: string
  status?: 'active' | 'archived'
}

// Path Domain
export interface Path {
  _id: string
  name: string
  description?: string
  status?: 'active' | 'archived'
  created: Breadcrumb
  saved: Breadcrumb
}

export interface PathInput {
  name: string
  description?: string
  status?: 'active' | 'archived'
}

export interface PathUpdate {
  name?: string
  description?: string
  status?: 'active' | 'archived'
}

// Plan Domain
export interface Plan {
  _id: string
  name: string
  description?: string
  status?: 'active' | 'archived'
  created: Breadcrumb
  saved: Breadcrumb
}

export interface PlanInput {
  name: string
  description?: string
  status?: 'active' | 'archived'
}

export interface PlanUpdate {
  name?: string
  description?: string
  status?: 'active' | 'archived'
}

// Encounter Domain
export interface Encounter {
  _id: string
  name: string
  description?: string
  status?: 'active' | 'archived'
  created: Breadcrumb
  saved: Breadcrumb
}

export interface EncounterInput {
  name: string
  description?: string
  status?: 'active' | 'archived'
}

export interface EncounterUpdate {
  name?: string
  description?: string
  status?: 'active' | 'archived'
}


// Event Domain
export interface Event {
  _id: string
  name: string
  description?: string
  status?: string
  created: Breadcrumb
}

export interface EventInput {
  name: string
  description?: string
  status?: string
}


// Profile Domain
export interface Profile {
  _id: string
  name: string
  description?: string
  status?: string
}


// Configuration
export interface ConfigResponse {
  config_items: unknown[]
  versions: unknown[]
  enumerators: unknown[]
  token?: {
    claims?: Record<string, unknown>
  }
}

// Infinite Scroll
export interface InfiniteScrollParams {
  name?: string
  after_id?: string
  limit?: number
  sort_by?: string
  order?: 'asc' | 'desc'
}

export interface InfiniteScrollResponse<T> {
  items: T[]
  limit: number
  has_more: boolean
  next_cursor: string | null
}
