"use client"

import { use } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AnimeCard } from "@/components/anime-card"
import { RatingStars } from "@/components/rating-stars"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, TrendingUp, Users, Sparkles, Heart, Plus } from "lucide-react"

// Mock data
const mockAnimeDetails = {
  id: 1,
  name: "Attack on Titan",
  japaneName: "Shingeki no Kyojin",
  rating: 9.0,
  userRating: 0,
  genres: ["Action", "Drama", "Fantasy", "Military"],
  type: "TV",
  episodes: 75,
  status: "Finished Airing",
  aired: "Apr 7, 2013 to Mar 28, 2021",
  season: "Spring 2013",
  studios: ["Wit Studio", "MAPPA"],
  source: "Manga",
  duration: "24 min per ep",
  rating_count: 1200000,
  members: 3500000,
  synopsis:
    "Centuries ago, mankind was slaughtered to near extinction by monstrous humanoid creatures called Titans, forcing humans to hide in fear behind enormous concentric walls. What makes these giants truly terrifying is that their taste for human flesh is not born out of hunger but what appears to be out of pleasure. To ensure their survival, the remnants of humanity began living within defensive barriers, resulting in one hundred years without a single titan encounter.",
}

const similarAnime = [
  { id: 2, name: "Death Note", rating: 8.9, genres: ["Mystery", "Psychological"], type: "TV", episodes: 37 },
  { id: 3, name: "Steins;Gate", rating: 9.1, genres: ["Sci-Fi", "Thriller"], type: "TV", episodes: 24 },
  { id: 4, name: "Fullmetal Alchemist", rating: 9.2, genres: ["Action", "Adventure"], type: "TV", episodes: 64 },
  { id: 6, name: "Demon Slayer", rating: 8.8, genres: ["Action", "Supernatural"], type: "TV", episodes: 26 },
  { id: 9, name: "Hunter x Hunter", rating: 9.0, genres: ["Action", "Adventure"], type: "TV", episodes: 148 },
]

const getGradientFromName = (name: string) => {
  const gradients = [
    "from-purple-500 via-pink-500 to-red-500",
    "from-blue-500 via-teal-500 to-green-500",
    "from-pink-500 via-purple-500 to-indigo-500",
    "from-yellow-500 via-orange-500 to-red-500",
    "from-green-500 via-teal-500 to-blue-500",
    "from-indigo-500 via-purple-500 to-pink-500",
    "from-red-500 via-pink-500 to-purple-500",
    "from-teal-500 via-cyan-500 to-blue-500",
  ]

  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return gradients[hash % gradients.length]
}

export default function AnimeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const anime = mockAnimeDetails

  const gradientClass = getGradientFromName(anime.name)

  const handleRate = (rating: number) => {
    console.log(`Rated anime ${id} with ${rating}/10`)
    // API call would go here
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-b from-muted/50 to-background">
          <div className="container mx-auto px-4 py-12">
            <div className="grid md:grid-cols-[300px,1fr] gap-8">
              {/* Poster */}
              <div className="space-y-4">
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl border-4 border-border shadow-2xl">
                  <div
                    className={`w-full h-full bg-gradient-to-br ${gradientClass} flex items-center justify-center p-8`}
                  >
                    <div className="text-center">
                      <p className="text-white font-bold text-2xl drop-shadow-lg">{anime.name}</p>
                      <p className="text-white/80 text-sm mt-2 drop-shadow-lg">{anime.japaneName}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button className="w-full anime-gradient" size="lg">
                    <Plus className="mr-2 h-5 w-5" />
                    Add to List
                  </Button>
                  <Button className="w-full bg-transparent" variant="outline" size="lg">
                    <Heart className="mr-2 h-5 w-5" />
                    Add to Favorites
                  </Button>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <h1 className="text-3xl md:text-5xl font-bold text-balance">{anime.name}</h1>
                  <p className="text-lg text-muted-foreground">{anime.japaneName}</p>
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-base px-3 py-1">
                      {anime.type}
                    </Badge>
                    <span className="text-muted-foreground">•</span>
                    <span className="font-medium">{anime.episodes} episodes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span className="text-xl font-bold text-primary">{anime.rating.toFixed(1)}</span>
                  </div>
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-2">
                  {anime.genres.map((genre) => (
                    <Badge key={genre} variant="outline" className="px-3 py-1">
                      {genre}
                    </Badge>
                  ))}
                </div>

                {/* Rating Section */}
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Rate this anime</p>
                        <RatingStars rating={anime.userRating} onRate={handleRate} size="lg" />
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-primary">{anime.rating.toFixed(1)}</div>
                        <div className="text-xs text-muted-foreground">
                          {anime.rating_count.toLocaleString()} ratings
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="text-sm font-medium">{anime.status}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Clock className="h-5 w-5 text-secondary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="text-sm font-medium">{anime.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Users className="h-5 w-5 text-accent" />
                    <div>
                      <p className="text-xs text-muted-foreground">Members</p>
                      <p className="text-sm font-medium">{(anime.members / 1000000).toFixed(1)}M</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Season</p>
                      <p className="text-sm font-medium">{anime.season}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Synopsis Section */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl space-y-6">
            <h2 className="text-2xl font-bold">Synopsis</h2>
            <p className="text-muted-foreground leading-relaxed">{anime.synopsis}</p>

            <Separator />

            {/* Additional Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Information</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Type:</dt>
                    <dd className="font-medium">{anime.type}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Episodes:</dt>
                    <dd className="font-medium">{anime.episodes}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Status:</dt>
                    <dd className="font-medium">{anime.status}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Aired:</dt>
                    <dd className="font-medium">{anime.aired}</dd>
                  </div>
                </dl>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Production</h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Studios:</dt>
                    <dd className="font-medium">{anime.studios.join(", ")}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Source:</dt>
                    <dd className="font-medium">{anime.source}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Season:</dt>
                    <dd className="font-medium">{anime.season}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Duration:</dt>
                    <dd className="font-medium">{anime.duration}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Anime Section */}
        <div className="bg-muted/30 py-12">
          <div className="container mx-auto px-4 space-y-6">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-primary" />
              <h2 className="text-2xl md:text-3xl font-bold">You might also like</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {similarAnime.map((anime) => (
                <AnimeCard key={anime.id} {...anime} />
              ))}
            </div>

            <div className="text-center pt-4">
              <Button variant="outline" size="lg" asChild>
                <Link href="/browse">View More Recommendations</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
