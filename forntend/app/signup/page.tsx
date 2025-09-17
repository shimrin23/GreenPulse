"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle sign up logic here
    console.log("Sign up:", formData)
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

      {/* Sign Up Form */}
      <Card className="w-full max-w-md p-8 bg-white/90 backdrop-blur-sm">
        <h2 className="text-3xl font-bold text-emerald-800 mb-6">Sign up</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-emerald-700">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-emerald-700">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-emerald-700">
              Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="text-emerald-700">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mt-1 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
              required
            />
          </div>

          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 mt-6">
            Sign up
          </Button>
        </form>

        <p className="text-center text-emerald-600 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold hover:text-emerald-800">
            Log in
          </Link>
        </p>
      </Card>

      {/* Decorative leaves */}
      <div className="fixed top-20 left-10 text-6xl text-emerald-200 opacity-30 pointer-events-none">🍃</div>
      <div className="fixed bottom-20 right-20 text-5xl text-emerald-300 opacity-40 pointer-events-none">🍃</div>
    </div>
  )
}
