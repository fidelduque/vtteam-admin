import { useMemo } from 'react'
import { subDays, format, getDay, parseISO } from 'date-fns'
import type { DayStats } from '../types'

interface Props {
  dayStats: DayStats[]
  weeks?: number
}

function rateToColor(rate: number, hasData: boolean): string {
  if (!hasData) return '#1e293b'      // slate-800 – no tasks scheduled
  if (rate === 0) return '#334155'    // slate-700 – tasks but none done
  if (rate < 0.5) return '#3730a3'   // indigo-800
  if (rate < 1) return '#4f46e5'     // indigo-600
  return '#6366f1'                   // indigo-500 perfect
}

export default function CalendarHeatmap({ dayStats, weeks = 16 }: Props) {
  const cells = useMemo(() => {
    const today = new Date()
    const totalDays = weeks * 7
    const days: Array<{ dateStr: string; stats?: DayStats }> = []

    // Start from the Sunday `weeks` weeks before this week's Sunday
    const todayDow = getDay(today)
    const startOffset = totalDays - 1 - todayDow
    const start = subDays(today, startOffset)

    const statsMap = new Map(dayStats.map((d) => [d.date, d]))

    for (let i = 0; i < totalDays; i++) {
      const date = subDays(start, -i)
      const dateStr = format(date, 'yyyy-MM-dd')
      days.push({ dateStr, stats: statsMap.get(dateStr) })
    }

    return days
  }, [dayStats, weeks])

  // Month labels: detect when month changes per column
  const monthLabels = useMemo(() => {
    const labels: Array<{ label: string; col: number }> = []
    let lastMonth = ''
    for (let col = 0; col < weeks; col++) {
      const cell = cells[col * 7]
      if (!cell) continue
      const month = format(parseISO(cell.dateStr), 'MMM')
      if (month !== lastMonth) {
        labels.push({ label: month, col })
        lastMonth = month
      }
    }
    return labels
  }, [cells, weeks])

  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="inline-block min-w-max">
        {/* Month labels */}
        <div className="mb-1 flex" style={{ paddingLeft: '1.5rem' }}>
          {Array.from({ length: weeks }).map((_, col) => {
            const label = monthLabels.find((m) => m.col === col)
            return (
              <div key={col} className="w-4 text-xs text-slate-500" style={{ marginRight: 2 }}>
                {label?.label ?? ''}
              </div>
            )
          })}
        </div>

        <div className="flex gap-0.5">
          {/* Day-of-week labels */}
          <div className="flex flex-col gap-0.5 pr-1">
            {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((d) => (
              <div key={d} className="flex h-4 w-4 items-center justify-center text-[10px] text-slate-500">
                {d}
              </div>
            ))}
          </div>

          {/* Grid: 7 rows × `weeks` cols */}
          {Array.from({ length: weeks }).map((_, col) => (
            <div key={col} className="flex flex-col gap-0.5">
              {Array.from({ length: 7 }).map((_, row) => {
                const cell = cells[col * 7 + row]
                if (!cell) return <div key={row} className="h-4 w-4" />
                const s = cell.stats
                const bg = rateToColor(s?.rate ?? 0, !!s && s.scheduled > 0)
                const title = s
                  ? `${cell.dateStr}: ${s.completed}/${s.scheduled}`
                  : cell.dateStr
                return (
                  <div
                    key={row}
                    title={title}
                    className="h-4 w-4 rounded-sm transition-opacity hover:opacity-80"
                    style={{ backgroundColor: bg }}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
