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


// Control Domain
export interface Control {
  _id: string
  name: string
  description?: string
  status?: 'active' | 'archived'
  created: Breadcrumb
  saved: Breadcrumb
}

export interface ControlInput {
  name: string
  description?: string
  status?: 'active' | 'archived'
}

export interface ControlUpdate {
  name?: string
  description?: string
  status?: 'active' | 'archived'
}


// Create Domain
export interface Create {
  _id: string
  name: string
  description?: string
  status?: string
  created: Breadcrumb
}

export interface CreateInput {
  name: string
  description?: string
  status?: string
}


// Consume Domain
export interface Consume {
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
