"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AnimeCard } from "@/components/anime-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Star, TrendingUp, Loader2 } from "lucide-react";
import Link from "next/link";
import { api, Anime } from "@/lib/api";

export default function BrowsePage() {
    const searchParams = useSearchParams();
    const initialGenre = searchParams.get("genre") || "";
    const initialSort = searchParams.get("sort") || "rating";

    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState(initialSort);
    const [genre, setGenre] = useState(initialGenre);
    const [animeList, setAnimeList] = useState<Anime[]>([]);
    const [recommendations, setRecommendations] = useState<Anime[]>([]);
    const [trending, setTrending] = useState<Anime[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const fetchAnime = useCallback(async () => {
        setLoading(true);
        try {
            if (searchQuery.trim()) {
                // Search mode
                const results = await api.searchAnime(searchQuery, 20);
                setAnimeList(results);
                setTotal(results.length);
                setTotalPages(1);
            } else {
                // Browse mode with pagination
                const data = await api.getAnimeList(page, 20, {
                    genre: genre || undefined,
                    sort: sortBy,
                    order: "desc",
                });
                setAnimeList(data.items);
                setTotal(data.total);
                setTotalPages(data.total_pages);
            }
        } catch (err) {
            console.error("Failed to fetch anime:", err);
            setAnimeList([]);
        } finally {
            setLoading(false);
        }
    }, [page, sortBy, genre, searchQuery]);

    const fetchSidebarData = useCallback(async () => {
        try {
            // Fetch top anime for trending
            const topData = await api.getTopAnime(5);
            setTrending(topData);

            // Fetch recommendations
            const userId = localStorage.getItem("user_id");
            if (userId) {
                try {
                    const recData = await api.getRecommendations(parseInt(userId), 5);
                    setRecommendations(recData.items);
                } catch {
                    const popularData = await api.getPopularAnime(5);
                    setRecommendations(popularData.items);
                }
            } else {
                const popularData = await api.getPopularAnime(5);
                setRecommendations(popularData.items);
            }
        } catch (err) {
            console.error("Failed to fetch sidebar data:", err);
        }
    }, []);

    useEffect(() => {
        fetchAnime();
    }, [fetchAnime]);

    useEffect(() => {
        fetchSidebarData();
    }, [fetchSidebarData]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery !== undefined) {
                setPage(1);
                fetchAnime();
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

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
                                <Select
                                    value={sortBy}
                                    onValueChange={(v) => {
                                        setSortBy(v);
                                        setPage(1);
                                    }}
                                >
                                    <SelectTrigger className="w-full sm:w-48 h-12">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="rating">Rating (High to Low)</SelectItem>
                                        <SelectItem value="name">Name (A-Z)</SelectItem>
                                        <SelectItem value="members">Popularity</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Results Count */}
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Showing <span className="font-semibold text-foreground">{animeList.length}</span> of {total} results
                                </p>
                            </div>

                            {/* Anime Grid */}
                            {loading ? (
                                <div className="flex justify-center py-20">
                                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                </div>
                            ) : animeList.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                        {animeList.map((anime) => (
                                            <AnimeCard
                                                key={anime.anime_id}
                                                id={anime.anime_id}
                                                name={anime.name}
                                                rating={anime.rating}
                                                genres={anime.genre}
                                                type={anime.type}
                                                episodes={anime.episodes}
                                            />
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="flex justify-center gap-2 pt-6">
                                            <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                                                Previous
                                            </Button>
                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                const pageNum = i + 1;
                                                return (
                                                    <Button
                                                        key={pageNum}
                                                        variant={page === pageNum ? "default" : "outline"}
                                                        className={page === pageNum ? "anime-gradient" : ""}
                                                        onClick={() => setPage(pageNum)}
                                                    >
                                                        {pageNum}
                                                    </Button>
                                                );
                                            })}
                                            <Button
                                                variant="outline"
                                                disabled={page === totalPages}
                                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    )}
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
                                {recommendations.length > 0 ? (
                                    recommendations.map((anime) => (
                                        <Link
                                            key={anime.anime_id}
                                            href={`/anime/${anime.anime_id}`}
                                            className="block p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                                        >
                                            <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-1">{anime.name}</h3>
                                            <div className="flex items-center justify-between mt-2 text-sm">
                                                <div className="flex items-center gap-1 text-yellow-500">
                                                    <Star className="h-3.5 w-3.5 fill-current" />
                                                    <span className="font-medium">{anime.rating?.toFixed(1)}</span>
                                                </div>
                                                <span className="text-muted-foreground">{anime.type}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {anime.genre?.slice(0, 2).map((g) => (
                                                    <span key={g} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                                                        {g}
                                                    </span>
                                                ))}
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">Loading...</p>
                                )}
                            </div>
                        </div>

                        {/* Trending Now */}
                        <div className="rounded-xl border bg-card p-6 space-y-4">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                <h2 className="text-xl font-bold">Trending Now</h2>
                            </div>
                            <div className="space-y-3">
                                {trending.length > 0 ? (
                                    trending.map((anime, index) => (
                                        <Link
                                            key={anime.anime_id}
                                            href={`/anime/${anime.anime_id}`}
                                            className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                                        >
                                            <span className="text-2xl font-bold text-primary/30 min-w-[24px]">#{index + 1}</span>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2 text-sm">{anime.name}</h3>
                                                <div className="flex items-center gap-1 text-yellow-500 mt-1">
                                                    <Star className="h-3 w-3 fill-current" />
                                                    <span className="text-xs font-medium">{anime.rating?.toFixed(1)}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">Loading...</p>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            <Footer />
        </div>
    );
}
