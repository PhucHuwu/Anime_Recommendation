"use client";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart } from "@/components/charts/pie-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { LineChart } from "@/components/charts/line-chart";
import { AreaChart } from "@/components/charts/area-chart";
import { RadarChart } from "@/components/charts/radar-chart";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp } from "lucide-react";

// Sample data for charts visualization (static demo data)
const genreData = [
    { name: "Action", value: 2500 },
    { name: "Adventure", value: 1800 },
    { name: "Comedy", value: 1600 },
    { name: "Drama", value: 1400 },
    { name: "Fantasy", value: 1200 },
];

const typeData = [
    { name: "TV", value: 8500 },
    { name: "Movie", value: 2000 },
    { name: "OVA", value: 1200 },
    { name: "Special", value: 400 },
    { name: "ONA", value: 194 },
];

const ratingDistribution = [
    { name: "1-2", value: 150 },
    { name: "3-4", value: 450 },
    { name: "5-6", value: 1200 },
    { name: "7-8", value: 3500 },
    { name: "9-10", value: 2000 },
];

const userActivity = [
    { name: "Jan", users: 8000, ratings: 45000 },
    { name: "Feb", users: 9500, ratings: 52000 },
    { name: "Mar", users: 11000, ratings: 61000 },
    { name: "Apr", users: 10500, ratings: 58000 },
    { name: "May", users: 12000, ratings: 68000 },
    { name: "Jun", users: 12500, ratings: 72000 },
];

const monthlyGrowth = [
    { name: "Jan", value: 8000 },
    { name: "Feb", value: 9500 },
    { name: "Mar", value: 11000 },
    { name: "Apr", value: 10500 },
    { name: "May", value: 12000 },
    { name: "Jun", value: 12500 },
];

const modelPerformance = [
    { subject: "Accuracy", contentBased: 85, itemBased: 87, userBased: 86, hybrid: 89 },
    { subject: "Precision", contentBased: 82, itemBased: 85, userBased: 83, hybrid: 88 },
    { subject: "Recall", contentBased: 80, itemBased: 83, userBased: 81, hybrid: 86 },
    { subject: "F1-Score", contentBased: 81, itemBased: 84, userBased: 82, hybrid: 87 },
    { subject: "Speed", contentBased: 90, itemBased: 85, userBased: 80, hybrid: 75 },
];

export default function AdminChartsPage() {
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
                                <CardDescription>ML model metrics across different algorithms</CardDescription>
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

                    {/* Summary Stats */}
                    <div className="grid md:grid-cols-4 gap-4">
                        <Card className="border-2 border-primary/20 bg-primary/5">
                            <CardContent className="pt-6">
                                <div className="text-3xl font-bold text-primary">+23.5%</div>
                                <p className="text-sm text-muted-foreground mt-1">User Growth</p>
                            </CardContent>
                        </Card>
                        <Card className="border-2 border-secondary/20 bg-secondary/5">
                            <CardContent className="pt-6">
                                <div className="text-3xl font-bold text-secondary">+18.2%</div>
                                <p className="text-sm text-muted-foreground mt-1">Rating Growth</p>
                            </CardContent>
                        </Card>
                        <Card className="border-2 border-accent/20 bg-accent/5">
                            <CardContent className="pt-6">
                                <div className="text-3xl font-bold text-accent">89.5%</div>
                                <p className="text-sm text-muted-foreground mt-1">Model Accuracy</p>
                            </CardContent>
                        </Card>
                        <Card className="border-2 border-chart-4/20 bg-chart-4/5">
                            <CardContent className="pt-6">
                                <div className="text-3xl font-bold" style={{ color: "hsl(var(--chart-4))" }}>
                                    0.82
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">Best RMSE</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
