"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const success = await login(formData.email, formData.password)
      if (success) {
        router.push("/leaderboard")
      } else {
        setError("Invalid email or password")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-6">
      {/* Header */}
      <div className="absolute top-6 left-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full"></div>
          </div>
          <h1 className="text-2xl font-bold text-emerald-800">GreenPulse</h1>
        </Link>
      </div>

      {/* Login Form */}
      <Card className="w-full max-w-md p-8 bg-white/90 backdrop-blur-sm">
        <h2 className="text-3xl font-bold text-emerald-800 mb-6">Log in</h2>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-emerald-700">
              📧 Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
              placeholder="emma@example.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-emerald-700">
              🔒 Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
              placeholder="password"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 mt-6"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Log in"}
          </Button>
        </form>

        <div className="text-center mt-4">
          <Link href="/forgot-password" className="text-sm text-emerald-600 hover:text-emerald-800">
            Forgot password?
          </Link>
        </div>

        <p className="text-center text-emerald-600 mt-6">
          {"Don't have an account?"}{" "}
          <Link href="/signup" className="font-semibold hover:text-emerald-800">
            Sign up
          </Link>
        </p>

        <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
          <p className="text-sm text-emerald-700 mb-2">Demo credentials:</p>
          <p className="text-xs text-emerald-600">Email: emma@example.com</p>
          <p className="text-xs text-emerald-600">Password: password</p>
        </div>
      </Card>

      {/* Decorative leaves */}
      <div className="fixed top-20 right-10 text-6xl text-emerald-200 opacity-30 pointer-events-none">🍃</div>
      <div className="fixed bottom-20 left-20 text-5xl text-emerald-300 opacity-40 pointer-events-none">🍃</div>
    </div>
  )
}
