import { useState, useEffect } from 'react'

interface ProgressData {
  date: string
  score: number
  assessmentType: string
  riskLevel: 'Low Risk' | 'Moderate Risk' | 'High Risk'
}

interface ProgressTrackerProps {
  userId?: string
  timeRange: 'week' | 'month' | 'quarter' | 'year'
  className?: string
}

export default function ProgressTracker({ 
  userId, 
  timeRange = 'month',
  className = '' 
}: ProgressTrackerProps) {
  const [progressData, setProgressData] = useState<ProgressData[]>([])
  const [loading, setLoading] = useState(true)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    fetchProgressData()
  }, [userId, timeRange])

  const fetchProgressData = async () => {
    try {
      setLoading(true)
      // This would be replaced with actual API call
      // const response = await axios.get(`/api/progress/${userId}?range=${timeRange}`)
      
      // Mock data for demonstration
      const mockData: ProgressData[] = [
        { date: '2024-01-15', score: 18, assessmentType: 'Child Mental Health', riskLevel: 'Low Risk' },
        { date: '2024-01-22', score: 22, assessmentType: 'Parenting Stress', riskLevel: 'Moderate Risk' },
        { date: '2024-02-05', score: 15, assessmentType: 'Child Mental Health', riskLevel: 'Low Risk' },
        { date: '2024-02-20', score: 28, assessmentType: 'Anxiety Assessment', riskLevel: 'High Risk' },
        { date: '2024-03-10', score: 20, assessmentType: 'Child Mental Health', riskLevel: 'Moderate Risk' },
      ]
      
      setProgressData(mockData)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch progress data:', error)
      setLoading(false)
    }
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'Low Risk': return 'bg-green-100 text-green-800 border-green-200'
      case 'Moderate Risk': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'High Risk': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTrendIndicator = (current: number, previous: number) => {
    if (current < previous) {
      return { icon: '↓', color: 'text-green-600', label: 'Improving' }
    } else if (current > previous) {
      return { icon: '↑', color: 'text-red-600', label: 'Needs Attention' }
    }
    return { icon: '→', color: 'text-gray-600', label: 'Stable' }
  }

  const calculateAverageScore = () => {
    if (progressData.length === 0) return 0
    return Math.round(progressData.reduce((sum, data) => sum + data.score, 0) / progressData.length)
  }

  const getLatestScore = () => {
    return progressData.length > 0 ? progressData[progressData.length - 1].score : 0
  }

  const getPreviousScore = () => {
    return progressData.length > 1 ? progressData[progressData.length - 2].score : 0
  }

  const trend = getTrendIndicator(getLatestScore(), getPreviousScore())

  if (loading) {
    return (
      <div className={`bg-white rounded-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Progress Tracking</h3>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-teal-600 hover:text-teal-700 text-sm font-medium"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 mb-1">{getLatestScore()}</div>
            <div className="text-sm text-gray-600">Latest Score</div>
            <div className={`text-xs font-medium mt-1 ${trend.color}`}>
              {trend.icon} {trend.label}
            </div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 mb-1">{calculateAverageScore()}</div>
            <div className="text-sm text-gray-600">Average Score</div>
            <div className="text-xs text-gray-500 mt-1">Over {progressData.length} assessments</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 mb-1">{progressData.length}</div>
            <div className="text-sm text-gray-600">Total Assessments</div>
            <div className="text-xs text-gray-500 mt-1">Last {timeRange}</div>
          </div>
        </div>

        {/* Progress Visualization */}
        <div className="mb-6">
          <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-gray-500">Progress chart visualization</p>
              <p className="text-xs text-gray-400 mt-1">Chart integration would go here</p>
            </div>
          </div>
        </div>

        {/* Recent Assessments */}
        {showDetails && (
          <div className="border-t pt-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">Recent Assessments</h4>
            <div className="space-y-2">
              {progressData.slice(-5).reverse().map((data, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-gray-900">{data.assessmentType}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRiskLevelColor(data.riskLevel)}`}>
                        {data.riskLevel}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {new Date(data.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-teal-600">{data.score}</div>
                    <div className="text-xs text-gray-500">Score</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
