import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useScaleCompletion } from '../hooks/useScaleCompletion'
import api from '../lib/api'
import type { Module } from '../types'
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  BookOpen, 
  Target,
  User,
  RefreshCw
} from 'lucide-react'

interface ScaleResponse {
  _id: string
  scaleId: string
  scaleName: string
  totalScore: number
  riskLevel: string
  completedAt: string
  timeTaken: number
  recommendations: Array<{
    id: number
    title: string
    priority: string
    description: string
    estimatedDuration: string
    status: string
  }>
}

interface ModuleProgress {
  moduleSlug: string
  moduleName: string
  currentPage: number
  totalPages: number
  completedPages: string[]
  percentage: number
  timeSpent: number
  lastAccessed: string
  status: string
  currentPageSlug?: string
  actualTotalPages?: number // Current module definition total pages
  actualPercentage?: number // Calculated using actual module data
}

interface UserStats {
  totalScalesCompleted: number
  totalModulesEnrolled: number
  totalModulesCompleted: number
  totalTimeSpent: number
  averageScore: number
  lastActivity: string
  streak: number
}

interface UserDashboardProps {
  modules: Module[]
}

export default function UserDashboard({ modules }: UserDashboardProps) {
  const { user, logout } = useAuth()
  const { allScalesCompleted, loading: scalesLoading, refresh } = useScaleCompletion()
  const navigate = useNavigate()
  const [scaleResponses, setScaleResponses] = useState<ScaleResponse[]>([])
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'scales' | 'modules'>('overview')

  const handleRedoAssessment = async (scaleId: string) => {
    if (!confirm('Are you sure you want to redo this assessment? Your previous score will be replaced.')) {
      return
    }

    try {
      // Delete the existing scale response
      await api.delete(`/scales/response/${scaleId}`)
      
      // Refresh the scale completion data
      await refresh()
      
      // Navigate to the scale
      navigate(`/dashboard`)
    } catch (error: any) {
      console.error('Failed to redo assessment:', error)
      alert('Failed to redo assessment. Please try again.')
    }
  }

  useEffect(() => {
    if (scalesLoading) return

    // Check if all required scales are completed
    if (!allScalesCompleted()) {
      navigate('/dashboard')
      return
    }

    if (user) {
      fetchUserData()
    }
  }, [user, navigate, allScalesCompleted, scalesLoading])

  const fetchUserData = async () => {
    try {
      // Fetch scale responses and module progress in parallel
      const [scalesResponse, modulesResponse] = await Promise.all([
        api.get('/scales/my-responses'),
        api.get('/modules/my-progress')
      ])
      
      setScaleResponses(scalesResponse.data.data || [])
      
      // Enhance progress data with actual module totals from props
      const rawProgress = modulesResponse.data.data || []
      const enhancedProgress = rawProgress.map((p: any) => {
        // Find current module definition to get actual total pages
        const currentModule = modules.find(m => m.slug === p.moduleSlug)
        const actualTotal = currentModule?.pages?.length || p.totalPages
        const actualPercentage = Math.min(100, Math.round((p.completedPages.length / actualTotal) * 100))
        return {
          ...p,
          actualTotalPages: actualTotal,
          actualPercentage: actualPercentage
        }
      })
      setModuleProgress(enhancedProgress)

      // Calculate user stats using actual percentages
      const stats: UserStats = {
        totalScalesCompleted: scalesResponse.data.data?.length || 0,
        totalModulesEnrolled: enhancedProgress.length || 0,
        totalModulesCompleted: enhancedProgress.filter((m: any) => m.actualPercentage === 100).length || 0,
        totalTimeSpent: enhancedProgress?.reduce((sum: number, m: any) => sum + (m.timeSpent || 0), 0) || 0,
        averageScore: scalesResponse.data.data?.length > 0 
          ? scalesResponse.data.data.reduce((sum: number, s: any) => sum + s.totalScore, 0) / scalesResponse.data.data.length 
          : 0,
        lastActivity: getLastActivity(scalesResponse.data.data || [], enhancedProgress || []),
        streak: calculateStreak(enhancedProgress || [])
      }
      setUserStats(stats)
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getLastActivity = (scales: ScaleResponse[], modules: ModuleProgress[]) => {
    const scaleDates = scales.map(s => new Date(s.completedAt))
    const moduleDates = modules.map(m => new Date(m.lastAccessed))
    const allDates = [...scaleDates, ...moduleDates]
    return allDates.length > 0 ? new Date(Math.max(...allDates.map(d => d.getTime()))).toISOString() : ''
  }

  const calculateStreak = (modules: ModuleProgress[]) => {
    // Simple streak calculation based on recent activity
    const recentActivity = modules.filter(m => {
      const lastAccess = new Date(m.lastAccessed)
      const daysDiff = Math.floor((new Date().getTime() - lastAccess.getTime()) / (1000 * 60 * 60 * 24))
      return daysDiff <= 7
    })
    return recentActivity.length
  }

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'low risk': return 'text-green-600 bg-green-100'
      case 'medium risk': return 'text-yellow-600 bg-yellow-100'
      case 'high risk': return 'text-orange-600 bg-orange-100'
      case 'very high risk': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getModuleStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'in_progress': return 'text-blue-600 bg-blue-100'
      case 'enrolled': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">User Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.name}!</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={logout}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Sign Out
              </button>
              <Link
                to="/"
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('scales')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'scales'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Scales
            </button>
            <button
              onClick={() => setActiveTab('modules')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'modules'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Module Progress
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && userStats && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Scales Completed</p>
                    <p className="text-2xl font-semibold text-gray-900">{userStats.totalScalesCompleted}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <BookOpen className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Modules Completed</p>
                    <p className="text-2xl font-semibold text-gray-900">{userStats.totalModulesCompleted}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Average Score</p>
                    <p className="text-2xl font-semibold text-gray-900">{userStats.averageScore.toFixed(1)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Time Spent</p>
                    <p className="text-2xl font-semibold text-gray-900">{Math.round(userStats.totalTimeSpent)}m</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Scale Results */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Recent Scale Results</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {scaleResponses.slice(0, 3).map((scale) => (
                      <div key={scale._id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{scale.scaleName}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(scale.completedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(scale.riskLevel || 'Unknown')}`}>
                            {scale.riskLevel || 'Unknown'}
                          </span>
                          <p className="text-sm text-gray-600 mt-1">Score: {scale.totalScore}</p>
                        </div>
                      </div>
                    ))}
                    {scaleResponses.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No scales completed yet</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Module Progress */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Module Progress</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {moduleProgress.slice(0, 3).map((module) => (
                      <div key={module.moduleSlug} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-900">{module.moduleName}</span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getModuleStatusColor(module.status)}`}>
                            {module.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${module.actualPercentage || 0}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500">{module.actualPercentage || 0}% complete</p>
                      </div>
                    ))}
                    {moduleProgress.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No modules enrolled yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveTab('scales')}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Target className="w-8 h-8 text-teal-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Review Scales</p>
                      <p className="text-sm text-gray-500">View assessments</p>
                    </div>
                  </button>
                  
                  <Link
                    to="/module/m1-connect/00-home"
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <BookOpen className="w-8 h-8 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Continue Learning</p>
                      <p className="text-sm text-gray-500">Access modules</p>
                    </div>
                  </Link>
                  
                  <Link
                    to="/profile"
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-8 h-8 text-purple-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">View Profile</p>
                      <p className="text-sm text-gray-500">Manage account</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scales Tab */}
        {activeTab === 'scales' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">My Scale Responses</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Scale Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Risk Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Completed
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time Taken
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {scaleResponses.map((scale) => (
                      <tr key={scale._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {scale.scaleName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {scale.totalScore}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(scale.riskLevel || 'Unknown')}`}>
                            {scale.riskLevel || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(scale.completedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {scale.timeTaken} min
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => handleRedoAssessment(scale.scaleId)}
                            className="inline-flex items-center px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
                          >
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Redo
                          </button>
                        </td>
                      </tr>
                    ))}
                    {scaleResponses.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          No scale responses found. Take your first assessment to get started!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Modules Tab */}
        {activeTab === 'modules' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">My Module Progress</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Module Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time Spent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Accessed
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {moduleProgress.map((module) => (
                      <tr key={module.moduleSlug}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {module.moduleName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-full max-w-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-gray-900">{module.actualPercentage}%</span>
                              <span className="text-xs text-gray-500">
                                {module.completedPages.length}/{module.actualTotalPages}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${module.actualPercentage || 0}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getModuleStatusColor(module.actualPercentage === 100 ? 'completed' : module.status)}`}>
                            {module.actualPercentage === 100 ? 'completed' : module.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {module.timeSpent} min
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(module.lastAccessed).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <Link
                            to={`/module/${module.moduleSlug}/${module.currentPageSlug || '00-home'}`}
                            className="px-3 py-1 bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
                          >
                            {module.actualPercentage === 100 ? 'Review' : 'Continue'}
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {moduleProgress.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          No module enrollments found. Visit any module page to start learning!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
