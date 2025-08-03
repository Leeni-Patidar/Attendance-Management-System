"use client"

import { createContext, useContext, useState, useEffect } from "react"
import apiService from "../services/api"

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      // Check if user has valid token
      if (apiService.isAuthenticated()) {
        // Try to get current user profile
        const result = await apiService.getProfile()
        if (result.success) {
          setUser(result.data.user)
          setIsAuthenticated(true)
        } else {
          // Token invalid, clear auth
          await logout()
        }
      } else {
        // Check localStorage for user data (fallback)
        const userData = localStorage.getItem("userData")
        if (userData) {
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)
          setIsAuthenticated(true)
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      await logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      setLoading(true)
      
      // Call real API login
      const result = await apiService.login(credentials)
      
      if (result.success) {
        setUser(result.user)
        setIsAuthenticated(true)
        
        return {
          success: true,
          redirectUrl: result.redirectUrl,
          user: result.user,
        }
      } else {
        return {
          success: false,
          error: result.error || "Login failed"
        }
      }
    } catch (error) {
      console.error("Login error:", error)
      return { 
        success: false, 
        error: "Network error occurred. Please check your connection." 
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      // Call API logout to invalidate tokens on server
      await apiService.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      // Clear local state
      setUser(null)
      setIsAuthenticated(false)
      setLoading(false)
      
      // Redirect to login page
      window.location.href = "/"
    }
  }

  const updateUser = async (userData) => {
    try {
      // Update profile on server
      const result = await apiService.updateProfile(userData)
      
      if (result.success) {
        setUser(result.data.user)
        return { success: true }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error("Update user error:", error)
      return { success: false, error: "Failed to update profile" }
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      const result = await apiService.register(userData)
      
      if (result.success) {
        return { success: true, data: result.data }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, error: "Registration failed" }
    } finally {
      setLoading(false)
    }
  }

  const changePassword = async (passwordData) => {
    try {
      const result = await apiService.changePassword(passwordData)
      return result
    } catch (error) {
      console.error("Change password error:", error)
      return { success: false, error: "Password change failed" }
    }
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    updateUser,
    register,
    changePassword,
    apiService, // Expose API service for direct use in components
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
