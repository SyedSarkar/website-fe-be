import { useState, useEffect } from 'react'
import { ContentBlock } from '../../types'
import { useAuth } from '../../hooks/useAuth'
import api from '../../lib/api'

interface QuizPageProps {
  content: ContentBlock[]
  moduleSlug?: string
  pageSlug?: string
  moduleName?: string
}

interface QuizQuestion {
  question: string
  options: string[]
}

export default function QuizPage({ content, moduleSlug, pageSlug, moduleName }: QuizPageProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [existingResponse, setExistingResponse] = useState<any>(null)
  const { user } = useAuth()

  // Parse questions from content
  const parseQuestions = (content: ContentBlock[]): QuizQuestion[] => {
    const questions: QuizQuestion[] = []
    const defaultOptions = ['True', 'False', "Don't Know"]
    
    for (const block of content) {
      if (block.type === 'paragraph') {
        const text = block.text.trim()
        
        // Check if this is a question (starts with QUESTION or Question)
        if (/^question\s*\d+/i.test(text)) {
          // Extract question text (remove "QUESTION 01:" prefix)
          const questionText = text.replace(/^question\s*\d*[:.]?\s*/i, '').trim()
          questions.push({ question: questionText, options: [...defaultOptions] })
        }
      }
    }

    return questions
  }

  const questions = parseQuestions(content)

  // Check for existing response on mount
  useEffect(() => {
    const checkExisting = async () => {
      if (!user || !moduleSlug || !pageSlug) return
      try {
        const response = await api.get(`/module-content/quiz/${moduleSlug}/${pageSlug}`)
        if (response.data.data) {
          setExistingResponse(response.data.data)
          setAnswers(response.data.data.answers || {})
          setShowResults(true)
        }
      } catch (error) {
        // No existing response - user hasn't taken quiz yet
      }
    }
    checkExisting()
  }, [user, moduleSlug, pageSlug])

  const handleAnswer = (questionIndex: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: answer }))
  }

  const handleSubmit = async () => {
    if (!user || !moduleSlug || !pageSlug) {
      setShowResults(true)
      return
    }

    try {
      await api.post('/module-content/quiz/submit', {
        moduleSlug,
        moduleName: moduleName || moduleSlug,
        quizId: pageSlug,
        answers,
        totalQuestions: questions.length,
        timeTaken: 0
      })
      setShowResults(true)
    } catch (error) {
      console.error('Failed to submit quiz:', error)
      setShowResults(true)
    }
  }

  const resetQuiz = () => {
    setAnswers({})
    setShowResults(false)
    setExistingResponse(null)
  }

  // Get the quiz title from content
  const title = content.find(b => b.type === 'heading')?.text || 'Quiz'

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">{title}</h1>
        
        {questions.map((q, idx) => (
          <div key={idx} className="mb-8 p-6 bg-white rounded-lg shadow-md border border-gray-200">
            <div className="flex gap-2 mb-4">
              <span className="font-bold text-purple-600">QUESTION {String(idx + 1).padStart(2, '0')}:</span>
              <p className="text-gray-800 font-medium flex-1">{q.question}</p>
            </div>
            
            <div className="space-y-3 ml-0 md:ml-6">
              {q.options.map((option) => (
                <label
                  key={option}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    answers[idx] === option
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  } ${showResults ? 'cursor-default' : ''}`}
                >
                  <input
                    type="radio"
                    name={`question-${idx}`}
                    value={option}
                    checked={answers[idx] === option}
                    onChange={() => !showResults && handleAnswer(idx, option)}
                    disabled={showResults}
                    className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-gray-700 font-medium">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        
        {!showResults ? (
          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="text-sm text-gray-600">
              Answered {Object.keys(answers).length} of {questions.length} questions
            </div>
            <button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length < questions.length}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Quiz
            </button>
            {Object.keys(answers).length < questions.length && (
              <p className="text-sm text-gray-500">Please answer all questions before submitting</p>
            )}
          </div>
        ) : (
          <div className="mt-8 text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-green-800 mb-2">
                {existingResponse ? 'Quiz Already Completed!' : 'Quiz Completed!'}
              </h3>
              <p className="text-green-700">
                You answered {Object.keys(answers).length} of {questions.length} questions.
              </p>
              {existingResponse?.score !== null && existingResponse?.score !== undefined && (
                <p className="text-green-800 font-semibold mt-2">
                  Your score: {existingResponse.score}/{existingResponse.totalQuestions || questions.length}
                </p>
              )}
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
