"use client";

import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  /** Current page number (1-based) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Callback when page changes */
  onPageChange?: (page: number) => void;
  /** Show first/last page buttons */
  showFirstLast?: boolean;
  /** Maximum number of page buttons to show */
  maxPageButtons?: number;
  /** Custom CSS class */
  className?: string;
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  maxPageButtons = 5,
  className,
}: PaginationProps) => {
  // Calculate which page numbers to show
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];

    if (totalPages <= maxPageButtons) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show subset with ellipsis
      const halfMaxButtons = Math.floor(maxPageButtons / 2);
      let startPage = Math.max(1, currentPage - halfMaxButtons);
      let endPage = Math.min(totalPages, currentPage + halfMaxButtons);

      // Adjust range if we're at the beginning or end
      if (currentPage <= halfMaxButtons) {
        endPage = Math.min(totalPages, maxPageButtons);
      } else if (currentPage >= totalPages - halfMaxButtons) {
        startPage = Math.max(1, totalPages - maxPageButtons + 1);
      }

      // Add first page and ellipsis if needed
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push("ellipsis");
        }
      }

      // Add page numbers
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis and last page if needed
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push("ellipsis");
        }
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange?.(page);
    }
  };

  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = getPageNumbers();

  return (
    <div className={cn("flex items-center space-x-1", className)}>
      {/* First page button */}
      {showFirstLast && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="px-2"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Previous page button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-2"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Page number buttons */}
      {pageNumbers.map((page, index) => {
        if (page === "ellipsis") {
          return (
            <div key={`ellipsis-${index}`} className="px-2">
              <MoreHorizontal className="h-4 w-4" />
            </div>
          );
        }

        return (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => handlePageChange(page)}
            className="min-w-[2.5rem]"
          >
            {page}
          </Button>
        );
      })}

      {/* Next page button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-2"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Last page button */}
      {showFirstLast && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="px-2"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default Pagination;
