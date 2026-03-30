import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useScaleCompletion } from '../hooks/useScaleCompletion'
import { useAuth } from '../hooks/useAuth'
import ChildMentalHealthScale from './scales/ChildMentalHealthScale'
import ParentalSelfEfficacyScale from './scales/ParentalSelfEfficacyScale'
import ParentChildRelationshipScale from './scales/ParentChildRelationshipScale'
import ParentalMentalWellbeingScale from './scales/ParentalMentalWellbeingScale'

interface ScaleConfig {
  id: string
  name: string
  description: string
  component: React.ComponentType
  estimatedTime: string
}

const scales: ScaleConfig[] = [
  {
    id: 'child-mental-health',
    name: "Child's Mental Health Scale",
    description: 'Assess your child\'s emotional wellbeing and identify potential areas of concern',
    component: ChildMentalHealthScale,
    estimatedTime: '5-10 minutes'
  },
  {
    id: 'parental-self-efficacy',
    name: 'Parental Self Efficacy Scale',
    description: 'Evaluate your confidence in handling various parenting situations',
    component: ParentalSelfEfficacyScale,
    estimatedTime: '5-10 minutes'
  },
  {
    id: 'parent-child-relationship',
    name: 'Parent-Child Relationship Scale',
    description: 'Assess the quality of your relationship with your child',
    component: ParentChildRelationshipScale,
    estimatedTime: '5-10 minutes'
  },
  {
    id: 'parental-mental-wellbeing',
    name: 'Parental Mental Wellbeing Scale',
    description: 'Evaluate your current mental health and wellbeing as a parent',
    component: ParentalMentalWellbeingScale,
    estimatedTime: '5-10 minutes'
  }
]

export default function ScaleFlow() {
  const { user, logout } = useAuth()
  const { completedScales, isScaleCompleted, allScalesCompleted, loading } = useScaleCompletion()
  const navigate = useNavigate()
  const [currentScaleIndex, setCurrentScaleIndex] = useState(0)
  const [showIntro, setShowIntro] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    if (loading) return

    // Check if all scales are completed
    if (allScalesCompleted()) {
      // All scales completed, redirect to user dashboard
      navigate('/user-dashboard')
      return
    }

    // Find the first incomplete scale
    const firstIncompleteIndex = scales.findIndex(scale => !isScaleCompleted(scale.id))
    if (firstIncompleteIndex !== -1 && firstIncompleteIndex !== currentScaleIndex) {
      setCurrentScaleIndex(firstIncompleteIndex)
    }
  }, [user, navigate, isScaleCompleted, currentScaleIndex, allScalesCompleted, loading])

  const currentScale = scales[currentScaleIndex]
  const CurrentScaleComponent = currentScale?.component

  if (loading || !currentScale || !CurrentScaleComponent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    )
  }

  if (showIntro) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Welcome to Your Assessment Journey
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              Before accessing the course modules, we need to understand your unique situation.
            </p>
            <p className="text-sm text-gray-500">
              These assessments help us provide you with the most relevant and personalized content.
            </p>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Your Assessments</h2>
              <span className="text-sm text-gray-600">
                {completedScales.length} of {scales.length} completed
              </span>
            </div>
            
            <div className="space-y-4">
              {scales.map((scale, index) => {
                const isCompleted = isScaleCompleted(scale.id)
                const isCurrent = index === currentScaleIndex
                
                return (
                  <div 
                    key={scale.id} 
                    className={`border rounded-lg p-4 transition-all ${
                      isCompleted 
                        ? 'bg-green-50 border-green-200' 
                        : isCurrent 
                        ? 'bg-teal-50 border-teal-200' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted 
                            ? 'bg-green-500 text-white' 
                            : isCurrent 
                            ? 'bg-teal-500 text-white' 
                            : 'bg-gray-300 text-gray-600'
                        }`}>
                          {isCompleted ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <span className="text-sm font-medium">{index + 1}</span>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{scale.name}</h3>
                          <p className="text-sm text-gray-600">{scale.description}</p>
                          <p className="text-xs text-gray-500 mt-1">Estimated time: {scale.estimatedTime}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {isCompleted ? (
                          <span className="text-green-600 text-sm font-medium">Completed</span>
                        ) : isCurrent ? (
                          <span className="text-teal-600 text-sm font-medium">Current</span>
                        ) : (
                          <span className="text-gray-500 text-sm">Pending</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => setShowIntro(false)}
              className="bg-gradient-to-r from-teal-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-teal-700 hover:to-blue-700 transition-all transform hover:scale-105"
            >
              Start {currentScale.name}
            </button>
            <p className="text-sm text-gray-600 mt-2">
              This will take approximately {currentScale.estimatedTime}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Universal Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-teal-600">Partners in Parenting</h1>
              <span className="text-sm text-gray-500">Assessment</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.name}</span>
              <button
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-6 px-4">
        {/* Progress Header */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-800">Assessment Progress</h2>
              <span className="text-sm text-gray-600">
                {completedScales.length} of {scales.length} completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-teal-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((completedScales.length) / scales.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Current Scale Component */}
        <CurrentScaleComponent />
      </main>
    </div>
  )
}
