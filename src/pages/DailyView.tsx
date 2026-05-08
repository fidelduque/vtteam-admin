import { useState, useEffect, useCallback } from 'react'
import { format, addDays, subDays, isToday, isYesterday, isTomorrow, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { useData } from '../contexts/DataContext'
import { getTasksForDate, toDateStr } from '../utils/schedule'
import CategoryBadge from '../components/CategoryBadge'
import CelebrationScreen from '../components/CelebrationScreen'

function formatDayLabel(date: Date): string {
  if (isToday(date)) return 'Hoy'
  if (isYesterday(date)) return 'Ayer'
  if (isTomorrow(date)) return 'Mañana'
  return format(date, "EEEE d 'de' MMMM", { locale: es })
}

export default function DailyView() {
  const { tasks, toggleCompletion, isCompleted, loading } = useData()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showCelebration, setShowCelebration] = useState(false)
  const [prevCompleted, setPrevCompleted] = useState(0)

  const dateStr = toDateStr(currentDate)
  const dayTasks = getTasksForDate(tasks, dateStr)
  const completedCount = dayTasks.filter((t) => isCompleted(t.id, dateStr)).length
  const total = dayTasks.length
  const progress = total > 0 ? completedCount / total : 0

  // Trigger celebration when all tasks just completed
  useEffect(() => {
    if (
      isToday(currentDate) &&
      total > 0 &&
      completedCount === total &&
      prevCompleted < total
    ) {
      setShowCelebration(true)
    }
    setPrevCompleted(completedCount)
  }, [completedCount, total, currentDate])

  async function handleToggle(taskId: string) {
    await toggleCompletion(taskId, dateStr)
  }

  const goBack = () => setCurrentDate((d) => subDays(d, 1))
  const goForward = () => setCurrentDate((d) => addDays(d, 1))
  const goToday = () => setCurrentDate(new Date())

  const isFutureDate = currentDate > new Date()

  return (
    <>
      {showCelebration && (
        <CelebrationScreen onClose={() => setShowCelebration(false)} />
      )}

      <div className="flex h-screen flex-col overflow-hidden">
        {/* Header */}
        <header
          className="flex-none border-b border-slate-800 bg-slate-950 px-4 py-3"
          style={{ paddingTop: 'max(env(safe-area-inset-top), 12px)' }}
        >
          <div className="flex items-center justify-between">
            <button
              onClick={goBack}
              className="rounded-xl p-2.5 text-slate-400 transition-colors active:bg-slate-800"
              aria-label="Día anterior"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <button onClick={goToday} className="flex flex-col items-center">
              <span className="text-base font-semibold capitalize text-slate-100">
                {formatDayLabel(currentDate)}
              </span>
              <span className="text-xs text-slate-500">
                {format(currentDate, "d 'de' MMMM", { locale: es })}
              </span>
            </button>

            <button
              onClick={goForward}
              className="rounded-xl p-2.5 text-slate-400 transition-colors active:bg-slate-800"
              aria-label="Día siguiente"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Progress bar */}
          {total > 0 && (
            <div className="mt-3">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs text-slate-400">{completedCount}/{total} tareas</span>
                <span className="text-xs font-semibold text-indigo-400">
                  {Math.round(progress * 100)}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 transition-all duration-500"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>
          )}
        </header>

        {/* Task list */}
        <div className="flex-1 overflow-y-auto scrollbar-hide pb-nav px-4 pt-3">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
            </div>
          ) : dayTasks.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 py-20 text-center">
              {isFutureDate ? (
                <>
                  <span className="text-5xl">📅</span>
                  <p className="text-slate-400">No hay tareas programadas para este día.</p>
                </>
              ) : (
                <>
                  <span className="text-5xl">🌿</span>
                  <p className="text-slate-400">Sin tareas para hoy.</p>
                  <p className="text-sm text-slate-600">Añade tareas en la pestaña Tareas.</p>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {completedCount === total && total > 0 && (
                <button
                  onClick={() => setShowCelebration(true)}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600/20 to-violet-600/20 border border-indigo-500/30 py-3 text-sm font-medium text-indigo-300"
                >
                  <span>🏆</span>
                  <span>¡Día perfecto! Ver celebración</span>
                </button>
              )}

              {dayTasks.map((task) => {
                const done = isCompleted(task.id, dateStr)
                return (
                  <button
                    key={task.id}
                    onClick={() => handleToggle(task.id)}
                    className={`flex items-start gap-4 rounded-2xl border px-4 py-4 text-left transition-all active:scale-[0.98] ${
                      done
                        ? 'border-slate-700/50 bg-slate-900/50'
                        : 'border-slate-800 bg-slate-900 shadow-sm'
                    }`}
                  >
                    {/* Checkbox */}
                    <div
                      className={`mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full border-2 transition-all duration-200 ${
                        done
                          ? 'animate-check-bounce border-indigo-500 bg-indigo-500'
                          : 'border-slate-600 bg-transparent'
                      }`}
                    >
                      {done && (
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={3}>
                          <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <p className={`font-medium leading-snug transition-colors ${done ? 'text-slate-500 line-through' : 'text-slate-100'}`}>
                        {task.title}
                      </p>
                      {task.description && !done && (
                        <p className="mt-1 text-sm text-slate-500 line-clamp-2">{task.description}</p>
                      )}
                      {task.category && (
                        <div className="mt-1.5">
                          <CategoryBadge category={task.category} small />
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
