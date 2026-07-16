'use client'

import { useState } from 'react'
import { MapPin, Navigation, Layers, Settings, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'

interface MapControlsProps {
  onLocationClick: () => void
  onNavigationClick: () => void
  onLayersClick: () => void
  onSettingsClick: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
}

export function MapControls({
  onLocationClick,
  onNavigationClick,
  onLayersClick,
  onSettingsClick,
  onZoomIn,
  onZoomOut,
  onReset
}: MapControlsProps) {
  const [showControls, setShowControls] = useState(true)

  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
      {/* Main Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2">
        <div className="flex flex-col space-y-2">
          <button
            onClick={onLocationClick}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="My Location"
          >
            <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          
          <button
            onClick={onNavigationClick}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Start Navigation"
          >
            <Navigation className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          
          <button
            onClick={onLayersClick}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Map Layers"
          >
            <Layers className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          
          <button
            onClick={onSettingsClick}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2">
        <div className="flex flex-col space-y-1">
          <button
            onClick={onZoomIn}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          
          <button
            onClick={onZoomOut}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          
          <button
            onClick={onReset}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Reset View"
          >
            <RotateCcw className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  )
}
