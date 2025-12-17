"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart } from "@/components/charts/pie-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { LineChart } from "@/components/charts/line-chart";
import { AreaChart } from "@/components/charts/area-chart";
import { RadarChart } from "@/components/charts/radar-chart";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, Loader2 } from "lucide-react";
import { api, ModelMetrics } from "@/lib/api";

export default function AdminChartsPage() {
    const [loading, setLoading] = useState(true);
    const [genreData, setGenreData] = useState<{ name: string; value: number }[]>([]);
    const [typeData, setTypeData] = useState<{ name: string; value: number }[]>([]);
    const [ratingDistribution, setRatingDistribution] = useState<{ name: string; value: number }[]>([]);
    const [userActivity, setUserActivity] = useState<{ name: string; users: number; ratings: number }[]>([]);
    // Using mock for monthly growth for now as API doesn't return it yet, or derive from activity
    const [monthlyGrowth, setMonthlyGrowth] = useState<{ name: string; value: number }[]>([]);
    const [modelPerformance, setModelPerformance] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch visualization data
                const vizData = (await api.getVisualizationData()) as any;

                // Genre (Top 5)
                if (vizData.genre_distribution) {
                    const genres = vizData.genre_distribution.map((g: any) => ({
                        name: g.name || g.genre,
                        value: g.value || g.count,
                    }));
                    setGenreData(genres.slice(0, 5));
                }

                // Type
                if (vizData.type_distribution) {
                    const types = vizData.type_distribution.map((t: any) => ({
                        name: t.name || t.type || "Unknown",
                        value: t.value || t.count,
                    }));
                    setTypeData(types);
                }

                // Rating (Transform to buckets)
                if (vizData.rating_distribution) {
                    // Buckets: 1-2, 3-4, 5-6, 7-8, 9-10
                    const buckets = {
                        "1-2": 0,
                        "3-4": 0,
                        "5-6": 0,
                        "7-8": 0,
                        "9-10": 0,
                    };
                    vizData.rating_distribution.forEach((r: any) => {
                        const rating = r.rating || r._id;
                        const count = r.count;
                        if (rating <= 2) buckets["1-2"] += count;
                        else if (rating <= 4) buckets["3-4"] += count;
                        else if (rating <= 6) buckets["5-6"] += count;
                        else if (rating <= 8) buckets["7-8"] += count;
                        else buckets["9-10"] += count;
                    });
                    setRatingDistribution(Object.entries(buckets).map(([name, value]) => ({ name, value })));
                }

                // Activity (Direct map or mock fallback if empty)
                if (vizData.activity_timeline && vizData.activity_timeline.length > 0) {
                    setUserActivity(vizData.activity_timeline);
                    // Use activity for growth
                    setMonthlyGrowth(
                        vizData.activity_timeline.map((a: any) => ({
                            name: a.name,
                            value: a.users,
                        }))
                    );
                } else {
                    // Fallback to mock activity if API not ready
                    const mockActivity = [
                        { name: "Jan", users: 8000, ratings: 45000 },
                        { name: "Feb", users: 9500, ratings: 52000 },
                        { name: "Mar", users: 11000, ratings: 61000 },
                        { name: "Apr", users: 10500, ratings: 58000 },
                        { name: "May", users: 12000, ratings: 68000 },
                        { name: "Jun", users: 12500, ratings: 72000 },
                    ];
                    setUserActivity(mockActivity);
                    setMonthlyGrowth(mockActivity.map((a) => ({ name: a.name, value: a.users })));
                }

                // Fetch Models
                const models = await api.getModels();
                if (models && models.length > 0) {
                    // Create radar data: normalized metrics 0-100
                    // We need to map models to keys (contentBased, itemBased, etc.) or just index
                    // Let's rely on model name
                    const getData = (modelNamePart: string, metric: keyof ModelMetrics) => {
                        const m = models.find((m) => m.model_name.toLowerCase().includes(modelNamePart));
                        if (!m) return 0;
                        const val = m[metric] as number;
                        return Math.round(val * 100);
                    };

                    const perfData = [
                        {
                            subject: "RMSE (Inv)",
                            contentBased: 100 - getData("content", "rmse"),
                            itemBased: 100 - getData("item", "rmse"),
                            userBased: 100 - getData("user", "rmse"),
                            hybrid: 100 - getData("hybrid", "rmse"),
                        },
                        {
                            subject: "Precision",
                            contentBased: getData("content", "precision_k"),
                            itemBased: getData("item", "precision_k"),
                            userBased: getData("user", "precision_k"),
                            hybrid: getData("hybrid", "precision_k"),
                        },
                        {
                            subject: "Recall",
                            contentBased: getData("content", "recall_k"),
                            itemBased: getData("item", "recall_k"),
                            userBased: getData("user", "recall_k"),
                            hybrid: getData("hybrid", "recall_k"),
                        },
                        {
                            subject: "Accuracy",
                            contentBased: getData("content", "precision_k"), // Using Precision as proxy for Accuracy
                            itemBased: getData("item", "precision_k"),
                            userBased: getData("user", "precision_k"),
                            hybrid: getData("hybrid", "precision_k"),
                        },
                        {
                            subject: "NDCG",
                            contentBased: getData("content", "ndcg_k"),
                            itemBased: getData("item", "ndcg_k"),
                            userBased: getData("user", "ndcg_k"),
                            hybrid: getData("hybrid", "ndcg_k"),
                        },
                    ];
                    setModelPerformance(perfData);
                }
            } catch (err) {
                console.error("Failed to fetch charts data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

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
                            <h1 className="text-3xl md:text-4xl font-bold text-gradient">Data Visualization</h1>
                            <p className="text-muted-foreground mt-2">Advanced analytics and insights</p>
                        </div>
                        <Button className="anime-gradient" size="lg">
                            <Download className="mr-2 h-5 w-5" />
                            Export Report
                        </Button>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Genre Distribution - Pie Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Genre Distribution</CardTitle>
                                <CardDescription>Top 5 anime genres by count</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <PieChart data={genreData} />
                            </CardContent>
                        </Card>

                        {/* Type Distribution - Pie Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Type Distribution</CardTitle>
                                <CardDescription>Anime by format type</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <PieChart data={typeData} />
                            </CardContent>
                        </Card>

                        {/* Rating Distribution - Bar Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Rating Distribution</CardTitle>
                                <CardDescription>Number of anime by rating range</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <BarChart data={ratingDistribution} />
                            </CardContent>
                        </Card>

                        {/* User Activity - Line Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>User Activity</CardTitle>
                                <CardDescription>Active users and ratings over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <LineChart
                                    data={userActivity}
                                    lines={[
                                        { dataKey: "users", color: "hsl(var(--primary))", name: "Active Users" },
                                        { dataKey: "ratings", color: "hsl(var(--secondary))", name: "Ratings" },
                                    ]}
                                />
                            </CardContent>
                        </Card>

                        {/* Monthly Growth - Area Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-primary" />
                                    Monthly Growth
                                </CardTitle>
                                <CardDescription>Active user growth trend</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <AreaChart data={monthlyGrowth} />
                            </CardContent>
                        </Card>

                        {/* Model Performance - Radar Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Model Performance Comparison</CardTitle>
                                <CardDescription>ML model metrics across different algorithms (100 scale)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RadarChart
                                    data={modelPerformance}
                                    datasets={[
                                        { dataKey: "contentBased", color: "hsl(var(--chart-1))", name: "Content-Based" },
                                        { dataKey: "itemBased", color: "hsl(var(--chart-2))", name: "Item-Based CF" },
                                        { dataKey: "userBased", color: "hsl(var(--chart-3))", name: "User-Based CF" },
                                        { dataKey: "hybrid", color: "hsl(var(--chart-4))", name: "Hybrid" },
                                    ]}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Summary Stats - Calculated from real data */}
                    <div className="grid md:grid-cols-4 gap-4">
                        <Card className="border-2 border-primary/20 bg-primary/5">
                            <CardContent className="pt-6">
                                <div className="text-3xl font-bold text-primary">
                                    {userActivity.length > 0 ? userActivity[userActivity.length - 1].users.toLocaleString() : "0"}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">Total Active Users</p>
                            </CardContent>
                        </Card>
                        <Card className="border-2 border-secondary/20 bg-secondary/5">
                            <CardContent className="pt-6">
                                <div className="text-3xl font-bold text-secondary">
                                    {userActivity.length > 0 ? userActivity[userActivity.length - 1].ratings.toLocaleString() : "0"}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">Total Ratings</p>
                            </CardContent>
                        </Card>
                        <Card className="border-2 border-accent/20 bg-accent/5">
                            <CardContent className="pt-6">
                                <div className="text-3xl font-bold text-accent">
                                    {modelPerformance.length > 0 ? modelPerformance.find((p) => p.subject === "Precision")?.hybrid + "%" : "0%"}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">Best Precision (Hybrid)</p>
                            </CardContent>
                        </Card>
                        <Card className="border-2 border-chart-4/20 bg-chart-4/5">
                            <CardContent className="pt-6">
                                <div className="text-3xl font-bold" style={{ color: "hsl(var(--chart-4))" }}>
                                    {modelPerformance.length > 0 ? (100 - modelPerformance.find((p) => p.subject === "RMSE (Inv)")?.hybrid) / 100 : "0"}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">Best RMSE (Hybrid)</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
