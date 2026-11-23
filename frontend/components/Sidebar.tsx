'use client'

import { MapPin, TrafficCone, Bell, Users, X } from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  activePanel: string
  onPanelChange: (panel: string) => void
}

export function Sidebar({ isOpen, onClose, activePanel, onPanelChange }: SidebarProps) {
  const panels = [
    { id: 'route', label: 'Route Planning', icon: MapPin, description: 'Plan your journey' },
    { id: 'traffic', label: 'Traffic Analysis', icon: TrafficCone, description: 'Real-time traffic data' },
    { id: 'alerts', label: 'Road Alerts', icon: Bell, description: 'Live incident reports' },
    { id: 'carpool', label: 'Carpooling', icon: Users, description: 'Find ride matches' },
  ]

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-16 left-0 h-full w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Navigation
            </h2>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <nav className="space-y-2">
            {panels.map((panel) => {
              const Icon = panel.icon
              return (
                <button
                  key={panel.id}
                  onClick={() => {
                    onPanelChange(panel.id)
                    onClose()
                  }}
                  className={`w-full flex items-start space-x-3 p-4 rounded-lg transition-all ${
                    activePanel === panel.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    activePanel === panel.id
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className={`font-medium ${
                      activePanel === panel.id
                        ? 'text-blue-900 dark:text-blue-100'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {panel.label}
                    </div>
                    <div className={`text-sm ${
                      activePanel === panel.id
                        ? 'text-blue-700 dark:text-blue-300'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {panel.description}
                    </div>
                  </div>
                </button>
              )
            })}
          </nav>
          
          <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              AI Features
            </h3>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Real-time traffic prediction</li>
              <li>• Smart route optimization</li>
              <li>• Dynamic load balancing</li>
              <li>• Intelligent carpool matching</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
