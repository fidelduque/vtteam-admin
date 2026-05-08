import { useState, useEffect, FormEvent } from 'react'
import type { Task, Category } from '../types'
import { DOW_LABELS } from '../utils/schedule'
import { format } from 'date-fns'

interface Props {
  initialTask?: Task | null
  categories: Category[]
  onSubmit: (data: Omit<Task, 'id' | 'user_id' | 'created_at'>) => Promise<void>
  onClose: () => void
}

const todayStr = () => format(new Date(), 'yyyy-MM-dd')

export default function TaskForm({ initialTask, categories, onSubmit, onClose }: Props) {
  const editing = !!initialTask

  const [title, setTitle] = useState(initialTask?.title ?? '')
  const [description, setDescription] = useState(initialTask?.description ?? '')
  const [schedule, setSchedule] = useState<Task['schedule']>(initialTask?.schedule ?? 'daily')
  const [weekdays, setWeekdays] = useState<number[]>(initialTask?.weekdays ?? [1, 2, 3, 4, 5])
  const [startDate, setStartDate] = useState(initialTask?.start_date ?? todayStr())
  const [endDate, setEndDate] = useState(initialTask?.end_date ?? '')
  const [onceDate, setOnceDate] = useState(initialTask?.once_date ?? todayStr())
  const [categoryId, setCategoryId] = useState(initialTask?.category_id ?? '')
  const [order] = useState(initialTask?.order ?? 0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function toggleWeekday(d: number) {
    setWeekdays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError('El título es obligatorio'); return }
    if (schedule === 'custom' && weekdays.length === 0) {
      setError('Selecciona al menos un día'); return
    }
    setError('')
    setSaving(true)
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        schedule,
        weekdays: schedule === 'custom' ? weekdays : null,
        start_date: schedule === 'once' ? onceDate : startDate,
        end_date: schedule !== 'once' && endDate ? endDate : null,
        once_date: schedule === 'once' ? onceDate : null,
        category_id: categoryId || null,
        order,
        archived: initialTask?.archived ?? false,
      })
      onClose()
    } catch {
      setError('Error al guardar. Inténtalo de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full max-w-lg rounded-t-2xl sm:rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl animate-slide-up max-h-[92vh] overflow-y-auto scrollbar-hide">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-900 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-100">
            {editing ? 'Editar tarea' : 'Nueva tarea'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-5">
          {/* Title */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Título <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Meditar 10 minutos"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Descripción <span className="text-slate-500">(opcional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Añade detalles…"
              className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Schedule type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Frecuencia</label>
            <div className="grid grid-cols-3 gap-2">
              {(['daily', 'custom', 'once'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSchedule(s)}
                  className={`rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                    schedule === s
                      ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300'
                      : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {s === 'daily' ? 'Lun–Vie' : s === 'custom' ? 'Personalizado' : 'Una vez'}
                </button>
              ))}
            </div>
          </div>

          {/* Weekday picker (custom only) */}
          {schedule === 'custom' && (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Días</label>
              <div className="flex gap-2">
                {DOW_LABELS.map((d, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleWeekday(i)}
                    className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                      weekdays.includes(i)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date fields */}
          {schedule === 'once' ? (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Fecha</label>
              <input
                type="date"
                value={onceDate}
                onChange={(e) => setOnceDate(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Inicio</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Fin <span className="text-slate-500">(opcional)</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Category */}
          {categories.length > 0 && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Categoría <span className="text-slate-500">(opcional)</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Sin categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {error && (
            <p className="rounded-lg bg-rose-900/30 px-4 py-2 text-sm text-rose-400">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-700 py-3 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
            >
              {saving ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
