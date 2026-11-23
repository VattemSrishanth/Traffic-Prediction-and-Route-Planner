'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

type SocketContextType = {
  socket: Socket | null
  isConnected: boolean
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
})

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const backendBase = process.env.NEXT_PUBLIC_API_URL || `http://${window.location.hostname}:8000`
    const socketInstance = io(backendBase, {
      // Allow upgrade from polling -> websocket for better compatibility
      transports: ['websocket', 'polling'],
      path: '/socket.io',
      withCredentials: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 500,
      autoConnect: true,
    })

    socketInstance.on('connect', () => {
      setIsConnected(true)
      console.log('Connected to server')
    })

    socketInstance.on('disconnect', () => {
      setIsConnected(false)
      console.log('Disconnected from server')
    })

    socketInstance.on('traffic_update', (data) => {
      console.log('Traffic update received:', data)
    })

    socketInstance.on('route_alert', (data) => {
      console.log('Route alert received:', data)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.close()
    }
  }, [])

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}
