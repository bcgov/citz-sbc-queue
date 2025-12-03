import { useMemo, useState } from "react"
import type {
  ColumnConfig,
  PaginationConfig,
  SearchConfig,
  SortConfig,
} from "@/components/common/datatable/types"
import { DEFAULT_DEBOUNCE_MS, DEFAULT_PAGE_SIZE } from "./constants"

export type UseDataTableProps<T extends Record<string, unknown>> = {
  /** Array of data rows */
  data: T[]
  /** Column configurations */
  columns: ColumnConfig<T>[]
  /** Pagination configuration (optional) */
  pagination?: PaginationConfig
  /** Search configuration (optional) */
  search?: SearchConfig
}

export type UseDataTableReturn<T extends Record<string, unknown>> = {
  /** Filtered and sorted data ready for display */
  paginatedData: T[]
  /** All filtered and sorted data (before pagination) */
  sortedData: T[]
  /** Current search query */
  searchQuery: string
  /** Current sort configuration */
  sortConfig: SortConfig<T> | null
  /** Current page number */
  currentPage: number
  /** Pagination information */
  paginationInfo: { totalPages: number; pageSize: number }
  /** Handle search input change with debounce */
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  /** Handle sorting on column header click */
  handleSort: (key: keyof T) => void
  /** Set current page */
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>
}

/**
 * Custom hook for managing DataTable state and logic including filtering,
 * sorting, searching, and pagination.
 *
 * @param props - Configuration for the hook
 * @returns Object containing data and handlers for table operations
 *
 * @example
 * const columns: ColumnConfig<User>[] = [
 *   { key: 'name', label: 'Name', sortable: true, searchable: true },
 * ];
 *
 * const {
 *   paginatedData,
 *   handleSearchChange,
 *   handleSort,
 * } = useDataTable({
 *   data: users,
 *   columns,
 *   pagination: { enabled: true, pageSize: 10 },
 *   search: { enabled: true },
 * });
 */
export const useDataTable = <T extends Record<string, unknown>>({
  data,
  columns,
  pagination,
  search,
}: UseDataTableProps<T>): UseDataTableReturn<T> => {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)

  // Get searchable columns
  const searchableColumns = useMemo(() => columns.filter((col) => col.searchable), [columns])

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery || searchableColumns.length === 0) return data

    const lowerQuery = searchQuery.toLowerCase()
    return data.filter((row) =>
      searchableColumns.some((col) => {
        const value = row[col.key]
        if (value === null || value === undefined) return false
        return String(value).toLowerCase().includes(lowerQuery)
      })
    )
  }, [data, searchQuery, searchableColumns])

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData

    const sorted = [...filteredData]
    sorted.sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue
      }

      return 0
    })

    return sorted
  }, [filteredData, sortConfig])

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination?.enabled) return sortedData

    const pageSize = pagination.pageSize || DEFAULT_PAGE_SIZE
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize

    return sortedData.slice(startIndex, endIndex)
  }, [sortedData, currentPage, pagination])

  // Calculate pagination info
  const paginationInfo = useMemo(() => {
    if (!pagination?.enabled) return { totalPages: 1, pageSize: sortedData.length }

    const pageSize = pagination.pageSize || DEFAULT_PAGE_SIZE
    const totalPages = Math.ceil(sortedData.length / pageSize)

    return { totalPages, pageSize }
  }, [sortedData, pagination])

  // Handle search input with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    if (debounceTimer) clearTimeout(debounceTimer)

    const timer = setTimeout(() => {
      setSearchQuery(value)
      setCurrentPage(1) // Reset to first page on search
    }, search?.debounceMs || DEFAULT_DEBOUNCE_MS)

    setDebounceTimer(timer)
  }

  // Handle column header click for sorting
  const handleSort = (key: keyof T) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        // Toggle direction
        return {
          ...prev,
          direction: prev.direction === "asc" ? "desc" : "asc",
        }
      }
      // New sort
      return { key, direction: "asc" }
    })
    setCurrentPage(1) // Reset to first page on sort
  }

  return {
    paginatedData,
    sortedData,
    searchQuery,
    sortConfig,
    currentPage,
    paginationInfo,
    handleSearchChange,
    handleSort,
    setCurrentPage,
  }
}
