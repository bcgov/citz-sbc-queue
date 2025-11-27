"use client"

import React, { type ReactNode } from "react"
import { useDataTable } from "@/hooks/useDataTable"
import { generateUUID } from "@/utils/common/generateUUID"
import { ColumnSortButton } from "./ColumnSortButton"
import { Pagination } from "./Pagination"
import { SearchInput } from "./SearchInput"
import type { ColumnConfig, DataTableProps } from "./types"

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
  const {
    paginatedData,
    sortedData,
    sortConfig,
    currentPage,
    handleSearchChange,
    handleSort,
    setCurrentPage,
    paginationInfo,
  } = useDataTable({
    data,
    columns,
    pagination,
    search,
  })

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
      {search?.enabled && <SearchInput handleSearchChange={handleSearchChange} />}

      {/* Table */}
      <div className="overflow-x-auto rounded border border-border-light">
        <table className="w-full">
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
                      <ColumnSortButton
                        handleSort={handleSort}
                        column={column}
                        sortConfig={sortConfig}
                      />
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
        <Pagination
          currentPage={currentPage}
          totalPages={paginationInfo.totalPages}
          paginatedDataLength={paginatedData.length}
          sortedDataLength={sortedData.length}
          setCurrentPage={setCurrentPage}
        />
      )}
    </div>
  )
}
