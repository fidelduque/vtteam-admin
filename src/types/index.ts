export type Schedule = 'daily' | 'custom' | 'once'

export interface Category {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

export interface Task {
  id: string
  user_id: string
  title: string
  description?: string | null
  schedule: Schedule
  /** Weekday numbers 0–6 (0=Sun). Used when schedule='custom' */
  weekdays?: number[] | null
  start_date: string   // ISO date 'YYYY-MM-DD'
  end_date?: string | null
  once_date?: string | null
  category_id?: string | null
  order: number
  archived: boolean
  created_at: string
  // Joined relation (optional)
  category?: Category | null
}

export interface Completion {
  id: string
  user_id: string
  task_id: string
  completed_date: string  // 'YYYY-MM-DD'
  created_at: string
}

// Derived helpers
export interface DayStats {
  date: string          // 'YYYY-MM-DD'
  scheduled: number
  completed: number
  rate: number          // 0–1
  perfect: boolean
}
