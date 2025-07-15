"use client";

import { useState } from "react";
import { Doc } from "@/convex/_generated/dataModel";
import { TrendCard } from "./trend-card";
import { TrendFilters } from "./trend-filters";
import { TrendSearch } from "./trend-search";
import { TrendSort } from "./trend-sort";
import { LoadingGrid } from "./loading-grid";
import { EmptyState } from "./empty-state";

type Trend = Doc<"trends">;

interface TrendGridProps {
  trends: Trend[];
  isLoading?: boolean;
  onTrendSelect?: (trend: Trend) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  className?: string;
}

export function TrendGrid({
  trends,
  isLoading = false,
  onTrendSelect,
  onLoadMore,
  hasMore = false,
  className = "",
}: TrendGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<
    "viralScore" | "createdAt" | "engagementTotal"
  >("viralScore");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Filter trends based on search and filters
  const filteredTrends = trends.filter((trend) => {
    const matchesSearch =
      !searchQuery ||
      trend.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trend.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPlatform =
      !selectedPlatform || trend.platform === selectedPlatform;
    const matchesCategory =
      !selectedCategory || trend.category === selectedCategory;

    return matchesSearch && matchesPlatform && matchesCategory;
  });

  // Sort trends
  const sortedTrends = [...filteredTrends].sort((a, b) => {
    let aValue: number;
    let bValue: number;

    switch (sortBy) {
      case "viralScore":
        aValue = a.viralScore;
        bValue = b.viralScore;
        break;
      case "createdAt":
        aValue = a.createdAt;
        bValue = b.createdAt;
        break;
      case "engagementTotal":
        aValue =
          (a.engagementMetrics.likes || 0) +
          (a.engagementMetrics.shares || a.engagementMetrics.retweets || 0) +
          (a.engagementMetrics.comments || a.engagementMetrics.replies || 0);
        bValue =
          (b.engagementMetrics.likes || 0) +
          (b.engagementMetrics.shares || b.engagementMetrics.retweets || 0) +
          (b.engagementMetrics.comments || b.engagementMetrics.replies || 0);
        break;
      default:
        aValue = a.viralScore;
        bValue = b.viralScore;
    }

    return sortOrder === "desc" ? bValue - aValue : aValue - bValue;
  });

  if (isLoading && trends.length === 0) {
    return <LoadingGrid />;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search and Controls */}
      <div className="space-y-4">
        <TrendSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search trending topics..."
        />

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <TrendFilters
            selectedPlatform={selectedPlatform}
            selectedCategory={selectedCategory}
            onPlatformChange={setSelectedPlatform}
            onCategoryChange={setSelectedCategory}
            trends={trends}
          />

          <TrendSort
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortByChange={setSortBy}
            onSortOrderChange={setSortOrder}
          />
        </div>
      </div>

      {/* Results Summary */}
      {searchQuery || selectedPlatform || selectedCategory ? (
        <div className="text-sm text-muted-foreground">
          Showing {sortedTrends.length} of {trends.length} trends
          {searchQuery && <span> matching "{searchQuery}"</span>}
          {selectedPlatform && <span> on {selectedPlatform}</span>}
          {selectedCategory && <span> in {selectedCategory}</span>}
        </div>
      ) : null}

      {/* Trends Grid */}
      {sortedTrends.length === 0 ? (
        <EmptyState
          hasFilters={!!(searchQuery || selectedPlatform || selectedCategory)}
          onClearFilters={() => {
            setSearchQuery("");
            setSelectedPlatform(null);
            setSelectedCategory(null);
          }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedTrends.map((trend) => (
              <TrendCard
                key={trend._id}
                trend={trend}
                onSelect={onTrendSelect}
              />
            ))}
          </div>

          {/* Load More */}
          {hasMore && onLoadMore && (
            <div className="flex justify-center">
              <button
                onClick={onLoadMore}
                disabled={isLoading}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
