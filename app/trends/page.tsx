"use client";

import { useState } from "react";
import { TrendGrid, TrendPreview } from "@/components/trends";
import { useTrends } from "@/hooks/use-trends";
import { Doc } from "@/convex/_generated/dataModel";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Trend = Doc<"trends">;

export default function PublicTrendsPage() {
  const [selectedTrend, setSelectedTrend] = useState<Trend | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Fetch trends with React Query integration
  const {
    data: trends = [],
    isLoading,
    isError,
    refetch,
  } = useTrends({
    limit: 20,
    sortBy: "viralScore",
    sortOrder: "desc",
  }) as {
    data: Trend[];
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };

  const handleTrendSelect = (trend: Trend) => {
    setSelectedTrend(trend);
    setPreviewOpen(true);
  };

  const handleCreateVideo = (trend: Trend) => {
    console.log("Create video for trend:", trend.title);
    // Navigate to sign in or creation wizard
    window.location.href = "/dashboard/create";
  };

  const handleRefresh = () => {
    refetch();
  };

  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              Trending Content
            </h1>
            <p className="text-muted-foreground text-lg">
              Discover viral topics and trending content across platforms
            </p>
          </div>

          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Failed to load trends. Please try again.
            </p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">
            Trending Content
          </h1>
          <p className="text-muted-foreground text-lg">
            Discover viral topics and trending content across platforms
          </p>
        </div>

        {/* Trends Grid with integrated search, filters, and sorting */}
        <TrendGrid
          trends={trends}
          isLoading={isLoading}
          onTrendSelect={handleTrendSelect}
          onLoadMore={undefined}
          hasMore={false}
        />

        {/* Trend Preview Modal */}
        <TrendPreview
          trend={selectedTrend}
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          onCreateVideo={handleCreateVideo}
        />
      </div>
    </div>
  );
}
