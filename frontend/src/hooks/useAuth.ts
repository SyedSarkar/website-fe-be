import { useState, useEffect, useContext, createContext, createElement } from 'react'
import axios from 'axios'

interface PersonalInfo {
  name?: string
  surname?: string
  age?: number
  gender?: string
  city?: string
  postcode?: string
  phoneNumber?: string
  alternativeContact?: string
}

interface FamilyInfo {
  ethnicity?: string
  ethnicityOther?: string
  relationshipStatus?: string
  education?: string
  householdIncome?: string
  covidImpact?: string[]
}

interface TeenInfo {
  firstName?: string
  dateOfBirth?: string
  age?: number
  schoolGrade?: string
  gender?: string
  relationship?: string
  otherParentInProgram?: string
}

interface Consent {
  given?: boolean
  date?: string
  acceptedTerms?: boolean
  acceptedPrivacy?: boolean
  acceptedResearch?: boolean
}

interface Eligibility {
  isEligible?: boolean
  reason?: string | null
}

interface User {
  id: string
  name: string
  surname?: string
  email: string
  role: string
  createdAt?: string
  lastLogin?: string
  onboardingCompleted?: boolean
  onboardingStep?: number
  eligibility?: Eligibility
  personalInfo?: PersonalInfo
  familyInfo?: FamilyInfo
  teenInfo?: TeenInfo
  consent?: Consent
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
  loading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Configure axios defaults
const API_BASE_URL = import.meta.env?.VITE_API_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://your-subdomain.yourdomain.com/api' 
    : 'http://localhost:5000/api')

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only get token from localStorage, NEVER user data
    const storedToken = localStorage.getItem('token')
    
    if (storedToken) {
      setToken(storedToken)
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
      
      // ALWAYS fetch fresh user from backend - no localStorage fallback
      axios.get(`${API_BASE_URL}/auth/me`)
        .then(response => {
          setUser(response.data.data.user)
        })
        .catch(() => {
          // Token invalid - clear and logout
          logout()
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      })

      const { token: newToken, data } = response.data
      
      setToken(newToken)
      setUser(data.user)
      
      // Only store token in localStorage, NEVER user data
      localStorage.setItem('token', newToken)
      
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed'
      throw new Error(message)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        name,
        email,
        password
      })

      const { token: newToken, data } = response.data
      
      setToken(newToken)
      setUser(data.user)
      
      // Only store token in localStorage, NEVER user data
      localStorage.setItem('token', newToken)
      
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed'
      throw new Error(message)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    setUser,
    loading,
    isAuthenticated: !!user
  }

  return createElement(
    AuthContext.Provider,
    { value },
    children
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
