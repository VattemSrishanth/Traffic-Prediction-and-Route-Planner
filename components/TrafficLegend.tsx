'use client'

import { Activity, AlertTriangle, Clock, MapPin } from 'lucide-react'

interface TrafficLegendProps {
  className?: string
}

export function TrafficLegend({ className = '' }: TrafficLegendProps) {
  const trafficLevels = [
    {
      level: 'low',
      label: 'Smooth',
      color: '#10b981',
      speed: '50+ km/h',
      description: 'Free flowing traffic'
    },
    {
      level: 'medium',
      label: 'Moderate',
      color: '#f59e0b',
      speed: '30-50 km/h',
      description: 'Some congestion'
    },
    {
      level: 'high',
      label: 'Heavy',
      color: '#ef4444',
      speed: '15-30 km/h',
      description: 'Significant delays'
    },
    {
      level: 'severe',
      label: 'Severe',
      color: '#dc2626',
      speed: '<15 km/h',
      description: 'Major congestion'
    }
  ]

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
      <div className="flex items-center space-x-2 mb-3">
        <Activity className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Traffic Legend</h3>
      </div>
      
      <div className="space-y-2">
        {trafficLevels.map((traffic) => (
          <div key={traffic.level} className="flex items-center space-x-3">
            <div
              className="w-4 h-4 rounded-full shadow-sm"
              style={{ backgroundColor: traffic.color }}
            ></div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {traffic.label}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {traffic.speed}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {traffic.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Clock className="w-4 h-4" />
          <span>Updated every 30 seconds</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
          <MapPin className="w-4 h-4" />
          <span>Real-time data</span>
        </div>
      </div>
    </div>
  )
}
