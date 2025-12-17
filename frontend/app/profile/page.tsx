"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AnimeCard } from "@/components/anime-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { User, Calendar, Star, TrendingUp, Heart, Clock, BarChart3 } from "lucide-react"
import { PieChart } from "@/components/charts/pie-chart"
import { BarChart } from "@/components/charts/bar-chart"

// Mock data
const mockUserData = {
  userId: "12345",
  joinDate: "January 2024",
  totalAnimeWatched: 150,
  totalEpisodes: 2400,
  averageRating: 7.8,
  totalRatings: 150,
  favoriteGenres: [
    { genre: "Action", count: 45, percentage: 30 },
    { genre: "Adventure", count: 38, percentage: 25 },
    { genre: "Drama", count: 30, percentage: 20 },
    { genre: "Sci-Fi", count: 22, percentage: 15 },
    { genre: "Comedy", count: 15, percentage: 10 },
  ],
  monthlyActivity: [
    { month: "Jan", count: 12 },
    { month: "Feb", count: 15 },
    { month: "Mar", count: 18 },
    { month: "Apr", count: 14 },
    { month: "May", count: 20 },
    { month: "Jun", count: 16 },
  ],
}

const mockRatingHistory = [
  { id: 1, name: "Attack on Titan", rating: 9, date: "2024-06-15", genres: ["Action", "Drama"] },
  { id: 2, name: "Death Note", rating: 10, date: "2024-06-10", genres: ["Mystery", "Psychological"] },
  { id: 3, name: "Steins;Gate", rating: 9, date: "2024-06-05", genres: ["Sci-Fi", "Thriller"] },
  { id: 4, name: "Fullmetal Alchemist", rating: 10, date: "2024-05-28", genres: ["Action", "Adventure"] },
  { id: 5, name: "My Hero Academia", rating: 8, date: "2024-05-20", genres: ["Action", "Comedy"] },
  { id: 6, name: "Demon Slayer", rating: 9, date: "2024-05-15", genres: ["Action", "Supernatural"] },
  { id: 7, name: "One Piece", rating: 8, date: "2024-05-10", genres: ["Adventure", "Comedy"] },
  { id: 8, name: "Naruto", rating: 7, date: "2024-05-05", genres: ["Action", "Adventure"] },
]

const mockFavorites = [
  { id: 1, name: "Attack on Titan", rating: 9.0, genres: ["Action", "Drama"], type: "TV", episodes: 75 },
  { id: 2, name: "Death Note", rating: 8.9, genres: ["Mystery", "Psychological"], type: "TV", episodes: 37 },
  { id: 3, name: "Steins;Gate", rating: 9.1, genres: ["Sci-Fi", "Thriller"], type: "TV", episodes: 24 },
  { id: 4, name: "Fullmetal Alchemist", rating: 9.2, genres: ["Action", "Adventure"], type: "TV", episodes: 64 },
]

export default function ProfilePage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"recent" | "rating">("recent")

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id")
    setUserId(storedUserId)
  }, [])

  const sortedRatings = [...mockRatingHistory].sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  const genreChartData = mockUserData.favoriteGenres.map((item) => ({ name: item.genre, value: item.count }))
  const monthlyChartData = mockUserData.monthlyActivity.map((item) => ({ name: item.month, value: item.count }))

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Profile Header */}
          <Card className="border-2">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <Avatar className="h-24 w-24 border-4 border-primary">
                  <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-3">
                  <div>
                    <h1 className="text-3xl font-bold">User #{userId || "Guest"}</h1>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4" />
                      Member since {mockUserData.joinDate}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Anime Watched</p>
                        <p className="text-lg font-bold">{mockUserData.totalAnimeWatched}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-lg">
                      <Clock className="h-5 w-5 text-secondary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Episodes</p>
                        <p className="text-lg font-bold">{mockUserData.totalEpisodes}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-lg">
                      <Star className="h-5 w-5 text-accent" />
                      <div>
                        <p className="text-xs text-muted-foreground">Avg Rating</p>
                        <p className="text-lg font-bold">{mockUserData.averageRating}/10</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Genre Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Genre Preferences
                </CardTitle>
                <CardDescription>Your most watched genres</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <PieChart data={genreChartData} />
                <div className="space-y-4">
                  {mockUserData.favoriteGenres.map((item) => (
                    <div key={item.genre} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{item.genre}</span>
                        <span className="text-muted-foreground">
                          {item.count} anime ({item.percentage}%)
                        </span>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-secondary" />
                  Monthly Activity
                </CardTitle>
                <CardDescription>Anime watched per month</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <BarChart data={monthlyChartData} color="hsl(var(--secondary))" />
                <div className="space-y-4">
                  {mockUserData.monthlyActivity.map((item) => (
                    <div key={item.month} className="flex items-center gap-4">
                      <span className="text-sm font-medium w-12">{item.month}</span>
                      <Progress value={(item.count / 20) * 100} className="flex-1 h-2" />
                      <span className="text-sm text-muted-foreground w-8 text-right">{item.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="ratings" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="ratings">Rating History</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
            </TabsList>

            {/* Rating History Tab */}
            <TabsContent value="ratings" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Rating History</CardTitle>
                      <CardDescription>All anime you've rated</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={sortBy === "recent" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSortBy("recent")}
                      >
                        Recent
                      </Button>
                      <Button
                        variant={sortBy === "rating" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSortBy("rating")}
                      >
                        Rating
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sortedRatings.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold">{item.name}</h4>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.genres.map((genre) => (
                              <Badge key={genre} variant="secondary" className="text-xs">
                                {genre}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">{item.date}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full">
                            <Star className="h-4 w-4 fill-primary text-primary" />
                            <span className="font-bold text-primary">{item.rating}/10</span>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={`/anime/${item.id}`}>View</a>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Favorites Tab */}
            <TabsContent value="favorites" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-destructive fill-destructive" />
                    Your Favorite Anime
                  </CardTitle>
                  <CardDescription>Anime you loved the most</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {mockFavorites.map((anime) => (
                      <AnimeCard key={anime.id} {...anime} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
