'use client'

import { useState, useEffect } from 'react'
import { Activity, TrendingUp, AlertTriangle, MapPin, Clock } from 'lucide-react'
import { useSocket } from './SocketProvider'

interface TrafficData {
  location: string
  level: 'low' | 'medium' | 'high' | 'severe'
  speed: number
  delay: number
  trend: 'improving' | 'stable' | 'worsening'
  lastUpdated: string
}

interface TrafficPrediction {
  time: string
  level: 'low' | 'medium' | 'high' | 'severe'
  confidence: number
}

export function TrafficPanel() {
  const { socket } = useSocket()
  const [trafficData, setTrafficData] = useState<TrafficData[]>([])
  const [predictions, setPredictions] = useState<TrafficPrediction[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (socket) {
      socket.on('traffic_update', (data: TrafficData[]) => {
        setTrafficData(data)
      })

      socket.on('traffic_prediction', (data: TrafficPrediction[]) => {
        setPredictions(data)
      })

      return () => {
        socket.off('traffic_update')
        socket.off('traffic_prediction')
      }
    }
  }, [socket])

  // Load initial traffic data
  useEffect(() => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      const mockData: TrafficData[] = [
        {
          location: 'I-95 North',
          level: 'high',
          speed: 25,
          delay: 12,
          trend: 'worsening',
          lastUpdated: '2 min ago'
        },
        {
          location: 'Highway 101',
          level: 'medium',
          speed: 45,
          delay: 5,
          trend: 'stable',
          lastUpdated: '1 min ago'
        },
        {
          location: 'Main Street',
          level: 'low',
          speed: 55,
          delay: 0,
          trend: 'improving',
          lastUpdated: '30 sec ago'
        },
        {
          location: 'Bridge Avenue',
          level: 'severe',
          speed: 15,
          delay: 20,
          trend: 'worsening',
          lastUpdated: '3 min ago'
        }
      ]
      
      const mockPredictions: TrafficPrediction[] = [
        { time: '15 min', level: 'high', confidence: 85 },
        { time: '30 min', level: 'medium', confidence: 72 },
        { time: '45 min', level: 'low', confidence: 68 },
        { time: '1 hour', level: 'low', confidence: 90 }
      ]
      
      setTrafficData(mockData)
      setPredictions(mockPredictions)
      setIsLoading(false)
    }, 1500)
  }, [])

  const getTrafficColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'severe': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'stable': return <Activity className="w-4 h-4 text-blue-500" />
      case 'worsening': return <AlertTriangle className="w-4 h-4 text-red-500" />
      default: return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Traffic Analysis
        </h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900 dark:text-blue-100">Current Status</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">Moderate</p>
            <p className="text-sm text-blue-700 dark:text-blue-300">Traffic conditions</p>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-900 dark:text-green-100">Avg Speed</span>
            </div>
            <p className="text-2xl font-bold text-green-600">42 km/h</p>
            <p className="text-sm text-green-700 dark:text-green-300">City average</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Current Traffic Conditions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Current Conditions
              </h3>
              <div className="space-y-3">
                {trafficData.map((traffic, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedLocation === traffic.location
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedLocation(traffic.location)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {traffic.location}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTrafficColor(traffic.level)}`}>
                        {traffic.level}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Speed:</span>
                        <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">
                          {traffic.speed} km/h
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Delay:</span>
                        <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">
                          {traffic.delay} min
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(traffic.trend)}
                        <span className="text-gray-500 dark:text-gray-400 capitalize">
                          {traffic.trend}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Updated {traffic.lastUpdated}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Predictions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                AI Predictions
              </h3>
              <div className="space-y-3">
                {predictions.map((prediction, index) => (
                  <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {prediction.time}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTrafficColor(prediction.level)}`}>
                        {prediction.level}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${prediction.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {prediction.confidence}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
