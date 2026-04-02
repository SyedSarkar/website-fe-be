import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useLanguage } from '../../hooks/useLanguage'
import { 
  Heart, 
  Users, 
  BookOpen, 
  ArrowRight,
  CheckCircle,
  Shield,
  Sparkles
} from 'lucide-react'
import Header from '../navigation/Header'

export default function Home() {
  const { isAuthenticated, user } = useAuth()
  const { t } = useLanguage()

  const features = [
    {
      icon: Heart,
      title: t('strengthen_relationships'),
      description: t('strengthen_desc')
    },
    {
      icon: Users,
      title: t('expert_guidance'),
      description: t('expert_desc')
    },
    {
      icon: BookOpen,
      title: t('learn_at_pace'),
      description: t('learn_desc')
    },
    {
      icon: Shield,
      title: t('proven_methods'),
      description: t('proven_desc')
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header transparent />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-600 via-blue-600 to-purple-700 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-yellow-300 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4 mr-2" />
            {t('trusted_by_parents')}
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            {t('partners_in')}
            <span className="block bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
              {t('parenting_title')}
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            {t('hero_description')}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to={user?.role === 'admin' ? '/admin' : '/user-dashboard'}
                className="group px-8 py-4 bg-white text-teal-600 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center"
              >
                {t('go_to_dashboard')}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="group px-8 py-4 bg-white text-teal-600 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center"
                >
                  {t('start_journey')}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold text-lg hover:bg-white/30 transition-all"
                >
                  {t('sign_in')}
                </Link>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-white">10K+</div>
              <div className="text-white/80">{t('happy_families')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white">50+</div>
              <div className="text-white/80">{t('expert_modules')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white">95%</div>
              <div className="text-white/80">{t('success_rate')}</div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/80 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('why_choose')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('comprehensive_support')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('how_it_works')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('simple_steps')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('step1_title')}</h3>
              <p className="text-gray-600">{t('step1_desc')}</p>
              {/* Connector */}
              <div className="hidden md:block absolute top-10 left-[60%] w-full h-0.5 bg-gradient-to-r from-teal-500 to-blue-600"></div>
            </div>

            <div className="relative text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('step2_title')}</h3>
              <p className="text-gray-600">{t('step2_desc')}</p>
              {/* Connector */}
              <div className="hidden md:block absolute top-10 left-[60%] w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-600"></div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{t('step3_title')}</h3>
              <p className="text-gray-600">{t('step3_desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-br from-teal-600 to-blue-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                {t('what_you_gain')}
              </h2>
              <p className="text-xl text-white/90 mb-8">
                {t('program_provides')}
              </p>
              
              <div className="space-y-4">
                {[t('benefit1'), t('benefit2'), t('benefit3'), t('benefit4'), t('benefit5'), t('benefit6')].map((benefit, index) => (
                  <div key={index} className="flex items-center text-white">
                    <CheckCircle className="w-6 h-6 mr-3 text-yellow-300 flex-shrink-0" />
                    <span className="text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                  <div className="text-3xl font-bold text-white mb-2">4</div>
                  <div className="text-white/80">{t('core_assessments')}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                  <div className="text-3xl font-bold text-white mb-2">12+</div>
                  <div className="text-white/80">{t('learning_modules')}</div>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                  <div className="text-3xl font-bold text-white mb-2">24/7</div>
                  <div className="text-white/80">{t('resource_access')}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                  <div className="text-3xl font-bold text-white mb-2">100%</div>
                  <div className="text-white/80">{t('satisfaction')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            {t('ready_to_transform')}
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            {t('join_parents')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to={user?.role === 'admin' ? '/admin' : '/user-dashboard'}
                className="px-8 py-4 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-xl font-semibold text-lg hover:from-teal-700 hover:to-blue-700 transition-all transform hover:scale-105"
              >
                {t('continue_journey')}
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-8 py-4 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-xl font-semibold text-lg hover:from-teal-700 hover:to-blue-700 transition-all transform hover:scale-105"
                >
                  {t('get_started_free')}
                </Link>
                <Link
                  to="/contact"
                  className="px-8 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold text-lg hover:bg-gray-200 transition-all"
                >
                  {t('learn_more')}
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">P</span>
                </div>
                <span className="font-bold text-xl">Partners in Parenting</span>
              </div>
              <p className="text-gray-400 max-w-sm">
                {t('empowering_families')}
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">{t('quick_links')}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/" className="hover:text-white transition-colors">{t('home')}</Link></li>
                <li><Link to="/resources" className="hover:text-white transition-colors">{t('resources')}</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">{t('contact_us')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">{t('account')}</h4>
              <ul className="space-y-2 text-gray-400">
                {isAuthenticated ? (
                  <>
                    <li><Link to="/profile" className="hover:text-white transition-colors">{t('my_profile')}</Link></li>
                    <li><Link to="/user-dashboard" className="hover:text-white transition-colors">{t('dashboard')}</Link></li>
                  </>
                ) : (
                  <>
                    <li><Link to="/login" className="hover:text-white transition-colors">{t('sign_in')}</Link></li>
                    <li><Link to="/register" className="hover:text-white transition-colors">{t('get_started')}</Link></li>
                  </>
                )}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500">
            <p>&copy; 2024 Partners in Parenting. {t('all_rights_reserved')}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
