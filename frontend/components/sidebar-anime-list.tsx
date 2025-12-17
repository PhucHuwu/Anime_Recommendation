"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Anime } from "@/lib/api";

interface SidebarAnimeListProps {
    items: Anime[];
    loading?: boolean;
    emptyMessage?: string;
}

export function SidebarAnimeList({ items, loading = false, emptyMessage = "No anime available" }: SidebarAnimeListProps) {
    const itemsPerPage = 5;
    const [currentPage, setCurrentPage] = useState(0);
    const totalPages = Math.ceil(items.length / itemsPerPage);

    const handleNext = () => {
        setCurrentPage((prev) => (prev + 1) % totalPages);
    };

    const handlePrev = () => {
        setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
    };

    const currentItems = items.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

    if (loading) {
        return <p className="text-sm text-muted-foreground">Loading...</p>;
    }

    if (items.length === 0) {
        return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
    }

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                {currentItems.map((anime) => (
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
                ))}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-muted-foreground">
                        Page {currentPage + 1} of {totalPages}
                    </span>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrev}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNext}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
