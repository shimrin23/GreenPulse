"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: number
  name: string
  email: string
  avatar: string
  color: string
  location: string
  joinDate: string
  totalTrees: number
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  updateUser: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock user data
const mockUser: User = {
  id: 1,
  name: "Emma",
  email: "emma@example.com",
  avatar: "E",
  color: "bg-emerald-500",
  location: "Central Park",
  joinDate: "March 2024",
  totalTrees: 45,
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check for stored auth state on mount
    const storedAuth = localStorage.getItem("zen-greenpulse-auth")
    if (storedAuth) {
      const authData = JSON.parse(storedAuth)
      setUser(authData.user)
      setIsAuthenticated(true)
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login logic
    if (email === "emma@example.com" && password === "password") {
      setUser(mockUser)
      setIsAuthenticated(true)
      localStorage.setItem("zen-greenpulse-auth", JSON.stringify({ user: mockUser }))
      return true
    }
    return false
  }

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    // Mock signup logic
    const newUser: User = {
      id: Date.now(),
      name,
      email,
      avatar: name.charAt(0).toUpperCase(),
      color: "bg-emerald-500",
      location: "New Location",
      joinDate: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      totalTrees: 0,
    }
    setUser(newUser)
    setIsAuthenticated(true)
    localStorage.setItem("zen-greenpulse-auth", JSON.stringify({ user: newUser }))
    return true
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("zen-greenpulse-auth")
  }

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem("zen-greenpulse-auth", JSON.stringify({ user: updatedUser }))
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
