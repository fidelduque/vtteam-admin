import { useState, FormEvent } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import type { Category } from '../types'

const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#06b6d4',
]

function CategoryItem({
  category,
  onUpdate,
  onDelete,
}: {
  category: Category
  onUpdate: (id: string, data: Partial<Category>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(category.name)
  const [color, setColor] = useState(category.color)
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!name.trim()) return
    setSaving(true)
    await onUpdate(category.id, { name: name.trim(), color })
    setSaving(false)
    setEditing(false)
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 rounded-full flex-none" style={{ backgroundColor: category.color }} />
          <span className="text-sm font-medium text-slate-200">{category.name}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setEditing(true)}
            className="rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(category.id)}
            className="rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-800 hover:text-rose-400"
          >
            Eliminar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-indigo-500/50 bg-slate-900 p-4">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mb-3 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
      />
      <div className="mb-3 flex flex-wrap gap-2">
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={`h-7 w-7 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''}`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setEditing(false)}
          className="flex-1 rounded-xl border border-slate-700 py-2 text-xs text-slate-400"
        >
          Cancelar
        </button>
        <button
          onClick={save}
          disabled={saving}
          className="flex-1 rounded-xl bg-indigo-600 py-2 text-xs font-semibold text-white disabled:opacity-50"
        >
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </div>
  )
}

export default function SettingsView() {
  const { user, signOut } = useAuth()
  const { categories, addCategory, updateCategory, deleteCategory, exportData, loading } = useData()

  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(PRESET_COLORS[0])
  const [addingCat, setAddingCat] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  async function handleAddCategory(e: FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setAddingCat(true)
    await addCategory({ name: newName.trim(), color: newColor })
    setNewName('')
    setNewColor(PRESET_COLORS[0])
    setShowAddForm(false)
    setAddingCat(false)
  }

  function handleExport() {
    const data = exportData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dayflow-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div
      className="h-screen overflow-y-auto scrollbar-hide pb-nav"
      style={{ paddingTop: 'max(env(safe-area-inset-top), 0px)' }}
    >
      {/* Header */}
      <div className="border-b border-slate-800 px-4 py-4">
        <h1 className="text-xl font-bold text-slate-100">Ajustes</h1>
      </div>

      <div className="flex flex-col gap-6 px-4 pt-4">

        {/* Account section */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Cuenta</h2>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
            <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600/20 text-indigo-400">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-200">Correo electrónico</p>
                <p className="truncate text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="flex w-full items-center gap-3 px-4 py-4 text-sm text-rose-400 transition-colors hover:bg-slate-800"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Cerrar sesión
            </button>
          </div>
        </section>

        {/* Categories section */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Categorías</h2>
            <button
              onClick={() => setShowAddForm((v) => !v)}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300"
            >
              {showAddForm ? 'Cancelar' : '+ Añadir'}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddCategory} className="mb-3 rounded-2xl border border-indigo-500/30 bg-slate-900 p-4 flex flex-col gap-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nombre de categoría"
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewColor(c)}
                    className={`h-7 w-7 rounded-full transition-transform ${newColor === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <button
                type="submit"
                disabled={addingCat || !newName.trim()}
                className="rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {addingCat ? 'Añadiendo…' : 'Añadir categoría'}
              </button>
            </form>
          )}

          {loading ? (
            <div className="py-6 text-center text-sm text-slate-500">Cargando…</div>
          ) : categories.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 py-8 text-center text-sm text-slate-500">
              Sin categorías aún
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {categories.map((cat) => (
                <CategoryItem
                  key={cat.id}
                  category={cat}
                  onUpdate={updateCategory}
                  onDelete={deleteCategory}
                />
              ))}
            </div>
          )}
        </section>

        {/* Data section */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Datos</h2>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
            <button
              onClick={handleExport}
              className="flex w-full items-center gap-3 px-4 py-4 text-sm text-slate-200 transition-colors hover:bg-slate-800"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Exportar mis datos (JSON)
            </button>
          </div>
        </section>

        {/* App info */}
        <div className="pb-2 text-center text-xs text-slate-600">
          DayFlow v1.0 · Tus datos están protegidos
        </div>
      </div>
    </div>
  )
}
