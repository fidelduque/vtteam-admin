import { subDays, eachDayOfInterval, format, parseISO } from 'date-fns'
import type { Task, Completion, DayStats } from '../types'
import { getTasksForDate } from './schedule'

function toDateStr(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/** Build per-day stats for the last `days` days (including today) */
export function buildDayStats(
  tasks: Task[],
  completions: Completion[],
  days = 90,
): DayStats[] {
  const today = new Date()
  const dates = eachDayOfInterval({ start: subDays(today, days - 1), end: today })

  const completionSet = new Set(
    completions.map((c) => `${c.task_id}__${c.completed_date}`),
  )

  return dates.map((date) => {
    const dateStr = toDateStr(date)
    const scheduled = getTasksForDate(tasks, dateStr)
    const completedCount = scheduled.filter((t) =>
      completionSet.has(`${t.id}__${dateStr}`),
    ).length
    const rate = scheduled.length > 0 ? completedCount / scheduled.length : 0
    return {
      date: dateStr,
      scheduled: scheduled.length,
      completed: completedCount,
      rate,
      perfect: scheduled.length > 0 && completedCount === scheduled.length,
    }
  })
}

/** Overall success rate: perfect days / days with tasks */
export function overallSuccessRate(dayStats: DayStats[]): number {
  const daysWithTasks = dayStats.filter((d) => d.scheduled > 0)
  if (daysWithTasks.length === 0) return 0
  return daysWithTasks.filter((d) => d.perfect).length / daysWithTasks.length
}

/** Streak calculations */
export function calcStreaks(dayStats: DayStats[]): { current: number; best: number } {
  const sorted = [...dayStats].sort((a, b) => a.date.localeCompare(b.date))
  let current = 0
  let best = 0
  let streak = 0

  for (let i = sorted.length - 1; i >= 0; i--) {
    const d = sorted[i]
    if (d.scheduled === 0) {
      if (current === 0) continue // skip days with no tasks for current streak
      break
    }
    if (d.perfect) {
      streak++
      if (current === 0) current = streak
    } else {
      if (current === 0) break
      streak = 0
    }
  }

  // Best streak (forward pass)
  let runStreak = 0
  for (const d of sorted) {
    if (d.scheduled === 0) continue
    if (d.perfect) {
      runStreak++
      if (runStreak > best) best = runStreak
    } else {
      runStreak = 0
    }
  }

  return { current, best }
}

/** Per-task completion rate over the last `days` days */
export function perTaskStats(
  tasks: Task[],
  completions: Completion[],
  days = 90,
): Array<{ task: Task; scheduled: number; completed: number; rate: number }> {
  const today = new Date()
  const dates = eachDayOfInterval({ start: subDays(today, days - 1), end: today })
  const completionSet = new Set(
    completions.map((c) => `${c.task_id}__${c.completed_date}`),
  )

  return tasks
    .filter((t) => !t.archived)
    .map((task) => {
      const scheduled = dates.filter((d) =>
        getTasksForDate([task], toDateStr(d)).length > 0,
      ).length
      const completed = dates.filter((d) =>
        completionSet.has(`${task.id}__${toDateStr(d)}`),
      ).length
      return { task, scheduled, completed, rate: scheduled > 0 ? completed / scheduled : 0 }
    })
    .sort((a, b) => b.rate - a.rate)
}
