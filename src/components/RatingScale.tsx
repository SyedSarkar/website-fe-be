import { useState } from 'react'

interface RatingScaleProps {
  min?: number
  max?: number
  step?: number
  labels?: string[]
  onChange?: (value: number) => void
  className?: string
}

export default function RatingScale({ 
  min = 1, 
  max = 10, 
  step = 1, 
  labels = [],
  onChange,
  className = ''
}: RatingScaleProps) {
  const [value, setValue] = useState<number | null>(null)

  const steps = Math.floor((max - min) / step) + 1
  const values = Array.from({ length: steps }, (_, i) => min + i * step)

  const handleValueChange = (newValue: number) => {
    setValue(newValue)
    onChange?.(newValue)
  }

  const getLabel = (val: number) => {
    const index = Math.floor(((val - min) / (max - min)) * (labels.length - 1))
    return labels[index] || ''
  }

  return (
    <div className={`w-full py-4 ${className}`}>
      {/* Scale */}
      <div className="relative h-2 bg-gray-200 rounded-full mb-6">
        <div 
          className="absolute h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-full"
          style={{ width: value !== null ? `${((value - min) / (max - min)) * 100}%` : '0%' }}
        />
        {values.map((val, index) => (
          <button
            key={val}
            onClick={() => handleValueChange(val)}
            onMouseDown={() => {}}
            className={`absolute w-4 h-4 rounded-full border-2 bg-white transition-all ${
              value === val 
                ? 'border-blue-500 scale-125' 
                : 'border-gray-400 hover:border-gray-600'
            }`}
            style={{ left: `${(index / (values.length - 1)) * 100}%`, transform: 'translateX(-50%)' }}
          />
        ))}
        {value !== null && (
          <div 
            className="absolute -top-8 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded"
            style={{ left: `${((value - min) / (max - min)) * 100}%` }}
          >
            {value}
          </div>
        )}
      </div>

      {/* Labels */}
      {labels.length > 0 && (
        <div className="flex justify-between text-xs text-gray-600 mb-2">
          {labels.map((label, index) => (
            <span key={index} className="text-center max-w-[60px]">
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Current value display */}
      {value !== null && (
        <div className="text-center text-sm text-gray-700">
          Selected: <span className="font-semibold">{value}</span>
          {getLabel(value) && (
            <span className="ml-2 text-gray-500">({getLabel(value)})</span>
          )}
        </div>
      )}
    </div>
  )
}
