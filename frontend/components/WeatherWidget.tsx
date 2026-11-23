'use client'

import { useState, useEffect } from 'react'
import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets, Eye } from 'lucide-react'

interface WeatherData {
  temperature: number
  condition: string
  humidity: number
  wind_speed: number
  visibility: number
  location: string
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate weather data loading
    const timer = setTimeout(() => {
      setWeather({
        temperature: 22,
        condition: 'sunny',
        humidity: 65,
        wind_speed: 10,
        visibility: 10,
        location: 'New York, NY'
      })
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="w-6 h-6 text-yellow-500" />
      case 'cloudy': return <Cloud className="w-6 h-6 text-gray-500" />
      case 'rainy': return <CloudRain className="w-6 h-6 text-blue-500" />
      case 'snowy': return <CloudSnow className="w-6 h-6 text-blue-300" />
      default: return <Sun className="w-6 h-6 text-yellow-500" />
    }
  }

  const getWeatherColor = (condition: string) => {
    switch (condition) {
      case 'sunny': return 'bg-gradient-to-r from-yellow-400 to-orange-400'
      case 'cloudy': return 'bg-gradient-to-r from-gray-400 to-gray-500'
      case 'rainy': return 'bg-gradient-to-r from-blue-400 to-blue-600'
      case 'snowy': return 'bg-gradient-to-r from-blue-200 to-blue-400'
      default: return 'bg-gradient-to-r from-yellow-400 to-orange-400'
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!weather) return null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className={`p-4 text-white ${getWeatherColor(weather.condition)}`}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">{weather.location}</h3>
          {getWeatherIcon(weather.condition)}
        </div>
        <div className="text-3xl font-bold">{weather.temperature}°C</div>
        <div className="text-sm opacity-90 capitalize">{weather.condition}</div>
      </div>
      
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Droplets className="w-4 h-4 text-blue-500" />
            <span className="text-gray-600 dark:text-gray-400">Humidity</span>
          </div>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {weather.humidity}%
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Wind className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600 dark:text-gray-400">Wind</span>
          </div>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {weather.wind_speed} km/h
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <Eye className="w-4 h-4 text-green-500" />
            <span className="text-gray-600 dark:text-gray-400">Visibility</span>
          </div>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {weather.visibility} km
          </span>
        </div>
      </div>
    </div>
  )
}
