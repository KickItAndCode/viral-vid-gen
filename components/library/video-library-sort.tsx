"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown, SortAsc, SortDesc } from "lucide-react";
import { VideoLibrarySortOption } from "./video-library-grid";

export interface VideoLibrarySortProps {
  /** Current sort option */
  sortOption: VideoLibrarySortOption;
  /** Callback when sort changes */
  onChange: (sort: VideoLibrarySortOption) => void;
  /** Custom CSS class */
  className?: string;
}

export const VideoLibrarySort = ({
  sortOption,
  onChange,
  className,
}: VideoLibrarySortProps) => {
  const sortOptions = [
    { value: "createdAt", label: "Created Date" },
    { value: "updatedAt", label: "Updated Date" },
    { value: "title", label: "Title" },
    { value: "duration", label: "Duration" },
    { value: "viralScore", label: "Viral Score" },
    { value: "views", label: "Views" },
  ];

  const handleFieldChange = (field: string) => {
    onChange({
      ...sortOption,
      field: field as VideoLibrarySortOption["field"],
    });
  };

  const handleDirectionToggle = () => {
    onChange({
      ...sortOption,
      direction: sortOption.direction === "asc" ? "desc" : "asc",
    });
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Select value={sortOption.field} onValueChange={handleFieldChange}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="sm"
        onClick={handleDirectionToggle}
        className="px-2"
      >
        {sortOption.direction === "asc" ? (
          <SortAsc className="h-4 w-4" />
        ) : (
          <SortDesc className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

export default VideoLibrarySort;
