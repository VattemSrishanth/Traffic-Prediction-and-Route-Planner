'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
import { RoutePanel } from '@/components/RoutePanel'
import { TrafficPanel } from '@/components/TrafficPanel'
import { AlertPanel } from '@/components/AlertPanel'
import { CarpoolPanel } from '@/components/CarpoolPanel'
import { AIChatbot } from '@/components/AIChatbot'
import { LoadingSpinner } from '@/components/LoadingSpinner'

// Dynamically import the map to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <LoadingSpinner />
})

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [activePanel, setActivePanel] = useState('route')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    // Simulate loading time for map initialization
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onPanelChange={setActivePanel}
        activePanel={activePanel}
      />
      
      <div className="flex h-screen pt-16">
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activePanel={activePanel}
          onPanelChange={setActivePanel}
        />
        
        <main className="flex-1 flex">
          <div className="flex-1 relative">
            <MapComponent />
          </div>
          
          <div className="w-96 bg-white dark:bg-gray-800 shadow-xl border-l border-gray-200 dark:border-gray-700">
            {activePanel === 'route' && <RoutePanel />}
            {activePanel === 'traffic' && <TrafficPanel />}
            {activePanel === 'alerts' && <AlertPanel />}
            {activePanel === 'carpool' && <CarpoolPanel />}
          </div>
        </main>
      </div>
      
      <AIChatbot />
    </div>
  )
}
