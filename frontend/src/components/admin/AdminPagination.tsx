import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

export function AdminPagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalItems, 
  itemsPerPage 
}: AdminPaginationProps) {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    let pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages = [1, 2, 3, 4, '...', totalPages];
      } else if (currentPage >= totalPages - 2) {
        pages = [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      } else {
        pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-8 py-5 border-t border-border/50 bg-secondary/20">
      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest hidden md:block">
        Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-xl bg-secondary hover:bg-primary hover:text-white disabled:opacity-30 transition-all border border-transparent disabled:border-border/50"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        
        <div className="flex items-center gap-1.5">
          {getVisiblePages().map((page, i) => (
            page === '...' ? (
              <div key={`dot-${i}`} className="w-8 h-8 flex items-center justify-center text-muted-foreground">
                <MoreHorizontal className="w-4 h-4" />
              </div>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                  currentPage === page
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
              >
                {page}
              </button>
            )
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-xl bg-secondary hover:bg-primary hover:text-white disabled:opacity-30 transition-all border border-transparent disabled:border-border/50"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
