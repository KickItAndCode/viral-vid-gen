"use client";

import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface TrendSortProps {
  sortBy: "viralScore" | "createdAt" | "engagementTotal";
  sortOrder: "asc" | "desc";
  onSortByChange: (
    sortBy: "viralScore" | "createdAt" | "engagementTotal"
  ) => void;
  onSortOrderChange: (sortOrder: "asc" | "desc") => void;
  className?: string;
}

export function TrendSort({
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
  className,
}: TrendSortProps) {
  const sortOptions = [
    { value: "viralScore", label: "Viral Score" },
    { value: "createdAt", label: "Date Created" },
    { value: "engagementTotal", label: "Engagement" },
  ] as const;

  const currentSortLabel =
    sortOptions.find((option) => option.value === sortBy)?.label ||
    "Viral Score";

  const toggleSortOrder = () => {
    onSortOrderChange(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Sort By Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Sort by {currentSortLabel}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {sortOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onSortByChange(option.value)}
              className={cn(
                "cursor-pointer",
                sortBy === option.value && "bg-accent"
              )}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sort Order Toggle */}
      <Button
        variant="outline"
        size="sm"
        onClick={toggleSortOrder}
        className="px-3"
      >
        {sortOrder === "desc" ? (
          <ArrowDown className="h-4 w-4" />
        ) : (
          <ArrowUp className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

// Compact sort component for mobile
interface CompactSortProps {
  sortBy: "viralScore" | "createdAt" | "engagementTotal";
  sortOrder: "asc" | "desc";
  onSortByChange: (
    sortBy: "viralScore" | "createdAt" | "engagementTotal"
  ) => void;
  onSortOrderChange: (sortOrder: "asc" | "desc") => void;
  className?: string;
}

export function CompactSort({
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
  className,
}: CompactSortProps) {
  const sortOptions = [
    { value: "viralScore", label: "Viral", icon: "🔥" },
    { value: "createdAt", label: "Date", icon: "📅" },
    { value: "engagementTotal", label: "Engagement", icon: "💬" },
  ] as const;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {sortOptions.map((option) => (
        <Button
          key={option.value}
          variant={sortBy === option.value ? "default" : "outline"}
          size="sm"
          onClick={() => onSortByChange(option.value)}
          className="text-xs h-8 px-2"
        >
          <span className="mr-1">{option.icon}</span>
          {option.label}
        </Button>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")}
        className="px-2 h-8"
      >
        {sortOrder === "desc" ? (
          <ArrowDown className="h-3 w-3" />
        ) : (
          <ArrowUp className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
}
