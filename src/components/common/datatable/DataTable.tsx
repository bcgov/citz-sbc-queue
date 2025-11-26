"use client"

import { ArrowDownIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid"
import React, { type ReactNode, useMemo, useState } from "react"
import { generateUUID } from "@/utils/common/generateUUID"
import { DEFAULT_DEBOUNCE_MS, DEFAULT_PAGE_SIZE } from "./constants"
import type { ColumnConfig, DataTableProps, SortConfig } from "./types"

/**
 * Reusable data table component with configurable columns, pagination,
 * search, and sorting capabilities.
 *
 * @param props - The props for the DataTable component
 * @property columns - Configuration for table columns
 * @property data - Array of data objects to display in the table
 * @property [pagination] - Configuration for pagination
 * @property [search] - Configuration for search functionality
 * @property [sticky=true] - Whether the header row is sticky
 * @property [emptyMessage="No data available"] - Message to display when no data is available
 * @property [onRowClick] - Callback function when a row is clicked
 *
 * @example
 * const columns: ColumnConfig<User>[] = [
 *   { key: 'name', label: 'Name', sortable: true, searchable: true },
 *   { key: 'email', label: 'Email', searchable: true },
 * ];
 *
 * <DataTable
 *   columns={columns}
 *   data={users}
 *   pagination={{ enabled: true, pageSize: 10 }}
 *   search={{ enabled: true }}
 * />
 */
export const DataTable = <T extends Record<string, unknown>>({
  columns,
  data,
  pagination,
  search,
  sticky = true,
  emptyMessage = "No data available",
  onRowClick,
}: DataTableProps<T>) => {
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

  const renderCellContent = (content: unknown, column: ColumnConfig<T>, row: T): ReactNode => {
    // Use custom render function if provided
    if (column.render) {
      return column.render(content, row)
    }

    if (React.isValidElement(content)) {
      return content
    }
    if (typeof content === "object" && content !== null) {
      return JSON.stringify(content)
    }
    return String(content ?? "")
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      {search?.enabled && (
        <div className="relative">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-5 -translate-y-1/2 h-5 w-5 text-icon-secondary" />
          <input
            type="text"
            placeholder="Search..."
            onChange={handleSearchChange}
            aria-label="Search table"
            className="w-full rounded border border-border-light bg-background-default py-2 pl-10 pr-4 text-typography-primary placeholder-typography-disabled focus:border-border-active focus:outline-none"
          />
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded border border-border-light">
        <table>
          <thead className={`bg-background-light-gray ${sticky ? "sticky top-0" : ""}`}>
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className="border-b border-border-light px-4 py-3 text-left font-semibold text-typography-primary"
                  scope="col"
                >
                  <div className="flex items-center gap-2">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <button
                        type="button"
                        onClick={() => handleSort(column.key)}
                        className="inline-flex items-center rounded p-1 hover:bg-hover focus:outline-none focus:ring-2 focus:ring-border-active focus:ring-offset-2"
                        aria-label={`Sort by ${column.label}`}
                        aria-pressed={sortConfig?.key === column.key}
                      >
                        <ArrowDownIcon
                          className={`h-4 w-4 text-icon-secondary transition-transform ${
                            sortConfig?.key === column.key
                              ? sortConfig.direction === "desc"
                                ? "rotate-180"
                                : ""
                              : "opacity-50"
                          }`}
                        />
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="border-b border-border-light px-4 py-8 text-center text-typography-secondary"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row) => {
                const rowKey = generateUUID()
                const handleKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    onRowClick?.(row)
                  }
                }
                return (
                  <tr
                    key={rowKey}
                    onClick={() => onRowClick?.(row)}
                    onKeyDown={handleKeyDown}
                    tabIndex={onRowClick ? 0 : -1}
                    role={onRowClick ? "button" : undefined}
                    className={`border-b border-border-light transition-colors ${
                      paginatedData.indexOf(row) % 2 === 0
                        ? "bg-background-default"
                        : "bg-background-light-gray"
                    } ${
                      onRowClick
                        ? "cursor-pointer hover:bg-gray-200 focus-within:bg-gray-200"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {columns.map((column) => (
                      <td
                        key={`${rowKey}-${String(column.key)}`}
                        className="px-4 py-3 text-typography-primary"
                      >
                        {renderCellContent(row[column.key], column, row)}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination?.enabled && paginationInfo.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-typography-secondary">
            Page {currentPage} of {paginationInfo.totalPages} • Showing {paginatedData.length} of{" "}
            {sortedData.length} results
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
              onClick={() =>
                setCurrentPage((prev) => Math.min(paginationInfo.totalPages, prev + 1))
              }
              disabled={currentPage === paginationInfo.totalPages}
              className="secondary small"
              aria-label="Next page"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
