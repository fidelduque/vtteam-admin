import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { useData } from '../contexts/DataContext'
import SortableTaskItem from '../components/SortableTaskItem'
import TaskForm from '../components/TaskForm'
import type { Task } from '../types'

export default function TasksView() {
  const { tasks, categories, addTask, updateTask, archiveTask, reorderTasks, loading } = useData()
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showArchived, setShowArchived] = useState(false)

  const activeTasks = tasks.filter((t) => !t.archived).sort((a, b) => a.order - b.order)
  const archivedTasks = tasks.filter((t) => t.archived)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = activeTasks.findIndex((t) => t.id === active.id)
    const newIndex = activeTasks.findIndex((t) => t.id === over.id)
    const reordered = arrayMove(activeTasks, oldIndex, newIndex)
    reorderTasks(reordered.map((t) => t.id))
  }

  function openEdit(task: Task) {
    setEditingTask(task)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingTask(null)
  }

  async function handleSubmit(data: Omit<Task, 'id' | 'user_id' | 'created_at'>) {
    if (editingTask) {
      await updateTask(editingTask.id, data)
    } else {
      await addTask({ ...data, order: activeTasks.length })
    }
  }

  return (
    <>
      {showForm && (
        <TaskForm
          initialTask={editingTask}
          categories={categories}
          onSubmit={handleSubmit}
          onClose={closeForm}
        />
      )}

      <div
        className="h-screen overflow-y-auto scrollbar-hide pb-nav"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 0px)' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950 px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-100">Tareas</h1>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition-colors hover:bg-indigo-500 active:scale-95"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            Nueva
          </button>
        </div>

        <div className="px-4 pt-4 flex flex-col gap-4">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
            </div>
          ) : activeTasks.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <span className="text-5xl">✨</span>
              <p className="text-slate-400">Aún no tienes tareas.</p>
              <button
                onClick={() => setShowForm(true)}
                className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white"
              >
                Crear primera tarea
              </button>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={activeTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-2">
                  {activeTasks.map((task) => (
                    <SortableTaskItem
                      key={task.id}
                      task={task}
                      onEdit={openEdit}
                      onArchive={archiveTask}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {/* Archived section */}
          {archivedTasks.length > 0 && (
            <div>
              <button
                onClick={() => setShowArchived((v) => !v)}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 mb-2"
              >
                <svg
                  viewBox="0 0 24 24"
                  className={`h-4 w-4 transition-transform ${showArchived ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Archivadas ({archivedTasks.length})
              </button>
              {showArchived && (
                <div className="flex flex-col gap-2">
                  {archivedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between rounded-xl border border-slate-800/50 bg-slate-900/50 px-4 py-3 opacity-60"
                    >
                      <span className="text-sm text-slate-400 line-through">{task.title}</span>
                      <button
                        onClick={() => updateTask(task.id, { archived: false })}
                        className="text-xs text-indigo-400 hover:text-indigo-300"
                      >
                        Restaurar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
