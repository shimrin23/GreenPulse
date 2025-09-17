"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Home, Trophy, Plus, User, Menu, Leaf } from "lucide-react"

interface NavigationProps {
  currentUser?: {
    id: number
    name: string
    avatar: string
  }
  isAuthenticated?: boolean
}

export function Navigation({ currentUser, isAuthenticated = false }: NavigationProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/add-tree", label: "Add Tree", icon: Plus, requiresAuth: true },
    { href: "/profile", label: "Profile", icon: User, requiresAuth: true },
  ]

  const filteredNavItems = navItems.filter((item) => !item.requiresAuth || isAuthenticated)

  const NavContent = () => (
    <>
      {filteredNavItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
              isActive ? "bg-emerald-600 text-white" : "text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
            }`}
            onClick={() => setIsOpen(false)}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </Link>
        )
      })}
    </>
  )

  return (
    <header className="flex items-center justify-between p-6 bg-white/80 backdrop-blur-sm border-b border-emerald-100">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
          <Leaf className="w-4 h-4 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-emerald-800">Zen GreenPulse</h1>
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-2">
        <NavContent />
      </nav>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {isAuthenticated && currentUser ? (
          <Link href="/profile">
            <Avatar className="w-10 h-10 bg-emerald-500">
              <AvatarFallback className="bg-emerald-500 text-white font-bold">{currentUser.avatar}</AvatarFallback>
            </Avatar>
          </Link>
        ) : (
          <div className="hidden md:flex gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-emerald-700 hover:text-emerald-800">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">Sign up</Button>
            </Link>
          </div>
        )}

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="md:hidden text-emerald-700">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 bg-white/95 backdrop-blur-sm">
            <div className="flex flex-col gap-6 mt-8">
              <nav className="flex flex-col gap-2">
                <NavContent />
              </nav>
              {!isAuthenticated && (
                <div className="flex flex-col gap-3 pt-6 border-t border-emerald-200">
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full text-emerald-700 hover:text-emerald-800">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">Sign up</Button>
                  </Link>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
