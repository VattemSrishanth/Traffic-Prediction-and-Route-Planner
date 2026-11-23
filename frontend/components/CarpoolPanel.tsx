'use client'

import { useState, useEffect } from 'react'
import { Users, MapPin, Clock, DollarSign, MessageCircle, Star, Shield } from 'lucide-react'
import { useSocket } from './SocketProvider'

interface CarpoolMatch {
  id: string
  driver: {
    name: string
    rating: number
    verified: boolean
    avatar: string
  }
  route: {
    start: string
    end: string
    distance: number
    duration: number
  }
  timing: {
    departure: string
    arrival: string
    flexibility: number // minutes
  }
  cost: {
    perPerson: number
    total: number
    currency: string
  }
  capacity: {
    available: number
    total: number
  }
  preferences: {
    smoking: boolean
    music: boolean
    conversation: 'quiet' | 'moderate' | 'chatty'
  }
  matchScore: number
}

interface CarpoolRequest {
  id: string
  user: {
    name: string
    rating: number
    verified: boolean
    avatar: string
  }
  route: {
    start: string
    end: string
    distance: number
    duration: number
  }
  timing: {
    departure: string
    arrival: string
    flexibility: number
  }
  budget: {
    max: number
    currency: string
  }
  preferences: {
    smoking: boolean
    music: boolean
    conversation: 'quiet' | 'moderate' | 'chatty'
  }
  status: 'active' | 'matched' | 'completed'
}

export function CarpoolPanel() {
  const { socket } = useSocket()
  const [activeTab, setActiveTab] = useState<'matches' | 'requests' | 'my-rides'>('matches')
  const [matches, setMatches] = useState<CarpoolMatch[]>([])
  const [requests, setRequests] = useState<CarpoolRequest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateRequest, setShowCreateRequest] = useState(false)

  useEffect(() => {
    if (socket) {
      socket.on('carpool_match', (match: CarpoolMatch) => {
        setMatches(prev => [match, ...prev])
      })

      socket.on('carpool_request', (request: CarpoolRequest) => {
        setRequests(prev => [request, ...prev])
      })

      return () => {
        socket.off('carpool_match')
        socket.off('carpool_request')
      }
    }
  }, [socket])

  // Load initial data
  useEffect(() => {
    setIsLoading(true)
    setTimeout(() => {
      const mockMatches: CarpoolMatch[] = [
        {
          id: '1',
          driver: {
            name: 'Sarah Johnson',
            rating: 4.8,
            verified: true,
            avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'
          },
          route: {
            start: 'Downtown Station',
            end: 'Airport Terminal 2',
            distance: 18.5,
            duration: 25
          },
          timing: {
            departure: '8:30 AM',
            arrival: '8:55 AM',
            flexibility: 10
          },
          cost: {
            perPerson: 12,
            total: 36,
            currency: 'USD'
          },
          capacity: {
            available: 2,
            total: 4
          },
          preferences: {
            smoking: false,
            music: true,
            conversation: 'moderate'
          },
          matchScore: 92
        },
        {
          id: '2',
          driver: {
            name: 'Mike Chen',
            rating: 4.6,
            verified: true,
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
          },
          route: {
            start: 'Central Park',
            end: 'Business District',
            distance: 12.3,
            duration: 18
          },
          timing: {
            departure: '9:15 AM',
            arrival: '9:33 AM',
            flexibility: 5
          },
          cost: {
            perPerson: 8,
            total: 24,
            currency: 'USD'
          },
          capacity: {
            available: 1,
            total: 3
          },
          preferences: {
            smoking: false,
            music: false,
            conversation: 'quiet'
          },
          matchScore: 87
        }
      ]

      const mockRequests: CarpoolRequest[] = [
        {
          id: '1',
          user: {
            name: 'Alex Rodriguez',
            rating: 4.9,
            verified: true,
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
          },
          route: {
            start: 'University Campus',
            end: 'Tech Hub',
            distance: 15.2,
            duration: 22
          },
          timing: {
            departure: '7:45 AM',
            arrival: '8:07 AM',
            flexibility: 15
          },
          budget: {
            max: 15,
            currency: 'USD'
          },
          preferences: {
            smoking: false,
            music: true,
            conversation: 'chatty'
          },
          status: 'active'
        }
      ]

      setMatches(mockMatches)
      setRequests(mockRequests)
      setIsLoading(false)
    }, 1500)
  }, [])

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100'
    if (score >= 80) return 'text-blue-600 bg-blue-100'
    if (score >= 70) return 'text-yellow-600 bg-yellow-100'
    return 'text-gray-600 bg-gray-100'
  }

  const getConversationIcon = (type: string) => {
    switch (type) {
      case 'quiet': return '🤫'
      case 'moderate': return '💬'
      case 'chatty': return '🗣️'
      default: return '💬'
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Carpooling
        </h2>
        
        {/* Tab navigation */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {[
            { key: 'matches', label: 'Matches', icon: Users },
            { key: 'requests', label: 'Requests', icon: MessageCircle },
            { key: 'my-rides', label: 'My Rides', icon: Star }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === key
                  ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTab === 'matches' && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Available Rides
                  </h3>
                  <button
                    onClick={() => setShowCreateRequest(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Create Request
                  </button>
                </div>
                
                {matches.length > 0 ? (
                  matches.map((match) => (
                    <div key={match.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                      <div className="flex items-start space-x-3">
                        <img
                          src={match.driver.avatar}
                          alt={match.driver.name}
                          className="w-10 h-10 rounded-full"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                                {match.driver.name}
                              </h4>
                              {match.driver.verified && (
                                <Shield className="w-4 h-4 text-blue-500" />
                              )}
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {match.driver.rating}
                                </span>
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMatchScoreColor(match.matchScore)}`}>
                              {match.matchScore}% match
                            </span>
                          </div>
                          
                          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4" />
                                <span>{match.route.start} → {match.route.end}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{match.timing.departure} - {match.timing.arrival}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1">
                                <DollarSign className="w-4 h-4" />
                                <span>${match.cost.perPerson} per person</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="w-4 h-4" />
                                <span>{match.capacity.available} of {match.capacity.total} seats</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              <span className="text-xs">
                                {getConversationIcon(match.preferences.conversation)} {match.preferences.conversation}
                              </span>
                              <span className="text-xs">
                                {match.preferences.music ? '🎵 Music' : '🔇 No music'}
                              </span>
                              <span className="text-xs">
                                {match.preferences.smoking ? '🚭 No smoking' : '🚭 No smoking'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-3 flex space-x-2">
                            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                              Join Ride
                            </button>
                            <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                              Message
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      No matches found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Create a request to find carpool matches
                    </p>
                  </div>
                )}
              </>
            )}

            {activeTab === 'requests' && (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Carpool Requests
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  View and respond to carpool requests from other users
                </p>
              </div>
            )}

            {activeTab === 'my-rides' && (
              <div className="text-center py-12">
                <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  My Rides
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Manage your active rides and ride history
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
