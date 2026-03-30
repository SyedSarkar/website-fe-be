import { useState } from 'react'
import { ContentBlock } from '../../types'

interface ScalePageProps {
  content: ContentBlock[]
  scaleId?: string
  onComplete?: () => void
}

export default function ScalePage({ content, scaleId, onComplete }: ScalePageProps) {
  const [ratings, setRatings] = useState<Record<number, number>>({})
  const [isCompleted, setIsCompleted] = useState(false)

  const handleRating = (itemIndex: number, rating: number) => {
    setRatings(prev => ({ ...prev, [itemIndex]: rating }))
  }

  const handleSubmit = () => {
    const totalItems = content.filter(block => block.type === 'list').reduce((acc, block) => acc + block.items.length, 0)
    
    if (Object.keys(ratings).length === totalItems) {
      setIsCompleted(true)
      
      // Store completion in localStorage
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
    const totalItems = content.filter(block => block.type === 'list').reduce((acc, block) => acc + block.items.length, 0)
    return Object.keys(ratings).length === totalItems
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl shadow-xl p-8">
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
              Submit Scale ({Object.keys(ratings).length} of {content.filter(block => block.type === 'list').reduce((acc, block) => acc + block.items.length, 0)} completed)
            </button>
            {!isScaleComplete() && (
              <p className="text-sm text-gray-600 mt-2">Please rate all items before submitting</p>
            )}
          </div>
        ) : (
          <div className="mt-12 text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-green-800 mb-2">Scale Completed Successfully!</h3>
              <p className="text-green-700">You can now proceed to the next module.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
