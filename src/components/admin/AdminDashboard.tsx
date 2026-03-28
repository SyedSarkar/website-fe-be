import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import api from '../../lib/api'

interface AdminStats {
  totalUsers: number
  totalScaleResponses: number
  recentUsers: Array<{
    _id: string
    name: string
    email: string
    createdAt: string
    lastLogin?: string
  }>
  scaleStats: Array<{
    _id: string
    count: number
    avgScore: number
  }>
  enrollmentStats: Array<{
    _id: string
    totalEnrollments: number
    completedEnrollments: number
    inProgressEnrollments: number
    avgProgress: number
    avgTimeSpent: number
  }>
  engagementMetrics: Array<{
    userName: string
    userEmail: string
    totalModulesEnrolled: number
    modulesCompleted: number
    avgProgress: number
    totalTimeSpent: number
    lastActivity: string
    completionRate: number
  }>
  riskDistribution: Array<{
    _id: string
    count: number
  }>
  activityTrends: Array<{
    date: string
    activeUsersCount: number
    totalAccesses: number
  }>
}

interface User {
  _id: string
  name: string
  email: string
  role: string
  createdAt: string
  lastLogin?: string
}

interface NewUser {
  name: string
  email: string
  password: string
  role: string
}

interface ScaleResponse {
  _id: string
  scaleId: string
  scaleName: string
  totalScore: number
  completedAt: string
  timeTaken: number
  user: {
    name: string
    email: string
  }
}

interface PerformanceData {
  user: {
    id: string
    name: string
    email: string
    role: string
    createdAt: string
    lastLogin?: string
  }
  performance: {
    totalScore: number
    averageScore: number
    completionCount: number
    lastCompletion: string | null
    recommendations: Array<{
      id: number
      title: string
      priority: string
      description: string
      estimatedDuration: string
      status: string
    }>
    riskLevel: string
  }
  scaleResponses: any[]
  moduleEnrollments: Array<{
    moduleSlug: string
    moduleName: string
    status: string
    progress: {
      percentage: number
      completedPages: string[]
      totalPages: number
      currentPageSlug?: string
      timeSpent: number
    }
    lastAccessed: string
  }>
}

interface UserPerformanceData {
  _id: string
  name: string
  email: string
  role: string
  createdAt: string
  lastLogin?: string
  performance: {
    totalScore: number
    averageScore: number
    completionCount: number
    lastCompletion: string | null
    recommendations: Array<{
      id: number
      title: string
      priority: string
      description: string
      estimatedDuration: string
      status: string
    }>
    moduleCount: number
    completedModules: number
    inProgressModules: number
    inProgressModulesDetails: Array<{
      moduleSlug: string
      moduleName: string
      progress: number
      completedPages: number
      totalPages: number
      currentPage: number
    }>
  }
}

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [responses, setResponses] = useState<ScaleResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'responses' | 'performance'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage] = useState(1)
  
  // Performance state
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null)
  const [allUsersPerformance, setAllUsersPerformance] = useState<UserPerformanceData[]>([])
  const [showPerformanceDetails, setShowPerformanceDetails] = useState(false)

  // CRUD state
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [showEditUser, setShowEditUser] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newUser, setNewUser] = useState<NewUser>({
    name: '',
    email: '',
    password: '',
    role: 'user'
  })
  const [editUser, setEditUser] = useState<Partial<User>>({})
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    if (user?.role !== 'admin') {
      return
    }
    fetchStats()
  }, [user])

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers()
    } else if (activeTab === 'responses') {
      fetchResponses()
    } else if (activeTab === 'performance') {
      fetchAllUsersPerformance()
    }
  }, [activeTab, currentPage, searchTerm])

  const fetchUserPerformance = async (userId: string) => {
    console.log('Fetching performance for user:', userId);
    try {
      const response = await api.get(`/admin/users/${userId}/performance`);
      console.log('Performance response:', response.data);
      setPerformanceData(response.data.data);
      setShowPerformanceDetails(true);
    } catch (error) {
      console.error('Failed to fetch user performance:', error);
      alert('Failed to fetch user performance. Please check the console for details.');
    }
  }

  const fetchAllUsersPerformance = async () => {
    try {
      const response = await api.get('/admin/performance');
      if (response.data?.data && Array.isArray(response.data.data)) {
        setAllUsersPerformance(response.data.data);
      } else {
        setAllUsersPerformance([]);
      }
    } catch (error) {
      console.error('Failed to fetch all users performance:', error);
      setAllUsersPerformance([]);
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      if (response.data?.data) {
        setStats(response.data.data);
      } else {
        // Set default stats if API fails
        setStats({
          totalUsers: 0,
          totalScaleResponses: 0,
          recentUsers: [],
          scaleStats: [],
          enrollmentStats: [],
          engagementMetrics: [],
          riskDistribution: [],
          activityTrends: []
        });
      }
    } catch (error) {
      console.error('Failed to fetch admin stats:', error);
      setStats({
        totalUsers: 0,
        totalScaleResponses: 0,
        recentUsers: [],
        scaleStats: [],
        enrollmentStats: [],
        engagementMetrics: [],
        riskDistribution: [],
        activityTrends: []
      });
    } finally {
      setLoading(false);
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users', {
        params: { page: currentPage, limit: 10, search: searchTerm }
      })
      setUsers(response.data.data.users)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const fetchResponses = async () => {
    try {
      const response = await api.get('/admin/responses', {
        params: { page: currentPage, limit: 20 }
      })
      setResponses(response.data.data.responses)
    } catch (error) {
      console.error('Failed to fetch responses:', error)
    }
  }

  const exportData = async (type: 'users' | 'responses' | 'performance') => {
    try {
      const response = await api.get(`/admin/export/${type}`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${type}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error(`Failed to export ${type}:`, error)
    }
  }

  const createUser = async () => {
    try {
      const response = await api.post('/admin/users', newUser)
      if (response.data.status === 'success') {
        setShowCreateUser(false)
        setNewUser({ name: '', email: '', password: '', role: 'user' })
        fetchUsers()
        alert('User created successfully!')
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create user')
    }
  }

  const updateUser = async () => {
    if (!selectedUser) return
    
    try {
      const response = await api.patch(`/admin/users/${selectedUser._id}`, editUser)
      if (response.data.status === 'success') {
        setShowEditUser(false)
        setSelectedUser(null)
        setEditUser({})
        fetchUsers()
        alert('User updated successfully!')
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update user')
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      const response = await api.delete(`/admin/users/${userId}`)
      if (response.data.status === 'success') {
        setDeleteConfirm(null)
        fetchUsers()
        alert('User deleted successfully!')
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete user')
    }
  }

  const resetPassword = async (userId: string) => {
    const newPassword = prompt('Enter new password:')
    if (!newPassword) return
    
    try {
      const response = await api.post(`/admin/users/${userId}/reset-password`, {
        newPassword
      })
      if (response.data.status === 'success') {
        alert('Password reset successfully!')
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to reset password')
    }
  }

  const openCreateUser = () => {
    setNewUser({ name: '', email: '', password: '', role: 'user' })
    setShowCreateUser(true)
  }

  const openEditUser = (user: User) => {
    setSelectedUser(user)
    setEditUser({
      name: user.name,
      email: user.email,
      role: user.role
    })
    setShowEditUser(true)
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
          <Link to="/" className="mt-4 text-teal-600 hover:text-teal-700">
            Return to Home
          </Link>
        </div>
      </div>
    )
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
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
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
                Back to Site
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
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'performance'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Performance
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Responses</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalScaleResponses}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg. Score</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.scaleStats.length > 0 
                        ? (stats.scaleStats.reduce((sum, stat) => sum + stat.avgScore, 0) / stats.scaleStats.length).toFixed(1)
                        : '0'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats.totalUsers > 0 
                        ? ((stats.totalScaleResponses / stats.totalUsers) * 100).toFixed(1)
                        : '0'
                      }%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Risk Distribution */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Risk Level Distribution</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {stats.riskDistribution.map((risk) => (
                      <div key={risk._id} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{risk._id}</span>
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className={`h-2 rounded-full ${
                                risk._id === 'Low Risk' ? 'bg-green-500' :
                                risk._id === 'Medium Risk' ? 'bg-yellow-500' :
                                risk._id === 'High Risk' ? 'bg-orange-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${stats.totalScaleResponses > 0 ? (risk.count / stats.totalScaleResponses) * 100 : 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{risk.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Module Progress Overview */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Module Progress</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Enrollments</span>
                      <span className="text-sm font-bold text-blue-600">
                        {stats.enrollmentStats.reduce((sum, stat) => sum + stat.totalEnrollments, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Completed</span>
                      <span className="text-sm font-bold text-green-600">
                        {stats.enrollmentStats.reduce((sum, stat) => sum + stat.completedEnrollments, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">In Progress</span>
                      <span className="text-sm font-bold text-yellow-600">
                        {stats.enrollmentStats.reduce((sum, stat) => sum + stat.inProgressEnrollments, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Avg. Time Spent</span>
                      <span className="text-sm font-bold text-purple-600">
                        {stats.enrollmentStats.length > 0 
                          ? (stats.enrollmentStats.reduce((sum, stat) => sum + stat.avgTimeSpent, 0) / stats.enrollmentStats.length).toFixed(1)
                          : '0'
                        } min
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Trends */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">7-Day Activity</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {stats.activityTrends.slice(-7).map((trend) => (
                      <div key={trend.date} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {new Date(trend.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${Math.min(100, (trend.activeUsersCount / Math.max(1, stats.totalUsers)) * 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{trend.activeUsersCount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Users */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Users</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {stats.recentUsers.map((recentUser) => (
                    <div key={recentUser._id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{recentUser.name}</p>
                        <p className="text-sm text-gray-500">{recentUser.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          Joined: {new Date(recentUser.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-400">
                          {recentUser.lastLogin 
                            ? `Last login: ${new Date(recentUser.lastLogin).toLocaleDateString()}`
                            : 'Never logged in'
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Users</h3>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <button
                      onClick={() => exportData('users')}
                      className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                    >
                      Export CSV
                    </button>
                    <button
                      onClick={openCreateUser}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Create User
                    </button>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'admin' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.lastLogin 
                            ? new Date(user.lastLogin).toLocaleDateString()
                            : 'Never'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditUser(user)}
                              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => resetPassword(user._id)}
                              className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                            >
                              Reset Password
                            </button>
                            {user.email !== 'admin@parenting.com' && (
                              <button
                                onClick={() => setDeleteConfirm(user._id)}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            {/* Performance Overview */}
            {allUsersPerformance.length > 0 ? (
              <div className="space-y-6">
                {/* Performance Overview */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">Total Users</h4>
                      <p className="text-2xl font-bold text-blue-600">{allUsersPerformance.length}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-green-900 mb-2">Average Score</h4>
                      <p className="text-2xl font-bold text-green-600">
                        {allUsersPerformance.length > 0 
                          ? (allUsersPerformance.reduce((sum, user) => sum + (user?.performance?.averageScore || 0), 0) / allUsersPerformance.length).toFixed(1)
                          : '0'
                        }
                      </p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-yellow-900 mb-2">Module Progress Overview</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total Modules</span>
                          <span className="text-sm font-bold text-blue-600">
                            {allUsersPerformance.reduce((sum, u) => sum + (u?.performance?.moduleCount || 0), 0)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Completed</span>
                          <span className="text-sm font-bold text-green-600">
                            {allUsersPerformance.reduce((sum, u) => sum + (u?.performance?.completedModules || 0), 0)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">In Progress</span>
                          <span className="text-sm font-bold text-yellow-600">
                            {allUsersPerformance.reduce((sum, u) => sum + (u?.performance?.inProgressModules || 0), 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Users Performance Table */}
                  <div className="bg-white rounded-lg shadow mt-6">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900">User Performance Tracking</h3>
                        <button
                          onClick={() => exportData('performance')}
                          className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                        >
                          Export Performance Data
                        </button>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Avg Score
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Module Progress
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              In Progress
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Last Activity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {allUsersPerformance.map((userPerf, index) => (
                            <tr key={userPerf?._id || index}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{userPerf?.name || 'Unknown User'}</p>
                                  <p className="text-xs text-gray-500">{userPerf?.email || 'No email'}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {userPerf?.performance?.averageScore?.toFixed(1) || '0'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="w-full max-w-xs">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm text-gray-900">
                                      {Math.round(((userPerf?.performance?.completedModules || 0) / Math.max(1, userPerf?.performance?.moduleCount || 1)) * 100)}%
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {userPerf?.performance?.completedModules || 0}/{userPerf?.performance?.moduleCount || 0}
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${Math.min(100, Math.max(0, ((userPerf?.performance?.completedModules || 0) / Math.max(1, userPerf?.performance?.moduleCount || 1)) * 100))}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="space-y-1">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    {userPerf?.performance?.inProgressModules || 0} in progress
                                  </span>
                                  {userPerf?.performance?.inProgressModulesDetails && userPerf.performance.inProgressModulesDetails.length > 0 && (
                                    <div className="text-xs text-gray-500 space-y-1">
                                      {userPerf.performance.inProgressModulesDetails.slice(0, 2).map((module, idx) => (
                                        <div key={idx} className="flex items-center justify-between">
                                          <span className="truncate max-w-24">{module.moduleName}</span>
                                          <span className="text-gray-400">{module.progress}%</span>
                                        </div>
                                      ))}
                                      {userPerf.performance.inProgressModulesDetails.length > 2 && (
                                        <div className="text-gray-400">+{userPerf.performance.inProgressModulesDetails.length - 2} more</div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {userPerf?.performance?.lastCompletion 
                                  ? new Date(userPerf.performance.lastCompletion).toLocaleDateString()
                                  : 'Never'
                                }
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      console.log('Button clicked, userPerf:', userPerf);
                                      console.log('userPerf._id:', userPerf?._id);
                                      alert(`User ID: ${userPerf?._id}, Name: ${userPerf?.name}`);
                                      if (userPerf?._id) {
                                        fetchUserPerformance(userPerf._id);
                                      }
                                    }}
                                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                                    disabled={!userPerf?._id}
                                  >
                                    View Details
                                  </button>
                                  <button
                                    onClick={() => userPerf && openEditUser(userPerf)}
                                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                                    disabled={!userPerf}
                                  >
                                    Edit User
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-600">
                  <p className="text-lg font-medium mb-4">No performance data available</p>
                  <p>Users need to complete the assessment first to generate performance data.</p>
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === 'responses' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Scale Responses</h3>
                  <button
                    onClick={() => exportData('responses')}
                    className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                  >
                    Export CSV
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Scale
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time Taken
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Completed
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {responses.map((response) => (
                      <tr key={response._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{response.user.name}</p>
                            <p className="text-sm text-gray-500">{response.user.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {response.scaleName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            response.totalScore <= 20 
                              ? 'bg-green-100 text-green-800'
                              : response.totalScore <= 30
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {response.totalScore}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {response.timeTaken}s
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(response.completedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative min-h-screen flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New User</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setShowCreateUser(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={createUser}
                  className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                >
                  Create User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUser && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative min-h-screen flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit User</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={editUser.name || ''}
                    onChange={(e) => setEditUser({...editUser, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editUser.email || ''}
                    onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={editUser.role || 'user'}
                    onChange={(e) => setEditUser({...editUser, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setShowEditUser(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={updateUser}
                  className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                >
                  Update User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative min-h-screen flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this user? This action cannot be undone.</p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteUser(deleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Details Modal */}
      {showPerformanceDetails && performanceData && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative min-h-screen flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full m-4 p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">User Performance Details</h3>
                <button
                  onClick={() => setShowPerformanceDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                  title="Close performance details"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* User Info */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">User Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium">{performanceData.user?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{performanceData.user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Role</p>
                    <p className="font-medium">{performanceData.user?.role || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Login</p>
                    <p className="font-medium">
                      {performanceData.user?.lastLogin 
                        ? new Date(performanceData.user.lastLogin).toLocaleString() 
                        : 'Never'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Risk Level</p>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      performanceData.performance?.riskLevel === 'Low Risk' 
                        ? 'bg-green-100 text-green-800'
                        : performanceData.performance?.riskLevel === 'Moderate Risk'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {performanceData.performance?.riskLevel || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Total Score</h4>
                  <p className="text-2xl font-bold text-blue-600">{performanceData.performance?.totalScore || 0}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-green-900 mb-2">Average Score</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {performanceData.performance?.averageScore?.toFixed(1) || '0'}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-purple-900 mb-2">Completions</h4>
                  <p className="text-2xl font-bold text-purple-600">{performanceData.performance?.completionCount || 0}</p>
                </div>
              </div>

              {/* All Modules Progress */}
              {performanceData.moduleEnrollments && performanceData.moduleEnrollments.length > 0 ? (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">All Modules Progress</h4>
                  <div className="space-y-4">
                    {performanceData.moduleEnrollments.map((enrollment: any) => (
                      <div key={enrollment.moduleSlug} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium text-gray-900">{enrollment.moduleName}</h5>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            enrollment.status === 'completed' 
                              ? 'bg-green-100 text-green-800'
                              : enrollment.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {enrollment.status?.replace('_', ' ') || 'Enrolled'}
                          </span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                          <div 
                            className="bg-teal-500 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${enrollment.progress?.percentage || 0}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">
                            {enrollment.progress?.percentage || 0}% complete
                          </span>
                          <span className="text-gray-500">
                            {enrollment.progress?.completedPages?.length || 0} / {enrollment.progress?.totalPages || 0} pages
                          </span>
                        </div>
                        
                        {enrollment.progress?.currentPageSlug && (
                          <p className="text-xs text-gray-500 mt-1">
                            Current page: {enrollment.progress.currentPageSlug}
                          </p>
                        )}
                        
                        {enrollment.progress?.timeSpent > 0 && (
                          <p className="text-xs text-gray-500">
                            Time spent: {enrollment.progress.timeSpent} minutes
                          </p>
                        )}
                        
                        <p className="text-xs text-gray-400 mt-2">
                          Last accessed: {enrollment.lastAccessed 
                            ? new Date(enrollment.lastAccessed).toLocaleString() 
                            : 'Never'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">All Modules Progress</h4>
                  <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
                    No module enrollments found. User hasn't started any modules yet.
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => setShowPerformanceDetails(false)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
