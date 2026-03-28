import { useScaleCompletion } from '../hooks/useScaleCompletion'
import { Link } from 'react-router-dom'

interface ScaleGateProps {
  moduleSlug: string
  children: React.ReactNode
}

export default function ScaleGate({ moduleSlug, children }: ScaleGateProps) {
  const { canAccessModule, getPendingScales, loading } = useScaleCompletion()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  if (canAccessModule(moduleSlug)) {
    return <>{children}</>
  }

  const pendingScales = getPendingScales(moduleSlug)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Assessment Required</h2>
          <p className="text-gray-600 mb-6">
            Before accessing this module, you need to complete the following assessment(s):
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {pendingScales.map((scale) => (
            <div key={scale.scaleId} className="bg-white rounded-lg p-4 border border-yellow-200">
              <h3 className="font-semibold text-gray-800 mb-2">{scale.name}</h3>
              <p className="text-sm text-gray-600 mb-3">
                This assessment helps us understand your current situation and provide personalized content.
              </p>
              <Link
                to="/dashboard"
                className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
              >
                Go to Assessments
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ))}
        </div>

        <div className="text-sm text-gray-500">
          <p>Once completed, you'll have full access to all modules and content.</p>
        </div>
      </div>
    </div>
  )
}
