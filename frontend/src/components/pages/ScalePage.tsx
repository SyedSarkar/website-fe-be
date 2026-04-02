import { useState, useEffect } from 'react'
import { ContentBlock } from '../../types'
import { useAuth } from '../../hooks/useAuth'
import api from '../../lib/api'

interface ScalePageProps {
  content: ContentBlock[]
  moduleSlug?: string
  pageSlug?: string
  moduleName?: string
  scaleId?: string
  onComplete?: () => void
}

export default function ScalePage({ content, moduleSlug, pageSlug, moduleName, scaleId, onComplete }: ScalePageProps) {
  const [ratings, setRatings] = useState<Record<number, number>>({})
  const [isCompleted, setIsCompleted] = useState(false)
  const [existingResponse, setExistingResponse] = useState<any>(null)
  const { user } = useAuth()

  // Check for existing response on mount
  useEffect(() => {
    const checkExisting = async () => {
      if (!user || !moduleSlug || !pageSlug) return
      try {
        const response = await api.get(`/module-content/response/${moduleSlug}/${pageSlug}`)
        if (response.data.data) {
          setExistingResponse(response.data.data)
          // Restore ratings from saved response
          const savedRatings: Record<number, number> = {}
          const responseData = response.data.data.responses
          if (responseData && typeof responseData === 'object') {
            Object.entries(responseData).forEach(([key, value]) => {
              if (key.startsWith('item_')) {
                const index = parseInt(key.replace('item_', ''))
                if (!isNaN(index)) {
                  savedRatings[index] = value as number
                }
              }
            })
          }
          setRatings(savedRatings)
          setIsCompleted(true)
        }
      } catch (error) {
        // No existing response - user hasn't completed scale yet
      }
    }
    checkExisting()
  }, [user, moduleSlug, pageSlug])

  const handleRating = (itemIndex: number, rating: number) => {
    setRatings(prev => ({ ...prev, [itemIndex]: rating }))
  }

  const handleSubmit = async () => {
    const scaleItems: string[] = []
    content.forEach(block => {
      if (block.type === 'list') {
        block.items.forEach(item => scaleItems.push(item))
      }
    })
    
    if (Object.keys(ratings).length === scaleItems.length) {
      // Save to backend if user is logged in and we have module info
      if (user && moduleSlug && pageSlug) {
        try {
          // Format responses for backend
          const responses: Record<string, number> = {}
          scaleItems.forEach((_, index) => {
            responses[`item_${index}`] = ratings[index] || 0
          })
          
          // Calculate total score
          const totalScore = Object.values(ratings).reduce((sum, r) => sum + r, 0)

          await api.post('/module-content/response', {
            moduleSlug,
            moduleName: moduleName || moduleSlug,
            pageSlug,
            responseType: 'scale',
            responses: {
              items: scaleItems,
              ratings: responses,
              totalScore
            },
            score: totalScore
          })
        } catch (error) {
          console.error('Failed to save scale response:', error)
        }
      }

      setIsCompleted(true)
      
      // Store completion in localStorage for backwards compatibility
      if (scaleId) {
        const completedScales = JSON.parse(localStorage.getItem('completedScales') || '[]')
        if (!completedScales.includes(scaleId)) {
          completedScales.push(scaleId)
          localStorage.setItem('completedScales', JSON.stringify(completedScales))
        }
      }
      
      if (onComplete) {
        onComplete()
      }
    }
  }

  const isScaleComplete = () => {
    const scaleItems: string[] = []
    content.forEach(block => {
      if (block.type === 'list') {
        block.items.forEach(item => scaleItems.push(item))
      }
    })
    return Object.keys(ratings).length === scaleItems.length
  }

  // Get scale items count
  const getScaleItemsCount = () => {
    let count = 0
    content.forEach(block => {
      if (block.type === 'list') {
        count += block.items.length
      }
    })
    return count
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl shadow-xl p-8">
        {existingResponse && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-700 text-sm">
              You have already completed this scale. 
              {existingResponse.score !== null && existingResponse.score !== undefined && (
                <span className="font-semibold"> Your score: {existingResponse.score}</span>
              )}
            </p>
          </div>
        )}
        {content.map((block, index) => (
          <div key={index} className="mb-8">
            {block.type === 'heading' && (
              <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                {block.text}
              </h1>
            )}
            
            {block.type === 'paragraph' && (
              <p className="text-lg text-gray-700 mb-8 leading-relaxed text-center">
                {block.text}
              </p>
            )}
            
            {block.type === 'list' && (
              <div className="space-y-4 mb-8">
                {block.items.map((item: string, i: number) => (
                  <div key={i} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <div className="flex items-start gap-4">
                      <span className="text-lg font-bold text-gray-600 min-w-[2rem]">
                        {i + 1}.
                      </span>
                      <div className="flex-1">
                        <p className="text-gray-800 mb-4 font-medium">{item}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                              <button
                                key={rating}
                                onClick={() => handleRating(i, rating)}
                                className={`w-8 h-8 rounded-full border-2 text-sm font-medium transition-all ${
                                  ratings[i] === rating
                                    ? 'bg-teal-600 text-white border-teal-600'
                                    : 'bg-white text-gray-600 border-gray-300 hover:border-teal-400 hover:text-teal-600'
                                }`}
                              >
                                {rating}
                              </button>
                            ))}
                          </div>
                          <div className="text-xs text-gray-500 space-x-4">
                            <span>Not at all</span>
                            <span>Extremely</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {!isCompleted ? (
          <div className="mt-12 flex flex-col items-center">
            <button
              onClick={handleSubmit}
              disabled={!isScaleComplete()}
              className="bg-gradient-to-r from-teal-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-teal-700 hover:to-blue-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Scale ({Object.keys(ratings).length} of {getScaleItemsCount()} completed)
            </button>
            {!isScaleComplete() && (
              <p className="text-sm text-gray-600 mt-2">Please rate all items before submitting</p>
            )}
          </div>
        ) : (
          <div className="mt-12 text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-green-800 mb-2">
                {existingResponse ? 'Scale Already Completed!' : 'Scale Completed Successfully!'}
              </h3>
              <p className="text-green-700">
                {existingResponse?.score !== null && existingResponse?.score !== undefined 
                  ? `Your score: ${existingResponse.score}` 
                  : 'You can now proceed to the next module.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
