'use client'

import Button from '@/components/ui/button'

interface TaskPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function TaskPagination({ currentPage, totalPages, onPageChange }: TaskPaginationProps) {
  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      <Button
        variant="secondary"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </Button>
      
      <span className="px-4 py-2">
        Page {currentPage} of {totalPages}
      </span>
      
      <Button
        variant="secondary"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </Button>
    </div>
  )
}
