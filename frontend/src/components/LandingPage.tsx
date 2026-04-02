import { Link } from 'react-router-dom'
import { useScaleCompletion } from '../hooks/useScaleCompletion'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../hooks/useLanguage'

export default function LandingPage() {
  const { canAccessModule, getPendingScales } = useScaleCompletion()
  const { user, logout, isAuthenticated, loading } = useAuth()
  const { t } = useLanguage()
  const canAccessModules = canAccessModule('all')
  const pendingScales = getPendingScales('all')

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Partners in Parenting
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {t('hero_description')}
          </p>
          
          {/* Authentication Links */}
          {!loading && (
            <div className="flex justify-center gap-4 mb-8">
              {isAuthenticated ? (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">{t('welcome_back')}, {user?.name}!</p>
                  <div className="flex justify-center gap-4 flex-wrap">
                    {user?.role === 'admin' ? (
                      <Link
                        to="/admin"
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                      >
                        {t('admin_dashboard')}
                      </Link>
                    ) : (
                      <>
                        <Link
                          to="/dashboard"
                          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105"
                        >
                          {t('my_dashboard')}
                        </Link>
                        {canAccessModules && (
                          <Link
                            to="/module/m1-connect/00-home"
                            className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-teal-700 transition-all transform hover:scale-105"
                          >
                            {t('continue_modules')}
                          </Link>
                        )}
                        {!canAccessModules && (
                          <Link
                            to="/scale/child-mental-health"
                            className="px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors"
                          >
                            {t('complete_assessment')}
                          </Link>
                        )}
                      </>
                    )}
                    <button
                      onClick={logout}
                      className="px-6 py-3 border-2 border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors"
                    >
                      {t('sign_out')}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors"
                  >
                    {t('sign_in')}
                  </Link>
                  <Link
                    to="/register"
                    className="px-6 py-3 border-2 border-teal-600 text-teal-600 rounded-lg font-semibold hover:bg-teal-50 transition-colors"
                  >
                    {t('get_started')}
                  </Link>
                </>
              )}
            </div>
          )}
          
          {!canAccessModules && pendingScales.length > 0 && user?.role !== 'admin' && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                {t('welcome_get_started')}
              </h2>
              <p className="text-gray-600 mb-6">
                {t('assessment_desc')}
              </p>
              <div className="space-y-3">
                {pendingScales.map((scale) => (
                  <Link
                    key={scale.scaleId}
                    to={`/scale/${scale.scaleId}`}
                    className="block w-full max-w-md mx-auto bg-gradient-to-r from-teal-600 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-teal-700 hover:to-blue-700 transition-all transform hover:scale-105 text-center"
                  >
                    Start {scale.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {canAccessModules && user?.role !== 'admin' && (
            <Link
              to="/module/m1-connect/00-home"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white text-lg font-semibold rounded-lg hover:from-green-700 hover:to-teal-700 transition-all transform hover:scale-105"
            >
              {t('continue_modules')}
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          )}
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">{t('comprehensive_modules')}</h3>
            <p className="text-gray-600">
              {t('modules_desc')}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">{t('interactive_activities')}</h3>
            <p className="text-gray-600">
              {t('activities_desc')}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">{t('personalized_support')}</h3>
            <p className="text-gray-600">
              {t('support_desc')}
            </p>
          </div>
        </div>

        {/* Module Preview */}
        {canAccessModules && user?.role !== 'admin' && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">{t('available_modules')}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: "Connect", slug: "m1-connect", description: "Building strong family connections" },
                { name: "Parenting in Pandemic", slug: "m2-parenting-in-pandemic", description: "Navigating challenges during difficult times" },
                { name: "Family Rules", slug: "m3-family-rules", description: "Establishing effective household guidelines" },
                { name: "Nurture", slug: "m4-nurture", description: "Supporting emotional development" },
                { name: "Conflict", slug: "m5-conflict", description: "Managing disagreements constructively" },
                { name: "Friends", slug: "m6-friends", description: "Understanding social relationships" }
              ].map((module) => (
                <Link
                  key={module.slug}
                  to={`/module/${module.slug}/00-home`}
                  className="block p-6 border-2 border-gray-200 rounded-lg hover:border-teal-400 hover:bg-teal-50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{module.name}</h3>
                  <p className="text-gray-600 text-sm">{module.description}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-gray-600">
          <p className="mb-2">
            {t('program_desc')}
          </p>
          <p className="text-sm">
            &copy; 2024 Partners in Parenting. {t('all_rights_reserved')}
          </p>
        </div>
      </div>
    </div>
  )
}
