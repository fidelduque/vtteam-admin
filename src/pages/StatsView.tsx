import { useMemo, useState } from 'react'
import { useData } from '../contexts/DataContext'
import { buildDayStats, overallSuccessRate, calcStreaks, perTaskStats } from '../utils/stats'
import CalendarHeatmap from '../components/CalendarHeatmap'
import CategoryBadge from '../components/CategoryBadge'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { format, parseISO, subDays } from 'date-fns'
import { es } from 'date-fns/locale'

type Range = 30 | 90

export default function StatsView() {
  const { tasks, completions, loading } = useData()
  const [range, setRange] = useState<Range>(30)

  const dayStats = useMemo(
    () => buildDayStats(tasks, completions, 90),
    [tasks, completions],
  )

  const rangeStats = useMemo(
    () => dayStats.slice(dayStats.length - range),
    [dayStats, range],
  )

  const successRate = useMemo(() => overallSuccessRate(dayStats), [dayStats])
  const streaks = useMemo(() => calcStreaks(dayStats), [dayStats])
  const taskStats = useMemo(() => perTaskStats(tasks, completions, 90), [tasks, completions])

  // Chart data: filter days with tasks
  const chartData = useMemo(
    () =>
      rangeStats
        .filter((d) => d.scheduled > 0)
        .map((d) => ({
          date: d.date,
          label: format(parseISO(d.date), 'd MMM', { locale: es }),
          rate: Math.round(d.rate * 100),
        })),
    [rangeStats],
  )

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div
      className="h-screen overflow-y-auto scrollbar-hide pb-nav"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 0px)' }}
    >
      {/* Header */}
      <div className="border-b border-slate-800 px-4 py-4">
        <h1 className="text-xl font-bold text-slate-100">Estadísticas</h1>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-6">

        {/* Top metrics */}
        <div className="grid grid-cols-3 gap-3">
          <MetricCard
            label="Éxito global"
            value={`${Math.round(successRate * 100)}%`}
            icon="🎯"
          />
          <MetricCard
            label="Racha actual"
            value={`${streaks.current}d`}
            icon="🔥"
          />
          <MetricCard
            label="Mejor racha"
            value={`${streaks.best}d`}
            icon="🏆"
          />
        </div>

        {/* Chart */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-300">Tendencia de éxito</h2>
            <div className="flex rounded-lg border border-slate-700 bg-slate-800 p-0.5 text-xs">
              {([30, 90] as Range[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`rounded-md px-3 py-1 font-medium transition-colors ${
                    range === r ? 'bg-indigo-600 text-white' : 'text-slate-400'
                  }`}
                >
                  {r}d
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    interval="preserveStartEnd"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v}%`}
                    width={36}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid #1e293b',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(v: number) => [`${v}%`, 'Completado']}
                  />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 4, fill: '#818cf8' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-44 items-center justify-center text-sm text-slate-500">
                Sin datos suficientes aún
              </div>
            )}
          </div>
        </section>

        {/* Calendar heatmap */}
        <section>
          <h2 className="mb-3 text-sm font-semibold text-slate-300">Mapa de actividad (90 días)</h2>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <CalendarHeatmap dayStats={dayStats} weeks={13} />
            <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
              <span>Menos</span>
              <div className="flex gap-1">
                {['#1e293b', '#334155', '#3730a3', '#4f46e5', '#6366f1'].map((c) => (
                  <div key={c} className="h-3 w-3 rounded-sm" style={{ backgroundColor: c }} />
                ))}
              </div>
              <span>Más</span>
            </div>
          </div>
        </section>

        {/* Per-task stats */}
        {taskStats.length > 0 && (
          <section className="pb-2">
            <h2 className="mb-3 text-sm font-semibold text-slate-300">Por tarea (últimos 90 días)</h2>
            <div className="flex flex-col gap-2">
              {taskStats.map(({ task, scheduled, completed, rate }) => (
                <div key={task.id} className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="truncate text-sm font-medium text-slate-200">{task.title}</span>
                        <CategoryBadge category={task.category} small />
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {completed}/{scheduled} veces completada
                      </p>
                    </div>
                    <span className="text-sm font-bold text-indigo-400 flex-none">
                      {Math.round(rate * 100)}%
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                      style={{ width: `${rate * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {taskStats.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="text-5xl">📊</span>
            <p className="text-slate-400">Aún no hay estadísticas.</p>
            <p className="text-sm text-slate-600">Añade tareas y empieza a registrar tu progreso.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-slate-800 bg-slate-900 py-4">
      <span className="text-2xl">{icon}</span>
      <span className="text-xl font-bold text-indigo-400">{value}</span>
      <span className="text-center text-xs text-slate-500 leading-tight px-1">{label}</span>
    </div>
  )
}
