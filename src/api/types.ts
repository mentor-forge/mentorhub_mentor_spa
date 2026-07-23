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
  checklist?: string[]
  created: Breadcrumb
  saved: Breadcrumb
}

export interface PlanInput {
  name: string
  description?: string
  status?: 'active' | 'archived'
  checklist?: string[]
}

export interface PlanUpdate {
  name?: string
  description?: string
  status?: 'active' | 'archived'
  checklist?: string[]
}

// Encounter Domain
export interface EncounterAgendaItem {
  checked?: boolean
  step?: string
}

export interface Encounter {
  _id: string
  mentor_id?: string
  mentee_id?: string
  plan_id?: string
  agenda?: EncounterAgendaItem[]
  date?: string
  status?: 'active' | 'archived'
  tldr?: string
  summary?: string
  transcript?: string
  created: Breadcrumb
  saved: Breadcrumb
}

export interface EncounterInput {
  mentor_id: string
  mentee_id: string
  plan_id: string
  date?: string
  status?: 'active' | 'archived'
  tldr?: string
  summary?: string
  transcript?: string
}

export interface EncounterUpdate {
  mentor_id?: string
  mentee_id?: string
  plan_id?: string
  agenda?: EncounterAgendaItem[]
  date?: string
  status?: 'active' | 'archived'
  tldr?: string
  summary?: string
  transcript?: string
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
export interface ProfileExperienceRole {
  title?: string
  description?: string
  start?: string
  end?: string
  technologies?: string[]
}

export interface ProfileExperience {
  company?: string
  roles?: ProfileExperienceRole[]
}

export interface Profile {
  _id: string
  name: string
  full_name?: string
  description?: string
  email?: string
  email_verified?: boolean
  mentor_id?: string
  status?: 'active' | 'archived' | 'suspended'
  location?: string
  phone?: string
  interests?: string[]
  goals?: string[]
  experience?: ProfileExperience[]
  created?: Breadcrumb
  saved?: Breadcrumb
}

export interface MenteeSchedule {
  repeats?: number
  starting?: string
}

export interface Mentee {
  _id: string
  name?: string
  profile_id?: string
  status?: 'active' | 'archived'
  description?: string
  focus?: string
  homework?: string
  notes?: string
  next_appointment?: string
  schedule?: MenteeSchedule
  created: Breadcrumb
  saved: Breadcrumb
}

export interface MenteeUpdate {
  name?: string
  profile_id?: string
  status?: 'active' | 'archived'
  description?: string
  focus?: string
  homework?: string
  notes?: string
  next_appointment?: string
  schedule?: MenteeSchedule
}

export interface ProfileDetail {
  profile: Profile
  mentee: Mentee
  encounters: Encounter[]
}

export interface JourneyProgress {
  library: number
  now: number
  next: number
}

export interface RecentEncounterSummary {
  _id: string
  date?: string
  tldr?: string
  summary?: string
}

/** Mentee card on the Mentor Dashboard (GET /api/Profile). */
export interface MentorDashboardProfile {
  _id: string
  name: string
  description?: string
  progress: JourneyProgress
  last_encounter?: RecentEncounterSummary | null
}

export interface StatusSummary {
  profile_status?: string
  journey_status?: string
  library_count: number
  now_count: number
  next_count: number
  encounters_count: number
  resources_engaged: number
  last_activity_at?: string | null
}

export interface SiteAndLink {
  resource_id: string
  name: string
  url?: string
  scope: 'library' | 'now' | 'next'
  used?: number
  started?: string
  completed?: string
}

export interface MentorHistoryEntry {
  mentor_id: string
  mentor_name?: string
  encounter_count: number
  first_date?: string
  last_date?: string
}

export interface ResourceUsageEntry {
  resource_id: string
  name: string
  times_used: number
  status: 'completed' | 'in_progress' | 'queued'
}

export interface CelebrationEntry {
  resource_id: string
  name: string
  completed_at: string
}

/** Aggregated mentee activity (GET /api/profile/{ProfileId}/properties). */
export interface ProfilePropertiesResponse {
  profile: Profile
  status_summary: StatusSummary
  sites_and_links: SiteAndLink[]
  mentor_history: MentorHistoryEntry[]
  journey?: object | null
  path?: object | null
  resource_usage: ResourceUsageEntry[]
  celebrations: CelebrationEntry[]
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

// Header-based offset pagination
export interface ListParams {
  offset?: number
  size?: number
  sort_by?: string
  order?: 'asc' | 'desc'
  name?: string
}

export interface ResourceListParams extends ListParams {
  description?: string
  status?: string
}

// Legacy cursor pagination used only by Event endpoints.
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
