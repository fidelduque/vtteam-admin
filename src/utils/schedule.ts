import { getDay, format, parseISO, isWithinInterval, startOfDay } from 'date-fns'
import type { Task } from '../types'

/** Returns true if the given task is scheduled for the given date string 'YYYY-MM-DD' */
export function isTaskScheduledForDate(task: Task, dateStr: string): boolean {
  if (task.archived) return false

  // Date bounds
  if (dateStr < task.start_date) return false
  if (task.end_date && dateStr > task.end_date) return false

  const date = parseISO(dateStr)
  const dow = getDay(date) // 0=Sun, 1=Mon, …, 6=Sat

  switch (task.schedule) {
    case 'daily':
      return dow >= 1 && dow <= 5 // Mon–Fri
    case 'custom':
      return (task.weekdays ?? []).includes(dow)
    case 'once':
      return task.once_date === dateStr
    default:
      return false
  }
}

/** Returns tasks (sorted by order) scheduled for a given date string */
export function getTasksForDate(tasks: Task[], dateStr: string): Task[] {
  return tasks
    .filter((t) => isTaskScheduledForDate(t, dateStr))
    .sort((a, b) => a.order - b.order)
}

/** Format a Date to 'YYYY-MM-DD' */
export function toDateStr(date: Date): string {
  return format(startOfDay(date), 'yyyy-MM-dd')
}

/** Day-of-week labels */
export const DOW_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
export const DOW_LABELS_FULL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

/** Human-readable schedule description */
export function scheduleLabel(task: Task): string {
  switch (task.schedule) {
    case 'daily':
      return 'Lun – Vie'
    case 'custom': {
      const days = (task.weekdays ?? []).sort().map((d) => DOW_LABELS[d])
      return days.join(', ') || 'Sin días'
    }
    case 'once':
      return task.once_date
        ? format(parseISO(task.once_date), 'd MMM yyyy')
        : 'Una vez'
    default:
      return ''
  }
}
