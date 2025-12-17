"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const [userId, setUserId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      // Store user_id in localStorage for demo
      localStorage.setItem("user_id", userId)
      router.push("/")
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse [animation-delay:1s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse [animation-delay:2s]" />
      </div>

      <Card className="w-full max-w-md border-2 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <Sparkles className="h-16 w-16 text-primary" />
              <div className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-secondary animate-bounce" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gradient">Welcome to AnimeRec</CardTitle>
          <CardDescription className="text-base">
            Enter your user ID to discover amazing anime recommendations
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                type="number"
                placeholder="Enter your user ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
                className="h-12 text-lg"
              />
              <p className="text-xs text-muted-foreground">No password required - just your unique user ID</p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full h-12 text-lg anime-gradient" disabled={isLoading || !userId}>
              {isLoading ? "Logging in..." : "Enter"}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Don't have a user ID?</p>
              <Button variant="link" type="button" className="text-primary">
                Try ID: 12345
              </Button>
            </div>

            <div className="pt-4 border-t">
              <Button
                variant="outline"
                type="button"
                className="w-full bg-transparent"
                onClick={() => router.push("/admin")}
              >
                Admin Portal
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
