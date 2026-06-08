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

{% for item in service.data_domains.controls %}
// {{ item }} Domain
export interface {{ item }} {
  _id: string
  name: string
  description?: string
  status?: 'active' | 'archived'
  created: Breadcrumb
  saved: Breadcrumb
}

export interface {{ item }}Input {
  name: string
  description?: string
  status?: 'active' | 'archived'
}

export interface {{ item }}Update {
  name?: string
  description?: string
  status?: 'active' | 'archived'
}
{% endfor %}
{% for item in service.data_domains.creates %}
// {{ item }} Domain
export interface {{ item }} {
  _id: string
  name: string
  description?: string
  status?: string
  created: Breadcrumb
}

export interface {{ item }}Input {
  name: string
  description?: string
  status?: string
}
{% endfor %}
{% for item in service.data_domains.consumes %}
// {{ item }} Domain
export interface {{ item }} {
  _id: string
  name: string
  description?: string
  status?: string
}
{% endfor %}

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

