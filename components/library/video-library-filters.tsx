"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Filter,
  X,
  Calendar as CalendarIcon,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Clock,
  Smartphone,
  Youtube,
  Instagram,
  Zap,
  Palette,
  Bot,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { VideoLibraryItem } from "./video-library-grid";

export interface VideoLibraryFilters {
  status?: string[];
  style?: string[];
  platform?: string[];
  aiProvider?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
}

export interface VideoLibraryFiltersProps {
  /** Current filters */
  filters: VideoLibraryFilters;
  /** Callback when filters change */
  onChange: (filters: VideoLibraryFilters) => void;
  /** Available videos for filter options */
  videos: VideoLibraryItem[];
  /** Custom CSS class */
  className?: string;
}

export const VideoLibraryFilters = ({
  filters,
  onChange,
  videos,
  className,
}: VideoLibraryFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Extract unique filter options from videos
  const filterOptions = {
    statuses: ["completed", "generating", "failed", "queued"],
    styles: [...new Set(videos.map((v) => v.style).filter(Boolean))],
    platforms: [
      ...new Set(videos.map((v) => v.platform).filter(Boolean)),
    ],
    aiProviders: [
      ...new Set(videos.map((v) => v.aiProvider).filter(Boolean)),
    ],
    tags: [...new Set(videos.flatMap((v) => v.tags || []))],
  };

  // Handle filter change
  const handleFilterChange = (key: keyof VideoLibraryFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    onChange(newFilters);
  };

  // Handle array filter toggle
  const handleArrayFilterToggle = (
    key: keyof VideoLibraryFilters,
    value: string
  ) => {
    const currentArray = (filters[key] as string[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];

    handleFilterChange(key, newArray.length > 0 ? newArray : undefined);
  };

  // Handle date range change
  const handleDateRangeChange = (
    start: Date | undefined,
    end: Date | undefined
  ) => {
    if (start && end) {
      handleFilterChange("dateRange", { start, end });
    } else {
      handleFilterChange("dateRange", undefined);
    }
  };

  // Clear all filters
  const handleClearAll = () => {
    onChange({});
  };

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(
    (value) =>
      value !== undefined && (Array.isArray(value) ? value.length > 0 : true)
  ).length;

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return CheckCircle2;
      case "generating":
        return Loader2;
      case "failed":
        return AlertCircle;
      case "queued":
        return Clock;
      default:
        return Clock;
    }
  };

  // Get platform icon
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "youtube":
        return Youtube;
      case "instagram":
        return Instagram;
      case "tiktok":
        return Smartphone;
      default:
        return Smartphone;
    }
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {/* Filter Button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <Badge
                variant="destructive"
                className="ml-2 h-5 w-5 rounded-full p-0 text-xs"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Filter Videos</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-auto p-0 text-xs"
              >
                Clear all
              </Button>
            </div>

            {/* Status Filter */}
            <div>
              <h4 className="text-sm font-medium mb-2">Status</h4>
              <div className="grid grid-cols-2 gap-2">
                {filterOptions.statuses.map((status) => {
                  const StatusIcon = getStatusIcon(status);
                  return (
                    <label
                      key={status}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={filters.status?.includes(status) || false}
                        onCheckedChange={() =>
                          handleArrayFilterToggle("status", status)
                        }
                      />
                      <StatusIcon className="h-4 w-4" />
                      <span className="text-sm capitalize">{status}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Platform Filter */}
            {filterOptions.platforms.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Platform</h4>
                <div className="space-y-2">
                  {filterOptions.platforms.map((platform) => {
                    const PlatformIcon = getPlatformIcon(platform);
                    return (
                      <label
                        key={platform}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <Checkbox
                          checked={
                            filters.platform?.includes(platform) || false
                          }
                          onCheckedChange={() =>
                            handleArrayFilterToggle("platform", platform)
                          }
                        />
                        <PlatformIcon className="h-4 w-4" />
                        <span className="text-sm">{platform}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Style Filter */}
            {filterOptions.styles.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Style</h4>
                <div className="space-y-2">
                  {filterOptions.styles.map((style) => (
                    <label
                      key={style}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={filters.style?.includes(style) || false}
                        onCheckedChange={() =>
                          handleArrayFilterToggle("style", style)
                        }
                      />
                      <Palette className="h-4 w-4" />
                      <span className="text-sm">{style}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* AI Provider Filter */}
            {filterOptions.aiProviders.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">AI Provider</h4>
                <div className="space-y-2">
                  {filterOptions.aiProviders.map((provider) => (
                    <label
                      key={provider}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={
                          filters.aiProvider?.includes(provider) || false
                        }
                        onCheckedChange={() =>
                          handleArrayFilterToggle("aiProvider", provider)
                        }
                      />
                      <Bot className="h-4 w-4" />
                      <span className="text-sm">{provider}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Date Range Filter */}
            <div>
              <h4 className="text-sm font-medium mb-2">Date Range</h4>
              <div className="grid grid-cols-2 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start"
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {filters.dateRange?.start
                        ? format(filters.dateRange.start, "MMM d")
                        : "From"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange?.start}
                      onSelect={(date) =>
                        handleDateRangeChange(date, filters.dateRange?.end)
                      }
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start"
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {filters.dateRange?.end
                        ? format(filters.dateRange.end, "MMM d")
                        : "To"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange?.end}
                      onSelect={(date) =>
                        handleDateRangeChange(filters.dateRange?.start, date)
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Tags Filter */}
            {filterOptions.tags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {filterOptions.tags.slice(0, 10).map((tag) => (
                    <Badge
                      key={tag}
                      variant={
                        filters.tags?.includes(tag) ? "default" : "secondary"
                      }
                      className="cursor-pointer hover:bg-secondary/80"
                      onClick={() => handleArrayFilterToggle("tags", tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="flex items-center space-x-1 flex-wrap">
          {/* Status badges */}
          {filters.status?.map((status) => (
            <Badge key={status} variant="secondary" className="text-xs">
              {status}
              <button
                onClick={() => handleArrayFilterToggle("status", status)}
                className="ml-1 hover:bg-secondary/80 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {/* Platform badges */}
          {filters.platform?.map((platform) => (
            <Badge key={platform} variant="secondary" className="text-xs">
              {platform}
              <button
                onClick={() => handleArrayFilterToggle("platform", platform)}
                className="ml-1 hover:bg-secondary/80 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {/* Style badges */}
          {filters.style?.map((style) => (
            <Badge key={style} variant="secondary" className="text-xs">
              {style}
              <button
                onClick={() => handleArrayFilterToggle("style", style)}
                className="ml-1 hover:bg-secondary/80 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}

          {/* Date range badge */}
          {filters.dateRange && (
            <Badge variant="secondary" className="text-xs">
              {format(filters.dateRange.start, "MMM d")} -{" "}
              {format(filters.dateRange.end, "MMM d")}
              <button
                onClick={() => handleFilterChange("dateRange", undefined)}
                className="ml-1 hover:bg-secondary/80 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoLibraryFilters;
