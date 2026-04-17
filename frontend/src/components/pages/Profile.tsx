import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useLanguage } from '../../hooks/useLanguage'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { 
  User, 
  Mail, 
  Calendar, 
  Shield,
  Edit2,
  Save,
  X,
  LogOut,
  Lock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  BarChart3,
  BookOpen
} from 'lucide-react'
import Header from '../navigation/Header'

interface UserStats {
  scalesCompleted: number
  modulesCompleted: number
  totalTimeSpent: number
  averageScore: number
  joinDate: string
}

export default function Profile() {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    bio: ''
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    fetchUserStats()
  }, [])

  const fetchUserStats = async () => {
    try {
      const [scalesResponse, modulesResponse] = await Promise.all([
        api.get('/scales/my-responses'),
        api.get('/modules/my-progress')
      ])

      const scales = scalesResponse.data.data || []
      const modules = modulesResponse.data.data || []

      setUserStats({
        scalesCompleted: scales.length,
        modulesCompleted: modules.filter((m: any) => m.status === 'completed').length,
        totalTimeSpent: modules.reduce((sum: number, m: any) => sum + (m.progress?.timeSpent || 0), 0),
        averageScore: scales.length > 0 
          ? scales.reduce((sum: number, s: any) => sum + s.totalScore, 0) / scales.length 
          : 0,
        joinDate: user?.createdAt || new Date().toISOString()
      })
    } catch (error) {
      console.error('Failed to fetch user stats:', error)
    }
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      await api.patch('/auth/profile', formData)
      setMessage({ type: 'success', text: t('profile_updated') })
      setIsEditing(false)
    } catch (error) {
      setMessage({ type: 'error', text: t('failed_update_profile') })
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: t('passwords_not_match') })
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      setMessage({ type: 'success', text: t('password_changed') })
      setShowPasswordModal(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.message || t('failed_change_password') })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{t('my_profile')}</h1>
            <p className="text-gray-600">{t('manage_account_settings')}</p>
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center ${
              message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2" />
              )}
              {message.text}
              <button
                onClick={() => setMessage(null)} 
                title="Close message"
                className="ml-auto"
              >  
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Card */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <User className="w-5 h-5 mr-2 text-teal-600" />
                    {t('personal_information')}
                  </h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center px-4 py-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      {t('edit')}
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4 mr-2" />
                        {t('cancel')}
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={loading}
                        className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? t('saving') : t('save')}
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{user?.name}</h3>
                      <p className="text-gray-500 capitalize">{user?.role} {t('account')}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('full_name')}</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900 flex items-center">
                          <User className="w-4 h-4 mr-2 text-gray-400" />
                          {user?.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900 flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {user?.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('phone')}</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder={t('phone_placeholder')}
                        />
                      ) : (
                        <p className="text-gray-900 flex items-center">
                          <span className="text-gray-400 mr-2">📞</span>
                          {user?.personalInfo?.phoneNumber || formData.phone || t('not_provided')}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('location')}</label>
                      <p className="text-gray-900 flex items-center">
                        <span className="text-gray-400 mr-2">📍</span>
                        {user?.personalInfo?.city ? `${user.personalInfo.city}, ${user.personalInfo.postcode}` : t('not_provided')}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('member_since')}</label>
                      <p className="text-gray-900 flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('bio')}</label>
                    {isEditing ? (
                      <textarea
                        rows={3}
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                        placeholder={t('bio_placeholder')}
                      />
                    ) : (
                      <p className="text-gray-900">
                        {formData.bio || t('no_bio')}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Security */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center mb-6">
                  <Shield className="w-5 h-5 mr-2 text-teal-600" />
                  {t('security')}
                </h2>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center">
                    <Lock className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{t('password')}</p>
                      <p className="text-sm text-gray-500">{t('change_password_desc')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    {t('change')}
                  </button>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">{t('quick_links')}</h2>
                
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/user-dashboard')}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <BarChart3 className="w-5 h-5 text-teal-600 mr-3" />
                      <span className="font-medium text-gray-900">{t('view_dashboard')}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>

                  <button
                    onClick={() => navigate('/dashboard')}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <BookOpen className="w-5 h-5 text-blue-600 mr-3" />
                      <span className="font-medium text-gray-900">{t('my_assessments')}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Stats & Actions */}
            <div className="space-y-6">
              {/* Stats Card */}
              <div className="bg-gradient-to-br from-teal-600 to-blue-700 rounded-2xl p-6 text-white">
                <h3 className="font-bold text-lg mb-4">{t('your_progress')}</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">{t('scales_completed')}</span>
                    <span className="font-bold text-2xl">{userStats?.scalesCompleted || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">{t('modules_done')}</span>
                    <span className="font-bold text-2xl">{userStats?.modulesCompleted || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">{t('avg_score')}</span>
                    <span className="font-bold text-2xl">{userStats?.averageScore.toFixed(1) || '0.0'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">{t('time_spent')}</span>
                    <span className="font-bold text-2xl">{Math.round(userStats?.totalTimeSpent || 0)}m</span>
                  </div>
                </div>
              </div>

              {/* Sign Out */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center p-4 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-semibold"
              >
                <LogOut className="w-5 h-5 mr-2" />
                {t('sign_out')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">{t('change')} {t('password')}</h3>
              <button 
                onClick={() => setShowPasswordModal(false)} 
                title="Close password modal"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('current_password')}</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('new_password')}</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('confirm_new_password')}</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                >
                  {loading ? t('changing') : t('change') + ' ' + t('password')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
