"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart } from "@/components/charts/pie-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";

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
                    // Transform to simple array for table display
                    const tableData = models.map((m) => ({
                        name: m.model_name,
                        rmse: m.rmse || 0,
                        mae: m.mae || 0,
                        precision: m.precision_k || 0,
                        recall: m.recall_k || 0,
                        f1: m.f1_k || 0,
                        ndcg: m.ndcg_k || 0,
                    }));
                    setModelPerformance(tableData);
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
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gradient">Data Visualization</h1>
                        <p className="text-muted-foreground mt-2">Advanced analytics and insights</p>
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

                        {/* Model Performance - Metrics Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Model Performance Comparison</CardTitle>
                                <CardDescription>Raw metrics for each recommendation algorithm</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {modelPerformance.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-border">
                                                    <th className="text-left py-3 px-2 font-semibold text-muted-foreground">Model</th>
                                                    <th className="text-center py-3 px-2 font-semibold text-muted-foreground">RMSE</th>
                                                    <th className="text-center py-3 px-2 font-semibold text-muted-foreground">MAE</th>
                                                    <th className="text-center py-3 px-2 font-semibold text-muted-foreground">Precision</th>
                                                    <th className="text-center py-3 px-2 font-semibold text-muted-foreground">Recall</th>
                                                    <th className="text-center py-3 px-2 font-semibold text-muted-foreground">F1</th>
                                                    <th className="text-center py-3 px-2 font-semibold text-muted-foreground">NDCG</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {modelPerformance.map((model, idx) => (
                                                    <tr key={idx} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                                                        <td className="py-3 px-2 font-medium">{model.name}</td>
                                                        <td className="text-center py-3 px-2">
                                                            <span
                                                                className={`px-2 py-1 rounded text-xs font-mono ${
                                                                    model.rmse <= 1.5
                                                                        ? "bg-green-500/20 text-green-400"
                                                                        : model.rmse <= 2.5
                                                                        ? "bg-yellow-500/20 text-yellow-400"
                                                                        : "bg-red-500/20 text-red-400"
                                                                }`}
                                                            >
                                                                {model.rmse.toFixed(4)}
                                                            </span>
                                                        </td>
                                                        <td className="text-center py-3 px-2">
                                                            <span
                                                                className={`px-2 py-1 rounded text-xs font-mono ${
                                                                    model.mae <= 1.0
                                                                        ? "bg-green-500/20 text-green-400"
                                                                        : model.mae <= 2.0
                                                                        ? "bg-yellow-500/20 text-yellow-400"
                                                                        : "bg-red-500/20 text-red-400"
                                                                }`}
                                                            >
                                                                {model.mae.toFixed(4)}
                                                            </span>
                                                        </td>
                                                        <td className="text-center py-3 px-2">
                                                            <span
                                                                className={`px-2 py-1 rounded text-xs font-mono ${
                                                                    model.precision >= 0.7
                                                                        ? "bg-green-500/20 text-green-400"
                                                                        : model.precision >= 0.4
                                                                        ? "bg-yellow-500/20 text-yellow-400"
                                                                        : "bg-red-500/20 text-red-400"
                                                                }`}
                                                            >
                                                                {model.precision.toFixed(4)}
                                                            </span>
                                                        </td>
                                                        <td className="text-center py-3 px-2">
                                                            <span
                                                                className={`px-2 py-1 rounded text-xs font-mono ${
                                                                    model.recall >= 0.7
                                                                        ? "bg-green-500/20 text-green-400"
                                                                        : model.recall >= 0.4
                                                                        ? "bg-yellow-500/20 text-yellow-400"
                                                                        : "bg-red-500/20 text-red-400"
                                                                }`}
                                                            >
                                                                {model.recall.toFixed(4)}
                                                            </span>
                                                        </td>
                                                        <td className="text-center py-3 px-2">
                                                            <span
                                                                className={`px-2 py-1 rounded text-xs font-mono ${
                                                                    model.f1 >= 0.7
                                                                        ? "bg-green-500/20 text-green-400"
                                                                        : model.f1 >= 0.4
                                                                        ? "bg-yellow-500/20 text-yellow-400"
                                                                        : "bg-red-500/20 text-red-400"
                                                                }`}
                                                            >
                                                                {model.f1.toFixed(4)}
                                                            </span>
                                                        </td>
                                                        <td className="text-center py-3 px-2">
                                                            <span
                                                                className={`px-2 py-1 rounded text-xs font-mono ${
                                                                    model.ndcg >= 0.7
                                                                        ? "bg-green-500/20 text-green-400"
                                                                        : model.ndcg >= 0.4
                                                                        ? "bg-yellow-500/20 text-yellow-400"
                                                                        : "bg-red-500/20 text-red-400"
                                                                }`}
                                                            >
                                                                {model.ndcg.toFixed(4)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-center py-8">No model metrics available. Please train models first.</p>
                                )}
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
