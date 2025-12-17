"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Film, Star, TrendingUp, Activity, Database, BarChart3, RefreshCw, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { PieChart } from "@/components/charts/pie-chart";
import { LineChart } from "@/components/charts/line-chart";
import { useToast } from "@/components/ui/use-toast";
import { api, Statistics, ModelMetrics } from "@/lib/api";

interface GenreStat {
    genre: string;
    count: number;
    percentage: number;
}

interface TypeStat {
    type: string;
    count: number;
    percentage: number;
}

export default function AdminPage() {
    const [loading, setLoading] = useState(true);
    const [retraining, setRetraining] = useState<string | null>(null);
    const { toast } = useToast();
    const [stats, setStats] = useState<Statistics | null>(null);
    const [models, setModels] = useState<ModelMetrics[]>([]);
    const [genreStats, setGenreStats] = useState<GenreStat[]>([]);
    const [typeStats, setTypeStats] = useState<TypeStat[]>([]);
    const [progress, setProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState("");

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch stats
            const statsData = await api.getStats();
            setStats(statsData);

            // Fetch visualization data for charts
            try {
                const vizData = (await api.getVisualizationData()) as any;

                // Process genre stats from visualization data
                if (vizData.genre_distribution && vizData.genre_distribution.length > 0) {
                    const genreData = vizData.genre_distribution as any[];
                    const total = genreData.reduce((sum: number, g: any) => sum + (g.count || g.value || 0), 0);
                    setGenreStats(
                        genreData.slice(0, 8).map((g: any) => ({
                            genre: g.genre || g.name || "Unknown",
                            count: g.count || g.value || 0,
                            percentage: total > 0 ? Math.round(((g.count || g.value || 0) / total) * 100) : 0,
                        }))
                    );
                }

                // Process type stats from visualization data
                if (vizData.type_distribution && vizData.type_distribution.length > 0) {
                    const typeData = vizData.type_distribution as any[];
                    const total = typeData.reduce((sum: number, t: any) => sum + (t.count || t.value || 0), 0);
                    setTypeStats(
                        typeData.map((t: any) => ({
                            type: t.type || t.name || "Unknown",
                            count: t.count || t.value || 0,
                            percentage: total > 0 ? Math.round(((t.count || t.value || 0) / total) * 100) : 0,
                        }))
                    );
                }
            } catch (vizErr) {
                console.error("Failed to fetch visualization data:", vizErr);
            }

            // Fetch models
            const modelsData = await api.getModels();
            setModels(modelsData);
        } catch (err) {
            console.error("Failed to fetch admin data:", err);
            // Fallback to defaults
            setStats({
                total_users: 69600,
                total_anime: 12294,
                total_ratings: 7700000,
                avg_rating: 7.7,
                rating_distribution: {},
                top_genres: [],
            });
            setModels([
                { model_name: "Content-Based", rmse: 0.92, mae: 0.75, precision_k: 0.68, recall_k: 0.72, ndcg_k: 0.7, is_active: true },
                { model_name: "Item-Based CF", rmse: 0.85, mae: 0.68, precision_k: 0.74, recall_k: 0.78, ndcg_k: 0.75, is_active: true },
                { model_name: "User-Based CF", rmse: 0.88, mae: 0.71, precision_k: 0.71, recall_k: 0.75, ndcg_k: 0.72, is_active: true },
                { model_name: "Hybrid", rmse: 0.82, mae: 0.65, precision_k: 0.79, recall_k: 0.82, ndcg_k: 0.8, is_active: true },
            ]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const checkRetrainStatus = useCallback(async () => {
        try {
            const status = await api.getRetrainStatus();
            if (status.status === "running") {
                if (!retraining) setRetraining(status.model_name || "all");
                setProgress(status.progress);
                setStatusMessage(status.message);
            } else if (status.status === "completed") {
                if (retraining || status.status === "completed") {
                    setRetraining(null);
                    setProgress(100);
                    setStatusMessage("Completed!");
                    if (retraining) {
                        toast({ title: "Retrain Completed", description: "Models have been updated." });
                        fetchData();
                    }
                }
            } else if (status.status === "error") {
                if (retraining) {
                    setRetraining(null);
                    toast({ title: "Retrain Failed", description: status.message, variant: "destructive" });
                }
            }
        } catch (e) {
            console.error(e);
        }
    }, [retraining, toast, fetchData]);

    // Poll status when retraining
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (retraining) {
            interval = setInterval(checkRetrainStatus, 1000);
        } else {
            checkRetrainStatus();
        }
        return () => clearInterval(interval);
    }, [retraining, checkRetrainStatus]);

    const handleRetrain = async (modelName?: string) => {
        const target = modelName || "all";
        setRetraining(target);
        toast({
            title: "Retraining Started",
            description: `Started retraining for ${modelName || "all models"}. This process runs in the background.`,
        });

        try {
            await api.retrainModel(modelName);
            toast({
                title: "Request Sent",
                description: "Retraining task runs in background.",
                className: "bg-green-500 text-white border-none",
            });
        } catch (err) {
            console.error("Retrain error:", err);
            toast({
                title: "Error",
                description: "Failed to start retraining.",
                variant: "destructive",
            });
            setRetraining(null);
        }
    };

    const genreChartData = genreStats.slice(0, 5).map((item) => ({ name: item.genre, value: item.count }));
    const typeChartData = typeStats.map((item) => ({ name: item.type, value: item.count }));
    const activityData = [
        { name: "Jan", users: 8000, ratings: 45000 },
        { name: "Feb", users: 9500, ratings: 52000 },
        { name: "Mar", users: 11000, ratings: 61000 },
        { name: "Apr", users: 10500, ratings: 58000 },
        { name: "May", users: 12000, ratings: 68000 },
        { name: "Jun", users: 12500, ratings: 72000 },
    ];

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

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="space-y-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gradient">Admin Dashboard</h1>
                            <p className="text-muted-foreground mt-2">Monitor system performance and manage models</p>
                        </div>
                        <Button variant="outline" size="lg" asChild>
                            <Link href="/admin/charts">
                                <BarChart3 className="mr-2 h-5 w-5" />
                                View Charts
                            </Link>
                        </Button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="border-2">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <Users className="h-8 w-8 text-primary" />
                                </div>
                                <div className="mt-4">
                                    <div className="text-2xl font-bold">{stats?.total_users?.toLocaleString() || 0}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Total Users</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-2">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <Film className="h-8 w-8 text-secondary" />
                                </div>
                                <div className="mt-4">
                                    <div className="text-2xl font-bold">{stats?.total_anime?.toLocaleString() || 0}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Anime Titles</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-2">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <Star className="h-8 w-8 text-accent" />
                                </div>
                                <div className="mt-4">
                                    <div className="text-2xl font-bold">{((stats?.total_ratings || 0) / 1000000).toFixed(1)}M</div>
                                    <p className="text-xs text-muted-foreground mt-1">Total Ratings</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-2">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <Activity className="h-8 w-8 text-secondary" />
                                </div>
                                <div className="mt-4">
                                    <div className="text-2xl font-bold">{(stats?.total_users || 0).toLocaleString()}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Active Users</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tabs */}
                    <Tabs defaultValue="models" className="space-y-6">
                        <TabsList className="grid w-full max-w-2xl grid-cols-2">
                            <TabsTrigger value="models">Models</TabsTrigger>
                            <TabsTrigger value="statistics">Statistics</TabsTrigger>
                        </TabsList>

                        {/* Models Tab */}
                        <TabsContent value="models" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>Recommendation Models</CardTitle>
                                            <CardDescription>Manage and monitor ML models</CardDescription>
                                        </div>
                                        <Button className="anime-gradient" onClick={() => handleRetrain()} disabled={!!retraining}>
                                            {retraining === "all" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                                            {retraining === "all" ? "Starting..." : "Retrain All"}
                                        </Button>
                                    </div>
                                    {!!retraining && (
                                        <div className="mt-4 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">{statusMessage}</span>
                                                <span className="font-medium">{progress}%</span>
                                            </div>
                                            <Progress value={progress} className="h-2" />
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {models.map((model, index) => (
                                            <Card key={`model-card-${index}`} className="border-2">
                                                <CardContent className="pt-6">
                                                    <div className="space-y-4">
                                                        <div className="flex items-start justify-between">
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <h3 className="font-semibold text-lg">{model.model_name}</h3>
                                                                    <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                                                                        {model.is_active ? "active" : "inactive"}
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-sm text-muted-foreground">{model.model_name}</p>
                                                            </div>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleRetrain(model.model_name)}
                                                                disabled={!!retraining}
                                                            >
                                                                {retraining === model.model_name ? (
                                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <RefreshCw className="mr-2 h-4 w-4" />
                                                                )}
                                                                Retrain
                                                            </Button>
                                                        </div>

                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                            <div className="space-y-1">
                                                                <p className="text-xs text-muted-foreground">RMSE</p>
                                                                <p className="text-xl font-bold text-primary">{model.rmse}</p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-xs text-muted-foreground">MAE</p>
                                                                <p className="text-xl font-bold text-secondary">{model.mae}</p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-xs text-muted-foreground">Precision@K</p>
                                                                <p className="text-xl font-bold text-accent">{model.precision_k}</p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-xs text-muted-foreground">Recall@K</p>
                                                                <p className="text-xl font-bold text-purple-500">{model.recall_k}</p>
                                                            </div>
                                                        </div>

                                                        <div className="pt-2 border-t">
                                                            <p className="text-xs text-muted-foreground">
                                                                Last Trained:{" "}
                                                                <span className="font-medium text-foreground">
                                                                    {model.trained_at ? new Date(model.trained_at).toLocaleDateString() : "N/A"}
                                                                </span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Model Performance Comparison</CardTitle>
                                    <CardDescription>Compare metrics across different models</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b-2 border-border">
                                                    <th className="text-left py-3 px-4 font-semibold">Model</th>
                                                    <th className="text-center py-3 px-4 font-semibold">
                                                        <div>RMSE</div>
                                                        <div className="text-xs font-normal text-muted-foreground mt-1">Lower is better</div>
                                                    </th>
                                                    <th className="text-center py-3 px-4 font-semibold">
                                                        <div>MAE</div>
                                                        <div className="text-xs font-normal text-muted-foreground mt-1">Lower is better</div>
                                                    </th>
                                                    <th className="text-center py-3 px-4 font-semibold">
                                                        <div>Precision@K</div>
                                                        <div className="text-xs font-normal text-muted-foreground mt-1">Higher is better</div>
                                                    </th>
                                                    <th className="text-center py-3 px-4 font-semibold">
                                                        <div>Recall@K</div>
                                                        <div className="text-xs font-normal text-muted-foreground mt-1">Higher is better</div>
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {models.map((model, index) => (
                                                    <tr key={`model-row-${index}`} className="border-b border-border hover:bg-muted/50 transition-colors">
                                                        <td className="py-4 px-4 font-medium">{model.model_name}</td>
                                                        <td className="text-center py-4 px-4">
                                                            <span
                                                                className={`font-semibold ${
                                                                    model.rmse === Math.min(...models.map((m) => m.rmse)) ? "text-green-500" : "text-foreground"
                                                                }`}
                                                            >
                                                                {model.rmse}
                                                            </span>
                                                        </td>
                                                        <td className="text-center py-4 px-4">
                                                            <span
                                                                className={`font-semibold ${
                                                                    model.mae === Math.min(...models.map((m) => m.mae)) ? "text-green-500" : "text-foreground"
                                                                }`}
                                                            >
                                                                {model.mae}
                                                            </span>
                                                        </td>
                                                        <td className="text-center py-4 px-4">
                                                            <span
                                                                className={`font-semibold ${
                                                                    model.precision_k === Math.max(...models.map((m) => m.precision_k))
                                                                        ? "text-green-500"
                                                                        : "text-foreground"
                                                                }`}
                                                            >
                                                                {model.precision_k}
                                                            </span>
                                                        </td>
                                                        <td className="text-center py-4 px-4">
                                                            <span
                                                                className={`font-semibold ${
                                                                    model.recall_k === Math.max(...models.map((m) => m.recall_k))
                                                                        ? "text-green-500"
                                                                        : "text-foreground"
                                                                }`}
                                                            >
                                                                {model.recall_k}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Statistics Tab */}
                        <TabsContent value="statistics" className="space-y-4">
                            <div className="grid lg:grid-cols-2 gap-6 mb-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Genre Distribution</CardTitle>
                                        <CardDescription>Top 5 genres</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <PieChart data={genreChartData} />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Type Distribution</CardTitle>
                                        <CardDescription>By format</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <PieChart data={typeChartData} />
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Genre Distribution */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <BarChart3 className="h-5 w-5 text-primary" />
                                            Genre Distribution
                                        </CardTitle>
                                        <CardDescription>Breakdown of anime by genre</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {genreStats.map((item) => (
                                                <div key={item.genre} className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="font-medium">{item.genre}</span>
                                                        <span className="text-muted-foreground">
                                                            {item.count} ({item.percentage}%)
                                                        </span>
                                                    </div>
                                                    <Progress value={item.percentage * 5} className="h-2" />
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Type Distribution */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Film className="h-5 w-5 text-secondary" />
                                            Type Distribution
                                        </CardTitle>
                                        <CardDescription>Breakdown of anime by type</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {typeStats.map((item) => (
                                                <div key={item.type} className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="font-medium">{item.type}</span>
                                                        <span className="text-muted-foreground">
                                                            {item.count} ({item.percentage}%)
                                                        </span>
                                                    </div>
                                                    <Progress value={item.percentage * 1.5} className="h-2" />
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Top Anime */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Top Rated Anime</CardTitle>
                                    <CardDescription>Highest rated anime on the platform</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {[
                                            { rank: 1, name: "Fullmetal Alchemist: Brotherhood", rating: 9.2, members: 2500000 },
                                            { rank: 2, name: "Steins;Gate", rating: 9.1, members: 1800000 },
                                            { rank: 3, name: "Hunter x Hunter", rating: 9.0, members: 2200000 },
                                            { rank: 4, name: "Attack on Titan", rating: 9.0, members: 3500000 },
                                            { rank: 5, name: "Death Note", rating: 8.9, members: 3000000 },
                                        ].map((anime) => (
                                            <div key={anime.rank} className="flex items-center justify-between p-4 rounded-lg border">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                                                        {anime.rank}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold">{anime.name}</h4>
                                                        <p className="text-xs text-muted-foreground">{anime.members.toLocaleString()} members</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                    <span className="font-bold text-lg">{anime.rating}</span>
                                                </div>
                                            </div>
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
    );
}
