import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useScaleCompletion } from '../../hooks/useScaleCompletion'
import { useAuth } from '../../hooks/useAuth'
import api from '../../lib/api'

interface ScaleItem {
  id: number
  text: string
}

const scaleItems: ScaleItem[] = [
  { id: 1, text: "I can always solve problems for my child, even when they are difficult" },
  { id: 2, text: "I can help my child feel better when they are upset or worried" },
  { id: 3, text: "I can successfully handle my child's behavioral problems" },
  { id: 4, text: "I can make my child feel loved and cared for" },
  { id: 5, text: "I can help my child succeed in school or other activities" },
  { id: 6, text: "I can effectively discipline my child when necessary" },
  { id: 7, text: "I can communicate well with my child" },
  { id: 8, text: "I can help my child develop good social skills" },
  { id: 9, text: "I can protect my child from negative influences" },
  { id: 10, text: "I can provide emotional support when my child needs it" }
]

export default function ParentalSelfEfficacyScale() {
  const [ratings, setRatings] = useState<Record<number, number>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { markScaleCompleted } = useScaleCompletion()
  const { user } = useAuth()
  const startTime = useState(Date.now())[0]

  const handleRating = (itemId: number, rating: number) => {
    setRatings(prev => ({ ...prev, [itemId]: rating }))
  }

  const handleSubmit = async () => {
    if (Object.keys(ratings).length !== scaleItems.length) {
      return
    }

    if (!user) {
      setError('Please log in to complete this assessment')
      return
    }

    setLoading(true)
    setError('')

    try {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000)
      const totalScore = Object.values(ratings).reduce((sum, rating) => sum + rating, 0)

      console.log('Submitting scale data:', {
        scaleId: 'parental-self-efficacy',
        scaleName: 'Parental Self Efficacy Scale',
        responses: ratings,
        totalScore,
        timeTaken
      })

      const response = await api.post('/scales/submit', {
        scaleId: 'parental-self-efficacy',
        scaleName: 'Parental Self Efficacy Scale',
        responses: ratings,
        totalScore,
        timeTaken
      })

      console.log('Scale submission response:', response.data)

      setIsSubmitted(true)
      markScaleCompleted('parental-self-efficacy')
      
      // Store in localStorage as backup
      const results = {
        scaleId: 'parental-self-efficacy',
        ratings,
        totalScore,
        completedAt: new Date().toISOString()
      }
      const existingResults = JSON.parse(localStorage.getItem('scaleResults') || '[]')
      existingResults.push(results)
      localStorage.setItem('scaleResults', JSON.stringify(existingResults))
      
    } catch (err: any) {
      console.error('Scale submission error:', err)
      console.error('Error response:', err.response?.data)
      
      if (err.response?.status === 401) {
        setError('Please log in to complete this assessment')
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.message || 'Invalid assessment data')
      } else {
        setError(err.response?.data?.message || 'Failed to save assessment. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const isComplete = Object.keys(ratings).length === scaleItems.length

  if (isSubmitted) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Assessment Completed</h1>
          <p className="text-lg text-gray-600 mb-6">
            Thank you for completing the Parental Self Efficacy Scale.
          </p>
          <div className="bg-white rounded-lg p-6 mb-6">
            <p className="text-gray-700 mb-4">Your responses have been recorded.</p>
            <p className="text-sm text-gray-600">
              This assessment helps us understand your confidence in parenting abilities.
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
          >
            Continue to Modules
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Parental Self Efficacy Assessment
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Please rate how confident you are in your ability to handle each parenting situation.
          </p>
          <p className="text-sm text-gray-500">
            Rate each item on a scale from 1 (Not at all confident) to 4 (Very confident)
          </p>
        </div>

        <div className="space-y-6 mb-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          
          {scaleItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-start gap-4">
                <span className="text-lg font-bold text-gray-600 min-w-[2rem]">
                  {item.id}.
                </span>
                <div className="flex-1">
                  <p className="text-gray-800 mb-4 font-medium">{item.text}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => handleRating(item.id, rating)}
                          className={`w-10 h-10 rounded-full border-2 font-medium transition-all ${
                            ratings[item.id] === rating
                              ? 'bg-teal-600 text-white border-teal-600'
                              : 'bg-white text-gray-600 border-gray-300 hover:border-teal-400 hover:text-teal-600'
                          }`}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 space-x-3">
                      <span>Not confident</span>
                      <span>Somewhat</span>
                      <span>Confident</span>
                      <span>Very confident</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center">
          <button
            onClick={handleSubmit}
            disabled={!isComplete || loading}
            className="bg-gradient-to-r from-teal-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-teal-700 hover:to-blue-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : `Submit Assessment (${Object.keys(ratings).length} of ${scaleItems.length} completed)`}
          </button>
          {!isComplete && !loading && (
            <p className="text-sm text-gray-600 mt-2">Please rate all items before submitting</p>
          )}
        </div>
      </div>
    </div>
  )
}
