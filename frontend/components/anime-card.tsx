import Link from "next/link"
import { Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface AnimeCardProps {
  id: number
  name: string
  image?: string
  rating?: number
  genres?: string[]
  type?: string
  episodes?: number
}

export function AnimeCard({ id, name, image, rating, genres, type, episodes }: AnimeCardProps) {
  return (
    <Link href={`/anime/${id}`}>
      <Card className="card-hover border-2 border-transparent hover:border-primary/50 bg-card h-full">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <h3 className="font-semibold text-base line-clamp-2 flex-1">{name}</h3>
            {rating && (
              <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full shrink-0">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-semibold">{rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {type && <Badge className="bg-primary/20 text-primary hover:bg-primary/30 text-xs">{type}</Badge>}

            {genres && genres.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {genres.slice(0, 3).map((genre) => (
                  <Badge key={genre} variant="secondary" className="text-xs px-2 py-0.5">
                    {genre}
                  </Badge>
                ))}
                {genres.length > 3 && (
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    +{genres.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {episodes && <p className="text-xs text-muted-foreground">{episodes} episodes</p>}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
