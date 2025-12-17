/**
 * API Client for Anime Recommendation System
 * Centralized API calls to backend FastAPI
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Types for API responses
export interface Anime {
    anime_id: number;
    name: string;
    genre: string[];
    type: string;
    episodes: number;
    rating: number;
    members: number;
    image_url?: string;
}

export interface AnimeDetail extends Anime {
    synopsis?: string;
    aired?: string;
    score?: number;
}

export interface UserProfile {
    user_id: number;
    total_ratings: number;
    average_rating: number;
    favorite_genres: string[];
    rating_distribution: Record<number, number>;
}

export interface UserRating {
    anime_id: number;
    anime_name: string;
    rating: number;
    rated_at?: string;
}

export interface ModelMetrics {
    model_name: string;
    rmse: number;
    mae: number;
    precision_k: number;
    recall_k: number;
    ndcg_k?: number;
    is_active?: boolean;
    trained_at?: string;
    status?: string;
    description?: string;
}

export interface RetrainStatus {
    status: "idle" | "running" | "completed" | "error";
    message: string;
    progress: number;
    started_at?: string;
    model_name?: string;
}

export interface Statistics {
    total_users: number;
    total_anime: number;
    total_ratings: number;
    avg_rating: number;
    rating_distribution: Record<number, number>;
    top_genres: Array<{ genre: string; count: number }>;
}

// Helper function for API requests
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options?.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(error.detail || `API Error: ${response.status}`);
    }

    return response.json();
}

// API Client
export const api = {
    // ==========================================
    // AUTHENTICATION
    // ==========================================
    login: async (userId: number) => {
        return fetchAPI<{ user_id: number; message: string }>("/api/login", {
            method: "POST",
            body: JSON.stringify({ user_id: userId }),
        });
    },

    logout: async () => {
        return fetchAPI<{ message: string }>("/api/logout", {
            method: "POST",
        });
    },

    // ==========================================
    // RECOMMENDATIONS
    // ==========================================
    getRecommendations: async (userId: number, n: number = 20, model: string = "hybrid") => {
        return fetchAPI<{ items: Anime[]; model: string; user_id: number }>(`/api/recommendations?user_id=${userId}&n=${n}&model=${model}`);
    },

    getSimilarAnime: async (animeId: number, n: number = 20) => {
        return fetchAPI<{ items: Anime[]; model: string }>(`/api/recommendations/similar/${animeId}?n=${n}`);
    },

    getPopularAnime: async (n: number = 20) => {
        return fetchAPI<{ items: Anime[]; model: string }>(`/api/recommendations/popular?n=${n}`);
    },

    getRealtimeRecommendations: async (userId: number, contextAnimeId?: number, n: number = 20) => {
        const params = new URLSearchParams({
            user_id: userId.toString(),
            n: n.toString(),
        });
        if (contextAnimeId) {
            params.append("context_anime_id", contextAnimeId.toString());
        }
        return fetchAPI<{ items: Anime[]; model: string; user_id: number }>(`/api/recommendations/realtime?${params}`);
    },

    // ==========================================
    // ANIME
    // ==========================================
    getAnimeList: async (
        page: number = 1,
        pageSize: number = 20,
        options?: {
            type?: string;
            sort?: string;
            order?: string;
        }
    ) => {
        const params = new URLSearchParams({
            page: page.toString(),
            page_size: pageSize.toString(),
        });
        if (options?.type) params.append("type", options.type);
        if (options?.sort) params.append("sort", options.sort);
        if (options?.order) params.append("order", options.order);

        return fetchAPI<{
            items: Anime[];
            total: number;
            page: number;
            page_size: number;
            total_pages: number;
        }>(`/api/anime?${params}`);
    },

    searchAnime: async (query: string, limit: number = 20) => {
        return fetchAPI<Anime[]>(`/api/anime/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    },

    getTopAnime: async (n: number = 20, by: string = "rating") => {
        return fetchAPI<Anime[]>(`/api/anime/top?n=${n}&by=${by}`);
    },

    getAnimeDetail: async (animeId: number) => {
        return fetchAPI<AnimeDetail>(`/api/anime/${animeId}`);
    },

    // ==========================================
    // USER
    // ==========================================
    getUserProfile: async (userId: number) => {
        return fetchAPI<UserProfile>(`/api/user/${userId}/profile`);
    },

    getUserRatings: async (userId: number, page: number = 1, pageSize: number = 20) => {
        return fetchAPI<{
            items: UserRating[];
            total: number;
            page: number;
            page_size: number;
        }>(`/api/user/${userId}/ratings?page=${page}&page_size=${pageSize}`);
    },

    getUserHistory: async (userId: number) => {
        return fetchAPI<{ items: UserRating[] }>(`/api/user/${userId}/history`);
    },

    rateAnime: async (userId: number, animeId: number, rating: number) => {
        return fetchAPI<{ message: string; rating: number }>("/api/user/rate", {
            method: "POST",
            body: JSON.stringify({
                user_id: userId,
                anime_id: animeId,
                rating: rating,
            }),
        });
    },

    // ==========================================
    // ADMIN
    // ==========================================
    getStats: async () => {
        return fetchAPI<Statistics>("/api/admin/stats");
    },

    getModels: async () => {
        return fetchAPI<ModelMetrics[]>("/api/admin/models");
    },

    getVisualizationData: async () => {
        return fetchAPI<{
            genre_distribution: { name: string; value: number }[];
            type_distribution: { name: string; value: number }[];
            rating_distribution: { rating: number; count: number }[];
            activity_timeline: { name: string; users: number; ratings: number }[];
            top_anime: { rank: number; name: string; rating: number; members: number }[];
        }>("/api/admin/visualization");
    },

    retrainModel: async (modelName?: string) => {
        const url = modelName ? `/api/admin/models/retrain?model=${encodeURIComponent(modelName)}` : "/api/admin/models/retrain";
        return fetchAPI<{ message: string; model: string }>(url, {
            method: "POST",
        });
    },

    getRetrainStatus: async () => {
        return fetchAPI<RetrainStatus>("/api/admin/models/retrain/status");
    },
};

export default api;
