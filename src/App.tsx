import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Sidebar from './components/Sidebar'
import ContentPage from './components/ContentPage'
import LandingPage from './components/LandingPage'
import LoginPage from './components/auth/LoginPage'
import RegisterPage from './components/auth/RegisterPage'
import AdminDashboard from './components/admin/AdminDashboard'
import UserDashboard from './components/UserDashboard'
import ChildMentalHealthScale from './components/scales/ChildMentalHealthScale'
import { Module } from './types'
import { parseAllModules } from './data/parser'

// Protected route component for non-admin users
function ProtectedUserRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (!user) {
    return <Navigate to="/login" replace />
  }
  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />
  }
  return <>{children}</>
}

// Protected route for admin users
function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (!user) {
    return <Navigate to="/login" replace />
  }
  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }
  return <>{children}</>
}

function AppContent() {
  const { user } = useAuth()
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      const parsedModules = await parseAllModules()
      setModules(parsedModules)
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading content...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Only show when user is authenticated and not on auth pages */}
      {user && (
        <div className={`
          fixed lg:static inset-y-0 left-0 z-50
          transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
          transition-transform duration-300 ease-in-out
          w-72 bg-white shadow-lg lg:shadow-none
        `}>
          <Sidebar 
            modules={modules} 
            onClose={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header - Only show when user is logged in */}
        {user && location.pathname !== '/login' && location.pathname !== '/register' && (
          <header className="lg:hidden bg-white shadow-sm px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
              title="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="font-semibold text-gray-800">Partners in Parenting</span>
            <div className="w-10" /> {/* Spacer for alignment */}
          </header>
        )}

        {/* Content area */}
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route 
              path="/" 
              element={
                user ? <Navigate to="/dashboard" replace /> : <LandingPage />
              } 
            />
            <Route 
              path="/login" 
              element={<LoginPage />} 
            />
            <Route 
              path="/register" 
              element={<RegisterPage />} 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedAdminRoute>
                  <AdminDashboard />
                </ProtectedAdminRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedUserRoute>
                  <UserDashboard />
                </ProtectedUserRoute>
              } 
            />
            <Route 
              path="/scale/:scaleId" 
              element={
                <ProtectedUserRoute>
                  <ChildMentalHealthScale />
                </ProtectedUserRoute>
              } 
            />
            <Route 
              path="/module/:moduleSlug/:pageSlug" 
              element={
                <ProtectedUserRoute>
                  <ContentPage modules={modules} />
                </ProtectedUserRoute>
              } 
            />
            <Route 
              path="*" 
              element={<Navigate to="/" replace />} 
            />
          </Routes>
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
