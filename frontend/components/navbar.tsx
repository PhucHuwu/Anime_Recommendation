"use client"

import Link from "next/link"
import { Search, Sparkles, User, LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState } from "react"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="relative">
              <Sparkles className="h-8 w-8 text-primary" />
              <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-secondary" />
            </div>
            <span className="text-xl font-bold text-gradient">AnimeRec</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
              Home
            </Link>
            <Link href="/browse" className="text-sm font-medium hover:text-primary transition-colors">
              Browse
            </Link>
            <Link href="/profile" className="text-sm font-medium hover:text-primary transition-colors">
              Profile
            </Link>
            <Link href="/admin" className="text-sm font-medium hover:text-primary transition-colors">
              Admin
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-sm mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search anime..." className="pl-10 bg-muted/50" />
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search anime..." className="pl-10 bg-muted/50" />
            </div>
            <div className="flex flex-col space-y-2">
              <Link href="/" className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg">
                Home
              </Link>
              <Link href="/browse" className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg">
                Browse
              </Link>
              <Link href="/profile" className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg">
                Profile
              </Link>
              <Link href="/admin" className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg">
                Admin
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
