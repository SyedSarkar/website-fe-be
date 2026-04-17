import { useState } from 'react'
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  Send,
  CheckCircle,
  MessageSquare,
  HelpCircle
} from 'lucide-react'
import Header from '../navigation/Header'
import { useLanguage } from '../../hooks/useLanguage'

export default function Contact() {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate form submission
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: '', email: '', subject: '', message: '' })
    }, 3000)
  }

  const contactInfo = [
    {
      icon: Phone,
      title: t('phone'),
      content: '+1 (555) 123-4567',
      description: t('mon_fri_hours')
    },
    {
      icon: Mail,
      title: t('email'),
      content: 'support@partnersinparenting.com',
      description: t('respond_24h')
    },
    {
      icon: MapPin,
      title: t('office'),
      content: '123 Family Lane, Suite 100',
      description: 'Parenting City, PC 12345'
    },
    {
      icon: Clock,
      title: t('working_hours'),
      content: 'Monday - Friday',
      description: '8:00 AM - 5:00 PM EST'
    }
  ]

  const faqs = [
    {
      question: t('faq_q1'),
      answer: t('faq_a1')
    },
    {
      question: t('faq_q2'),
      answer: t('faq_a2')
    },
    {
      question: t('faq_q3'),
      answer: t('faq_a3')
    },
    {
      question: t('faq_q4'),
      answer: t('faq_a4')
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-teal-600 to-blue-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            {t('contact_us')}
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            {t('contact_hero_desc')}
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 -mt-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow text-center"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <info.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{t(info.title)}</h3>
                <p className="text-teal-600 font-medium mb-1">{info.content}</p>
                <p className="text-sm text-gray-500">{info.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & FAQ */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-center mb-6">
                <MessageSquare className="w-6 h-6 text-teal-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">{t('send_message')}</h2>
              </div>

              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t('message_sent')}</h3>
                  <p className="text-gray-600">{t('get_back_24h')}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('your_name')}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('email_address')}
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('subject')}
                    </label>
                    <select
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="">{t('select_subject')}</option>
                      <option value="general">{t('general_inquiry')}</option>
                      <option value="support">{t('technical_support')}</option>
                      <option value="billing">{t('billing_question')}</option>
                      <option value="feedback">{t('feedback')}</option>
                      <option value="other">{t('other')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('message')}
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                      placeholder={t('how_can_help')}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-8 py-4 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-lg font-semibold hover:from-teal-700 hover:to-blue-700 transition-all flex items-center justify-center"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    {t('send_message_btn')}
                  </button>
                </form>
              )}
            </div>

            {/* FAQ Section */}
            <div>
              <div className="flex items-center mb-6">
                <HelpCircle className="w-6 h-6 text-teal-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">{t('faq')}</h2>
              </div>

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-6 shadow-sm"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl p-6">
                <h3 className="font-bold text-gray-900 mb-2">{t('still_have_questions')}</h3>
                <p className="text-gray-600 mb-4">
                  {t('support_team_help')}
                </p>
                <a
                  href="mailto:support@partnersinparenting.com"
                  className="inline-flex items-center text-teal-600 font-semibold hover:text-teal-700"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  {t('email_support_team')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section (Placeholder) */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-100 rounded-2xl h-64 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">{t('map_coming_soon')}</p>
              <p className="text-sm text-gray-400">123 Family Lane, Suite 100, Parenting City, PC 12345</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            &copy; 2024 Partners in Parenting. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
