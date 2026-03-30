import { useState } from 'react'
import { ContentBlock } from '../../types'

interface QuizPageProps {
  content: ContentBlock[]
}

export default function QuizPage({ content }: QuizPageProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [showResults, setShowResults] = useState(false)

  const handleAnswer = (questionIndex: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answer }))
  }

  const handleSubmit = () => {
    setShowResults(true)
  }

  const resetQuiz = () => {
    setAnswers({})
    setShowResults(false)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl p-8">
        {content.map((block, index) => (
          <div key={index}>
            {block.type === 'heading' && (
              <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                {block.text}
              </h1>
            )}
            
            {block.type === 'paragraph' && (
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                {block.text}
              </p>
            )}
            
            {block.type === 'list' && (
              <div className="space-y-6 mb-8">
                {block.items.map((item, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Question {i + 1}: {item}
                    </h3>
                    <div className="space-y-2">
                      {['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'].map((option) => (
                        <label key={option} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name={`question-${i}`}
                            value={option}
                            checked={answers[i] === option}
                            onChange={() => handleAnswer(i, option)}
                            className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {!showResults ? (
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length === 0}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Quiz
            </button>
          </div>
        ) : (
          <div className="mt-8 text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-green-800 mb-2">Quiz Completed!</h3>
              <p className="text-green-700">You answered {Object.keys(answers).length} questions.</p>
            </div>
            <button
              onClick={resetQuiz}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Retake Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
