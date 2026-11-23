'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, MapPin, Clock, Users, Car, Construction, Zap } from 'lucide-react'
import { useSocket } from './SocketProvider'

interface Alert {
  id: string
  type: 'accident' | 'construction' | 'hazard' | 'congestion' | 'weather'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  location: string
  coordinates: [number, number]
  reportedAt: string
  reportedBy: string
  affectedRoutes: string[]
  estimatedDuration: string
  verified: boolean
}

export function AlertPanel() {
  const { socket } = useSocket()
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [filter, setFilter] = useState<'all' | 'accident' | 'construction' | 'hazard' | 'congestion' | 'weather'>('all')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (socket) {
      socket.on('new_alert', (alert: Alert) => {
        setAlerts(prev => [alert, ...prev])
      })

      socket.on('alert_update', (updatedAlert: Alert) => {
        setAlerts(prev => prev.map(alert => 
          alert.id === updatedAlert.id ? updatedAlert : alert
        ))
      })

      return () => {
        socket.off('new_alert')
        socket.off('alert_update')
      }
    }
  }, [socket])

  // Load initial alerts
  useEffect(() => {
    setIsLoading(true)
    setTimeout(() => {
      const mockAlerts: Alert[] = [
        {
          id: '1',
          type: 'accident',
          severity: 'high',
          title: 'Multi-vehicle collision on I-95',
          description: 'Three-car accident blocking two lanes. Emergency services on scene.',
          location: 'I-95 North, Mile Marker 42',
          coordinates: [40.7128, -74.0060],
          reportedAt: '5 minutes ago',
          reportedBy: 'Traffic Control',
          affectedRoutes: ['I-95 North', 'Route 1'],
          estimatedDuration: '2-3 hours',
          verified: true
        },
        {
          id: '2',
          type: 'construction',
          severity: 'medium',
          title: 'Road construction on Main Street',
          description: 'Lane closure for utility work. Expect delays during rush hour.',
          location: 'Main Street between 5th and 7th Ave',
          coordinates: [40.7589, -73.9851],
          reportedAt: '1 hour ago',
          reportedBy: 'City Works',
          affectedRoutes: ['Main Street'],
          estimatedDuration: 'Until 6 PM',
          verified: true
        },
        {
          id: '3',
          type: 'hazard',
          severity: 'medium',
          title: 'Debris on roadway',
          description: 'Large tree branch blocking right lane. City cleanup in progress.',
          location: 'Oak Avenue near Central Park',
          coordinates: [40.7831, -73.9712],
          reportedAt: '30 minutes ago',
          reportedBy: 'User Report',
          affectedRoutes: ['Oak Avenue'],
          estimatedDuration: '1 hour',
          verified: false
        },
        {
          id: '4',
          type: 'congestion',
          severity: 'low',
          title: 'Heavy traffic on Highway 101',
          description: 'Rush hour congestion causing 15-minute delays.',
          location: 'Highway 101 Southbound',
          coordinates: [40.7505, -73.9934],
          reportedAt: '2 hours ago',
          reportedBy: 'AI System',
          affectedRoutes: ['Highway 101'],
          estimatedDuration: 'Until 7 PM',
          verified: true
        }
      ]
      
      setAlerts(mockAlerts)
      setIsLoading(false)
    }, 1000)
  }, [])

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'accident': return <Car className="w-5 h-5 text-red-500" />
      case 'construction': return <Construction className="w-5 h-5 text-orange-500" />
      case 'hazard': return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'congestion': return <Users className="w-5 h-5 text-blue-500" />
      case 'weather': return <Zap className="w-5 h-5 text-purple-500" />
      default: return <AlertTriangle className="w-5 h-5 text-gray-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const filteredAlerts = alerts.filter(alert => 
    filter === 'all' || alert.type === filter
  )

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Road Alerts
        </h2>
        
        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'accident', label: 'Accidents' },
            { key: 'construction', label: 'Construction' },
            { key: 'hazard', label: 'Hazards' },
            { key: 'congestion', label: 'Congestion' },
            { key: 'weather', label: 'Weather' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
          </div>
        ) : filteredAlerts.length > 0 ? (
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getAlertIcon(alert.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {alert.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        {alert.verified && (
                          <span className="text-green-600 text-xs font-medium">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {alert.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{alert.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{alert.reportedAt}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <span>Duration: </span>
                        <span className="font-medium">{alert.estimatedDuration}</span>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <span>By: </span>
                        <span className="font-medium">{alert.reportedBy}</span>
                      </div>
                    </div>
                    
                    {alert.affectedRoutes.length > 0 && (
                      <div className="mt-3">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Affected routes: </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {alert.affectedRoutes.map((route, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-xs"
                            >
                              {route}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No alerts found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {filter === 'all' 
                ? 'No road alerts at this time'
                : `No ${filter} alerts found`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
