"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface LoadingGridProps {
  /** View mode (grid or list) */
  viewMode: "grid" | "list";
  /** Number of skeleton items to show */
  count?: number;
  /** Custom CSS class */
  className?: string;
}

export const LoadingGrid = ({
  viewMode,
  count = 12,
  className,
}: LoadingGridProps) => {
  const items = Array.from({ length: count }, (_, i) => i);

  if (viewMode === "grid") {
    return (
      <div
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
          className
        )}
      >
        {items.map((item) => (
          <Card key={item} className="overflow-hidden">
            <div className="aspect-video bg-gray-100">
              <Skeleton className="w-full h-full" />
            </div>
            <CardContent className="p-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {items.map((item) => (
        <Card key={item} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="w-6 h-6 rounded" />
              <Skeleton className="w-24 h-16 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default LoadingGrid;
