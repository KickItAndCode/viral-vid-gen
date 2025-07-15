"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckSquare,
  Square,
  X,
  Download,
  Share2,
  Copy,
  Trash2,
  Archive,
  Tag,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface BulkActionsProps {
  /** Number of selected items */
  selectedCount: number;
  /** Callback for bulk actions */
  onAction?: (action: string) => void;
  /** Callback to select all items */
  onSelectAll?: () => void;
  /** Callback to clear selection */
  onClearSelection?: () => void;
  /** Custom CSS class */
  className?: string;
}

export const BulkActions = ({
  selectedCount,
  onAction,
  onSelectAll,
  onClearSelection,
  className,
}: BulkActionsProps) => {
  const handleAction = (action: string) => {
    onAction?.(action);
  };

  return (
    <div
      className={cn(
        "flex items-center space-x-2 p-3 bg-secondary/50 rounded-lg",
        className
      )}
    >
      <Badge variant="secondary" className="font-medium">
        {selectedCount} selected
      </Badge>

      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onSelectAll}
          className="h-8 px-2"
        >
          <CheckSquare className="h-4 w-4 mr-1" />
          All
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="h-8 px-2"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      </div>

      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleAction("download")}
          className="h-8 px-2"
        >
          <Download className="h-4 w-4 mr-1" />
          Download
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleAction("share")}
          className="h-8 px-2"
        >
          <Share2 className="h-4 w-4 mr-1" />
          Share
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleAction("duplicate")}
          className="h-8 px-2"
        >
          <Copy className="h-4 w-4 mr-1" />
          Duplicate
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleAction("addTags")}>
              <Tag className="h-4 w-4 mr-2" />
              Add Tags
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction("archive")}>
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleAction("delete")}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default BulkActions;
