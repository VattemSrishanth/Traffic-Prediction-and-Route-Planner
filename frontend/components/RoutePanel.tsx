'use client'

import { useState, useEffect } from 'react'
import { Search, MapPin, Navigation, Clock, Route } from 'lucide-react'
import { useSocket } from './SocketProvider'
import { debounce } from '@/lib/utils'
import { getRoutes } from '@/lib/api'

interface RouteData {
  id: string
  name: string
  distance: number
  duration: number
  trafficLevel: 'low' | 'medium' | 'high'
  color: string
  coordinates: [number, number][]
}

type GeoSuggestion = {
  display_name: string
  lat: string
  lon: string
}

export function RoutePanel() {
  const { socket } = useSocket()
  const [startLocation, setStartLocation] = useState('')
  const [endLocation, setEndLocation] = useState('')
  const [startCoord, setStartCoord] = useState<{lat:number,lng:number}|null>(null)
  const [endCoord, setEndCoord] = useState<{lat:number,lng:number}|null>(null)
  const [routes, setRoutes] = useState<RouteData[]>([])
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [suggestionsStart, setSuggestionsStart] = useState<GeoSuggestion[]>([])
  const [suggestionsEnd, setSuggestionsEnd] = useState<GeoSuggestion[]>([])

  const handleSearch = async () => {
    if (!startCoord || !endCoord) {
      // If user typed but didn't pick suggestion, try geocoding the exact text
      if (!startCoord && startLocation) {
        const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(startLocation)}&limit=1`)
        const arr = await resp.json()
        if (arr?.[0]) setStartCoord({ lat: parseFloat(arr[0].lat), lng: parseFloat(arr[0].lon) })
      }
      if (!endCoord && endLocation) {
        const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endLocation)}&limit=1`)
        const arr = await resp.json()
        if (arr?.[0]) setEndCoord({ lat: parseFloat(arr[0].lat), lng: parseFloat(arr[0].lon) })
      }
    }
    if (!startCoord || !endCoord) return
    setIsLoading(true)
    try {
      const res = await getRoutes({
        start: { lat: startCoord.lat, lng: startCoord.lng, name: startLocation },
        end: { lat: endCoord.lat, lng: endCoord.lng, name: endLocation },
      })
      // Map backend payload (traffic_level -> trafficLevel)
      const mapped: RouteData[] = res.routes.map((r: any) => ({
        id: r.id,
        name: r.name,
        distance: r.distance,
        duration: r.duration,
        trafficLevel: (r.trafficLevel || r.traffic_level) as 'low'|'medium'|'high',
        color: r.color,
        coordinates: r.coordinates,
      }))
      setRoutes(mapped)
      // Notify map to draw routes
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('routes_update', { detail: mapped }))
        window.dispatchEvent(new CustomEvent('route_markers_update', { detail: { start: startCoord, end: endCoord } }))
      }
    } catch (e) {
      console.error('Failed to fetch routes', e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRouteSelect = (routeId: string) => {
    setSelectedRoute(routeId)
    if (socket) {
      const route = routes.find(r => r.id === routeId)
      if (route) {
        socket.emit('select_route', route)
      }
    }
    // Center map on route
    if (typeof window !== 'undefined') {
      const route = routes.find(r => r.id === routeId)
      if (route) window.dispatchEvent(new CustomEvent('routes_update', { detail: [route] }))
    }
  }

  const getTrafficColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  // Nominatim geocoding
  const searchNominatim = async (q: string, setter: (v: GeoSuggestion[])=>void) => {
    if (!q || q.length < 3) { setter([]); return }
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5` , {
        headers: { 'Accept-Language': 'en' }
      })
      const data = await resp.json()
      setter(data as GeoSuggestion[])
    } catch {
      setter([])
    }
  }

  const debouncedStart = debounce((q:string)=>searchNominatim(q, setSuggestionsStart), 350)
  const debouncedEnd = debounce((q:string)=>searchNominatim(q, setSuggestionsEnd), 350)

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Route Planning
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              From
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={startLocation}
                onChange={(e) => { setStartLocation(e.target.value); debouncedStart(e.target.value) }}
                placeholder="Enter starting point"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              {suggestionsStart.length > 0 && (
                <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {suggestionsStart.map((s) => (
                    <button
                      type="button"
                      key={`${s.lat},${s.lon}`}
                      onClick={() => {
                        setStartLocation(s.display_name)
                        setStartCoord({ lat: parseFloat(s.lat), lng: parseFloat(s.lon) })
                        setSuggestionsStart([])
                      }}
                      className="block w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                    >
                      {s.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              To
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={endLocation}
                onChange={(e) => { setEndLocation(e.target.value); debouncedEnd(e.target.value) }}
                placeholder="Enter destination"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              {suggestionsEnd.length > 0 && (
                <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {suggestionsEnd.map((s) => (
                    <button
                      type="button"
                      key={`${s.lat},${s.lon}`}
                      onClick={() => {
                        setEndLocation(s.display_name)
                        setEndCoord({ lat: parseFloat(s.lat), lng: parseFloat(s.lon) })
                        setSuggestionsEnd([])
                      }}
                      className="block w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                    >
                      {s.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={handleSearch}
            disabled={!startLocation || !endLocation || isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Finding routes...</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4" />
                <span>Find Routes</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {routes.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Available Routes
            </h3>
            
            {routes.map((route) => (
              <div
                key={route.id}
                onClick={() => handleRouteSelect(route.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedRoute === route.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {route.name}
                  </h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTrafficColor(route.trafficLevel)}`}>
                    {route.trafficLevel}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Route className="w-4 h-4" />
                    <span>{route.distance} km</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{route.duration} min</span>
                  </div>
                </div>
                
                <div className="mt-2 flex items-center space-x-2">
                  <div 
                    className="w-4 h-1 rounded-full"
                    style={{ backgroundColor: route.color }}
                  ></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Route preview
                  </span>
                </div>
              </div>
            ))}
            <div className="pt-2">
              <button
                onClick={() => window.speechSynthesis?.speak(new SpeechSynthesisUtterance('Starting journey. Follow the highlighted route.'))}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                ▶ Start Journey
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Navigation className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Plan Your Journey
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Enter your starting point and destination to find the best routes
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
