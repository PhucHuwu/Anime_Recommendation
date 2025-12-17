"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { RatingStars } from "@/components/rating-stars";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, Loader2, Sparkles, Cpu } from "lucide-react";
import { AnimeGridPagination } from "@/components/anime-grid-pagination";
import { api, AnimeDetail, Anime } from "@/lib/api";

// Removed ExtendedAnimeDetail interface as it's no longer needed

export default function AnimeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [anime, setAnime] = useState<AnimeDetail | null>(null);
    const [similarAnime, setSimilarAnime] = useState<Anime[]>([]);
    const [loading, setLoading] = useState(true);
    const [userRating, setUserRating] = useState(0);
    const [similarModel, setSimilarModel] = useState<string>("content_based");

    const fetchAnimeData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch anime details
            const animeData = await api.getAnimeDetail(parseInt(id));
            setAnime(animeData);

            // Fetch similar anime
            const similarData = await api.getSimilarAnime(parseInt(id), 20);
            setSimilarAnime(similarData.items);
            setSimilarModel(similarData.model);
        } catch (err) {
            console.error("Failed to fetch anime:", err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchAnimeData();
    }, [fetchAnimeData]);

    const handleRate = async (rating: number) => {
        const userId = localStorage.getItem("user_id");
        if (!userId) {
            alert("Please login to rate");
            return;
        }
        try {
            await api.rateAnime(parseInt(userId), parseInt(id), rating);
            setUserRating(rating);
        } catch (err) {
            console.error("Failed to rate:", err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </main>
                <Footer />
            </div>
        );
    }

    if (!anime) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <p className="text-muted-foreground">Anime not found</p>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1">
                {/* Hero Section */}
                <div className="relative bg-gradient-to-b from-muted/50 to-background">
                    <div className="container mx-auto px-4 py-12">
                        <div className="flex flex-col gap-8">
                            {/* Info */}
                            <div className="space-y-6">
                                {/* Title */}
                                <div className="space-y-4">
                                    <h1 className="text-3xl md:text-5xl font-bold text-balance">{anime.name}</h1>

                                    {/* Removed Action Buttons */}
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
                                    <div className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-accent" />
                                        <span className="font-medium">{anime.members.toLocaleString()} Members</span>
                                    </div>
                                </div>

                                {/* Genres */}
                                <div className="flex flex-wrap gap-2">
                                    {anime.genre?.map((g: string) => (
                                        <Badge key={g} variant="outline" className="px-3 py-1">
                                            {g}
                                        </Badge>
                                    ))}
                                </div>

                                {/* Rating Section */}
                                <Card className="bg-primary/5 border-primary/20 max-w-xl">
                                    <CardContent className="p-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-muted-foreground mb-1">Rate this anime</p>
                                                <RatingStars rating={userRating || 0} onRate={handleRate} size="lg" />
                                            </div>
                                            <div className="text-right">
                                                <div className="text-3xl font-bold text-primary">{anime.rating?.toFixed(1) || 0}</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
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
                            <Badge variant="outline" className="text-xs font-normal">
                                <Cpu className="h-3 w-3 mr-1" />
                                {similarModel === "content_based" ? "Content-Based" : similarModel === "context_similar" ? "Context-Similar" : similarModel}
                            </Badge>
                        </div>

                        <AnimeGridPagination items={similarAnime} emptyMessage="No similar anime found" />

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
    );
}
