"use client";

import { TrendingUp, Search, Filter, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  type?: "no-results" | "no-trends" | "search-empty" | "filter-empty";
  hasFilters?: boolean;
  searchQuery?: string;
  onClearFilters?: () => void;
  onRefresh?: () => void;
  className?: string;
}

export function EmptyState({
  type = "no-results",
  hasFilters = false,
  searchQuery,
  onClearFilters,
  onRefresh,
  className,
}: EmptyStateProps) {
  const getEmptyStateConfig = () => {
    switch (type) {
      case "no-trends":
        return {
          icon: TrendingUp,
          title: "No trends available",
          description:
            "There are no trending topics at the moment. Check back later or try refreshing.",
          primaryAction: onRefresh
            ? { label: "Refresh", action: onRefresh, icon: RefreshCw }
            : null,
          secondaryAction: null,
        };

      case "search-empty":
        return {
          icon: Search,
          title: searchQuery
            ? `No results for "${searchQuery}"`
            : "No search results",
          description:
            "Try adjusting your search terms or browse trending topics instead.",
          primaryAction: onClearFilters
            ? { label: "Clear search", action: onClearFilters, icon: null }
            : null,
          secondaryAction: null,
        };

      case "filter-empty":
        return {
          icon: Filter,
          title: "No trends match your filters",
          description:
            "Try adjusting your filters or browse all trending topics.",
          primaryAction: onClearFilters
            ? { label: "Clear filters", action: onClearFilters, icon: null }
            : null,
          secondaryAction: onRefresh
            ? { label: "Refresh", action: onRefresh, icon: RefreshCw }
            : null,
        };

      default:
        return {
          icon: TrendingUp,
          title: hasFilters ? "No matching trends" : "No trends found",
          description: hasFilters
            ? "Try adjusting your search or filters to see more results."
            : "There are no trending topics available right now.",
          primaryAction:
            hasFilters && onClearFilters
              ? {
                  label: "Clear all filters",
                  action: onClearFilters,
                  icon: null,
                }
              : onRefresh
                ? { label: "Refresh", action: onRefresh, icon: RefreshCw }
                : null,
          secondaryAction: null,
        };
    }
  };

  const config = getEmptyStateConfig();
  const Icon = config.icon;

  return (
    <Card className={cn("border-dashed border-2", className)}>
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>

        <h3 className="text-lg font-semibold mb-2">{config.title}</h3>
        <p className="text-muted-foreground text-sm max-w-md mb-6">
          {config.description}
        </p>

        <div className="flex items-center gap-3">
          {config.primaryAction && (
            <Button
              onClick={config.primaryAction.action}
              className="min-w-[120px]"
            >
              {config.primaryAction.icon && (
                <config.primaryAction.icon className="h-4 w-4 mr-2" />
              )}
              {config.primaryAction.label}
            </Button>
          )}

          {config.secondaryAction && (
            <Button
              variant="outline"
              onClick={config.secondaryAction.action}
              className="min-w-[120px]"
            >
              {config.secondaryAction.icon && (
                <config.secondaryAction.icon className="h-4 w-4 mr-2" />
              )}
              {config.secondaryAction.label}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Specialized empty states
export function NoTrendsFound({ onRefresh }: { onRefresh?: () => void }) {
  return <EmptyState type="no-trends" onRefresh={onRefresh} />;
}

export function SearchNotFound({
  searchQuery,
  onClearSearch,
}: {
  searchQuery: string;
  onClearSearch: () => void;
}) {
  return (
    <EmptyState
      type="search-empty"
      searchQuery={searchQuery}
      onClearFilters={onClearSearch}
    />
  );
}

export function FilterNotFound({
  onClearFilters,
}: {
  onClearFilters: () => void;
}) {
  return (
    <EmptyState
      type="filter-empty"
      hasFilters={true}
      onClearFilters={onClearFilters}
    />
  );
}

// Success state for when user creates first video
export function CreateFirstVideo() {
  return (
    <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>

        <h3 className="text-lg font-semibold mb-2">Ready to go viral?</h3>
        <p className="text-muted-foreground text-sm max-w-md mb-6">
          Select a trending topic above to create your first AI-generated video
          and join the viral conversation.
        </p>

        <Button className="min-w-[140px]">
          <Sparkles className="h-4 w-4 mr-2" />
          Get Started
        </Button>
      </CardContent>
    </Card>
  );
}
