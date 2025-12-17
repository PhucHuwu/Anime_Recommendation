"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { User, Calendar, Star, TrendingUp, Clock, BarChart3, Loader2 } from "lucide-react";
import { PieChart } from "@/components/charts/pie-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { api, UserProfile, UserRating } from "@/lib/api";

interface GenreStats {
    genre: string;
    count: number;
    percentage: number;
}

export default function ProfilePage() {
    const [userId, setUserId] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<"recent" | "rating">("recent");
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [ratings, setRatings] = useState<UserRating[]>([]);
    const [genreStats, setGenreStats] = useState<GenreStats[]>([]);
    const router = useRouter();

    const fetchUserData = useCallback(async (uid: string) => {
        setLoading(true);
        try {
            // Fetch user profile
            const profileData = await api.getUserProfile(parseInt(uid));
            setProfile(profileData);

            // Set genre stats directly from profile data
            if (profileData.favorite_genres) {
                setGenreStats(profileData.favorite_genres);
            }

            // Fetch user ratings
            const ratingsData = await api.getUserRatings(parseInt(uid), 1, 100);
            setRatings(ratingsData.items);
        } catch (err) {
            console.error("Failed to fetch user data:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const storedUserId = localStorage.getItem("user_id");
        if (!storedUserId) {
            router.push("/login");
            return;
        }
        setUserId(storedUserId);
        fetchUserData(storedUserId);
    }, [fetchUserData, router]);

    const sortedRatings = [...ratings].sort((a, b) => {
        if (sortBy === "rating") return b.rating - a.rating;
        // Recent first (assuming rated_at exists)
        return 0;
    });

    const genreChartData = genreStats.map((item) => ({ name: item.genre, value: item.count }));
    const ratingDistributionData = Array.from({ length: 10 }, (_, i) => {
        const score = 10 - i;
        const count = ratings.filter((r) => Math.round(r.rating) === score).length;
        return { name: score.toString(), value: count };
    });

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
                                            Member since 2024
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
                                            <TrendingUp className="h-5 w-5 text-primary" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Anime Rated</p>
                                                <p className="text-lg font-bold">{profile?.total_ratings || 0}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-lg">
                                            <Clock className="h-5 w-5 text-secondary" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Recent Ratings</p>
                                                <p className="text-lg font-bold">{ratings.length}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-lg">
                                            <Star className="h-5 w-5 text-accent" />
                                            <div>
                                                <p className="text-xs text-muted-foreground">Avg Rating</p>
                                                <p className="text-lg font-bold">{profile?.average_rating?.toFixed(1) || 0}/10</p>
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
                                    {genreStats.map((item: GenreStats) => (
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

                        {/* Rating Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Star className="h-5 w-5 text-secondary" />
                                    Rating Distribution
                                </CardTitle>
                                <CardDescription>How you rated anime (1-10)</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <BarChart data={ratingDistributionData} />
                                <div className="space-y-4">
                                    {ratingDistributionData.map((item) => (
                                        <div key={item.name} className="flex items-center gap-4">
                                            <div className="flex items-center gap-1 w-12 justify-end">
                                                <span className="text-sm font-medium">{item.name}</span>
                                                <Star className="h-3 w-3 fill-current text-muted-foreground" />
                                            </div>
                                            <Progress value={(item.value / (ratings.length || 1)) * 100} className="flex-1 h-2" />
                                            <span className="text-sm text-muted-foreground w-8 text-right">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Rating History Section */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Rating History</CardTitle>
                                        <CardDescription>All anime you've rated</CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant={sortBy === "recent" ? "default" : "outline"} size="sm" onClick={() => setSortBy("recent")}>
                                            Recent
                                        </Button>
                                        <Button variant={sortBy === "rating" ? "default" : "outline"} size="sm" onClick={() => setSortBy("rating")}>
                                            Rating
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {sortedRatings.length > 0 ? (
                                        sortedRatings.map((item) => (
                                            <div
                                                key={item.anime_id}
                                                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="flex-1">
                                                    <h4 className="font-semibold">{item.anime_name}</h4>
                                                    <p className="text-xs text-muted-foreground mt-2">{item.rated_at || "Recently"}</p>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <div className="flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full">
                                                        <Star className="h-4 w-4 fill-primary text-primary" />
                                                        <span className="font-bold text-primary">{item.rating}/10</span>
                                                    </div>
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <a href={`/anime/${item.anime_id}`}>View</a>
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-muted-foreground py-8">No ratings yet</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
