import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API endpoints
export const endpoints = {
  routes: '/api/routes',
  traffic: '/api/traffic',
  alerts: '/api/alerts',
  predict: '/api/predict',
  carpool: {
    matches: '/api/carpool/matches',
    requests: '/api/carpool/requests',
    create: '/api/carpool/create',
  },
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    profile: '/api/auth/profile',
  },
}

// Route planning
export interface RouteRequest {
  start: {
    lat: number
    lng: number
    name?: string
  }
  end: {
    lat: number
    lng: number
    name?: string
  }
  preferences?: {
    avoidTolls?: boolean
    avoidHighways?: boolean
    preferSpeed?: boolean
    preferDistance?: boolean
  }
}

export interface RouteResponse {
  routes: Array<{
    id: string
    name: string
    distance: number
    duration: number
    trafficLevel: string
    color: string
    coordinates: [number, number][]
  }>
}

export const getRoutes = async (request: RouteRequest): Promise<RouteResponse> => {
  const response = await api.post(endpoints.routes, request)
  return response.data
}

// Traffic data
export interface TrafficData {
  lat: number
  lng: number
  level: string
  speed: number
  timestamp: string
}

export interface TrafficResponse {
  traffic: TrafficData[]
}

export const getTrafficData = async (): Promise<TrafficResponse> => {
  const response = await api.get(endpoints.traffic)
  return response.data
}

// Alerts
export interface Alert {
  id: string
  type: string
  severity: string
  title: string
  description: string
  location: string
  coordinates: number[]
  reported_at: string
  verified: boolean
}

export interface AlertsResponse {
  alerts: Alert[]
}

export const getAlerts = async (): Promise<AlertsResponse> => {
  const response = await api.get(endpoints.alerts)
  return response.data
}

// Traffic prediction
export interface PredictionRequest {
  lat: number
  lng: number
  hour?: number
  weather?: number
  day_of_week?: number
}

export interface PredictionResponse {
  prediction: number
  confidence: number
  timestamp: string
}

export const predictTraffic = async (request: PredictionRequest): Promise<PredictionResponse> => {
  const response = await api.post(endpoints.predict, request)
  return response.data
}

// Carpooling
export interface CarpoolMatch {
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
    flexibility: number
  }
  cost: {
    per_person: number
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
    conversation: string
  }
  match_score: number
}

export interface CarpoolMatchesResponse {
  matches: CarpoolMatch[]
}

export const getCarpoolMatches = async (location: {
  lat: number
  lng: number
  radius?: number
}): Promise<CarpoolMatchesResponse> => {
  const response = await api.post(endpoints.carpool.matches, location)
  return response.data
}

// Location search
export interface LocationSearchRequest {
  query: string
  lat?: number
  lng?: number
  radius?: number
}

export interface LocationSearchResponse {
  results: Array<{
    name: string
    address: string
    lat: number
    lng: number
    place_id?: string
  }>
}

export const searchLocations = async (request: LocationSearchRequest): Promise<LocationSearchResponse> => {
  // This would typically call a geocoding service
  // For now, return mock data
  return {
    results: [
      {
        name: request.query,
        address: `${request.query}, New York, NY`,
        lat: 40.7128,
        lng: -74.0060,
        place_id: 'mock_place_id'
      }
    ]
  }
}

// Weather data
export interface WeatherData {
  temperature: number
  condition: string
  humidity: number
  wind_speed: number
  visibility: number
}

export const getWeatherData = async (lat: number, lng: number): Promise<WeatherData> => {
  // This would call a weather API
  // For now, return mock data
  return {
    temperature: 22,
    condition: 'sunny',
    humidity: 65,
    wind_speed: 10,
    visibility: 10
  }
}

// Error handling
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export const handleAPIError = (error: any): APIError => {
  if (error.response) {
    return new APIError(
      error.response.data?.message || 'API request failed',
      error.response.status,
      error.response.data?.code
    )
  } else if (error.request) {
    return new APIError('Network error - please check your connection', 0)
  } else {
    return new APIError(error.message || 'Unknown error occurred', 0)
  }
}
