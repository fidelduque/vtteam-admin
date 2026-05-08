import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '../types'
import CategoryBadge from './CategoryBadge'
import { scheduleLabel } from '../utils/schedule'

interface Props {
  task: Task
  onEdit: (task: Task) => void
  onArchive: (id: string) => void
}

export default function SortableTaskItem({ task, onEdit, onArchive }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3"
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="touch-none text-slate-600 active:text-slate-400"
        aria-label="Arrastrar para reordenar"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
          <path d="M8 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm8-12a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
        </svg>
      </button>

      {/* Task info */}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-slate-100">{task.title}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-500">{scheduleLabel(task)}</span>
          <CategoryBadge category={task.category} small />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onEdit(task)}
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-200"
          aria-label="Editar"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          onClick={() => onArchive(task.id)}
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-800 hover:text-rose-400"
          aria-label="Archivar"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
            <polyline points="21 8 21 21 3 21 3 8" />
            <rect x="1" y="3" width="22" height="5" />
            <line x1="10" y1="12" x2="14" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
