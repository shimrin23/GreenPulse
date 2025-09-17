"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Plus, Trophy, Medal, Award } from "lucide-react"

// Extended mock data for leaderboard
const leaderboardData = [
  { id: 1, name: "Emma", trees: 45, avatar: "E", color: "bg-emerald-500", location: "Central Park" },
  { id: 2, name: "Daniel", trees: 38, avatar: "D", color: "bg-green-600", location: "Riverside" },
  { id: 3, name: "Sophia", trees: 32, avatar: "S", color: "bg-lime-500", location: "Oak Grove" },
  { id: 4, name: "Liam", trees: 28, avatar: "L", color: "bg-teal-500", location: "Pine Valley" },
  { id: 5, name: "Olivia", trees: 25, avatar: "O", color: "bg-emerald-400", location: "Maple Street" },
  { id: 6, name: "Noah", trees: 22, avatar: "N", color: "bg-green-500", location: "Birch Lane" },
  { id: 7, name: "Ava", trees: 19, avatar: "A", color: "bg-lime-600", location: "Cedar Park" },
  { id: 8, name: "Mason", trees: 16, avatar: "M", color: "bg-teal-600", location: "Willow Creek" },
]

export default function LeaderboardPage() {
  const [currentUser] = useState({ id: 1, name: "Emma" }) // Mock current user

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-6 h-6 text-yellow-500" />
      case 1:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 2:
        return <Award className="w-6 h-6 text-amber-600" />
      default:
        return <span className="text-2xl font-bold text-emerald-700 w-6 text-center">{index + 1}</span>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="flex items-center justify-between p-6 bg-white/80 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full"></div>
          </div>
          <h1 className="text-2xl font-bold text-emerald-800">Zen GreenPulse</h1>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/add-tree">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Tree
            </Button>
          </Link>
          <Link href="/profile">
            <Avatar className="w-10 h-10 bg-emerald-500">
              <AvatarFallback className="bg-emerald-500 text-white font-bold">
                {currentUser.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-emerald-800 mb-2">Leaderboard</h2>
          <p className="text-emerald-600 text-lg">See who's making the biggest impact in our community!</p>
        </div>

        {/* Top 3 Podium */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {leaderboardData.slice(0, 3).map((user, index) => (
            <Card
              key={user.id}
              className={`p-6 text-center ${
                index === 0 ? "md:order-2 bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200" : ""
              } ${index === 1 ? "md:order-1 bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200" : ""} ${
                index === 2 ? "md:order-3 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200" : ""
              } bg-white/90 backdrop-blur-sm`}
            >
              <div className="flex justify-center mb-4">{getRankIcon(index)}</div>
              <Avatar className={`w-20 h-20 mx-auto mb-4 ${user.color}`}>
                <AvatarFallback className={`${user.color} text-white text-2xl font-bold`}>{user.avatar}</AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-bold text-emerald-800 mb-1">{user.name}</h3>
              <p className="text-emerald-600 mb-2">{user.location}</p>
              <p className="text-2xl font-bold text-emerald-700">{user.trees} trees</p>
              <Link href={`/user/${user.id}`} className="mt-4 block">
                <Button
                  variant="outline"
                  className="w-full text-emerald-700 border-emerald-300 hover:bg-emerald-50 bg-transparent"
                >
                  View Profile
                </Button>
              </Link>
            </Card>
          ))}
        </div>

        {/* Full Leaderboard */}
        <Card className="p-6 bg-white/90 backdrop-blur-sm">
          <h3 className="text-2xl font-bold text-emerald-800 mb-6">Full Rankings</h3>
          <div className="space-y-3">
            {leaderboardData.map((user, index) => (
              <div
                key={user.id}
                className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                  user.id === currentUser.id
                    ? "bg-emerald-100 border-2 border-emerald-300"
                    : "hover:bg-emerald-50 border border-transparent"
                }`}
              >
                <div className="flex items-center justify-center w-12">{getRankIcon(index)}</div>
                <Avatar className={`w-12 h-12 ${user.color}`}>
                  <AvatarFallback className={`${user.color} text-white font-bold`}>{user.avatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-emerald-800">{user.name}</h4>
                    {user.id === currentUser.id && (
                      <span className="text-xs bg-emerald-600 text-white px-2 py-1 rounded-full">You</span>
                    )}
                  </div>
                  <p className="text-sm text-emerald-600">{user.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-emerald-700">{user.trees}</p>
                  <p className="text-sm text-emerald-600">trees</p>
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
        </Card>

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <Card className="p-8 bg-gradient-to-br from-emerald-500 to-green-600 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to climb the leaderboard?</h3>
            <p className="text-emerald-100 mb-6">Plant more trees and make a difference in your community!</p>
            <Link href="/add-tree">
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50">
                <Plus className="w-5 h-5 mr-2" />
                Plant Your Next Tree
              </Button>
            </Link>
          </Card>
        </div>
      </main>

      {/* Decorative leaves */}
      <div className="fixed top-20 left-10 text-6xl text-emerald-200 opacity-30 pointer-events-none">🍃</div>
      <div className="fixed bottom-20 right-20 text-5xl text-emerald-300 opacity-40 pointer-events-none">🍃</div>
    </div>
  )
}
