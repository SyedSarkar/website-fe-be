import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown, ChevronRight, X, BookOpen, Check } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import LanguageSwitcher from './LanguageSwitcher'
import api from '../lib/api'
import type { Module } from '../types'

interface SidebarProps {
  modules: Module[]
  onClose: () => void
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

export default function Sidebar({ modules, onClose }: SidebarProps) {
  const location = useLocation()
  const { user } = useAuth()
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    () => new Set([modules[0]?.slug])
  )
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>([])

  // Don't show module navigation for admin users
  if (user?.role === 'admin') {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-teal-600" />
            <h1 className="font-bold text-lg text-teal-800">Partners in Parenting</h1>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Admin users don't need to access course modules.</p>
            <Link
              to="/admin"
              className="text-teal-600 hover:text-teal-700 font-medium"
              onClick={onClose}
            >
              Go to Admin Dashboard
            </Link>
          </div>
        </div>
        <div className="p-4 border-t border-gray-200 text-xs text-gray-500">
          <p>Partners in Parenting</p>
          <p>Supporting families together</p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (!user) return
    
    // Load progress from backend (user-specific) instead of localStorage
    const fetchProgress = async () => {
      try {
        const response = await api.get('/modules/my-progress')
        
        if (response.data) {
          console.log('Sidebar progress data:', response.data)
          const progressData = response.data.data || []
          setModuleProgress(Array.isArray(progressData) ? progressData : [])
        } else {
          console.log('Sidebar progress fetch failed:', response.status)
          setModuleProgress([])
        }
      } catch (error) {
        console.log('Failed to fetch module progress:', error)
        setModuleProgress([])
      }
    }
    
    fetchProgress()
    // Refresh progress every 30 seconds
    const interval = setInterval(fetchProgress, 30000)
    return () => clearInterval(interval)
  }, [user, location.pathname])

  const getFilename = (pageSlug: string) => {
    // Simply return the slug with .txt extension
    return `${pageSlug}.txt`
  }

  const toggleModule = (slug: string) => {
    const newSet = new Set(expandedModules)
    if (newSet.has(slug)) {
      newSet.delete(slug)
    } else {
      newSet.add(slug)
    }
    setExpandedModules(newSet)
  }

  const isActive = (moduleSlug: string, pageSlug: string) => {
    return location.pathname.includes(`/module/${moduleSlug}/${pageSlug}`)
  }

  const isPageCompleted = (moduleSlug: string, pageSlug: string) => {
    const progress = moduleProgress.find(p => p.moduleSlug === moduleSlug)
    return progress?.completedPages.includes(pageSlug) || false
  }

  const getModuleProgress = (moduleSlug: string) => {
    const progress = moduleProgress.find(p => p.moduleSlug === moduleSlug)
    const module = modules.find(m => m.slug === moduleSlug)
    if (!progress || !module) return 0
    const percentage = Math.round((progress.completedPages.length / module.pages.length) * 100)
    return isNaN(percentage) ? 0 : Math.min(percentage, 100) // Cap at 100%
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-teal-600" />
          <h1 className="font-bold text-lg text-teal-800">Partners in Parenting</h1>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        {modules.map((module) => (
          <div key={module.slug} className="mb-1">
            <button
              onClick={() => toggleModule(module.slug)}
              className="w-full flex items-center justify-between p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-gray-800">{module.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-teal-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${getModuleProgress(module.slug)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {getModuleProgress(module.slug)}%
                  </span>
                </div>
              </div>
              {expandedModules.has(module.slug) ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {expandedModules.has(module.slug) && (
              <ul className="space-y-1">
                {module.pages.map((page, index) => (
                  <li key={page.slug}>
                    <Link
                      to={`/module/${module.slug}/${page.slug}`}
                      onClick={onClose}
                      className={`px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2 ${
                        isActive(module.slug, page.slug)
                          ? 'bg-teal-100 text-teal-800 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {isPageCompleted(module.slug, page.slug) && (
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      )}
                      <span className="inline-block w-6 text-left font-medium">
                        {index + 1}.
                      </span>{' '}
                      <span className="flex-1">{getFilename(page.slug)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 text-xs text-gray-500">
        <p>Partners in Parenting</p>
        <p>Supporting families together</p>
      </div>
    </div>
  )
}
