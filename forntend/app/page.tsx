"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, Plus, Minus } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/lib/auth-context"

// Mock data for leaderboard
const leaderboardData = [
  { id: 1, name: "Emma", trees: 45, avatar: "E", color: "bg-emerald-500" },
  { id: 2, name: "Daniel", trees: 38, avatar: "D", color: "bg-green-600" },
  { id: 3, name: "Sophia", trees: 32, avatar: "S", color: "bg-lime-500" },
  { id: 4, name: "Liam", trees: 28, avatar: "L", color: "bg-teal-500" },
]

// Mock tree locations for the map
const treeLocations = [
  { id: 1, x: 20, y: 30 },
  { id: 2, x: 35, y: 45 },
  { id: 3, x: 60, y: 25 },
  { id: 4, x: 45, y: 60 },
  { id: 5, x: 75, y: 40 },
  { id: 6, x: 25, y: 70 },
  { id: 7, x: 80, y: 20 },
  { id: 8, x: 15, y: 55 },
]

export default function HomePage() {
  const [mapZoom, setMapZoom] = useState(1)
  const { user, isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <Navigation currentUser={user || undefined} isAuthenticated={isAuthenticated} />

      {/* Hero Section */}
      <section className="px-6 py-12 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-5xl font-bold text-emerald-800 mb-6 text-balance">Welcome to GreenPulse</h2>
            <p className="text-xl text-emerald-700 mb-8 leading-relaxed">
              Join our community and start planting trees for a greener future!
            </p>
            <Link href={isAuthenticated ? "/leaderboard" : "/signup"}>
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 text-lg">
                {isAuthenticated ? "View Leaderboard" : "Get Started"}
              </Button>
            </Link>
          </div>
          <div className="flex justify-center">
            <img src="/images/tree-planting-hero.jpg" alt="Person planting a tree" className="w-full max-w-md h-auto" />
          </div>
        </div>
      </section>

      {/* Community Map Section */}
      <section className="px-6 py-12 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-white/90 backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-emerald-800 mb-4">Community Map</h3>
              <div className="relative bg-gradient-to-br from-green-100 to-emerald-200 rounded-lg overflow-hidden h-96">
                {/* Map background with rivers/paths */}
                <div className="absolute inset-0">
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0,60 Q20,50 40,55 T80,45 L100,40 L100,100 L0,100 Z" fill="rgba(59, 130, 246, 0.3)" />
                    <path d="M0,80 Q30,75 60,80 T100,75 L100,100 L0,100 Z" fill="rgba(59, 130, 246, 0.2)" />
                  </svg>
                </div>

                {/* Tree markers */}
                {treeLocations.map((tree) => (
                  <div
                    key={tree.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${tree.x}%`, top: `${tree.y}%` }}
                  >
                    <div className="text-emerald-600 text-2xl">🌳</div>
                  </div>
                ))}

                {/* Location pin */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="bg-emerald-600 rounded-full p-3 shadow-lg">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Zoom controls */}
                <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-8 h-8 p-0"
                    onClick={() => setMapZoom(Math.min(mapZoom + 0.2, 2))}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-8 h-8 p-0"
                    onClick={() => setMapZoom(Math.max(mapZoom - 0.2, 0.5))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Map attribution */}
                <div className="absolute bottom-2 left-2 text-xs text-emerald-600 bg-white/80 px-2 py-1 rounded">
                  Map data ©2024
                </div>
              </div>
            </Card>
          </div>

          {/* Leaderboard */}
          <div>
            <Card className="p-6 bg-white/90 backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-emerald-800 mb-4">Leaderboard</h3>
              <div className="space-y-3">
                {leaderboardData.map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-emerald-50 transition-colors"
                  >
                    <span className="text-lg font-bold text-emerald-700 w-6">{index + 1}</span>
                    <div
                      className={`w-10 h-10 ${user.color} rounded-full flex items-center justify-center text-white font-bold`}
                    >
                      {user.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-emerald-800">{user.name}</p>
                      <p className="text-sm text-emerald-600">{user.trees} trees</p>
                    </div>
                    <Link href={`/user/${user.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-emerald-700 border-emerald-300 hover:bg-emerald-50 bg-transparent"
                      >
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-emerald-200">
                <Link href="/leaderboard">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                    View Full Leaderboard
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Decorative leaves */}
      <div className="fixed top-20 left-10 text-6xl text-emerald-200 opacity-50 pointer-events-none">🍃</div>
      <div className="fixed top-40 right-20 text-4xl text-emerald-300 opacity-40 pointer-events-none">🍃</div>
      <div className="fixed bottom-20 left-20 text-5xl text-emerald-200 opacity-30 pointer-events-none">🍃</div>
      <div className="fixed bottom-40 right-10 text-3xl text-emerald-300 opacity-50 pointer-events-none">🍃</div>
    </div>
  )
}
