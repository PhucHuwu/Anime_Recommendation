"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AnimeCard } from "@/components/anime-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, Heart, Zap, ChevronRight, Loader2 } from "lucide-react";
import { api, Anime } from "@/lib/api";

// Genre list for browse buttons
const genres = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Mystery", "Romance", "Sci-Fi", "Slice of Life"];

export default function HomePage() {
    const [userId, setUserId] = useState<string | null>(null);
    const [recommendations, setRecommendations] = useState<Anime[]>([]);
    const [topAnime, setTopAnime] = useState<Anime[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Check if user is logged in
        const storedUserId = localStorage.getItem("user_id");
        setUserId(storedUserId);

        // Fetch data
        fetchData(storedUserId);
    }, []);

    const fetchData = async (storedUserId: string | null) => {
        setLoading(true);
        setError(null);

        try {
            // Fetch recommendations
            if (storedUserId) {
                try {
                    const recData = await api.getRecommendations(parseInt(storedUserId), 5);
                    setRecommendations(recData.items);
                } catch {
                    // Fallback to popular if user recommendations fail
                    const popularData = await api.getPopularAnime(5);
                    setRecommendations(popularData.items);
                }
            } else {
                // No user logged in, show popular
                const popularData = await api.getPopularAnime(5);
                setRecommendations(popularData.items);
            }

            // Fetch top anime
            const topData = await api.getTopAnime(5);
            setTopAnime(topData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load data");
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative py-20 px-4 overflow-hidden">
                    <div className="absolute inset-0 -z-10">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
                    </div>

                    <div className="container mx-auto text-center space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                            <Sparkles className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">AI-Powered Recommendations</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold text-balance">
                            Discover Your Next <span className="text-gradient">Favorite Anime</span>
                        </h1>

                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
                            Personalized recommendations based on your unique taste. Powered by advanced machine learning algorithms.
                        </p>

                        <div className="flex flex-wrap gap-4 justify-center pt-4">
                            <Button size="lg" className="anime-gradient text-lg h-12" asChild>
                                <Link href="/browse">
                                    <Sparkles className="mr-2 h-5 w-5" />
                                    Start Exploring
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" className="text-lg h-12 bg-transparent" asChild>
                                <Link href="/profile">View Profile</Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Recommendations Section */}
                <section className="py-12 px-4 bg-muted/30">
                    <div className="container mx-auto space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Heart className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold">Recommended For You</h2>
                                    <p className="text-sm text-muted-foreground">Based on your watching history</p>
                                </div>
                            </div>
                            <Button variant="ghost" asChild>
                                <Link href="/browse">
                                    View All
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                            {loading ? (
                                <div className="col-span-full flex justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : recommendations.length > 0 ? (
                                recommendations.map((anime) => (
                                    <AnimeCard
                                        key={anime.anime_id}
                                        id={anime.anime_id}
                                        name={anime.name}
                                        rating={anime.rating}
                                        genres={anime.genre}
                                        type={anime.type}
                                        episodes={anime.episodes}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full text-center py-8 text-muted-foreground">No recommendations available</div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Top Anime Section */}
                <section className="py-12 px-4">
                    <div className="container mx-auto space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-secondary/10 rounded-lg">
                                    <TrendingUp className="h-6 w-6 text-secondary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl md:text-3xl font-bold">Top Rated Anime</h2>
                                    <p className="text-sm text-muted-foreground">Most popular among the community</p>
                                </div>
                            </div>
                            <Button variant="ghost" asChild>
                                <Link href="/browse?sort=rating">
                                    View All
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                            {loading ? (
                                <div className="col-span-full flex justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-secondary" />
                                </div>
                            ) : topAnime.length > 0 ? (
                                topAnime.map((anime) => (
                                    <AnimeCard
                                        key={anime.anime_id}
                                        id={anime.anime_id}
                                        name={anime.name}
                                        rating={anime.rating}
                                        genres={anime.genre}
                                        type={anime.type}
                                        episodes={anime.episodes}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full text-center py-8 text-muted-foreground">No top anime available</div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Browse by Genre Section */}
                <section className="py-12 px-4 bg-muted/30">
                    <div className="container mx-auto space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-accent/10 rounded-lg">
                                <Zap className="h-6 w-6 text-accent" />
                            </div>
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold">Browse by Genre</h2>
                                <p className="text-sm text-muted-foreground">Find anime that matches your mood</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {genres.map((genre) => (
                                <Link key={genre} href={`/browse?genre=${genre}`}>
                                    <Badge
                                        variant="outline"
                                        className="px-6 py-3 text-base cursor-pointer hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
                                    >
                                        {genre}
                                    </Badge>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-12 px-4">
                    <div className="container mx-auto">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            <div className="text-center space-y-2">
                                <div className="text-4xl font-bold text-gradient">12,294</div>
                                <div className="text-sm text-muted-foreground">Anime Titles</div>
                            </div>
                            <div className="text-center space-y-2">
                                <div className="text-4xl font-bold text-gradient">69,600</div>
                                <div className="text-sm text-muted-foreground">Active Users</div>
                            </div>
                            <div className="text-center space-y-2">
                                <div className="text-4xl font-bold text-gradient">7.7M</div>
                                <div className="text-sm text-muted-foreground">Ratings</div>
                            </div>
                            <div className="text-center space-y-2">
                                <div className="text-4xl font-bold text-gradient">95%</div>
                                <div className="text-sm text-muted-foreground">Accuracy</div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
