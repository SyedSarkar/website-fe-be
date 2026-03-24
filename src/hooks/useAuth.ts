import { useState, useEffect, useContext, createContext, createElement } from 'react'
import axios from 'axios'

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt?: string
  lastLogin?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Configure axios defaults
const API_BASE_URL = import.meta.env?.VITE_API_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://partners-in-parenting.netlify.app/api' 
    : 'http://localhost:5000/api')

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing token on mount
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
    }
    
    setLoading(false)
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
      
      // Store in localStorage
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(data.user))
      
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
      
      // Store in localStorage
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(data.user))
      
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
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
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
