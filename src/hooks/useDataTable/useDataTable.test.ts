import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { ColumnConfig } from "@/components/common/datatable/types"
import { useDataTable } from "./useDataTable"

type TestData = {
  id: number
  name: string
  email: string
  age: number
}

describe("useDataTable", () => {
  const mockColumns: ColumnConfig<TestData>[] = [
    { key: "id", label: "ID", sortable: false, searchable: false },
    { key: "name", label: "Name", sortable: true, searchable: true },
    { key: "email", label: "Email", sortable: false, searchable: true },
    { key: "age", label: "Age", sortable: true, searchable: false },
  ]

  const mockData: TestData[] = [
    { id: 1, name: "Alice", email: "alice@example.com", age: 30 },
    { id: 2, name: "Bob", email: "bob@test.com", age: 25 },
    { id: 3, name: "Charlie", email: "charlie@example.com", age: 35 },
    { id: 4, name: "Diana", email: "diana@example.com", age: 28 },
  ]

  it("should initialize with correct default values", () => {
    const { result } = renderHook(() =>
      useDataTable({
        data: mockData,
        columns: mockColumns,
      })
    )

    expect(result.current.paginatedData).toEqual(mockData)
    expect(result.current.sortConfig).toBeNull()
    expect(result.current.currentPage).toBe(1)
    expect(result.current.searchQuery).toBe("")
    expect(result.current.paginationInfo.totalPages).toBe(1)
  })

  describe("Search functionality", () => {
    it("should filter data by search query", async () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: mockData,
          columns: mockColumns,
          search: { enabled: true },
        })
      )

      vi.useFakeTimers()

      act(() => {
        const event = {
          target: { value: "alice" },
        } as React.ChangeEvent<HTMLInputElement>
        result.current.handleSearchChange(event)
      })

      // Fast forward time for debounce
      act(() => {
        vi.advanceTimersByTime(300)
      })

      vi.useRealTimers()

      expect(result.current.paginatedData).toHaveLength(1)
      expect(result.current.paginatedData[0]?.name).toBe("Alice")
    })

    it("should reset to page 1 on search", async () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: mockData,
          columns: mockColumns,
          pagination: { enabled: true, pageSize: 2 },
          search: { enabled: true },
        })
      )

      act(() => {
        result.current.setCurrentPage(2)
      })

      expect(result.current.currentPage).toBe(2)

      vi.useFakeTimers()

      act(() => {
        const event = {
          target: { value: "alice" },
        } as React.ChangeEvent<HTMLInputElement>
        result.current.handleSearchChange(event)
      })

      act(() => {
        vi.advanceTimersByTime(300)
      })

      vi.useRealTimers()

      expect(result.current.currentPage).toBe(1)
    })
  })

  describe("Sorting functionality", () => {
    it("should sort data by column", () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: mockData,
          columns: mockColumns,
        })
      )

      act(() => {
        result.current.handleSort("name")
      })

      expect(result.current.sortConfig?.key).toBe("name")
      expect(result.current.sortConfig?.direction).toBe("asc")
      expect(result.current.paginatedData[0]?.name).toBe("Alice")
    })

    it("should toggle sort direction", () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: mockData,
          columns: mockColumns,
        })
      )

      act(() => {
        result.current.handleSort("name")
      })

      expect(result.current.sortConfig?.direction).toBe("asc")

      act(() => {
        result.current.handleSort("name")
      })

      expect(result.current.sortConfig?.direction).toBe("desc")
      expect(result.current.paginatedData[0]?.name).toBe("Diana")
    })

    it("should sort numbers correctly", () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: mockData,
          columns: mockColumns,
        })
      )

      act(() => {
        result.current.handleSort("age")
      })

      expect(result.current.paginatedData[0]?.age).toBe(25)
      expect(result.current.paginatedData[3]?.age).toBe(35)
    })

    it("should reset to page 1 on sort", () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: mockData,
          columns: mockColumns,
          pagination: { enabled: true, pageSize: 2 },
        })
      )

      act(() => {
        result.current.setCurrentPage(2)
      })

      expect(result.current.currentPage).toBe(2)

      act(() => {
        result.current.handleSort("name")
      })

      expect(result.current.currentPage).toBe(1)
    })
  })

  describe("Pagination functionality", () => {
    it("should paginate data correctly", () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: mockData,
          columns: mockColumns,
          pagination: { enabled: true, pageSize: 2 },
        })
      )

      expect(result.current.paginatedData).toHaveLength(2)
      expect(result.current.paginationInfo.totalPages).toBe(2)

      act(() => {
        result.current.setCurrentPage(2)
      })

      expect(result.current.paginatedData).toHaveLength(2)
    })

    it("should handle page changes", () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: mockData,
          columns: mockColumns,
          pagination: { enabled: true, pageSize: 2 },
        })
      )

      act(() => {
        result.current.setCurrentPage(2)
      })

      expect(result.current.currentPage).toBe(2)
      expect(result.current.paginatedData[0]?.id).toBe(3)
    })

    it("should not paginate when disabled", () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: mockData,
          columns: mockColumns,
          pagination: { enabled: false },
        })
      )

      expect(result.current.paginatedData).toEqual(mockData)
      expect(result.current.paginationInfo.totalPages).toBe(1)
    })
  })

  describe("Combined operations", () => {
    it("should handle search and sort together", () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: mockData,
          columns: mockColumns,
          search: { enabled: true },
        })
      )

      // Sort by age ascending
      act(() => {
        result.current.handleSort("age")
      })

      vi.useFakeTimers()

      // Filter to only include entries with 'a' in name
      act(() => {
        const event = {
          target: { value: "a" },
        } as React.ChangeEvent<HTMLInputElement>
        result.current.handleSearchChange(event)
      })

      act(() => {
        vi.advanceTimersByTime(300)
      })

      vi.useRealTimers()

      // Should have Alice, Charlie, Diana (3 names with 'a')
      expect(result.current.paginatedData).toHaveLength(3)
      expect(result.current.paginatedData[0]?.name).toBe("Diana")
    })

    it("should handle search, sort, and pagination together", () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: mockData,
          columns: mockColumns,
          search: { enabled: true },
          pagination: { enabled: true, pageSize: 2 },
        })
      )

      // Sort by name
      act(() => {
        result.current.handleSort("name")
      })

      vi.useFakeTimers()

      // Search for entries with 'a'
      act(() => {
        const event = {
          target: { value: "a" },
        } as React.ChangeEvent<HTMLInputElement>
        result.current.handleSearchChange(event)
      })

      act(() => {
        vi.advanceTimersByTime(300)
      })

      vi.useRealTimers()

      // Should have 3 results, paginated to 2 per page
      expect(result.current.paginationInfo.totalPages).toBe(2)
      expect(result.current.paginatedData).toHaveLength(2)
    })
  })
})
