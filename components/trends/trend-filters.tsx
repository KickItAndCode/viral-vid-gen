"use client";

import { useState } from "react";
import { Filter, X, Calendar, Hash, Globe } from "lucide-react";
import { Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type Trend = Doc<"trends">;

interface TrendFiltersProps {
  selectedPlatform: string | null;
  selectedCategory: string | null;
  onPlatformChange: (platform: string | null) => void;
  onCategoryChange: (category: string | null) => void;
  trends: Trend[];
  className?: string;
}

export function TrendFilters({
  selectedPlatform,
  selectedCategory,
  onPlatformChange,
  onCategoryChange,
  trends,
  className,
}: TrendFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Extract unique platforms and categories from trends
  const platforms = Array.from(new Set(trends.map((trend) => trend.platform)))
    .map((platform) => ({
      value: platform,
      label: platform.charAt(0).toUpperCase() + platform.slice(1),
      count: trends.filter((trend) => trend.platform === platform).length,
    }))
    .sort((a, b) => b.count - a.count);

  const categories = Array.from(new Set(trends.map((trend) => trend.category)))
    .map((category) => ({
      value: category,
      label: category,
      count: trends.filter((trend) => trend.category === category).length,
    }))
    .sort((a, b) => b.count - a.count);

  const hasActiveFilters = selectedPlatform || selectedCategory;
  const activeFilterCount =
    (selectedPlatform ? 1 : 0) + (selectedCategory ? 1 : 0);

  const clearAllFilters = () => {
    onPlatformChange(null);
    onCategoryChange(null);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Main Filter Button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "relative",
              hasActiveFilters && "border-primary text-primary"
            )}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 px-1.5 py-0.5 text-xs min-w-[20px] h-5"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Filter Trends</h3>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs h-auto p-1"
                >
                  Clear all
                </Button>
              )}
            </div>

            {/* Platform Filter */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm font-medium">Platform</label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {platforms.map((platform) => (
                  <Button
                    key={platform.value}
                    variant={
                      selectedPlatform === platform.value
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      onPlatformChange(
                        selectedPlatform === platform.value
                          ? null
                          : platform.value
                      )
                    }
                    className="justify-start text-xs h-8"
                  >
                    <span className="flex-1 text-left">{platform.label}</span>
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      {platform.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <label className="text-sm font-medium">Category</label>
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {categories.slice(0, 8).map((category) => (
                  <Button
                    key={category.value}
                    variant={
                      selectedCategory === category.value ? "default" : "ghost"
                    }
                    size="sm"
                    onClick={() =>
                      onCategoryChange(
                        selectedCategory === category.value
                          ? null
                          : category.value
                      )
                    }
                    className="w-full justify-start text-xs h-8"
                  >
                    <span className="flex-1 text-left">{category.label}</span>
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      {category.count}
                    </Badge>
                  </Button>
                ))}
                {categories.length > 8 && (
                  <div className="text-xs text-muted-foreground text-center py-1">
                    +{categories.length - 8} more categories
                  </div>
                )}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filter Pills */}
      <div className="flex items-center gap-1">
        {selectedPlatform && (
          <Badge variant="secondary" className="pl-2 pr-1 py-1 text-xs gap-1">
            <Globe className="h-3 w-3" />
            {selectedPlatform.charAt(0).toUpperCase() +
              selectedPlatform.slice(1)}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPlatformChange(null)}
              className="h-auto p-0.5 hover:bg-transparent"
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}

        {selectedCategory && (
          <Badge variant="secondary" className="pl-2 pr-1 py-1 text-xs gap-1">
            <Hash className="h-3 w-3" />
            {selectedCategory}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCategoryChange(null)}
              className="h-auto p-0.5 hover:bg-transparent"
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}
      </div>
    </div>
  );
}

// Quick filter buttons for common use cases
interface QuickFiltersProps {
  onPlatformChange: (platform: string | null) => void;
  onCategoryChange: (category: string | null) => void;
  className?: string;
}

export function QuickFilters({
  onPlatformChange,
  onCategoryChange,
  className,
}: QuickFiltersProps) {
  const quickFilters = [
    {
      label: "Trending",
      action: () => {
        /* TODO: Add trending filter */
      },
    },
    { label: "Reddit", action: () => onPlatformChange("reddit") },
    { label: "Twitter", action: () => onPlatformChange("twitter") },
    { label: "Tech", action: () => onCategoryChange("Technology") },
    { label: "AI", action: () => onCategoryChange("AI") },
  ];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-sm text-muted-foreground">Quick filters:</span>
      {quickFilters.map((filter, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={filter.action}
          className="text-xs h-7"
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}
