"use client";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { usePathname, useSearchParams } from "next/navigation";

interface PaginationProps {
  page: number;
  count: number;
}

export function PaginationDemo({ page, count }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Logic to check if Next/Prev buttons should be enabled
  const hasPrev = ITEM_PER_PAGE * (page - 1) > 0;
  const hasNext = ITEM_PER_PAGE * (page - 1) + ITEM_PER_PAGE < count;

  // Helper to generate the URL for a specific page number
  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  return (
    <Pagination className="p-4">
      <PaginationContent>
        
        {/* PREVIOUS BUTTON */}
        <PaginationItem>
          <PaginationPrevious 
            href={createPageUrl(page - 1)}
            // Disable styling if on first page
            className={!hasPrev ? "pointer-events-none opacity-50" : undefined}
            aria-disabled={!hasPrev}
            tabIndex={!hasPrev ? -1 : undefined}
          />
        </PaginationItem>

        {/* CURRENT PAGE NUMBER */}
        <PaginationItem>
          <PaginationLink href="#" isActive>
            {page}
          </PaginationLink>
        </PaginationItem>

        {/* NEXT BUTTON */}
        <PaginationItem>
          <PaginationNext 
            href={createPageUrl(page + 1)}
            // Disable styling if on last page
            className={!hasNext ? "pointer-events-none opacity-50" : undefined}
            aria-disabled={!hasNext}
            tabIndex={!hasNext ? -1 : undefined}
          />
        </PaginationItem>

      </PaginationContent>
    </Pagination>
  );
}