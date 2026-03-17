'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const handlePageChange = (page: number) => {
    onPageChange(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)

      if (currentPage > 3) {
        pages.push('ellipsis')
      }

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      if (currentPage < totalPages - 2) {
        pages.push('ellipsis')
      }

      pages.push(totalPages)
    }

    return pages
  }

  return (
    <nav
      className="mt-12 flex items-center justify-center gap-2"
      aria-label="Пагінація"
    >
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Попередня сторінка"
        className="h-11 w-11 rounded-full border-black/8 bg-white"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-2 rounded-full border border-black/8 bg-white px-2 py-2 shadow-[0_10px_24px_rgba(0,0,0,0.04)]">
        {getPageNumbers().map((page, index) =>
          page === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="px-2 py-2 text-sm text-muted-foreground"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              aria-label={`Сторінка ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
              className={cn(
                "flex h-10 min-w-10 items-center justify-center rounded-full px-3 text-sm font-medium transition-all",
                currentPage === page
                  ? "bg-[#1A1A1A] text-white"
                  : "text-foreground/68 hover:bg-muted hover:text-foreground"
              )}
            >
              {page}
            </button>
          )
        )}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Наступна сторінка"
        className="h-11 w-11 rounded-full border-black/8 bg-white"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  )
}
