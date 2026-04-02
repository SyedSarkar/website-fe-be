import { useState, useEffect } from 'react'
import { ContentBlock } from '../../types'
import { useLanguage } from '../../hooks/useLanguage'
import { useAuth } from '../../hooks/useAuth'
import api from '../../lib/api'
import { Star, ChevronDown, ChevronUp, Plus, Trash2, Check, SkipForward, Play } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

interface ModulePageProps {
  content: ContentBlock[]
  moduleSlug: string
  pageSlug?: string
}

// Star Scale Component for checking-in
function StarScale({ question, onSubmit, moduleSlug, pageSlug }: { 
  question: string; 
  onSubmit?: (rating: number) => void;
  moduleSlug: string;
  pageSlug: string;
}) {
  const [rating, setRating] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [hoverRating, setHoverRating] = useState(0)
  const { user } = useAuth()

  useEffect(() => {
    const checkExisting = async () => {
      if (!user) return
      try {
        const response = await api.get(`/module-content/response/${moduleSlug}/${pageSlug}`)
        if (response.data.data) {
          setRating(response.data.data.responses.rating)
          setSubmitted(true)
        }
      } catch (error) {
        // No existing response
      }
    }
    checkExisting()
  }, [user, moduleSlug, pageSlug])

  const handleSubmit = async (selectedRating: number) => {
    if (!user) return
    
    try {
      await api.post('/module-content/response', {
        moduleSlug,
        moduleName: moduleSlug,
        pageSlug,
        responseType: 'checking-in',
        responses: { rating: selectedRating, question },
        score: selectedRating
      })
      setRating(selectedRating)
      setSubmitted(true)
      onSubmit?.(selectedRating)
    } catch (error) {
      console.error('Failed to submit rating:', error)
    }
  }

  return (
    <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl p-6 mb-6">
      <p className="text-lg font-medium text-gray-800 mb-4">{question}</p>
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
          <button
            key={star}
            onClick={() => handleSubmit(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className={`transition-all duration-200 ${
              star <= (hoverRating || rating)
                ? 'text-yellow-400 scale-110'
                : 'text-gray-300'
            } ${submitted && star === rating ? 'scale-125' : ''}`}
            disabled={submitted}
          >
            <Star className="w-8 h-8 fill-current" />
          </button>
        ))}
      </div>
      {submitted && (
        <p className="text-center text-teal-600 mt-3 font-medium">
          Thank you! You rated: {rating}/10
        </p>
      )}
    </div>
  )
}

// Expandable Section Component
function ExpandableSection({ title, children, defaultOpen = false }: { 
  title: string; 
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="mb-4 border border-teal-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-teal-50 hover:bg-teal-100 transition-colors"
      >
        <span className="font-semibold text-teal-800">{title}</span>
        {isOpen ? <ChevronUp className="w-5 h-5 text-teal-600" /> : <ChevronDown className="w-5 h-5 text-teal-600" />}
      </button>
      {isOpen && (
        <div className="p-4 bg-white">
          {children}
        </div>
      )}
    </div>
  )
}

// Clickable Title with Expandable Content
function ClickableTitleItem({ title, content }: { title: string; content: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="mb-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-teal-100 to-blue-100 rounded-lg hover:from-teal-200 hover:to-blue-200 transition-all"
      >
        <span className="font-bold text-teal-700 text-lg">{title}</span>
        {isOpen ? <ChevronUp className="w-5 h-5 text-teal-600 ml-auto" /> : <ChevronDown className="w-5 h-5 text-teal-600 ml-auto" />}
      </button>
      {isOpen && (
        <div className="p-4 bg-gray-50 rounded-b-lg mt-1 border-l-4 border-teal-400">
          <p className="text-gray-700">{content}</p>
        </div>
      )}
    </div>
  )
}

// Attractive Card for quotes/lines
function AttractiveCard({ text, type = 'default' }: { text: string; type?: 'encouragement' | 'acknowledgement' | 'affection' | 'appreciation' | 'default' }) {
  const colors = {
    encouragement: 'from-pink-50 to-rose-50 border-pink-200',
    acknowledgement: 'from-blue-50 to-cyan-50 border-blue-200',
    affection: 'from-purple-50 to-pink-50 border-purple-200',
    appreciation: 'from-green-50 to-teal-50 border-green-200',
    default: 'from-gray-50 to-slate-50 border-gray-200'
  }

  return (
    <div className={`p-4 rounded-xl border bg-gradient-to-br ${colors[type]} hover:shadow-md transition-shadow mb-3`}>
      <p className="text-gray-800 font-medium">{text}</p>
    </div>
  )
}

// Image Grid Component
function ImageGrid({ images, moduleSlug }: { images: { src: string; alt: string }[]; moduleSlug: string }) {
  const { language } = useLanguage()
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-6">
      {images.map((img, idx) => (
        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
          <img
            src={`${API_URL}/content/${moduleSlug.replace('m', 'module_').replace(/-/g, '_')}/images/${img.src}?lang=${language}`}
            alt={img.alt}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
      ))}
    </div>
  )
}

// Do/Don't Comparison Table
function DoDontTable({ doItems, dontItems }: { doItems: string[]; dontItems: string[] }) {
  return (
    <div className="grid md:grid-cols-2 gap-6 my-6">
      <div className="bg-green-50 rounded-xl p-6 border border-green-200">
        <h4 className="text-green-800 font-bold text-xl mb-4 flex items-center gap-2">
          <Check className="w-6 h-6" /> Do
        </h4>
        <ul className="space-y-3">
          {doItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-green-700">
              <span className="text-green-500 mt-1">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-red-50 rounded-xl p-6 border border-red-200">
        <h4 className="text-red-800 font-bold text-xl mb-4 flex items-center gap-2">
          <Trash2 className="w-6 h-6" /> Don't
        </h4>
        <ul className="space-y-3">
          {dontItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-red-700">
              <span className="text-red-500 mt-1">✗</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// Video Embed Component
function VideoEmbed({ url }: { url: string }) {
  const [showVideo, setShowVideo] = useState(false)

  const getVimeoId = (url: string) => {
    const match = url.match(/video\/(\d+)/)
    return match ? match[1] : null
  }

  const vimeoId = getVimeoId(url)

  if (!vimeoId) {
    return (
      <div className="my-6 p-4 bg-gray-100 rounded-lg">
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">
          Watch Video
        </a>
      </div>
    )
  }

  return (
    <div className="my-6">
      {!showVideo ? (
        <button
          onClick={() => setShowVideo(true)}
          className="w-full aspect-video bg-gradient-to-br from-teal-600 to-blue-700 rounded-xl flex items-center justify-center group hover:from-teal-700 hover:to-blue-800 transition-all"
        >
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="w-10 h-10 text-white fill-current" />
          </div>
        </button>
      ) : (
        <div className="aspect-video rounded-xl overflow-hidden">
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1`}
            className="w-full h-full"
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        </div>
      )}
    </div>
  )
}

// Skip Button Component
function SkipButton({ onSkip }: { onSkip: () => void }) {
  return (
    <button
      onClick={onSkip}
      className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
    >
      <SkipForward className="w-4 h-4" />
      Skip
    </button>
  )
}

// Goal Selection Component
function GoalSelection({ 
  goals, 
  moduleSlug, 
  moduleName 
}: { 
  goals: { text: string; id: string; links?: string[] }[];
  moduleSlug: string;
  moduleName: string;
}) {
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [userGoals, setUserGoals] = useState<any[]>([])
  const { user } = useAuth()

  useEffect(() => {
    const fetchGoals = async () => {
      if (!user) return
      try {
        const response = await api.get(`/module-content/goals?moduleSlug=${moduleSlug}`)
        setUserGoals(response.data.data || [])
        setSelectedGoals((response.data.data || []).map((g: any) => g.goalId))
      } catch (error) {
        console.error('Failed to fetch goals:', error)
      }
    }
    fetchGoals()
  }, [user, moduleSlug])

  const toggleGoal = async (goalId: string, goalText: string) => {
    if (!user) return

    if (selectedGoals.includes(goalId)) {
      try {
        await api.delete(`/module-content/goals/${goalId}`)
        setSelectedGoals(prev => prev.filter(id => id !== goalId))
        setUserGoals(prev => prev.filter(g => g.goalId !== goalId))
      } catch (error) {
        console.error('Failed to remove goal:', error)
      }
    } else {
      try {
        await api.post('/module-content/goals/select', {
          moduleSlug,
          moduleName,
          goalText,
          goalId
        })
        setSelectedGoals(prev => [...prev, goalId])
        setUserGoals(prev => [...prev, { goalId, goalText }])
      } catch (error) {
        console.error('Failed to select goal:', error)
      }
    }
  }

  return (
    <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl p-6 my-6">
      <h4 className="text-xl font-bold text-teal-800 mb-4">Select a goal to focus on this week</h4>
      
      {userGoals.length > 0 && (
        <div className="mb-6 p-4 bg-white rounded-lg border-2 border-teal-200">
          <h5 className="font-semibold text-teal-700 mb-2">Your selected goal:</h5>
          <ul className="space-y-2">
            {userGoals.map((goal) => (
              <li key={goal.goalId} className="flex items-center gap-2 text-gray-700">
                <Check className="w-4 h-4 text-teal-600" />
                {goal.goalText}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-3">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
              selectedGoals.includes(goal.id)
                ? 'border-teal-500 bg-teal-50'
                : 'border-gray-200 bg-white hover:border-teal-300'
            }`}
            onClick={() => toggleGoal(goal.id, goal.text)}
          >
            <button className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
              selectedGoals.includes(goal.id)
                ? 'bg-teal-600 text-white'
                : 'bg-gray-200 text-gray-400 hover:bg-teal-200'
            }`}>
              {selectedGoals.includes(goal.id) ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
            <div className="flex-1">
              <p className="text-gray-800">{goal.text}</p>
              {goal.links && goal.links.length > 0 && (
                <p className="text-sm text-teal-600 mt-1">
                  See: {goal.links.join(', ')}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Quiz Component
function QuizComponent({ 
  questions, 
  moduleSlug, 
  pageSlug,
  moduleName
}: { 
  questions: { question: string; options: string[] }[];
  moduleSlug: string;
  pageSlug: string;
  moduleName: string;
}) {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [existingResponse, setExistingResponse] = useState<any>(null)
  const { user } = useAuth()

  useEffect(() => {
    const checkExisting = async () => {
      if (!user) return
      try {
        const response = await api.get(`/module-content/quiz/${moduleSlug}/${pageSlug}`)
        if (response.data.data) {
          setExistingResponse(response.data.data)
          setAnswers(response.data.data.answers)
          setSubmitted(true)
        }
      } catch (error) {
        // No existing response
      }
    }
    checkExisting()
  }, [user, moduleSlug, pageSlug])

  const handleOptionSelect = (questionIndex: number, option: string) => {
    if (submitted) return
    setAnswers(prev => ({ ...prev, [questionIndex]: option }))
  }

  const handleSubmit = async () => {
    if (!user) return
    
    try {
      await api.post('/module-content/quiz/submit', {
        moduleSlug,
        moduleName,
        quizId: pageSlug,
        answers,
        totalQuestions: questions.length,
        timeTaken: 0
      })
      setSubmitted(true)
    } catch (error) {
      console.error('Failed to submit quiz:', error)
    }
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 my-6">
      <h4 className="text-2xl font-bold text-blue-800 mb-6">Quiz</h4>
      
      {questions.map((q, idx) => (
        <div key={idx} className="mb-8 p-4 bg-white rounded-lg shadow-sm">
          <p className="font-semibold text-gray-800 mb-4">
            <span className="text-blue-600">Question {idx + 1}:</span> {q.question}
          </p>
          <div className="space-y-2">
            {q.options.map((option) => (
              <label
                key={option}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  answers[idx] === option
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                } ${submitted ? 'cursor-default' : ''}`}
              >
                <input
                  type="radio"
                  name={`question-${idx}`}
                  value={option}
                  checked={answers[idx] === option}
                  onChange={() => handleOptionSelect(idx, option)}
                  disabled={submitted}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
      
      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length !== questions.length}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Submit Quiz
        </button>
      ) : (
        <div className="p-4 bg-green-100 rounded-lg">
          <p className="text-green-800 font-semibold text-center">
            Quiz completed! Thank you for your responses.
          </p>
          {existingResponse?.score !== null && (
            <p className="text-green-700 text-center mt-2">
              Your score: {existingResponse.score}/{questions.length}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// Interactive Video Activity
function VideoActivity({ 
  questions, 
  moduleSlug, 
  pageSlug 
}: { 
  questions: { question: string; options: string[] }[];
  moduleSlug: string;
  pageSlug: string;
}) {
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const { user } = useAuth()

  const handleOptionSelect = (questionIndex: number, option: string) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: option }))
  }

  const handleSubmit = async () => {
    if (!user) return
    
    try {
      await api.post('/module-content/response', {
        moduleSlug,
        moduleName: moduleSlug,
        pageSlug,
        responseType: 'activity',
        responses: { answers }
      })
      setSubmitted(true)
    } catch (error) {
      console.error('Failed to submit activity:', error)
    }
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 my-6">
      <h4 className="text-xl font-bold text-purple-800 mb-4">Video Activity</h4>
      {questions.map((q, idx) => (
        <div key={idx} className="mb-6">
          <p className="font-semibold text-gray-800 mb-3">{q.question}</p>
          <div className="flex flex-wrap gap-3">
            {q.options.map((option) => (
              <button
                key={option}
                onClick={() => !submitted && handleOptionSelect(idx, option)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  answers[idx] === option
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-purple-100'
                } ${submitted ? 'cursor-default' : ''}`}
                disabled={submitted}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ))}
      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length !== questions.length}
          className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Submit Answers
        </button>
      ) : (
        <p className="mt-4 text-green-600 font-semibold">Thank you for completing the activity!</p>
      )}
    </div>
  )
}

// Main ModulePage Component
export default function ModulePage({ content, moduleSlug, pageSlug }: ModulePageProps) {
  const { language } = useLanguage()
  const { user } = useAuth()
  const [skipClicked, setSkipClicked] = useState(false)

  const hasPattern = (text: string, pattern: string) => text?.toLowerCase().includes(pattern.toLowerCase())

  const renderContent = () => {
    const elements: React.ReactNode[] = []
    let i = 0

    while (i < content.length) {
      const block = content[i]

      if (block.type === 'heading') {
        elements.push(
          <h1 key={i} className={`font-bold text-gray-800 mb-6 ${
            block.level === 1 ? 'text-4xl text-teal-700' :
            block.level === 2 ? 'text-3xl text-teal-600' :
            block.level === 3 ? 'text-2xl text-teal-600' : 'text-xl text-teal-600'
          }`}>
            {block.text}
          </h1>
        )
        i++
        continue
      }

      if (block.type === 'paragraph') {
        // Star scale pattern
        if (hasPattern(block.text, 'star') && content.slice(i, i + 10).some(b => 
          b.type === 'paragraph' && /\d+ stars?/i.test(b.text)
        )) {
          const question = block.text
          elements.push(
            <StarScale 
              key={`scale-${i}`} 
              question={question} 
              moduleSlug={moduleSlug}
              pageSlug={pageSlug || 'checking-in'}
            />
          )
          i++
          continue
        }

        // Click to reveal pattern
        if (hasPattern(block.text, 'click') && hasPattern(block.text, 'reveal')) {
          const title = block.text
          const expandableContent: React.ReactNode[] = []
          i++
          
          while (i < content.length && content[i].type !== 'heading' && 
                 !(content[i].type === 'paragraph' && hasPattern(content[i].text, 'click'))) {
            const innerBlock = content[i]
            if (innerBlock.type === 'paragraph') {
              expandableContent.push(<p key={i} className="text-gray-700 mb-2">{innerBlock.text}</p>)
            } else if (innerBlock.type === 'list') {
              expandableContent.push(
                <ul key={i} className="list-disc pl-6 space-y-1">
                  {innerBlock.items.map((item, idx) => (
                    <li key={idx} className="text-gray-700">{item}</li>
                  ))}
                </ul>
              )
            }
            i++
          }

          elements.push(
            <ExpandableSection key={`expand-${i}`} title={title}>
              {expandableContent}
            </ExpandableSection>
          )
          continue
        }

        // Video URL pattern
        const videoMatch = block.text.match(/^>(https:\/\/player\.vimeo\.com\/video\/\d+)/)
        if (videoMatch) {
          elements.push(<VideoEmbed key={`video-${i}`} url={videoMatch[1]} />)
          i++
          continue
        }

        // Skip button for pandemic
        if (hasPattern(block.text, 'pandemic') && !skipClicked) {
          elements.push(
            <div key={`skip-${i}`} className="flex justify-end mb-4">
              <SkipButton onSkip={() => setSkipClicked(true)} />
            </div>
          )
        }

        // Special styled paragraph
        if (hasPattern(block.text, 'no one way') || hasPattern(block.text, 'works for one')) {
          elements.push(
            <div key={i} className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400 p-4 rounded-r-lg mb-6">
              <p className="text-gray-700 italic">{block.text}</p>
            </div>
          )
        } else {
          elements.push(<p key={i} className="text-lg text-gray-700 mb-6 leading-relaxed">{block.text}</p>)
        }
        i++
        continue
      }

      if (block.type === 'list') {
        // Clickable titles pattern
        if (block.items.every(item => item.split(' ').length <= 3) && 
            content[i + 1]?.type === 'paragraph') {
          const titles = block.items
          i++
          
          titles.forEach((title, idx) => {
            const contentText = content[i]?.type === 'paragraph' ? content[i].text : ''
            if (content[i]?.type === 'paragraph') i++
            
            elements.push(
              <ClickableTitleItem key={`clickable-${idx}`} title={title} content={contentText} />
            )
          })
          continue
        }

        // Do/Don't pattern
        const doItems = block.items.filter(item => 
          hasPattern(item, 'do:') || (!hasPattern(item, "don't") && !hasPattern(item, 'avoid'))
        )
        const dontItems = block.items.filter(item => 
          hasPattern(item, "don't") || hasPattern(item, 'avoid') || hasPattern(item, 'never')
        )
        
        if (doItems.length > 0 && dontItems.length > 0) {
          elements.push(
            <DoDontTable 
              key={`dodont-${i}`} 
              doItems={doItems.map(s => s.replace(/^Do:\s*/i, ''))}
              dontItems={dontItems.map(s => s.replace(/^Don't:\s*/i, '').replace(/^(Avoid|Never):\s*/i, ''))}
            />
          )
          i++
          continue
        }

        // Goal selection pattern
        if (hasPattern(block.items[0], 'try') || hasPattern(block.items[0], 'select a goal') || 
            hasPattern(block.items[0], 'select one goal')) {
          const goals = block.items.map((item, idx) => ({
            text: item.replace(/^-?\s*/, ''),
            id: `goal-${moduleSlug}-${idx}`,
            links: []
          }))
          
          elements.push(
            <GoalSelection 
              key={`goals-${i}`}
              goals={goals}
              moduleSlug={moduleSlug}
              moduleName={moduleSlug}
            />
          )
          i++
          continue
        }

        // Quiz pattern
        if (block.items.some(item => hasPattern(item, 'question') || hasPattern(item, 'true') || hasPattern(item, 'false'))) {
          const questions: { question: string; options: string[] }[] = []
          let currentQuestion: { question: string; options: string[] } | null = null
          
          block.items.forEach(item => {
            if (hasPattern(item, 'question')) {
              if (currentQuestion) questions.push(currentQuestion)
              currentQuestion = { question: item.replace(/^question\s*\d*[:.]?\s*/i, ''), options: [] }
            } else if (currentQuestion && ['true', 'false', "don't know", 'yes', 'no'].some(opt => 
              hasPattern(item, opt)
            )) {
              currentQuestion.options.push(item)
            }
          })
          if (currentQuestion) questions.push(currentQuestion)

          if (questions.length > 0) {
            elements.push(
              <QuizComponent
                key={`quiz-${i}`}
                questions={questions}
                moduleSlug={moduleSlug}
                pageSlug={pageSlug || 'quiz'}
                moduleName={moduleSlug}
              />
            )
            i++
            continue
          }
        }

        // Video activity pattern
        if (block.items.some(item => 
          hasPattern(item, 'identify') || hasPattern(item, 'validate') || hasPattern(item, 'understand')
        )) {
          const questions = block.items
            .filter(item => !['identify', 'validate', 'understand'].some(opt => 
              item.toLowerCase().trim() === opt
            ))
            .map((item, idx) => ({
              question: item,
              options: ['Identify', 'Validate', 'Understand']
            }))

          if (questions.length > 0) {
            elements.push(
              <VideoActivity
                key={`activity-${i}`}
                questions={questions}
                moduleSlug={moduleSlug}
                pageSlug={pageSlug || 'activity'}
              />
            )
            i++
            continue
          }
        }

        // Attractive cards for special content
        if (block.items.some(item => hasPattern(item, 'encouragement') || hasPattern(item, 'praise'))) {
          elements.push(
            <div key={i} className="grid gap-3">
              {block.items.map((item, idx) => {
                let type: 'encouragement' | 'acknowledgement' | 'affection' | 'appreciation' | 'default' = 'default'
                if (hasPattern(item, 'encouragement') || hasPattern(item, 'praise')) type = 'encouragement'
                else if (hasPattern(item, 'acknowledgement')) type = 'acknowledgement'
                else if (hasPattern(item, 'affection')) type = 'affection'
                else if (hasPattern(item, 'appreciation')) type = 'appreciation'
                
                return <AttractiveCard key={idx} text={item} type={type} />
              })}
            </div>
          )
        } else {
          elements.push(
            <ul key={i} className="list-disc pl-6 mb-6 space-y-2">
              {block.items.map((item, idx) => (
                <li key={idx} className="text-gray-700">{item}</li>
              ))}
            </ul>
          )
        }
        i++
        continue
      }

      if (block.type === 'image') {
        // Image grid pattern
        const gridImages: { src: string; alt: string }[] = []
        let j = i
        while (j < content.length && content[j].type === 'image' && 
               content[j].src?.match(/Note-\d+\.svg/)) {
          gridImages.push({ src: content[j].src!, alt: content[j].alt || '' })
          j++
        }
        
        if (gridImages.length > 1) {
          elements.push(<ImageGrid key={`grid-${i}`} images={gridImages} moduleSlug={moduleSlug} />)
          i = j
          continue
        }

        // Smaller centered images for three-strategies
        if (block.src?.includes('2-01') || block.src?.includes('2-02') || block.src?.includes('2-03')) {
          elements.push(
            <div key={i} className="my-6 flex justify-center">
              <img
                src={`${API_URL}/content/${moduleSlug.replace('m', 'module_').replace(/-/g, '_')}/images/${block.src}?lang=${language}`}
                alt={block.alt || ''}
                className="max-w-xs h-auto rounded-lg shadow-md"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          )
        } else {
          elements.push(
            <div key={i} className="my-6">
              <img
                src={`${API_URL}/content/${moduleSlug.replace('m', 'module_').replace(/-/g, '_')}/images/${block.src}?lang=${language}`}
                alt={block.alt || ''}
                className="max-w-full h-auto rounded-lg shadow-md mx-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          )
        }
        i++
        continue
      }

      if (block.type === 'video') {
        elements.push(<VideoEmbed key={i} url={block.src} />)
        i++
        continue
      }

      if (block.type === 'audio') {
        elements.push(
          <div key={i} className="my-6 p-4 bg-gray-100 rounded-lg flex items-center gap-3">
            <div className="w-6 h-6 text-teal-600 flex items-center justify-center">🔊</div>
            <div>
              <p className="font-medium text-gray-800">Audio</p>
              <a href={block.src} target="_blank" rel="noopener noreferrer" className="text-sm text-teal-600 hover:underline">
                {block.src}
              </a>
            </div>
          </div>
        )
        i++
        continue
      }

      if (block.type === 'quote') {
        elements.push(
          <blockquote key={i} className="border-l-4 border-teal-500 pl-4 italic text-gray-600 my-6">
            <p className="text-lg">{block.text}</p>
            {block.author && (
              <cite className="block mt-2 text-sm text-gray-500 not-italic">— {block.author}</cite>
            )}
          </blockquote>
        )
        i++
        continue
      }

      if (block.type === 'table') {
        elements.push(
          <div key={i} className="my-6 overflow-x-auto">
            <table className="min-w-full border-collapse">
              <tbody>
                {block.rows.map((row, ri) => (
                  <tr key={ri} className="border-b border-gray-200">
                    {row.map((cell, ci) => (
                      <td key={ci} className="py-2 px-4 text-gray-700">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
        i++
        continue
      }

      i++
    }

    return elements
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {renderContent()}
      </div>
    </div>
  )
}
