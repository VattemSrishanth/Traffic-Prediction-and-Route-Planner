'use client'

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useSocket } from './SocketProvider'

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface Location {
  lat: number
  lng: number
  name?: string
}

interface Route {
  coordinates: [number, number][]
  color: string
  weight?: number
  opacity?: number
}

interface TrafficData {
  lat: number
  lng: number
  level: 'low' | 'medium' | 'high'
  speed: number
}

interface AlertData {
  id: string
  type: string
  severity: string
  title: string
  description: string
  location: string
  coordinates: [number, number]
}

function MapContent() {
  const map = useMap()
  const { socket } = useSocket()
  const [trafficData, setTrafficData] = useState<TrafficData[]>([])
  const [alerts, setAlerts] = useState<AlertData[]>([])
  const [routes, setRoutes] = useState<Route[]>([])
  const [startLocation, setStartLocation] = useState<Location | null>(null)
  const [endLocation, setEndLocation] = useState<Location | null>(null)

  useEffect(() => {
    if (socket) {
      socket.on('traffic_update', (data: TrafficData[]) => {
        setTrafficData(data)
      })

      socket.on('route_update', (data: Route[]) => {
        setRoutes(data)
      })

      return () => {
        socket.off('traffic_update')
        socket.off('route_update')
      }
    }
  }, [socket])

  // Listen for route updates dispatched from UI
  useEffect(() => {
    const onRoutes = (e: any) => {
      const rts = e.detail as Route[]
      setRoutes(rts)
      if (rts && rts.length > 0) {
        const coords = rts[0].coordinates
        if (coords && coords.length > 0) {
          map.fitBounds(coords as any, { padding: [40, 40] as any })
        }
      }
    }
    const onMarkers = (e: any) => {
      const { start, end } = e.detail || {}
      if (start) setStartLocation({ lat: start.lat, lng: start.lng, name: 'Start' })
      if (end) setEndLocation({ lat: end.lat, lng: end.lng, name: 'Destination' })
    }
    window.addEventListener('routes_update' as any, onRoutes)
    window.addEventListener('route_markers_update' as any, onMarkers)
    return () => {
      window.removeEventListener('routes_update' as any, onRoutes)
      window.removeEventListener('route_markers_update' as any, onMarkers)
    }
  }, [map])

  // Poll backend for traffic and alerts around current map center
  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const center = map.getCenter()
        const resTraffic = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/traffic`)
        const trafficJson = await resTraffic.json()
        const resAlerts = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/alerts`)
        const alertsJson = await resAlerts.json()

        // Filter by distance ~15km from center
        const inRadius = (lat:number, lng:number) => {
          const dLat = (lat - center.lat) * Math.PI/180
          const dLng = (lng - center.lng) * Math.PI/180
          const a = Math.sin(dLat/2)**2 + Math.cos(center.lat*Math.PI/180)*Math.cos(lat*Math.PI/180)*Math.sin(dLng/2)**2
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
          const km = 6371 * c
          return km <= 15
        }

        if (mounted) {
          const filteredTraffic = (trafficJson.traffic || []).filter((t:any)=> inRadius(t.lat, t.lng))
          setTrafficData(filteredTraffic)

          const filteredAlerts = (alertsJson.alerts || []).filter((a:any)=> inRadius(a.coordinates?.[0], a.coordinates?.[1]))
          setAlerts(filteredAlerts)
        }
      } catch (e) {
        // ignore polling errors
      }
    }
    load()
    const id = setInterval(load, 30000)
    return () => { mounted = false; clearInterval(id) }
  }, [map])

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setStartLocation({ lat: latitude, lng: longitude, name: 'Current Location' })
          map.setView([latitude, longitude], 13)
        },
        (error) => {
          console.error('Error getting location:', error)
          // Default to a neutral global view
          map.setView([20.0, 0.0], 2)
        }
      )
    }
  }, [map])

  // React to chatbot/location requests
  useEffect(() => {
    const onLocate = () => {
      if (!navigator.geolocation) return
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords
        map.setView([latitude, longitude], 14)
        setStartLocation({ lat: latitude, lng: longitude, name: 'Current Location' })
      })
    }
    const onShowTraffic = () => {
      map.setZoom(Math.max(map.getZoom(), 13))
    }
    window.addEventListener('locate_me' as any, onLocate)
    window.addEventListener('show_traffic' as any, onShowTraffic)
    return () => {
      window.removeEventListener('locate_me' as any, onLocate)
      window.removeEventListener('show_traffic' as any, onShowTraffic)
    }
  }, [map])

  // Satellite / Traffic toggles (traffic = markers already)
  useEffect(() => {
    const toggleSatellite = () => {
      document.querySelectorAll('.satellite-layer').forEach((el) => {
        el.classList.toggle('hidden')
      })
    }
    const toggleTraffic = () => setTrafficData((t) => [...t])
    window.addEventListener('toggle_satellite' as any, toggleSatellite)
    window.addEventListener('toggle_traffic' as any, toggleTraffic)
    return () => {
      window.removeEventListener('toggle_satellite' as any, toggleSatellite)
      window.removeEventListener('toggle_traffic' as any, toggleTraffic)
    }
  }, [])

  return (
    <>
      {/* Traffic markers */}
      {trafficData.map((traffic, index) => (
        <Marker
          key={index}
          position={[traffic.lat, traffic.lng]}
          icon={L.divIcon({
            className: 'traffic-marker',
            html: `<div class="traffic-light ${traffic.level}"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6]
          })}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold">Traffic Level: {traffic.level}</h3>
              <p>Speed: {traffic.speed} km/h</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Route polylines */}
      {routes.map((route, index) => (
        <Polyline
          key={index}
          positions={route.coordinates}
          color={route.color}
          weight={route.weight ?? 5}
          opacity={route.opacity ?? 0.9}
        />
      ))}

      {/* Start and end markers */}
      {startLocation && (
        <Marker position={[startLocation.lat, startLocation.lng]}>
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold text-green-600">Start</h3>
              <p>{startLocation.name}</p>
            </div>
          </Popup>
        </Marker>
      )}

      {endLocation && (
        <Marker position={[endLocation.lat, endLocation.lng]}>
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold text-red-600">Destination</h3>
              <p>{endLocation.name}</p>
            </div>
          </Popup>
        </Marker>
      )}
    </>
  )
}

export function MapComponent() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <MapContainer
        center={[20.0, 0.0]}
        zoom={2}
        className="w-full h-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Satellite (MapTiler demo URL; replace with your key for production) */}
        <TileLayer
          attribution='&copy; MapTiler & OpenStreetMap contributors'
          url={process.env.NEXT_PUBLIC_MAPTILER_SATELLITE_URL || 'https://api.maptiler.com/tiles/satellite/{z}/{x}/{y}.jpg?key=Get_Your_Key'}
          className="satellite-layer hidden"
        />
        <MapContent />
        {/* GPS button */}
        <div className="leaflet-top leaflet-right z-[1000] p-2">
          <button
            onClick={() => window.dispatchEvent(new Event('locate_me'))}
            className="px-2 py-1 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow text-sm"
            title="Locate me"
          >📍 GPS</button>
        </div>
        {/* Map toggles container */}
        <div className="leaflet-top leaflet-right z-[1000] p-2 mt-10 flex flex-col space-y-2">
          <button
            onClick={() => window.dispatchEvent(new Event('toggle_satellite'))}
            className="px-2 py-1 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow text-sm"
          >🛰️ Satellite</button>
          <button
            onClick={() => window.dispatchEvent(new Event('toggle_traffic'))}
            className="px-2 py-1 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow text-sm"
          >🚦 Traffic</button>
        </div>
      </MapContainer>
    </div>
  )
}

export default MapComponent
