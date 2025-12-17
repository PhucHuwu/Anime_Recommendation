"use client"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Film, Star, TrendingUp, Activity, Database, Settings, BarChart3, RefreshCw } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { PieChart } from "@/components/charts/pie-chart"
import { LineChart } from "@/components/charts/line-chart"

// Mock data
const mockStats = {
  totalUsers: 69600,
  totalAnime: 12294,
  totalRatings: 7700000,
  averageRating: 7.7,
  activeUsers: 12500,
  newUsersThisMonth: 2340,
}

const mockModels = [
  {
    name: "Content-Based Filtering",
    status: "active",
    rmse: 0.92,
    mae: 0.75,
    precisionK: 0.68,
    recallK: 0.72,
    lastTrained: "2024-06-15",
    description: "Recommends based on anime features and metadata",
  },
  {
    name: "Item-Based Collaborative Filtering",
    status: "active",
    rmse: 0.85,
    mae: 0.68,
    precisionK: 0.74,
    recallK: 0.78,
    lastTrained: "2024-06-14",
    description: "Recommends based on anime similarity patterns",
  },
  {
    name: "User-Based Collaborative Filtering",
    status: "active",
    rmse: 0.88,
    mae: 0.71,
    precisionK: 0.71,
    recallK: 0.75,
    lastTrained: "2024-06-14",
    description: "Recommends based on similar user preferences",
  },
  {
    name: "Hybrid Model",
    status: "active",
    rmse: 0.82,
    mae: 0.65,
    precisionK: 0.79,
    recallK: 0.82,
    lastTrained: "2024-06-15",
    description: "Combines multiple algorithms for best results",
  },
]

const mockGenreStats = [
  { genre: "Action", count: 2500, percentage: 20.3 },
  { genre: "Adventure", count: 1800, percentage: 14.6 },
  { genre: "Comedy", count: 1600, percentage: 13.0 },
  { genre: "Drama", count: 1400, percentage: 11.4 },
  { genre: "Fantasy", count: 1200, percentage: 9.8 },
  { genre: "Romance", count: 1000, percentage: 8.1 },
  { genre: "Sci-Fi", count: 900, percentage: 7.3 },
  { genre: "Mystery", count: 800, percentage: 6.5 },
]

const mockTypeStats = [
  { type: "TV", count: 8500, percentage: 69.1 },
  { type: "Movie", count: 2000, percentage: 16.3 },
  { type: "OVA", count: 1200, percentage: 9.8 },
  { type: "Special", count: 400, percentage: 3.3 },
  { type: "ONA", count: 194, percentage: 1.6 },
]

const genreChartData = mockGenreStats.slice(0, 5).map((item) => ({ name: item.genre, value: item.count }))
const typeChartData = mockTypeStats.map((item) => ({ name: item.type, value: item.count }))
const activityData = [
  { name: "Jan", users: 8000, ratings: 45000 },
  { name: "Feb", users: 9500, ratings: 52000 },
  { name: "Mar", users: 11000, ratings: 61000 },
  { name: "Apr", users: 10500, ratings: 58000 },
  { name: "May", users: 12000, ratings: 68000 },
  { name: "Jun", users: 12500, ratings: 72000 },
]

export default function AdminPage() {
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
            <div className="flex gap-2">
              <Button variant="outline" size="lg" asChild>
                <Link href="/admin/charts">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  View Charts
                </Link>
              </Button>
              <Button className="anime-gradient" size="lg">
                <Settings className="mr-2 h-5 w-5" />
                Settings
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold">{mockStats.totalUsers.toLocaleString()}</div>
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
                  <div className="text-2xl font-bold">{mockStats.totalAnime.toLocaleString()}</div>
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
                  <div className="text-2xl font-bold">{(mockStats.totalRatings / 1000000).toFixed(1)}M</div>
                  <p className="text-xs text-muted-foreground mt-1">Total Ratings</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold">{mockStats.averageRating.toFixed(1)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Avg Rating</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <Activity className="h-8 w-8 text-secondary" />
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold">{mockStats.activeUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">Active Users</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <Database className="h-8 w-8 text-accent" />
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold">+{mockStats.newUsersThisMonth.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">New This Month</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="models" className="space-y-6">
            <TabsList className="grid w-full max-w-2xl grid-cols-3">
              <TabsTrigger value="models">Models</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
              <TabsTrigger value="database">Database</TabsTrigger>
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
                    <Button className="anime-gradient">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Retrain All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockModels.map((model) => (
                      <Card key={model.name} className="border-2">
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-lg">{model.name}</h3>
                                  <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                                    {model.status}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{model.description}</p>
                              </div>
                              <Button variant="outline" size="sm">
                                <RefreshCw className="mr-2 h-4 w-4" />
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
                                <p className="text-xl font-bold text-accent">{model.precisionK}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Recall@K</p>
                                <p className="text-xl font-bold text-purple-500">{model.recallK}</p>
                              </div>
                            </div>

                            <div className="pt-2 border-t">
                              <p className="text-xs text-muted-foreground">
                                Last Trained: <span className="font-medium text-foreground">{model.lastTrained}</span>
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
                        {mockModels.map((model, index) => (
                          <tr key={model.name} className="border-b border-border hover:bg-muted/50 transition-colors">
                            <td className="py-4 px-4 font-medium">{model.name}</td>
                            <td className="text-center py-4 px-4">
                              <span
                                className={`font-semibold ${
                                  model.rmse === Math.min(...mockModels.map((m) => m.rmse))
                                    ? "text-green-500"
                                    : "text-foreground"
                                }`}
                              >
                                {model.rmse}
                              </span>
                            </td>
                            <td className="text-center py-4 px-4">
                              <span
                                className={`font-semibold ${
                                  model.mae === Math.min(...mockModels.map((m) => m.mae))
                                    ? "text-green-500"
                                    : "text-foreground"
                                }`}
                              >
                                {model.mae}
                              </span>
                            </td>
                            <td className="text-center py-4 px-4">
                              <span
                                className={`font-semibold ${
                                  model.precisionK === Math.max(...mockModels.map((m) => m.precisionK))
                                    ? "text-green-500"
                                    : "text-foreground"
                                }`}
                              >
                                {model.precisionK}
                              </span>
                            </td>
                            <td className="text-center py-4 px-4">
                              <span
                                className={`font-semibold ${
                                  model.recallK === Math.max(...mockModels.map((m) => m.recallK))
                                    ? "text-green-500"
                                    : "text-foreground"
                                }`}
                              >
                                {model.recallK}
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
              <div className="grid lg:grid-cols-3 gap-6 mb-6">
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

                <Card>
                  <CardHeader>
                    <CardTitle>User Activity</CardTitle>
                    <CardDescription>Last 6 months</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LineChart
                      data={activityData}
                      lines={[
                        { dataKey: "users", color: "hsl(var(--primary))", name: "Users" },
                        { dataKey: "ratings", color: "hsl(var(--secondary))", name: "Ratings" },
                      ]}
                    />
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
                      {mockGenreStats.map((item) => (
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
                      {mockTypeStats.map((item) => (
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

            {/* Database Tab */}
            <TabsContent value="database" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Database Overview</CardTitle>
                  <CardDescription>Monitor database health and performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg border-2 border-primary/20 bg-primary/5">
                        <Database className="h-8 w-8 text-primary mb-2" />
                        <div className="text-2xl font-bold">98.5%</div>
                        <p className="text-sm text-muted-foreground">Uptime</p>
                      </div>
                      <div className="p-4 rounded-lg border-2 border-secondary/20 bg-secondary/5">
                        <Activity className="h-8 w-8 text-secondary mb-2" />
                        <div className="text-2xl font-bold">1.2ms</div>
                        <p className="text-sm text-muted-foreground">Avg Query Time</p>
                      </div>
                      <div className="p-4 rounded-lg border-2 border-accent/20 bg-accent/5">
                        <TrendingUp className="h-8 w-8 text-accent mb-2" />
                        <div className="text-2xl font-bold">45GB</div>
                        <p className="text-sm text-muted-foreground">Database Size</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold">Recent Operations</h4>
                      <div className="space-y-2">
                        {[
                          { operation: "User registration", time: "2 minutes ago", status: "success" },
                          { operation: "Rating update", time: "5 minutes ago", status: "success" },
                          { operation: "Model training", time: "1 hour ago", status: "success" },
                          { operation: "Data backup", time: "2 hours ago", status: "success" },
                          { operation: "Cache refresh", time: "3 hours ago", status: "success" },
                        ].map((op, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                            <span className="text-sm font-medium">{op.operation}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-muted-foreground">{op.time}</span>
                              <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                                {op.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
