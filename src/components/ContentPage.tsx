import { useParams, Link, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import axios from 'axios'
import HomePage from './pages/HomePage'
import QuizPage from './pages/QuizPage'
import ScalePage from './pages/ScalePage'
import ModulePage from './pages/ModulePage'
import ScaleGate from './ScaleGate'
import type { Module, ContentBlock } from '../types'

interface ContentPageProps {
  modules: Module[]
}

interface ModuleProgress {
  moduleSlug: string
  moduleName: string
  currentPage: number
  totalPages: number
  completedPages: string[]
  lastAccessed: string
  isCompleted: boolean
  timeSpent: number
}

// Helper function to determine page type
function getPageType(slug: string, content: ContentBlock[]): 'home' | 'quiz' | 'scale' | 'default' {
  if (slug.includes('home') || slug.includes('00-home')) return 'home'
  if (slug.includes('quiz')) return 'quiz'
  if (content.some(block => 
    block.type === 'paragraph' && 
    block.text.toLowerCase().includes('scale')
  )) return 'scale'
  return 'default'
}

export default function ContentPage({ modules }: ContentPageProps) {
  const { moduleSlug, pageSlug } = useParams<{ moduleSlug: string; pageSlug: string }>()
  const { user } = useAuth()

  const currentModule = modules.find(m => m.slug === moduleSlug)
  const currentPage = currentModule?.pages.find(p => p.slug === pageSlug)

  if (!currentModule || !currentPage) {
    return <Navigate to="/" replace />
  }

  // Progress tracking with time tracking
  useEffect(() => {
    if (!user) return

    // Mark current page as completed when user visits it
    const savedProgress = localStorage.getItem('moduleProgress')
    let progress: ModuleProgress[] = savedProgress ? JSON.parse(savedProgress) : []
    
    // Find or create progress for this module
    let moduleProgress = progress.find(p => p.moduleSlug === moduleSlug)
    if (!moduleProgress) {
      moduleProgress = {
        moduleSlug: moduleSlug!,
        moduleName: currentModule.name,
        currentPage: 0,
        totalPages: currentModule.pages.length,
        completedPages: [],
        lastAccessed: new Date().toISOString(),
        isCompleted: false,
        timeSpent: 0
      }
      progress.push(moduleProgress)
    }

    // Track time spent on this page
    const pageStartTime = Date.now()
    const currentPageSlug = pageSlug!

    // Mark current page as completed if not already marked
    if (!moduleProgress.completedPages.includes(currentPageSlug)) {
      moduleProgress.completedPages.push(currentPageSlug)
      moduleProgress.currentPage = currentModule.pages.findIndex(p => p.slug === currentPageSlug)
      moduleProgress.lastAccessed = new Date().toISOString()
      moduleProgress.isCompleted = moduleProgress.completedPages.length === currentModule.pages.length
      
      // Save updated progress to localStorage
      localStorage.setItem('moduleProgress', JSON.stringify(progress))

      // Enroll user in module and sync progress with backend
      enrollAndUpdateProgress(moduleProgress)
    }

    // Cleanup function to track time spent
    return () => {
      const timeSpent = Math.round((Date.now() - pageStartTime) / 1000 / 60) // Convert to minutes
      if (timeSpent > 0) {
        // Update time spent for this module
        const updatedProgress = progress.find(p => p.moduleSlug === moduleSlug)
        if (updatedProgress) {
          updatedProgress.timeSpent += timeSpent
          localStorage.setItem('moduleProgress', JSON.stringify(progress))
          
          // Sync time spent to backend
          updateTimeSpent(moduleSlug!, timeSpent)
        }
      }
    }
  }, [moduleSlug, pageSlug, currentModule, currentPage, user])

  // Function to update time spent on backend
  const updateTimeSpent = async (moduleSlug: string, additionalTime: number) => {
    try {
      const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api'
      
      await axios.post(`${API_BASE_URL}/modules/time-spent`, {
        moduleSlug,
        additionalTime
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      console.error('❌ Failed to update time spent:', error);
    }
  }

  // Function to enroll user and update progress
  const enrollAndUpdateProgress = async (progressData: ModuleProgress) => {
    try {
      const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api'
      
      console.log('🔄 Attempting to enroll user:', progressData.moduleSlug)
      
      // First, try to enroll user
      try {
        const enrollResponse = await axios.post(`${API_BASE_URL}/modules/enroll`, {
          moduleSlug: progressData.moduleSlug,
          moduleName: progressData.moduleName,
          totalPages: progressData.totalPages
        }, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        console.log('✅ Enrollment response:', enrollResponse.data);
      } catch (enrollError: any) {
        // If already enrolled, that's fine - continue with progress update
        if (enrollError.response?.status !== 400) {
          throw enrollError;
        } else {
          console.log('ℹ️ User already enrolled, continuing with progress update');
        }
      }

      // Then update progress
      const progressResponse = await axios.post(`${API_BASE_URL}/modules/progress`, {
        moduleSlug: progressData.moduleSlug,
        moduleName: progressData.moduleName,
        currentPage: progressData.currentPage,
        totalPages: progressData.totalPages,
        completedPages: progressData.completedPages,
        timeSpent: progressData.timeSpent
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('✅ Progress update response:', progressResponse.data);
    } catch (error) {
      console.error('❌ Failed to enroll/update progress:', error);
      // Continue silently - localStorage is the primary source
    }
  }

  // Find prev/next pages
  const allPages = modules.flatMap(m => m.pages)
  const currentIndex = allPages.findIndex(
    p => p.moduleSlug === moduleSlug && p.slug === pageSlug
  )
  const prevPage = currentIndex > 0 ? allPages[currentIndex - 1] : null
  const nextPage = currentIndex < allPages.length - 1 ? allPages[currentIndex + 1] : null

  // Determine page type and use appropriate layout
  const pageType = getPageType(currentPage.slug, currentPage.content)
  
  const renderContent = () => {
    switch (pageType) {
      case 'home':
        return <HomePage content={currentPage.content} moduleSlug={moduleSlug!} />
      case 'quiz':
        return <QuizPage content={currentPage.content} />
      case 'scale':
        return <ScalePage content={currentPage.content} />
      default:
        return <ModulePage content={currentPage.content} moduleSlug={moduleSlug!} />
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="px-4 py-3 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Link to="/" className="hover:text-teal-600">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-teal-700 font-medium">{currentModule.name}</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-800">{currentPage.title}</span>
        </div>
      </nav>

      {/* Content */}
      <ScaleGate moduleSlug={moduleSlug!}>
        <article className="bg-white shadow-sm rounded-lg p-6 md:p-8 mb-6">
          {renderContent()}
        </article>
      </ScaleGate>

      {/* Navigation */}
      <div className="px-4 pb-8 flex items-center justify-between">
        {prevPage ? (
          <Link
            to={`/module/${prevPage.moduleSlug}/${prevPage.slug}`}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-md shadow-sm hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">{prevPage.title}</span>
          </Link>
        ) : (
          <div />
        )}

        {nextPage ? (
          <Link
            to={`/module/${nextPage.moduleSlug}/${nextPage.slug}`}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md shadow-sm hover:bg-teal-700 transition-colors"
          >
            <span className="text-sm font-medium">{nextPage.title}</span>
            <ChevronRight className="w-5 h-5" />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  )
}

