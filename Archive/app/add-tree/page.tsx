"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, MapPin, Calendar, Leaf, Camera } from "lucide-react"

export default function AddTreePage() {
  const [currentUser] = useState({ id: 1, name: "Emma" }) // Mock current user
  const [formData, setFormData] = useState({
    treeType: "",
    location: "",
    coordinates: "",
    datePlanted: "",
    description: "",
    image: null as File | null,
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle tree submission logic here
    console.log("Add tree:", formData)
    // Redirect to profile or leaderboard after successful submission
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      treeType: value,
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }))
      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="flex items-center justify-between p-6 bg-white/80 backdrop-blur-sm">
        <Link href="/leaderboard" className="flex items-center gap-2 text-emerald-700 hover:text-emerald-800">
          <ArrowLeft className="w-5 h-5" />
          Back to Leaderboard
        </Link>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full"></div>
          </div>
          <h1 className="text-2xl font-bold text-emerald-800">GreenPulse</h1>
        </Link>
        <Link href="/profile">
          <Avatar className="w-10 h-10 bg-emerald-500">
            <AvatarFallback className="bg-emerald-500 text-white font-bold">
              {currentUser.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </Link>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8 max-w-2xl mx-auto">
        <Card className="p-8 bg-white/90 backdrop-blur-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-emerald-800 mb-2">Tree Registration</h2>
            <p className="text-emerald-600">Add a new tree to your planting record</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div>
              <Label className="text-emerald-700 font-semibold">Upload Photo</Label>
              <div className="mt-2">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Tree preview"
                      className="w-full h-48 object-cover rounded-lg border-2 border-emerald-200"
                    />
                    <Button
                      type="button"
                      size="sm"
                      className="absolute top-2 right-2 bg-white/80 text-emerald-700 hover:bg-white"
                      onClick={() => {
                        setImagePreview(null)
                        setFormData((prev) => ({ ...prev, image: null }))
                      }}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-emerald-300 rounded-lg p-8 text-center hover:border-emerald-400 transition-colors">
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      required
                    />
                    <label htmlFor="image" className="cursor-pointer">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                          <Camera className="w-8 h-8 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-emerald-700 font-semibold">Upload Photo</p>
                          <p className="text-sm text-emerald-600">Click to select an image of your tree</p>
                        </div>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Tree Type */}
            <div>
              <Label htmlFor="treeType" className="text-emerald-700 font-semibold">
                Tree Type
              </Label>
              <Select onValueChange={handleSelectChange} required>
                <SelectTrigger className="mt-2 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500">
                  <SelectValue placeholder="e.g. Oak" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oak">Oak</SelectItem>
                  <SelectItem value="maple">Maple</SelectItem>
                  <SelectItem value="pine">Pine</SelectItem>
                  <SelectItem value="birch">Birch</SelectItem>
                  <SelectItem value="cedar">Cedar</SelectItem>
                  <SelectItem value="willow">Willow</SelectItem>
                  <SelectItem value="elm">Elm</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div>
              <Label htmlFor="location" className="text-emerald-700 font-semibold">
                Location
              </Label>
              <div className="relative mt-2">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-500" />
                <Input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Central Park East"
                  className="pl-10 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            {/* Coordinates */}
            <div>
              <Label htmlFor="coordinates" className="text-emerald-700 font-semibold">
                Coordinates (Optional)
              </Label>
              <Input
                id="coordinates"
                name="coordinates"
                type="text"
                value={formData.coordinates}
                onChange={handleChange}
                placeholder="27.9879, 86.9250"
                className="mt-2 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>

            {/* Date Planted */}
            <div>
              <Label htmlFor="datePlanted" className="text-emerald-700 font-semibold">
                Date Planted
              </Label>
              <div className="relative mt-2">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-500" />
                <Input
                  id="datePlanted"
                  name="datePlanted"
                  type="date"
                  value={formData.datePlanted}
                  onChange={handleChange}
                  className="pl-10 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-emerald-700 font-semibold">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell us about this tree planting experience..."
                className="mt-2 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500 min-h-[100px]"
              />
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 text-lg">
              <Leaf className="w-5 h-5 mr-2" />
              Plant Tree
            </Button>
          </form>
        </Card>

        {/* Tips Card */}
        <Card className="mt-8 p-6 bg-gradient-to-br from-emerald-500 to-green-600 text-white">
          <h3 className="text-xl font-bold mb-4">Tree Planting Tips</h3>
          <ul className="space-y-2 text-emerald-100">
            <li>• Choose the right location with adequate sunlight and space</li>
            <li>• Dig a hole twice as wide as the root ball</li>
            <li>• Water regularly, especially during the first year</li>
            <li>• Add mulch around the base to retain moisture</li>
          </ul>
        </Card>
      </main>

      {/* Decorative leaves */}
      <div className="fixed top-20 left-10 text-6xl text-emerald-200 opacity-30 pointer-events-none">🍃</div>
      <div className="fixed bottom-20 right-20 text-5xl text-emerald-300 opacity-40 pointer-events-none">🍃</div>
    </div>
  )
}
