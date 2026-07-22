'use client'

import { useState, useEffect } from 'react'
import { Activity, Users, MapPin, Clock, AlertTriangle, Wifi, WifiOff } from 'lucide-react'
import { useSocket } from './SocketProvider'

interface SystemStatus {
  api: 'online' | 'offline'
  database: 'online' | 'offline'
  redis: 'online' | 'offline'
  trafficData: 'online' | 'offline'
  lastUpdate: Date
}

interface TrafficStats {
  totalRoutes: number
  activeUsers: number
  incidents: number
  avgSpeed: number
}

export function StatusDashboard() {
  const { isConnected } = useSocket()
  const [status, setStatus] = useState<SystemStatus>({
    api: 'offline',
    database: 'offline',
    redis: 'offline',
    trafficData: 'offline',
    lastUpdate: new Date()
  })
  const [stats, setStats] = useState<TrafficStats>({
    totalRoutes: 0,
    activeUsers: 0,
    incidents: 0,
    avgSpeed: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate status checks
    const checkStatus = async () => {
      setIsLoading(true)
      
      // Simulate API status check
      setTimeout(() => {
        setStatus({
          api: isConnected ? 'online' : 'offline',
          database: 'online',
          redis: 'online',
          trafficData: 'online',
          lastUpdate: new Date()
        })
        
        setStats({
          totalRoutes: Math.floor(Math.random() * 1000) + 500,
          activeUsers: Math.floor(Math.random() * 100) + 50,
          incidents: Math.floor(Math.random() * 10),
          avgSpeed: Math.floor(Math.random() * 20) + 35
        })
        
        setIsLoading(false)
      }, 1500)
    }

    checkStatus()
    const interval = setInterval(checkStatus, 30000) // Check every 30 seconds
    
    return () => clearInterval(interval)
  }, [isConnected])

  const getStatusColor = (status: string) => {
    return status === 'online' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
  }

  const getStatusIcon = (status: string) => {
    return status === 'online' ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          System Status
        </h3>
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
          isConnected ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
        }`}>
          {getStatusIcon(isConnected ? 'online' : 'offline')}
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      {/* System Components */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">API Server</span>
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status.api)}`}>
            {getStatusIcon(status.api)}
            <span className="capitalize">{status.api}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Database</span>
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status.database)}`}>
            {getStatusIcon(status.database)}
            <span className="capitalize">{status.database}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Redis Cache</span>
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status.redis)}`}>
            {getStatusIcon(status.redis)}
            <span className="capitalize">{status.redis}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Traffic Data</span>
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status.trafficData)}`}>
            {getStatusIcon(status.trafficData)}
            <span className="capitalize">{status.trafficData}</span>
          </div>
        </div>
      </div>

      {/* Traffic Statistics */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
          Live Statistics
        </h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.totalRoutes.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Active Routes</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Users className="w-4 h-4 text-green-500" />
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.activeUsers}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Active Users</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.incidents}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Incidents</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Activity className="w-4 h-4 text-purple-500" />
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stats.avgSpeed}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Avg Speed (km/h)</p>
          </div>
        </div>
      </div>

      {/* Last Update */}
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
          <Clock className="w-3 h-3" />
          <span>Last updated: {status.lastUpdate.toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  )
}
