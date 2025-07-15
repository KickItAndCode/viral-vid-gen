"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  X,
  Filter,
  SortAsc,
  SortDesc,
  Clock,
  TrendingUp,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface VideoLibrarySearchProps {
  /** Current search value */
  value: string;
  /** Callback when search value changes */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether to show search suggestions */
  showSuggestions?: boolean;
  /** Search suggestions */
  suggestions?: string[];
  /** Recent searches */
  recentSearches?: string[];
  /** Whether search is loading */
  isLoading?: boolean;
  /** Callback for suggestion click */
  onSuggestionClick?: (suggestion: string) => void;
  /** Callback for recent search click */
  onRecentSearchClick?: (search: string) => void;
  /** Callback to clear recent searches */
  onClearRecentSearches?: () => void;
  /** Custom CSS class */
  className?: string;
}

export const VideoLibrarySearch = ({
  value,
  onChange,
  placeholder = "Search videos...",
  showSuggestions = true,
  suggestions = [],
  recentSearches = [],
  isLoading = false,
  onSuggestionClick,
  onRecentSearchClick,
  onClearRecentSearches,
  className,
}: VideoLibrarySearchProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [debouncedValue, setDebouncedValue] = useState(value);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedValue !== value) {
        onChange(debouncedValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [debouncedValue, value, onChange]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDebouncedValue(e.target.value);
  };

  // Handle clear search
  const handleClear = () => {
    setDebouncedValue("");
    onChange("");
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsFocused(false);
    }
  };

  // Popular search suggestions
  const popularSuggestions = [
    "viral videos",
    "trending content",
    "high engagement",
    "recent uploads",
    "completed videos",
    "failed generations",
  ];

  // Show dropdown when focused and has suggestions or recent searches
  const showDropdown =
    isFocused &&
    ((showSuggestions &&
      (suggestions.length > 0 || popularSuggestions.length > 0)) ||
      recentSearches.length > 0);

  return (
    <div className={cn("relative", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={debouncedValue}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={handleKeyPress}
          className="pl-10 pr-10"
        />
        {debouncedValue && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 p-0 hover:bg-transparent"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {isLoading && (
          <div className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        )}
      </div>

      {/* Search Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="p-3 border-b">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Recent Searches
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearRecentSearches}
                  className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {recentSearches.slice(0, 5).map((search, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80"
                    onClick={() => {
                      onRecentSearchClick?.(search);
                      setDebouncedValue(search);
                      setIsFocused(false);
                    }}
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    {search}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {showSuggestions && (
            <div className="p-3">
              {/* Search Suggestions */}
              {suggestions.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                    Suggestions
                  </h4>
                  <div className="space-y-1">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          onSuggestionClick?.(suggestion);
                          setDebouncedValue(suggestion);
                          setIsFocused(false);
                        }}
                        className="w-full text-left px-2 py-1 rounded text-sm hover:bg-secondary transition-colors"
                      >
                        <Search className="h-3 w-3 mr-2 inline-block" />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Suggestions */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  Popular
                </h4>
                <div className="space-y-1">
                  {popularSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        onSuggestionClick?.(suggestion);
                        setDebouncedValue(suggestion);
                        setIsFocused(false);
                      }}
                      className="w-full text-left px-2 py-1 rounded text-sm hover:bg-secondary transition-colors flex items-center"
                    >
                      {suggestion.includes("viral") && (
                        <TrendingUp className="h-3 w-3 mr-2" />
                      )}
                      {suggestion.includes("trending") && (
                        <TrendingUp className="h-3 w-3 mr-2" />
                      )}
                      {suggestion.includes("engagement") && (
                        <Eye className="h-3 w-3 mr-2" />
                      )}
                      {!suggestion.includes("viral") &&
                        !suggestion.includes("trending") &&
                        !suggestion.includes("engagement") && (
                          <Search className="h-3 w-3 mr-2" />
                        )}
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoLibrarySearch;
