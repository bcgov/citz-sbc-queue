"use client"

type PaginationProps = {
  currentPage: number
  totalPages: number
  paginatedDataLength: number
  sortedDataLength: number
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>
}

/**
 * A pagination component for navigating through pages in a datatable.
 *
 * @param props - The props for the Pagination component
 * @property props.currentPage - The current active page number
 * @property props.totalPages - The total number of pages available
 * @property props.paginatedDataLength - The number of items on the current page
 * @property props.sortedDataLength - The total number of items after sorting/filtering
 * @property props.setCurrentPage - Function to update the current page
 */
export const Pagination = ({
  currentPage,
  totalPages,
  paginatedDataLength,
  sortedDataLength,
  setCurrentPage,
}: PaginationProps) => {
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-typography-secondary">
        Page {currentPage} of {totalPages} • Showing {paginatedDataLength} of {sortedDataLength}{" "}
        results
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className="secondary small"
          aria-label="Previous page"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
          className="secondary small"
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    </div>
  )
}
