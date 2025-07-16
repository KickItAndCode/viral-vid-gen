"use client";

import { useState, useMemo } from "react";
import { VideoCard } from "./video-card";
import type { VideoLibraryFilters } from "./video-library-filters";
import { VideoLibrarySearch } from "./video-library-search";
import { VideoLibrarySort } from "./video-library-sort";
import { VideoLibraryStats } from "./video-library-stats";
import { BulkActions } from "./bulk-actions";
import { EmptyState } from "./empty-state";
import { LoadingGrid } from "./loading-grid";
import { Pagination } from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Grid, List, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export interface VideoLibraryItem {
  id: string;
  title: string;
  description?: string;
  url?: string;
  thumbnailUrl?: string;
  duration: number;
  status: "generating" | "completed" | "failed" | "queued" | "processing";
  createdAt: Date;
  updatedAt: Date;
  fileSize?: number;
  viralScore?: number;
  views?: number;
  likes?: number;
  shares?: number;
  platform?: string;
  style?: string;
  aiProvider?: string;
  tags?: string[];
  progress?: number;
}

export interface VideoLibrarySortOption {
  field:
    | "createdAt"
    | "updatedAt"
    | "title"
    | "duration"
    | "viralScore"
    | "views";
  direction: "asc" | "desc";
}

export interface VideoLibraryGridProps {
  /** Array of video library items */
  videos: VideoLibraryItem[];
  /** Whether data is loading */
  isLoading?: boolean;
  /** Whether there's an error */
  error?: string;
  /** Total number of videos */
  totalCount?: number;
  /** Current page */
  currentPage?: number;
  /** Items per page */
  itemsPerPage?: number;
  /** Selected video IDs for bulk operations */
  selectedVideoIds?: string[];
  /** Callback for video selection */
  onVideoSelect?: (videoId: string) => void;
  /** Callback for bulk selection */
  onBulkSelect?: (videoIds: string[]) => void;
  /** Callback for video actions */
  onVideoAction?: (action: string, videoId: string) => void;
  /** Callback for bulk actions */
  onBulkAction?: (action: string, videoIds: string[]) => void;
  /** Callback for search */
  onSearch?: (query: string) => void;
  /** Callback for filtering */
  onFilter?: (filters: VideoLibraryFilters) => void;
  /** Callback for sorting */
  onSort?: (sort: VideoLibrarySortOption) => void;
  /** Callback for pagination */
  onPageChange?: (page: number) => void;
  /** Custom CSS class */
  className?: string;
}

export const VideoLibraryGrid = ({
  videos,
  isLoading = false,
  error,
  totalCount = 0,
  currentPage = 1,
  itemsPerPage = 12,
  selectedVideoIds = [],
  onVideoSelect,
  onBulkSelect,
  onVideoAction,
  onBulkAction,
  onSearch,
  onFilter,
  onSort,
  onPageChange,
  className,
}: VideoLibraryGridProps) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<VideoLibraryFilters>({});
  const [sortOption, setSortOption] = useState<VideoLibrarySortOption>({
    field: "createdAt",
    direction: "desc",
  });

  // Calculate statistics
  const stats = useMemo(() => {
    const total = videos.length;
    const completed = videos.filter((v) => v.status === "completed").length;
    const generating = videos.filter(
      (v) => v.status === "generating" || v.status === "processing"
    ).length;
    const failed = videos.filter((v) => v.status === "failed").length;
    const totalViews = videos.reduce((sum, v) => sum + (v.views || 0), 0);
    const totalLikes = videos.reduce((sum, v) => sum + (v.likes || 0), 0);
    const averageViralScore =
      videos.length > 0
        ? videos.reduce((sum, v) => sum + (v.viralScore || 0), 0) /
          videos.length
        : 0;

    return {
      total,
      completed,
      generating,
      failed,
      totalViews,
      totalLikes,
      averageViralScore,
    };
  }, [videos]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  // Handle filtering
  const handleFilter = (filters: VideoLibraryFilters) => {
    setActiveFilters(filters);
    onFilter?.(filters);
  };

  // Handle sorting
  const handleSort = (sort: VideoLibrarySortOption) => {
    setSortOption(sort);
    onSort?.(sort);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedVideoIds.length === videos.length) {
      onBulkSelect?.([]);
    } else {
      onBulkSelect?.(videos.map((v) => v.id));
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalCount);

  if (error) {
    return (
      <Card className={cn("p-6", className)}>
        <div className="text-center text-red-500">
          <p className="text-lg font-semibold">Error loading videos</p>
          <p className="text-sm text-muted-foreground mt-2">{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Statistics */}
      <VideoLibraryStats stats={stats} />

      {/* Search and Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Video Library</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                {startIndex + 1}-{endIndex} of {totalCount}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setViewMode(viewMode === "grid" ? "list" : "grid")
                }
              >
                {viewMode === "grid" ? (
                  <List className="h-4 w-4" />
                ) : (
                  <Grid className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <VideoLibrarySearch
            value={searchQuery}
            onChange={handleSearch}
            placeholder="Search videos by title, description, or tags..."
          />

          {/* Filters and Sort */}
          <div className="flex flex-wrap gap-4">
            <VideoLibraryFilters
              filters={activeFilters}
              onChange={handleFilter}
              videos={videos}
            />
            <VideoLibrarySort sortOption={sortOption} onChange={handleSort} />
          </div>

          {/* Bulk Actions */}
          {selectedVideoIds.length > 0 && (
            <BulkActions
              selectedCount={selectedVideoIds.length}
              onAction={onBulkAction}
              onSelectAll={handleSelectAll}
              onClearSelection={() => onBulkSelect?.([])}
            />
          )}
        </CardContent>
      </Card>

      {/* Video Grid */}
      {isLoading ? (
        <LoadingGrid viewMode={viewMode} />
      ) : videos.length === 0 ? (
        <EmptyState
          hasFilters={Object.keys(activeFilters).some(
            (key) => activeFilters[key as keyof VideoLibraryFilters]?.length > 0
          )}
          onClearFilters={() => handleFilter({})}
        />
      ) : (
        <div
          className={cn(
            "grid gap-4",
            viewMode === "grid"
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "grid-cols-1"
          )}
        >
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              viewMode={viewMode}
              isSelected={selectedVideoIds.includes(video.id)}
              onSelect={() => onVideoSelect?.(video.id)}
              onAction={(action) => onVideoAction?.(action, video.id)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default VideoLibraryGrid;
