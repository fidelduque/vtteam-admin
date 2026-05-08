import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import AuthPage from './pages/AuthPage'
import DailyView from './pages/DailyView'
import StatsView from './pages/StatsView'
import TasksView from './pages/TasksView'
import SettingsView from './pages/SettingsView'
import BottomNav from './components/BottomNav'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="text-sm text-slate-400">Cargando DayFlow…</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<AuthPage />} />
      </Routes>
    )
  }

  return (
    <DataProvider>
      <div className="flex min-h-screen flex-col bg-slate-950">
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<DailyView />} />
            <Route path="/stats" element={<StatsView />} />
            <Route path="/tasks" element={<TasksView />} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </DataProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
