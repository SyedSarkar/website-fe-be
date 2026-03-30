import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { 
  Heart, 
  Users, 
  BookOpen, 
  Star, 
  ArrowRight,
  CheckCircle,
  Shield,
  Sparkles
} from 'lucide-react'
import Header from '../navigation/Header'

export default function Home() {
  const { isAuthenticated, user } = useAuth()

  const features = [
    {
      icon: Heart,
      title: 'Strengthen Relationships',
      description: 'Build stronger bonds with your children through evidence-based parenting strategies.'
    },
    {
      icon: Users,
      title: 'Expert Guidance',
      description: 'Access professional advice and practical tools from child development specialists.'
    },
    {
      icon: BookOpen,
      title: 'Learn at Your Pace',
      description: 'Self-paced modules designed to fit into your busy parenting schedule.'
    },
    {
      icon: Shield,
      title: 'Proven Methods',
      description: 'Techniques backed by research to help your family thrive.'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'Mother of 2',
      content: 'This program transformed how I approach parenting. My relationship with my kids has never been better.',
      rating: 5
    },
    {
      name: 'Michael R.',
      role: 'Father of 3',
      content: 'The practical tools and strategies helped me navigate the challenges of parenting with confidence.',
      rating: 5
    },
    {
      name: 'Jennifer L.',
      role: 'Single Parent',
      content: 'Finally, a program that understands real parenting challenges. Highly recommended!',
      rating: 5
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
            Trusted by 10,000+ Parents Worldwide
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Partners in
            <span className="block bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
              Parenting
            </span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
            Empowering families with evidence-based strategies, practical tools, and expert guidance to build stronger, healthier relationships.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to={user?.role === 'admin' ? '/admin' : '/user-dashboard'}
                className="group px-8 py-4 bg-white text-teal-600 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center"
              >
                Go to Dashboard
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="group px-8 py-4 bg-white text-teal-600 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center"
                >
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold text-lg hover:bg-white/30 transition-all"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-white">10K+</div>
              <div className="text-white/80">Happy Families</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white">50+</div>
              <div className="text-white/80">Expert Modules</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white">95%</div>
              <div className="text-white/80">Success Rate</div>
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
              Why Choose Partners in Parenting?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive support designed to help your family thrive at every stage.
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
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple steps to transform your parenting journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Complete Assessments</h3>
              <p className="text-gray-600">Take our comprehensive parenting assessments to understand your strengths and areas for growth.</p>
              {/* Connector */}
              <div className="hidden md:block absolute top-10 left-[60%] w-full h-0.5 bg-gradient-to-r from-teal-500 to-blue-600"></div>
            </div>

            <div className="relative text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Access Modules</h3>
              <p className="text-gray-600">Explore personalized learning modules designed specifically for your family's needs.</p>
              {/* Connector */}
              <div className="hidden md:block absolute top-10 left-[60%] w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-600"></div>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Transform Family Life</h3>
              <p className="text-gray-600">Apply proven strategies and watch your family relationships flourish.</p>
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
                What You'll Gain
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Our program provides you with practical tools and knowledge to create a nurturing family environment.
              </p>
              
              <div className="space-y-4">
                {[
                  'Improved communication with your children',
                  'Effective discipline strategies',
                  'Stress management techniques',
                  'Better understanding of child development',
                  'Stronger family bonds',
                  'Confidence in your parenting decisions'
                ].map((benefit, index) => (
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
                  <div className="text-white/80">Core Assessments</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                  <div className="text-3xl font-bold text-white mb-2">12+</div>
                  <div className="text-white/80">Learning Modules</div>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                  <div className="text-3xl font-bold text-white mb-2">24/7</div>
                  <div className="text-white/80">Resource Access</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                  <div className="text-3xl font-bold text-white mb-2">100%</div>
                  <div className="text-white/80">Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Parents Say
            </h2>
            <p className="text-xl text-gray-600">
              Real stories from families who transformed their relationships.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-bold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Parenting Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of parents who have already discovered the power of evidence-based parenting strategies.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to={user?.role === 'admin' ? '/admin' : '/user-dashboard'}
                className="px-8 py-4 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-xl font-semibold text-lg hover:from-teal-700 hover:to-blue-700 transition-all transform hover:scale-105"
              >
                Continue Your Journey
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-8 py-4 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-xl font-semibold text-lg hover:from-teal-700 hover:to-blue-700 transition-all transform hover:scale-105"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/contact"
                  className="px-8 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold text-lg hover:bg-gray-200 transition-all"
                >
                  Learn More
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
                Empowering families with evidence-based strategies and expert guidance since 2024.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/resources" className="hover:text-white transition-colors">Resources</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Account</h4>
              <ul className="space-y-2 text-gray-400">
                {isAuthenticated ? (
                  <>
                    <li><Link to="/profile" className="hover:text-white transition-colors">My Profile</Link></li>
                    <li><Link to="/user-dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                  </>
                ) : (
                  <>
                    <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                    <li><Link to="/register" className="hover:text-white transition-colors">Get Started</Link></li>
                  </>
                )}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500">
            <p>&copy; 2024 Partners in Parenting. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
