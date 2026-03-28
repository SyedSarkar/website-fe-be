import { useState, useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Sidebar from './components/Sidebar'
import { Module } from './types'
import { parseAllModules } from './data/parser'

// Lazy load heavy components
const ContentPage = lazy(() => import('./components/ContentPage'))
const LoginPage = lazy(() => import('./components/auth/LoginPage'))
const RegisterPage = lazy(() => import('./components/auth/RegisterPage'))
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'))
const UserDashboard = lazy(() => import('./components/UserDashboard'))
const ScaleFlow = lazy(() => import('./components/ScaleFlow'))
const Home = lazy(() => import('./components/pages/Home'))
const Contact = lazy(() => import('./components/pages/Contact'))
const Profile = lazy(() => import('./components/pages/Profile'))
const Resources = lazy(() => import('./components/pages/Resources'))
const OnboardingFlow = lazy(() => import('./components/onboarding/OnboardingFlow'))

// Protected route component for non-admin users
function ProtectedUserRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (!user) {
    return <Navigate to="/login" replace />
  }
  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />
  }
  // Redirect to onboarding if not completed
  if (!user.onboardingCompleted && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
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
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
          }>
            <Routes>
              <Route 
                path="/" 
                element={<Home />} 
              />
              <Route 
                path="/contact" 
                element={<Contact />} 
              />
              <Route 
                path="/resources" 
                element={<Resources />} 
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
                path="/profile" 
                element={
                  <ProtectedUserRoute>
                    <Profile />
                  </ProtectedUserRoute>
                } 
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
                path="/onboarding" 
                element={
                  <ProtectedUserRoute>
                    <OnboardingFlow />
                  </ProtectedUserRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedUserRoute>
                    <ScaleFlow />
                  </ProtectedUserRoute>
                } 
              />
              <Route 
                path="/user-dashboard" 
                element={
                  <ProtectedUserRoute>
                    <UserDashboard />
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
          </Suspense>
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
