"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingGridProps {
  count?: number;
  variant?: "default" | "compact" | "featured";
  className?: string;
}

export function LoadingGrid({
  count = 6,
  variant = "default",
  className,
}: LoadingGridProps) {
  if (variant === "compact") {
    return (
      <div className={cn("space-y-4", className)}>
        {Array.from({ length: count }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
                <Skeleton className="h-8 w-8" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (variant === "featured") {
    return (
      <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-6", className)}>
        {Array.from({ length: Math.min(count, 2) }).map((_, index) => (
          <Card key={index} className="border-primary/20">
            <CardHeader className="pb-3">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-3/5" />
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Default grid loading
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
        className
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index}>
          <CardHeader className="pb-3">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-4 w-4" />
            </div>
            <div className="flex flex-wrap gap-1">
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-10" />
            </div>
            <Skeleton className="h-8 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Individual loading card component
export function LoadingCard({
  variant = "default",
}: {
  variant?: "default" | "compact" | "featured";
}) {
  return <LoadingGrid count={1} variant={variant} />;
}

// Skeleton components for specific parts
export function TrendCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-4">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-4 w-4" />
        </div>
        <div className="flex flex-wrap gap-1">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-10" />
        </div>
        <Skeleton className="h-8 w-full" />
      </CardContent>
    </Card>
  );
}

// Loading state for search results
export function SearchLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-20" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-16" />
      </div>
      <Skeleton className="h-4 w-48" />
      <LoadingGrid count={3} />
    </div>
  );
}
