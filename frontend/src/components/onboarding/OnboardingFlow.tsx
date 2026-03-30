import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import api from '../../lib/api'
import { 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle, 
  Users, 
  Baby, 
  Heart,
  BookOpen,
  Target,
  ArrowRight,
  Shield,
  Star,
  Clock,
  MessageCircle,
  GraduationCap
} from 'lucide-react'

interface OnboardingData {
  eligibility: {
    reason: string
  }
  personalInfo: {
    name: string
    surname: string
    age: string
    gender: string
    city: string
    postcode: string
    phoneNumber: string
    alternativeContact: string
  }
  familyInfo: {
    ethnicity: string
    ethnicityOther: string
    relationshipStatus: string
    education: string
    householdIncome: string
    covidImpact: string[]
  }
  teenInfo: {
    firstName: string
    dateOfBirth: string
    schoolGrade: string
    gender: string
    relationship: string
    otherParentInProgram: string
  }
  consent: {
    acceptedTerms: boolean
    acceptedPrivacy: boolean
    acceptedResearch: boolean
  }
}

const INITIAL_DATA: OnboardingData = {
  eligibility: { reason: '' },
  personalInfo: {
    name: '',
    surname: '',
    age: '',
    gender: '',
    city: '',
    postcode: '',
    phoneNumber: '',
    alternativeContact: ''
  },
  familyInfo: {
    ethnicity: '',
    ethnicityOther: '',
    relationshipStatus: '',
    education: '',
    householdIncome: '',
    covidImpact: []
  },
  teenInfo: {
    firstName: '',
    dateOfBirth: '',
    schoolGrade: '',
    gender: '',
    relationship: '',
    otherParentInProgram: ''
  },
  consent: {
    acceptedTerms: false,
    acceptedPrivacy: false,
    acceptedResearch: false
  }
}

export default function OnboardingFlow() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<OnboardingData>(INITIAL_DATA)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Load existing progress from backend
  useEffect(() => {
    if (user?.onboardingStep !== undefined) {
      setCurrentStep(user.onboardingStep)
      // Load existing data if available - convert age to string for form
      if (user?.personalInfo) {
        setData(prev => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            name: user.personalInfo?.name || prev.personalInfo.name,
            surname: user.personalInfo?.surname || prev.personalInfo.surname,
            age: user.personalInfo?.age?.toString() || prev.personalInfo.age,
            gender: user.personalInfo?.gender || prev.personalInfo.gender,
            city: user.personalInfo?.city || prev.personalInfo.city,
            postcode: user.personalInfo?.postcode || prev.personalInfo.postcode,
            phoneNumber: user.personalInfo?.phoneNumber || prev.personalInfo.phoneNumber,
            alternativeContact: user.personalInfo?.alternativeContact || prev.personalInfo.alternativeContact
          }
        }))
      }
    }
  }, [user])

  const updateData = (section: keyof OnboardingData, field: string, value: any) => {
    setData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const saveProgress = async (nextStep: number) => {
    try {
      console.log('Saving progress to step:', nextStep)
      console.log('Data being sent:', { onboardingStep: nextStep, ...data })
      const response = await api.patch('/auth/onboarding', {
        onboardingStep: nextStep,
        ...data
      })
      console.log('Save progress response:', response.data)
    } catch (err: any) {
      console.error('Failed to save progress:', err.response?.data || err.message)
    }
  }

  const nextStep = async () => {
    if (validateStep(currentStep)) {
      setError('')
      const next = currentStep + 1
      await saveProgress(next)
      setCurrentStep(next)
    }
  }

  const prevStep = () => {
    const prev = currentStep - 1
    setCurrentStep(prev)
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 3: // Eligibility
        if (!data.eligibility.reason) {
          setError('Please select an option')
          return false
        }
        if (data.eligibility.reason !== 'yes') {
          setError('Unfortunately, you are not eligible for this program at this time.')
          return false
        }
        return true
      case 4: // Personal Info
        const { name, surname, age, gender, city, phoneNumber } = data.personalInfo
        if (!name || !surname || !age || !gender || !city || !phoneNumber) {
          setError('Please fill in all required fields')
          return false
        }
        return true
      case 6: // Teen Info
        const { firstName, dateOfBirth, schoolGrade, gender: teenGender, relationship } = data.teenInfo
        if (!firstName || !dateOfBirth || !schoolGrade || !teenGender || !relationship) {
          setError('Please fill in all required fields')
          return false
        }
        return true
      case 7: // Consent
        const { acceptedTerms, acceptedPrivacy, acceptedResearch } = data.consent
        if (!acceptedTerms || !acceptedPrivacy || !acceptedResearch) {
          setError('Please accept all consent items to continue')
          return false
        }
        return true
      default:
        return true
    }
  }

  const completeOnboarding = async () => {
    setLoading(true)
    try {
      console.log('Completing onboarding...')
      const response = await api.patch('/auth/onboarding', {
        onboardingCompleted: true,
        onboardingStep: 9,
        ...data
      })
      console.log('Complete onboarding response:', response.data)
      // Update user context with new onboarding status
      if (response.data?.data?.user) {
        console.log('Setting user:', response.data.data.user)
        setUser(response.data.data.user)
      }
      console.log('Navigating to dashboard...')
      navigate('/dashboard')
    } catch (err: any) {
      console.error('Failed to complete onboarding:', err.response?.data || err.message)
      setError(err.response?.data?.message || 'Failed to complete onboarding')
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { title: 'Welcome', icon: Heart },
    { title: 'About PiP', icon: BookOpen },
    { title: 'Features', icon: Star },
    { title: 'Eligibility', icon: Shield },
    { title: 'About You', icon: Users },
    { title: 'Your Family', icon: Heart },
    { title: 'Your Teen', icon: Baby },
    { title: 'Consent', icon: Shield },
    { title: 'Start', icon: Target }
  ]

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep />
      case 1:
        return <AboutPiPStep />
      case 2:
        return <FeaturesStep />
      case 3:
        return (
          <EligibilityStep 
            data={data.eligibility} 
            updateData={(field, value) => updateData('eligibility', field, value)}
          />
        )
      case 4:
        return (
          <AboutYouStep 
            data={data.personalInfo} 
            updateData={(field, value) => updateData('personalInfo', field, value)}
          />
        )
      case 5:
        return (
          <AboutFamilyStep 
            data={data.familyInfo} 
            updateData={(field, value) => updateData('familyInfo', field, value)}
          />
        )
      case 6:
        return (
          <AboutTeenStep 
            data={data.teenInfo} 
            updateData={(field, value) => updateData('teenInfo', field, value)}
          />
        )
      case 7:
        return (
          <ConsentStep 
            data={data.consent} 
            updateData={(field, value) => updateData('consent', field, value)}
          />
        )
      case 8:
        return <StartStep teenName={data.teenInfo.firstName} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50">
      {/* Progress Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-800">Partners in Parenting</h1>
            <span className="text-sm text-gray-500">Step {currentStep + 1} of {steps.length}</span>
          </div>
          <div className="flex items-center space-x-1">
            {steps.map((_step, index) => (
              <div key={index} className="flex-1 flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  index <= currentStep 
                    ? 'bg-teal-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {index < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    index < currentStep ? 'bg-teal-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {renderStep()}
          
          {error && (
            <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            {currentStep > 0 ? (
              <button
                onClick={prevStep}
                className="flex items-center px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < steps.length - 1 ? (
              <button
                onClick={nextStep}
                className="flex items-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Continue
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            ) : (
              <button
                onClick={completeOnboarding}
                disabled={loading}
                className="flex items-center px-8 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-lg hover:from-teal-700 hover:to-blue-700 transition-all disabled:opacity-50"
              >
                {loading ? 'Starting...' : 'Start My Program'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Step Components
function WelcomeStep() {
  return (
    <div className="text-center py-8">
      <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <Heart className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        Welcome to the PiP+ Program!
      </h2>
      <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
        The first stage of the program includes an initial online assessment, during which you'll receive personalised feedback. After the surveys, you'll have access to your tailored program right away.
      </p>
      <div className="bg-teal-50 rounded-xl p-6 text-left max-w-2xl mx-auto">
        <p className="text-gray-700">
          Click the button below to get started on your journey to better parenting and stronger family relationships.
        </p>
      </div>
    </div>
  )
}

function AboutPiPStep() {
  return (
    <div className="py-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Partners in Parenting</h2>
      
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl p-6 text-white">
          <h3 className="text-xl font-semibold mb-3">What is PiP?</h3>
          <p className="text-white/90">
            Partners in Parenting is a free online program that aims to prevent depression and anxiety among teenagers.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Why Parents Matter</h3>
          <p className="text-gray-600">
            Parents have an important positive influence on their teenager's mental wellbeing. There's now good evidence to show that by supporting parents in their parenting we can help teenagers to stay well.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">What You'll Learn</h3>
          <p className="text-gray-600">
            By participating in this program you'll learn some new parenting strategies, and by completing some optional evaluation surveys, you'll be helping us to improve the impact of the program.
          </p>
        </div>
      </div>
    </div>
  )
}

function FeaturesStep() {
  const features = [
    { icon: Target, title: 'Personalised Feedback', description: 'Take our parenting survey to receive personalised feedback about your parenting' },
    { icon: Heart, title: 'Mental Wellbeing', description: 'Receive feedback about your own and your teen\'s mental wellbeing' },
    { icon: BookOpen, title: 'Interactive Modules', description: 'Access up to 10 interactive online modules (15-25 mins each) tailored for you' },
    { icon: Shield, title: 'COVID-19 Support', description: 'New, expert-endorsed information about parenting through the COVID-19 pandemic' },
    { icon: MessageCircle, title: 'Peer Community', description: 'Access to an online peer support community, to connect with other PiP parents' },
    { icon: GraduationCap, title: 'Research Impact', description: 'Be part of a world leading research project' }
  ]

  return (
    <div className="py-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Program Features</h2>
      <p className="text-gray-600 mb-8">Discover what makes Partners in Parenting special</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start p-4 bg-gray-50 rounded-xl">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
              <feature.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{feature.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Who Can Sign Up */}
      <div className="mt-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white">
        <h3 className="text-xl font-semibold mb-4">Who Can Sign Up?</h3>
        <p className="mb-4">Parents or guardians of a teenager aged 12 to 17 who:</p>
        <ul className="space-y-2">
          <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-2" /> Live in Pakistan</li>
          <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-2" /> Are fluent in English/Urdu</li>
          <li className="flex items-center"><CheckCircle className="w-5 h-5 mr-2" /> Have internet access</li>
        </ul>
        <p className="mt-4 text-sm text-white/80">
          Please note, our program is not designed to treat depression and anxiety conditions that have already developed. If your teenager is currently experiencing such difficulties, we recommend that you consult your GP or a mental health professional.
        </p>
      </div>
    </div>
  )
}

interface StepProps {
  data: any
  updateData: (field: string, value: any) => void
}

function EligibilityStep({ data, updateData }: StepProps) {
  const options = [
    { value: 'yes', label: 'Yes, I am a parent of a teenager aged 12-17' },
    { value: 'under_12', label: 'No, I am a parent of a child under 12' },
    { value: 'over_17', label: 'No, I am a parent of a child aged over 17' },
    { value: 'professional', label: 'No, I am a professional checking out the program' }
  ]

  return (
    <div className="py-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Eligibility Check</h2>
      <p className="text-gray-600 mb-6">Please confirm your eligibility for the program</p>

      <div className="space-y-3">
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
              data.reason === option.value
                ? 'border-teal-500 bg-teal-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="eligibility"
              value={option.value}
              checked={data.reason === option.value}
              onChange={(e) => updateData('reason', e.target.value)}
              className="w-4 h-4 text-teal-600 mr-4"
            />
            <span className="text-gray-900">{option.label}</span>
          </label>
        ))}
      </div>

      {data.reason && data.reason !== 'yes' && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-yellow-800">
            Unfortunately, you are not eligible for this program at this time. This program is specifically designed for parents of teenagers aged 12-17. However, you may still browse our resources section for general parenting tips.
          </p>
        </div>
      )}
    </div>
  )
}

function AboutYouStep({ data, updateData }: StepProps) {
  return (
    <div className="py-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">About You</h2>
      <p className="text-gray-600 mb-6">Tell us about yourself (All fields required)</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => updateData('name', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Your first name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Surname *</label>
          <input
            type="text"
            value={data.surname}
            onChange={(e) => updateData('surname', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Your surname"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
          <input
            type="number"
            min="18"
            max="100"
            value={data.age}
            onChange={(e) => updateData('age', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Your age"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
          <select
            value={data.gender}
            onChange={(e) => updateData('gender', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non_binary">Non-binary</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
          <input
            type="text"
            value={data.city}
            onChange={(e) => updateData('city', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Your city"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Postcode</label>
          <input
            type="text"
            value={data.postcode}
            onChange={(e) => updateData('postcode', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Postcode"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
          <input
            type="tel"
            value={data.phoneNumber}
            onChange={(e) => updateData('phoneNumber', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="+92 XXX XXXXXXX"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Alternative Contact (Optional)</label>
          <input
            type="text"
            value={data.alternativeContact}
            onChange={(e) => updateData('alternativeContact', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Email or phone"
          />
        </div>
      </div>
    </div>
  )
}

function AboutFamilyStep({ data, updateData }: StepProps) {
  const covidOptions = [
    { value: 'job_loss_one_parent', label: 'Job loss by one parent/guardian' },
    { value: 'job_loss_both_parents', label: 'Job loss by two parents/guardians' },
    { value: 'reduced_hours_one', label: 'Reduced job hours for one parent/guardian' },
    { value: 'reduced_hours_both', label: 'Reduced job hours for two parents/guardians' },
    { value: 'difficulty_paying_bills', label: 'Difficulty paying bills or buying necessities (e.g., food)' },
    { value: 'longer_work_hours', label: 'Parent/guardian having to work longer hours' },
    { value: 'applied_govt_assistance', label: 'Applied for government (financial) assistance' },
    { value: 'received_govt_assistance', label: 'Received government (financial) assistance' },
    { value: 'none', label: 'None of the above' }
  ]

  const handleCovidChange = (value: string) => {
    const current = data.covidImpact || []
    if (current.includes(value)) {
      updateData('covidImpact', current.filter((v: string) => v !== value))
    } else {
      updateData('covidImpact', [...current, value])
    }
  }

  return (
    <div className="py-4">
      <div className="bg-blue-50 rounded-xl p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> The following questions ask some personal information about you and your family. Answering these questions will help us to learn more about the parents who use the PiP program, and who benefits most. While we'd really appreciate you answering, if you prefer not to, you can skip these questions.
        </p>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">About Your Family</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Which ethnicity do you most identify with?</label>
          <select
            value={data.ethnicity}
            onChange={(e) => updateData('ethnicity', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">Select ethnicity</option>
            <option value="punjabi">Punjabi</option>
            <option value="sindhi">Sindhi</option>
            <option value="pashtun">Pashtun</option>
            <option value="balochi">Balochi</option>
            <option value="muhajir">Muhajir</option>
            <option value="kashmiri">Kashmiri</option>
            <option value="hazara">Hazara</option>
            <option value="other">Other (please specify)</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
          {data.ethnicity === 'other' && (
            <input
              type="text"
              value={data.ethnicityOther || ''}
              onChange={(e) => updateData('ethnicityOther', e.target.value)}
              className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="Please specify your ethnicity"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">What is your relationship status?</label>
          <select
            value={data.relationshipStatus}
            onChange={(e) => updateData('relationshipStatus', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">Select status</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="widowed">Widowed</option>
            <option value="divorced">Divorced</option>
            <option value="separated">Separated</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">What is your highest level of education?</label>
          <select
            value={data.education}
            onChange={(e) => updateData('education', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">Select education level</option>
            <option value="no_formal_education">No formal education</option>
            <option value="primary">Primary (Grades 1-5)</option>
            <option value="middle">Middle (Grades 6-8)</option>
            <option value="matric">Matric (Grades 9-10)</option>
            <option value="intermediate">Intermediate (Grades 11-12)</option>
            <option value="bachelors">Bachelor's degree</option>
            <option value="masters">Master's degree</option>
            <option value="phd">PhD/Doctorate</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">What is the current total income of your household, before tax?</label>
          <select
            value={data.householdIncome}
            onChange={(e) => updateData('householdIncome', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">Select income range</option>
            <option value="under_25000">Under PKR 25,000</option>
            <option value="25000_50000">PKR 25,000 - 50,000</option>
            <option value="50000_100000">PKR 50,000 - 100,000</option>
            <option value="100000_200000">PKR 100,000 - 200,000</option>
            <option value="over_200000">Over PKR 200,000</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Due to COVID-19, have any of these things happened in your household? (Check all that apply)
          </label>
          <div className="grid grid-cols-1 gap-2">
            {covidOptions.map((option) => (
              <label key={option.value} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(data.covidImpact || []).includes(option.value)}
                  onChange={() => handleCovidChange(option.value)}
                  className="w-4 h-4 text-teal-600 mr-3"
                />
                <span className="text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function AboutTeenStep({ data, updateData }: StepProps) {
  return (
    <div className="py-4">
      <div className="bg-purple-50 rounded-xl p-4 mb-6">
        <p className="text-sm text-purple-800">
          This program is designed for parents of teenagers aged between 12 and 17. If you have multiple teenagers, please complete the information below in reference to the teenager you are most likely to apply the program strategies with.
        </p>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">About Your Teenager</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your teen's first name *
          </label>
          <input
            type="text"
            value={data.firstName}
            onChange={(e) => updateData('firstName', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Teen's first name"
          />
          <p className="text-xs text-gray-500 mt-1">This is required to personalise the program to you and your teen.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of birth *
          </label>
          <input
            type="date"
            value={data.dateOfBirth}
            onChange={(e) => updateData('dateOfBirth', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            School grade/year level *
          </label>
          <select
            value={data.schoolGrade}
            onChange={(e) => updateData('schoolGrade', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">Select grade</option>
            <option value="grade_6">Grade 6</option>
            <option value="grade_7">Grade 7</option>
            <option value="grade_8">Grade 8</option>
            <option value="grade_9">Grade 9</option>
            <option value="grade_10">Grade 10 (Matric)</option>
            <option value="grade_11">Grade 11 (First Year)</option>
            <option value="grade_12">Grade 12 (Second Year)</option>
            <option value="not_attending">Not attending school</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gender *
          </label>
          <select
            value={data.gender}
            onChange={(e) => updateData('gender', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non_binary">Non-binary</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">This is required to personalise the program to you and your teen.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your relationship to them *
          </label>
          <select
            value={data.relationship}
            onChange={(e) => updateData('relationship', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">Select relationship</option>
            <option value="biological_mother">Biological Mother</option>
            <option value="biological_father">Biological Father</option>
            <option value="step_mother">Step Mother</option>
            <option value="step_father">Step Father</option>
            <option value="adoptive_mother">Adoptive Mother</option>
            <option value="adoptive_father">Adoptive Father</option>
            <option value="grandmother">Grandmother</option>
            <option value="grandfather">Grandfather</option>
            <option value="guardian">Guardian</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Is another parent also in this program? *
          </label>
          <div className="flex gap-4">
            {['yes', 'no', 'maybe'].map((option) => (
              <label key={option} className="flex items-center">
                <input
                  type="radio"
                  name="otherParent"
                  value={option}
                  checked={data.otherParentInProgram === option}
                  onChange={(e) => updateData('otherParentInProgram', e.target.value)}
                  className="w-4 h-4 text-teal-600 mr-2"
                />
                <span className="capitalize">{option}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Is your child's other parent (or co-parent) also taking part in this program? For example, biological parents, step-parents or other guardians.
          </p>
        </div>
      </div>
    </div>
  )
}

function ConsentStep({ data, updateData }: StepProps) {
  return (
    <div className="py-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Consent</h2>
      <p className="text-gray-600 mb-6">Please read carefully and accept the following terms</p>

      <div className="bg-gray-50 rounded-xl p-6 mb-6 max-h-96 overflow-y-auto">
        <h3 className="font-semibold text-gray-900 mb-4">What you're signing up for</h3>
        <p className="text-gray-700 mb-4">
          As a parent, I understand that my participation will involve receiving the Partners in Parenting program, consisting of:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-4">
          <li>Completing a confidential online survey to receive tailored feedback about my parenting. I will also receive feedback about my own and my teenager's mental wellbeing.</li>
          <li>Receiving a copy of the Reducing teenagers' risk of depression and anxiety disorders: Strategies for parents during the COVID-19 pandemic booklet immediately after completing the survey.</li>
          <li>Access to up to 10 interactive online modules, which provide more detailed parenting tips, and each take around 15-25 minutes to complete.</li>
          <li>Access to an optional online peer support community with other PiP parents, via Facebook.</li>
        </ol>
        
        <div className="space-y-3 text-gray-700">
          <p>• I understand that I will be invited to complete some optional evaluation surveys around 3-months later, to look at how my parenting approach, my teenager's mental wellbeing, and my own mental wellbeing have changed over time.</p>
          <p>• If I choose to join the online peer support community, I will be provided with more information about my privacy and data security before I join.</p>
          <p>• I may also be invited to participate in an optional interview (via phone or Zoom video conferencing) with the research team to give feedback on my experience of using the program.</p>
          <p>• I understand that I am free to use the Partners in Parenting program without completing the optional evaluation surveys, and if I do complete them I can withdraw consent and discontinue participation in the evaluation at any time without explanation.</p>
          <p>• My decision whether or not to use the program or participate in the evaluation will not prejudice any future relationship I or my teenager may have with Monash University.</p>
          <p>• I understand that all information provided by me will be kept strictly confidential within the limits of the law, unless the Partners in Parenting team deems that I, my child, or someone else is at serious risk of harm.</p>
          <p>• I agree that data gathered from the surveys I complete may be published in a scientific journal or conference presentation, provided that I cannot be identified.</p>
          <p>• I understand that non-identifiable data will be made available for future research via a secure online repository.</p>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Any concerns about the scientific aspects of the program can be directed to Associate Professor Marie Yap via email, marie.yap@monash.edu
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Any complaints about the ethical aspects of the research may be directed to the Executive Officer, Monash University Human Research Ethics Committee (MUHREC).
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <label className="flex items-start p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50">
          <input
            type="checkbox"
            checked={data.acceptedTerms}
            onChange={(e) => updateData('acceptedTerms', e.target.checked)}
            className="w-5 h-5 text-teal-600 mr-3 mt-0.5"
          />
          <span className="text-gray-700">
            I have read and understood the information in the Explanatory Statement, and agree to participate in this program. *
          </span>
        </label>

        <label className="flex items-start p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50">
          <input
            type="checkbox"
            checked={data.acceptedPrivacy}
            onChange={(e) => updateData('acceptedPrivacy', e.target.checked)}
            className="w-5 h-5 text-teal-600 mr-3 mt-0.5"
          />
          <span className="text-gray-700">
            I understand that my data will be kept confidential and I agree to the privacy policy. *
          </span>
        </label>

        <label className="flex items-start p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50">
          <input
            type="checkbox"
            checked={data.acceptedResearch}
            onChange={(e) => updateData('acceptedResearch', e.target.checked)}
            className="w-5 h-5 text-teal-600 mr-3 mt-0.5"
          />
          <span className="text-gray-700">
            I agree that non-identifiable data from my participation may be used for future research. *
          </span>
        </label>
      </div>
    </div>
  )
}

function StartStep({ teenName }: { teenName: string }) {
  return (
    <div className="text-center py-8">
      <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-white" />
      </div>
      
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        You're All Set!
      </h2>
      
      <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
        After you've completed the first online survey, you'll have access to your personalised parenting program. 
        {teenName && (
          <span className="block mt-2 font-semibold text-teal-600">
            We're excited to help you and {teenName} on this journey!
          </span>
        )}
      </p>

      <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6 text-left max-w-2xl mx-auto mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">What happens next:</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start">
            <Clock className="w-5 h-5 mr-2 text-teal-600 flex-shrink-0 mt-0.5" />
            <span>Complete the initial assessment (takes about 15-20 minutes)</span>
          </li>
          <li className="flex items-start">
            <Target className="w-5 h-5 mr-2 text-teal-600 flex-shrink-0 mt-0.5" />
            <span>Receive personalised feedback and recommendations</span>
          </li>
          <li className="flex items-start">
            <BookOpen className="w-5 h-5 mr-2 text-teal-600 flex-shrink-0 mt-0.5" />
            <span>Access up to 10 tailored modules, one per week at your own pace</span>
          </li>
          <li className="flex items-start">
            <Heart className="w-5 h-5 mr-2 text-teal-600 flex-shrink-0 mt-0.5" />
            <span>Track your progress and see improvements over time</span>
          </li>
        </ul>
      </div>

      <p className="text-gray-500 text-sm">
        You can select up to 10 modules, based on our suggestions and your preferences. Click the button below to begin.
      </p>
    </div>
  )
}
