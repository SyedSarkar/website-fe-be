import { useState, useEffect, useCallback } from 'react'
import api from '../lib/api'

interface ScaleRequirement {
  scaleId: string
  name: string
  requiredForModule: string
}

const scaleRequirements: ScaleRequirement[] = [
  {
    scaleId: 'child-mental-health',
    name: "Child's Mental Health Scale",
    requiredForModule: 'all'
  },
  {
    scaleId: 'parental-self-efficacy',
    name: 'Parental Self Efficacy Scale',
    requiredForModule: 'all'
  },
  {
    scaleId: 'parent-child-relationship',
    name: 'Parent-Child Relationship Scale',
    requiredForModule: 'all'
  },
  {
    scaleId: 'parental-mental-wellbeing',
    name: 'Parental Mental Wellbeing Scale',
    requiredForModule: 'all'
  }
]

export function useScaleCompletion() {
  const [completedScales, setCompletedScales] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch user's completed scales from backend
  const fetchCompletedScales = useCallback(async () => {
    try {
      const response = await api.get('/scales/my-responses')
      const responses = response.data.data || []
      // Extract unique scaleIds that user has completed
      const completed = responses.map((r: any) => r.scaleId)
      setCompletedScales(completed)
    } catch (error) {
      console.error('Failed to fetch scale responses:', error)
      setCompletedScales([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCompletedScales()
  }, [fetchCompletedScales])

  const isScaleCompleted = (scaleId: string): boolean => {
    return completedScales.includes(scaleId)
  }

  const markScaleCompleted = async (_scaleId: string) => {
    // Refresh from backend to ensure we have latest data
    await fetchCompletedScales()
  }

  const canAccessModule = (moduleSlug: string): boolean => {
    const requiredScales = scaleRequirements.filter(
      req => req.requiredForModule === moduleSlug || req.requiredForModule === 'all'
    )
    return requiredScales.every(req => isScaleCompleted(req.scaleId))
  }

  const getRequiredScales = (moduleSlug: string): ScaleRequirement[] => {
    return scaleRequirements.filter(
      req => req.requiredForModule === moduleSlug || req.requiredForModule === 'all'
    )
  }

  const getPendingScales = (moduleSlug: string): ScaleRequirement[] => {
    return getRequiredScales(moduleSlug).filter(req => !isScaleCompleted(req.scaleId))
  }

  const allScalesCompleted = (): boolean => {
    return scaleRequirements.every(req => isScaleCompleted(req.scaleId))
  }

  return {
    completedScales,
    isScaleCompleted,
    markScaleCompleted,
    canAccessModule,
    getRequiredScales,
    getPendingScales,
    scaleRequirements,
    allScalesCompleted,
    loading,
    refresh: fetchCompletedScales
  }
}
