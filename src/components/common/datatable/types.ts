import type { ReactNode } from "react"

/**
 * Configuration for a single column in the DataTable.
 * @template T - The type of data in the table row
 */
export type ColumnConfig<T extends Record<string, unknown>> = {
  /** The key of the property in the data object */
  key: keyof T
  /** Display label for the column header */
  label: string
  /** Whether this column supports sorting (default: false) */
  sortable?: boolean
  /** Whether this column can be searched (default: false) */
  searchable?: boolean
  /** Optional custom render function for cell content */
  render?: (value: unknown, row: T) => ReactNode
}

/**
 * Sorting configuration for the table.
 * @template T - The type of data in the table row
 */
export type SortConfig<T extends Record<string, unknown>> = {
  /** The key to sort by */
  key: keyof T
  /** Sort direction */
  direction: "asc" | "desc"
}

/**
 * Pagination configuration.
 */
export type PaginationConfig = {
  /** Whether pagination is enabled (default: false) */
  enabled: boolean
  /** Number of rows per page (default: 10) */
  pageSize?: number
}

/**
 * Search configuration.
 */
export type SearchConfig = {
  /** Whether the search bar is enabled (default: false) */
  enabled: boolean
  /** Debounce delay in milliseconds (default: 300) */
  debounceMs?: number
}

/**
 * Props for the DataTable component.
 * @template T - The type of data in the table rows
 */
export type DataTableProps<T extends Record<string, unknown>> = {
  /** Column configurations */
  columns: ColumnConfig<T>[]
  /** Array of data rows to display */
  data: T[]
  /** Pagination configuration (optional) */
  pagination?: PaginationConfig
  /** Search configuration (optional) */
  search?: SearchConfig
  /** Whether the table header is sticky (default: true) */
  sticky?: boolean
  /** Message to display when no data is available (default: 'No data available') */
  emptyMessage?: string
  /** Optional callback function when a row is clicked */
  onRowClick?: (row: T) => void
}
