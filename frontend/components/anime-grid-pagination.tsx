"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimeCard } from "@/components/anime-card";
import { Anime } from "@/lib/api";

interface AnimeGridPaginationProps {
    items: Anime[];
    itemsPerPage?: number;
    emptyMessage?: string;
}

export function AnimeGridPagination({ items, itemsPerPage = 10, emptyMessage = "No anime available" }: AnimeGridPaginationProps) {
    const [currentPage, setCurrentPage] = useState(0);
    const totalPages = Math.ceil(items.length / itemsPerPage);

    const handleNext = () => {
        setCurrentPage((prev) => (prev + 1) % totalPages);
    };

    const handlePrev = () => {
        setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
    };

    const currentItems = items.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

    if (items.length === 0) {
        return <div className="text-center py-8 text-muted-foreground">{emptyMessage}</div>;
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 min-h-[200px] content-start">
                {currentItems.map((anime) => (
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

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-4">
                    <Button variant="outline" size="icon" onClick={handlePrev} disabled={items.length <= itemsPerPage}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {currentPage + 1} of {totalPages}
                    </span>
                    <Button variant="outline" size="icon" onClick={handleNext} disabled={items.length <= itemsPerPage}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}
