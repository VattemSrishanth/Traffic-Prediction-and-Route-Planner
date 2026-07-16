'use client'

import { useState } from 'react'
import { Menu, MapPin, TrafficCone, Bell, Users, Bot } from 'lucide-react'
import { useTheme } from './ThemeProvider'

interface HeaderProps {
  onMenuClick: () => void
  onPanelChange: (panel: string) => void
  activePanel: string
}

export function Header({ onMenuClick, onPanelChange, activePanel }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const [showThemeMenu, setShowThemeMenu] = useState(false)

  const panels = [
    { id: 'route', label: 'Route', icon: MapPin },
    { id: 'traffic', label: 'Traffic', icon: TrafficCone },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'carpool', label: 'Carpool', icon: Users },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 h-16">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Traffic Planner
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Panel Navigation */}
          <div className="hidden md:flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {panels.map((panel) => {
              const Icon = panel.icon
              return (
                <button
                  key={panel.id}
                  onClick={() => onPanelChange(panel.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all ${
                    activePanel === panel.id
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{panel.label}</span>
                </button>
              )
            })}
          </div>

          {/* Theme Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '💻'}
            </button>
            
            {showThemeMenu && (
              <div className="absolute right-0 top-full mt-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                <button
                  onClick={() => { setTheme('light'); setShowThemeMenu(false) }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                >
                  <span>☀️</span>
                  <span>Light</span>
                </button>
                <button
                  onClick={() => { setTheme('dark'); setShowThemeMenu(false) }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                >
                  <span>🌙</span>
                  <span>Dark</span>
                </button>
                <button
                  onClick={() => { setTheme('system'); setShowThemeMenu(false) }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                >
                  <span>💻</span>
                  <span>System</span>
                </button>
              </div>
            )}
          </div>

          {/* AI Chatbot Toggle */}
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('open_chatbot'))
              }
            }}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Open chatbot"
          >
            <Bot className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  )
}
