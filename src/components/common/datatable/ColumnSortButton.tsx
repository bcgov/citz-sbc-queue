"use client"

import { ArrowDownIcon } from "@heroicons/react/24/solid"
import type { ColumnConfig, SortConfig } from "./types"

type ColumnSortButtonProps<T extends Record<string, unknown>> = {
  handleSort: (key: keyof T) => void
  column: ColumnConfig<T>
  sortConfig: SortConfig<T> | null
}

/**
 * A button component for sorting columns in a datatable.
 *
 * @param props - The props for the ColumnSortButton component
 * @property props.handleSort - Function to handle sorting when the button is clicked
 * @property props.column - The column configuration
 * @property props.sortConfig - The current sorting configuration
 */
export const ColumnSortButton = <T extends Record<string, unknown>>({
  handleSort,
  column,
  sortConfig,
}: ColumnSortButtonProps<T>) => {
  return (
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
  )
}
