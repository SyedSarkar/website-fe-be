import { useState, useEffect } from 'react'

interface ScaleRequirement {
  scaleId: string
  name: string
  requiredForModule: string
}

const scaleRequirements: ScaleRequirement[] = [
  {
    scaleId: 'child-mental-health',
    name: "Child's Mental Health Scale",
    requiredForModule: 'all' // This scale is required before accessing any modules
  }
]

export function useScaleCompletion() {
  const [completedScales, setCompletedScales] = useState<string[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('completedScales')
    if (stored) {
      setCompletedScales(JSON.parse(stored))
    }
  }, [])

  const isScaleCompleted = (scaleId: string): boolean => {
    return completedScales.includes(scaleId)
  }

  const markScaleCompleted = (scaleId: string) => {
    const updated = [...completedScales, scaleId]
    setCompletedScales(updated)
    localStorage.setItem('completedScales', JSON.stringify(updated))
  }

  const canAccessModule = (moduleSlug: string): boolean => {
    // Check if any required scales need to be completed before accessing this module
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

  return {
    completedScales,
    isScaleCompleted,
    markScaleCompleted,
    canAccessModule,
    getRequiredScales,
    getPendingScales,
    scaleRequirements
  }
}
