import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import type { Task, Completion, Category } from '../types'
import { subDays, format } from 'date-fns'

interface DataContextValue {
  tasks: Task[]
  completions: Completion[]
  categories: Category[]
  loading: boolean
  // Task operations
  addTask: (task: Omit<Task, 'id' | 'user_id' | 'created_at'>) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  archiveTask: (id: string) => Promise<void>
  reorderTasks: (orderedIds: string[]) => Promise<void>
  // Completion operations
  toggleCompletion: (taskId: string, date: string) => Promise<void>
  isCompleted: (taskId: string, date: string) => boolean
  // Category operations
  addCategory: (cat: Omit<Category, 'id' | 'user_id' | 'created_at'>) => Promise<void>
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  // Export
  exportData: () => object
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [completions, setCompletions] = useState<Completion[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const since = format(subDays(new Date(), 90), 'yyyy-MM-dd')

    const [tasksRes, completionsRes, categoriesRes] = await Promise.allSettled([
      supabase
        .from('tasks')
        .select('*, category:categories(*)')
        .eq('user_id', user.id)
        .order('order', { ascending: true }),
      supabase
        .from('completions')
        .select('*')
        .eq('user_id', user.id)
        .gte('completed_date', since),
      supabase.from('categories').select('*').eq('user_id', user.id),
    ])

    if (tasksRes.status === 'fulfilled' && tasksRes.value.data) {
      setTasks(tasksRes.value.data as Task[])
    }
    if (completionsRes.status === 'fulfilled' && completionsRes.value.data) {
      setCompletions(completionsRes.value.data as Completion[])
    }
    if (categoriesRes.status === 'fulfilled' && categoriesRes.value.data) {
      setCategories(categoriesRes.value.data as Category[])
    }

    setLoading(false)
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  // ── Task operations ────────────────────────────────────────────────────────

  async function addTask(task: Omit<Task, 'id' | 'user_id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...task, user_id: user!.id })
      .select('*, category:categories(*)')
      .single()
    if (error) throw error
    setTasks((prev) => [...prev, data as Task].sort((a, b) => a.order - b.order))
  }

  async function updateTask(id: string, updates: Partial<Task>) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select('*, category:categories(*)')
      .single()
    if (error) throw error
    setTasks((prev) => prev.map((t) => (t.id === id ? (data as Task) : t)))
  }

  async function archiveTask(id: string) {
    await updateTask(id, { archived: true })
  }

  async function reorderTasks(orderedIds: string[]) {
    setTasks((prev) => {
      const map = new Map(prev.map((t) => [t.id, t]))
      return orderedIds
        .map((id, idx) => ({ ...map.get(id)!, order: idx }))
        .concat(prev.filter((t) => !orderedIds.includes(t.id)))
    })
    // Persist new order
    await Promise.all(
      orderedIds.map((id, idx) =>
        supabase.from('tasks').update({ order: idx }).eq('id', id),
      ),
    )
  }

  // ── Completion operations ──────────────────────────────────────────────────

  function isCompleted(taskId: string, date: string) {
    return completions.some(
      (c) => c.task_id === taskId && c.completed_date === date,
    )
  }

  async function toggleCompletion(taskId: string, date: string) {
    const existing = completions.find(
      (c) => c.task_id === taskId && c.completed_date === date,
    )

    if (existing) {
      await supabase.from('completions').delete().eq('id', existing.id)
      setCompletions((prev) => prev.filter((c) => c.id !== existing.id))
    } else {
      const { data, error } = await supabase
        .from('completions')
        .insert({ task_id: taskId, completed_date: date, user_id: user!.id })
        .select()
        .single()
      if (error) throw error
      setCompletions((prev) => [...prev, data as Completion])
    }
  }

  // ── Category operations ────────────────────────────────────────────────────

  async function addCategory(cat: Omit<Category, 'id' | 'user_id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('categories')
      .insert({ ...cat, user_id: user!.id })
      .select()
      .single()
    if (error) throw error
    setCategories((prev) => [...prev, data as Category])
  }

  async function updateCategory(id: string, updates: Partial<Category>) {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    setCategories((prev) => prev.map((c) => (c.id === id ? (data as Category) : c)))
    // Refresh tasks that reference this category
    await load()
  }

  async function deleteCategory(id: string) {
    await supabase.from('categories').delete().eq('id', id)
    setCategories((prev) => prev.filter((c) => c.id !== id))
    setTasks((prev) =>
      prev.map((t) => (t.category_id === id ? { ...t, category_id: null, category: null } : t)),
    )
  }

  // ── Export ─────────────────────────────────────────────────────────────────

  function exportData() {
    return { tasks, completions, categories, exportedAt: new Date().toISOString() }
  }

  return (
    <DataContext.Provider
      value={{
        tasks,
        completions,
        categories,
        loading,
        addTask,
        updateTask,
        archiveTask,
        reorderTasks,
        toggleCompletion,
        isCompleted,
        addCategory,
        updateCategory,
        deleteCategory,
        exportData,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside DataProvider')
  return ctx
}
