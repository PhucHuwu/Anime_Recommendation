"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AnimeCard } from "@/components/anime-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Star, TrendingUp } from "lucide-react"
import Link from "next/link"

// Mock data
const mockAnimeList = [
  { id: 1, name: "Attack on Titan", rating: 9.0, genres: ["Action", "Drama"], type: "TV", episodes: 75 },
  { id: 2, name: "Death Note", rating: 8.9, genres: ["Mystery", "Psychological"], type: "TV", episodes: 37 },
  { id: 3, name: "Steins;Gate", rating: 9.1, genres: ["Sci-Fi", "Thriller"], type: "TV", episodes: 24 },
  { id: 4, name: "Fullmetal Alchemist", rating: 9.2, genres: ["Action", "Adventure"], type: "TV", episodes: 64 },
  { id: 5, name: "My Hero Academia", rating: 8.5, genres: ["Action", "Comedy"], type: "TV", episodes: 113 },
  { id: 6, name: "Demon Slayer", rating: 8.8, genres: ["Action", "Supernatural"], type: "TV", episodes: 26 },
  { id: 7, name: "One Piece", rating: 8.9, genres: ["Adventure", "Comedy"], type: "TV", episodes: 1000 },
  { id: 8, name: "Naruto", rating: 8.4, genres: ["Action", "Adventure"], type: "TV", episodes: 220 },
  { id: 9, name: "Hunter x Hunter", rating: 9.0, genres: ["Action", "Adventure"], type: "TV", episodes: 148 },
  { id: 10, name: "Cowboy Bebop", rating: 8.9, genres: ["Action", "Sci-Fi"], type: "TV", episodes: 26 },
  { id: 11, name: "Sword Art Online", rating: 7.8, genres: ["Action", "Fantasy"], type: "TV", episodes: 25 },
  { id: 12, name: "Tokyo Ghoul", rating: 8.1, genres: ["Action", "Horror"], type: "TV", episodes: 12 },
]

// Mock recommendations data
const mockRecommendations = [
  { id: 13, name: "Jujutsu Kaisen", rating: 8.7, genres: ["Action", "Supernatural"], type: "TV", episodes: 24 },
  { id: 14, name: "Mob Psycho 100", rating: 8.6, genres: ["Action", "Comedy"], type: "TV", episodes: 25 },
  { id: 15, name: "Vinland Saga", rating: 8.9, genres: ["Action", "Drama"], type: "TV", episodes: 24 },
  { id: 16, name: "Spy x Family", rating: 8.5, genres: ["Action", "Comedy"], type: "TV", episodes: 12 },
  { id: 17, name: "Chainsaw Man", rating: 8.4, genres: ["Action", "Horror"], type: "TV", episodes: 12 },
]

export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("rating")

  const filteredAnime = mockAnimeList
    .filter((anime) => {
      if (searchQuery && !anime.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating
      if (sortBy === "name") return a.name.localeCompare(b.name)
      return 0
    })

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold">Browse Anime</h1>

              {/* Search and Sort Bar */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search anime by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 text-base"
                  />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-48 h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Rating (High to Low)</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-6">
              {/* Results Count */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{filteredAnime.length}</span> results
                </p>
              </div>

              {/* Anime Grid */}
              {filteredAnime.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredAnime.map((anime) => (
                      <AnimeCard key={anime.id} {...anime} />
                    ))}
                  </div>

                  {/* Pagination */}
                  <div className="flex justify-center gap-2 pt-6">
                    <Button variant="outline" disabled>
                      Previous
                    </Button>
                    <Button variant="default" className="anime-gradient">
                      1
                    </Button>
                    <Button variant="outline">2</Button>
                    <Button variant="outline">3</Button>
                    <Button variant="outline">Next</Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-20">
                  <p className="text-lg text-muted-foreground">No anime found matching your criteria</p>
                </div>
              )}
            </div>
          </div>

          <aside className="lg:w-80 space-y-6">
            {/* Recommended for You */}
            <div className="rounded-xl border bg-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Recommended for You</h2>
              </div>
              <div className="space-y-3">
                {mockRecommendations.map((anime) => (
                  <Link
                    key={anime.id}
                    href={`/anime/${anime.id}`}
                    className="block p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                  >
                    <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-1">
                      {anime.name}
                    </h3>
                    <div className="flex items-center justify-between mt-2 text-sm">
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <span className="font-medium">{anime.rating}</span>
                      </div>
                      <span className="text-muted-foreground">{anime.type}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {anime.genres.slice(0, 2).map((genre) => (
                        <span key={genre} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                          {genre}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Trending Now */}
            <div className="rounded-xl border bg-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Trending Now</h2>
              </div>
              <div className="space-y-3">
                {mockAnimeList.slice(0, 5).map((anime, index) => (
                  <Link
                    key={anime.id}
                    href={`/anime/${anime.id}`}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                  >
                    <span className="text-2xl font-bold text-primary/30 min-w-[24px]">#{index + 1}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2 text-sm">
                        {anime.name}
                      </h3>
                      <div className="flex items-center gap-1 text-yellow-500 mt-1">
                        <Star className="h-3 w-3 fill-current" />
                        <span className="text-xs font-medium">{anime.rating}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  )
}
