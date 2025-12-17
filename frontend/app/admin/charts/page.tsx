"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart } from "@/components/charts/pie-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { RadarChart } from "@/components/charts/radar-chart";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { api, ModelMetrics } from "@/lib/api";

export default function AdminChartsPage() {
    const [loading, setLoading] = useState(true);
    const [genreData, setGenreData] = useState<{ name: string; value: number }[]>([]);
    const [typeData, setTypeData] = useState<{ name: string; value: number }[]>([]);
    const [ratingDistribution, setRatingDistribution] = useState<{ name: string; value: number }[]>([]);
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

                // Fetch Models
                const models = await api.getModels();
                if (models && models.length > 0) {
                    // Create radar data: normalized metrics 0-100
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
                                        { dataKey: "contentBased", color: "var(--chart-1)", name: "Content-Based" },
                                        { dataKey: "itemBased", color: "var(--chart-2)", name: "Item-Based CF" },
                                        { dataKey: "userBased", color: "var(--chart-3)", name: "User-Based CF" },
                                        { dataKey: "hybrid", color: "var(--chart-4)", name: "Hybrid" },
                                    ]}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Removed Summary Cards */}
                </div>
            </main>

            <Footer />
        </div>
    );
}
