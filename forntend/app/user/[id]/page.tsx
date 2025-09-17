"use client"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, Calendar, Leaf } from "lucide-react"

// Mock user data
const userData = {
  1: {
    id: 1,
    name: "Emma",
    avatar: "E",
    color: "bg-emerald-500",
    location: "Central Park",
    joinDate: "March 2024",
    totalTrees: 45,
    trees: [
      {
        id: 1,
        type: "Oak",
        location: "Central Park East",
        datePlanted: "2024-09-15",
        image: "/images/oak-tree.jpg",
        status: "Growing",
      },
      {
        id: 2,
        type: "Maple",
        location: "Central Park West",
        datePlanted: "2024-09-10",
        image: "/images/maple-tree.jpg",
        status: "Growing",
      },
      {
        id: 3,
        type: "Pine",
        location: "Central Park North",
        datePlanted: "2024-09-05",
        image: "/images/pine-tree.jpg",
        status: "Growing",
      },
    ],
  },
  // Add more users as needed
}

export default function UserProfilePage() {
  const params = useParams()
  const userId = Number.parseInt(params.id as string)
  const user = userData[userId as keyof typeof userData]

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-emerald-800 mb-4">User not found</h2>
          <Link href="/leaderboard">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Back to Leaderboard</Button>
          </Link>
        </Card>
      </div>
    )
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
          <h1 className="text-2xl font-bold text-emerald-800">Zen GreenPulse</h1>
        </Link>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8 max-w-4xl mx-auto">
        {/* User Profile Header */}
        <Card className="p-8 mb-8 bg-white/90 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className={`w-24 h-24 ${user.color}`}>
              <AvatarFallback className={`${user.color} text-white text-4xl font-bold`}>{user.avatar}</AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-3xl font-bold text-emerald-800 mb-2">{user.name}</h2>
              <div className="flex flex-col md:flex-row gap-4 text-emerald-600 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{user.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {user.joinDate}</span>
                </div>
              </div>
              <div className="flex justify-center md:justify-start">
                <Badge className="bg-emerald-600 text-white text-lg px-4 py-2">
                  <Leaf className="w-4 h-4 mr-2" />
                  {user.totalTrees} Trees Planted
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Trees Grid */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-emerald-800 mb-6">Trees Planted</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.trees.map((tree) => (
              <Card key={tree.id} className="overflow-hidden bg-white/90 backdrop-blur-sm">
                <div className="aspect-video bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center">
                  <div className="text-6xl">🌳</div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-emerald-800">{tree.type}</h4>
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                      {tree.status}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm text-emerald-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3" />
                      <span>{tree.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      <span>Planted {new Date(tree.datePlanted).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 text-center bg-white/90 backdrop-blur-sm">
            <div className="text-3xl font-bold text-emerald-700 mb-2">{user.totalTrees}</div>
            <div className="text-emerald-600">Total Trees</div>
          </Card>
          <Card className="p-6 text-center bg-white/90 backdrop-blur-sm">
            <div className="text-3xl font-bold text-emerald-700 mb-2">3</div>
            <div className="text-emerald-600">Tree Types</div>
          </Card>
          <Card className="p-6 text-center bg-white/90 backdrop-blur-sm">
            <div className="text-3xl font-bold text-emerald-700 mb-2">12</div>
            <div className="text-emerald-600">Days Active</div>
          </Card>
        </div>
      </main>

      {/* Decorative leaves */}
      <div className="fixed top-20 left-10 text-6xl text-emerald-200 opacity-30 pointer-events-none">🍃</div>
      <div className="fixed bottom-20 right-20 text-5xl text-emerald-300 opacity-40 pointer-events-none">🍃</div>
    </div>
  )
}
