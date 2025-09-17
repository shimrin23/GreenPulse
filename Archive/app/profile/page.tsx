"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ArrowLeft, MapPin, Calendar, Leaf, Edit, Trash2, Plus, Settings } from "lucide-react"

// Mock current user data
const currentUserData = {
  id: 1,
  name: "Emma",
  email: "emma@example.com",
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
      description: "Beautiful oak tree planted near the pond",
    },
    {
      id: 2,
      type: "Maple",
      location: "Central Park West",
      datePlanted: "2024-09-10",
      image: "/images/maple-tree.jpg",
      status: "Growing",
      description: "Maple tree with vibrant fall colors",
    },
    {
      id: 3,
      type: "Pine",
      location: "Central Park North",
      datePlanted: "2024-09-05",
      image: "/images/pine-tree.jpg",
      status: "Growing",
      description: "Evergreen pine for year-round beauty",
    },
  ],
}

export default function ProfilePage() {
  const [user, setUser] = useState(currentUserData)
  const [editingTree, setEditingTree] = useState<(typeof currentUserData.trees)[0] | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const handleDeleteTree = (treeId: number) => {
    setUser((prev) => ({
      ...prev,
      trees: prev.trees.filter((tree) => tree.id !== treeId),
      totalTrees: prev.totalTrees - 1,
    }))
  }

  const handleEditTree = (tree: (typeof currentUserData.trees)[0]) => {
    setEditingTree(tree)
    setIsEditDialogOpen(true)
  }

  const handleSaveTree = () => {
    if (editingTree) {
      setUser((prev) => ({
        ...prev,
        trees: prev.trees.map((tree) => (tree.id === editingTree.id ? editingTree : tree)),
      }))
      setIsEditDialogOpen(false)
      setEditingTree(null)
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
          <h1 className="text-2xl font-bold text-emerald-800">Zen GreenPulse</h1>
        </Link>
        <Button variant="ghost" size="sm" className="text-emerald-700">
          <Settings className="w-4 h-4" />
        </Button>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8 max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card className="p-8 mb-8 bg-white/90 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className={`w-24 h-24 ${user.color}`}>
              <AvatarFallback className={`${user.color} text-white text-4xl font-bold`}>{user.avatar}</AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-3xl font-bold text-emerald-800 mb-2">{user.name}</h2>
              <p className="text-emerald-600 mb-4">{user.email}</p>
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
            <Link href="/add-tree">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Tree
              </Button>
            </Link>
          </div>
        </Card>

        {/* My Trees Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-emerald-800">My Trees</h3>
            <Link href="/add-tree">
              <Button
                variant="outline"
                className="text-emerald-700 border-emerald-300 hover:bg-emerald-50 bg-transparent"
              >
                <Plus className="w-4 h-4 mr-2" />
                Plant New Tree
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.trees.map((tree) => (
              <Card key={tree.id} className="overflow-hidden bg-white/90 backdrop-blur-sm">
                <div className="aspect-video bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center">
                  <div className="text-6xl">🌳</div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-emerald-800">{tree.type}</h4>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-emerald-600 hover:text-emerald-800 p-1"
                        onClick={() => handleEditTree(tree)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 p-1"
                        onClick={() => handleDeleteTree(tree.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 mb-3">
                    {tree.status}
                  </Badge>
                  <div className="space-y-2 text-sm text-emerald-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3" />
                      <span>{tree.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      <span>Planted {new Date(tree.datePlanted).toLocaleDateString()}</span>
                    </div>
                    {tree.description && <p className="text-xs text-emerald-500 mt-2">{tree.description}</p>}
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
            <div className="text-3xl font-bold text-emerald-700 mb-2">
              {new Set(user.trees.map((tree) => tree.type)).size}
            </div>
            <div className="text-emerald-600">Tree Types</div>
          </Card>
          <Card className="p-6 text-center bg-white/90 backdrop-blur-sm">
            <div className="text-3xl font-bold text-emerald-700 mb-2">
              {Math.floor((Date.now() - new Date(user.joinDate + " 2024").getTime()) / (1000 * 60 * 60 * 24))}
            </div>
            <div className="text-emerald-600">Days Active</div>
          </Card>
        </div>
      </main>

      {/* Edit Tree Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-emerald-800">Edit Tree</DialogTitle>
          </DialogHeader>
          {editingTree && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editType" className="text-emerald-700">
                  Tree Type
                </Label>
                <Input
                  id="editType"
                  value={editingTree.type}
                  onChange={(e) => setEditingTree({ ...editingTree, type: e.target.value })}
                  className="mt-1 border-emerald-200 focus:border-emerald-500"
                />
              </div>
              <div>
                <Label htmlFor="editLocation" className="text-emerald-700">
                  Location
                </Label>
                <Input
                  id="editLocation"
                  value={editingTree.location}
                  onChange={(e) => setEditingTree({ ...editingTree, location: e.target.value })}
                  className="mt-1 border-emerald-200 focus:border-emerald-500"
                />
              </div>
              <div>
                <Label htmlFor="editDescription" className="text-emerald-700">
                  Description
                </Label>
                <Input
                  id="editDescription"
                  value={editingTree.description}
                  onChange={(e) => setEditingTree({ ...editingTree, description: e.target.value })}
                  className="mt-1 border-emerald-200 focus:border-emerald-500"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button onClick={handleSaveTree} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="flex-1 text-emerald-700 border-emerald-300"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Decorative leaves */}
      <div className="fixed top-20 left-10 text-6xl text-emerald-200 opacity-30 pointer-events-none">🍃</div>
      <div className="fixed bottom-20 right-20 text-5xl text-emerald-300 opacity-40 pointer-events-none">🍃</div>
    </div>
  )
}
