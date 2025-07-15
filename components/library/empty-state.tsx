"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Video, Search, Filter, Plus, Sparkles } from "lucide-react";

export interface EmptyStateProps {
  /** Whether there are active filters */
  hasFilters?: boolean;
  /** Callback to clear filters */
  onClearFilters?: () => void;
  /** Callback to create new video */
  onCreateVideo?: () => void;
  /** Custom CSS class */
  className?: string;
}

export const EmptyState = ({
  hasFilters = false,
  onClearFilters,
  onCreateVideo,
  className,
}: EmptyStateProps) => {
  if (hasFilters) {
    return (
      <Card className={`p-8 ${className}`}>
        <CardContent className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No videos found</h3>
          <p className="text-muted-foreground mb-4">
            No videos match your current filters. Try adjusting your search
            criteria.
          </p>
          <Button onClick={onClearFilters} variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Clear Filters
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`p-8 ${className}`}>
      <CardContent className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
          <Video className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No videos yet</h3>
        <p className="text-muted-foreground mb-6">
          Get started by creating your first AI-generated video. Transform
          trending content into viral videos in minutes.
        </p>
        <div className="flex justify-center space-x-3">
          <Button onClick={onCreateVideo} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Create Video
          </Button>
          <Button variant="outline" size="lg">
            <Sparkles className="h-5 w-5 mr-2" />
            Browse Trends
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyState;
