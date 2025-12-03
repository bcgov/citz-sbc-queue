import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import "@testing-library/jest-dom"
import { DataTable } from "./DataTable"
import type { ColumnConfig } from "./types"

type TestData = {
  id: string
  name: string
  email: string
  age: number
  department: string
}

describe("DataTable", () => {
  const mockData: TestData[] = [
    {
      id: "1",
      name: "Alice Johnson",
      email: "alice@example.com",
      age: 28,
      department: "Engineering",
    },
    {
      id: "2",
      name: "Bob Smith",
      email: "bob@example.com",
      age: 35,
      department: "Marketing",
    },
    {
      id: "3",
      name: "Carol Williams",
      email: "carol@example.com",
      age: 32,
      department: "Engineering",
    },
    {
      id: "4",
      name: "David Brown",
      email: "david@example.com",
      age: 29,
      department: "Sales",
    },
    {
      id: "5",
      name: "Eve Davis",
      email: "eve@example.com",
      age: 31,
      department: "Marketing",
    },
  ]

  const mockColumns: ColumnConfig<TestData>[] = [
    { key: "name", label: "Name", sortable: true, searchable: true },
    { key: "email", label: "Email", searchable: true },
    { key: "age", label: "Age", sortable: true },
    { key: "department", label: "Department", sortable: true },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Basic Rendering", () => {
    it("should render table with correct columns", () => {
      render(<DataTable columns={mockColumns} data={mockData} />)

      mockColumns.forEach((column) => {
        expect(screen.getByText(column.label)).toBeInTheDocument()
      })
    })

    it("should render all data rows", () => {
      render(<DataTable columns={mockColumns} data={mockData} />)

      mockData.forEach((row) => {
        expect(screen.getByText(row.name)).toBeInTheDocument()
        expect(screen.getByText(row.email)).toBeInTheDocument()
      })
    })

    it("should render empty message when no data is provided", () => {
      render(<DataTable columns={mockColumns} data={[]} />)

      expect(screen.getByText("No data available")).toBeInTheDocument()
    })

    it("should render custom empty message", () => {
      const customMessage = "No appointments found"
      render(<DataTable columns={mockColumns} data={[]} emptyMessage={customMessage} />)

      expect(screen.getByText(customMessage)).toBeInTheDocument()
    })

    it("should have sticky header by default", () => {
      const { container } = render(<DataTable columns={mockColumns} data={mockData} />)

      const thead = container.querySelector("thead")
      expect(thead).toHaveClass("sticky")
    })

    it("should not have sticky header when sticky is false", () => {
      const { container } = render(
        <DataTable columns={mockColumns} data={mockData} sticky={false} />
      )

      const thead = container.querySelector("thead")
      expect(thead).not.toHaveClass("sticky")
    })
  })

  describe("Search Functionality", () => {
    it("should display search input when search is enabled", () => {
      render(<DataTable columns={mockColumns} data={mockData} search={{ enabled: true }} />)

      const searchInput = screen.getByPlaceholderText("Search...")
      expect(searchInput).toBeInTheDocument()
      expect(searchInput).toHaveAttribute("aria-label", "Search table")
    })

    it("should not display search input when search is disabled", () => {
      render(<DataTable columns={mockColumns} data={mockData} search={{ enabled: false }} />)

      expect(screen.queryByPlaceholderText("Search...")).not.toBeInTheDocument()
    })

    it("should filter data based on search query in searchable columns", async () => {
      const user = userEvent.setup()
      render(<DataTable columns={mockColumns} data={mockData} search={{ enabled: true }} />)

      const searchInput = screen.getByPlaceholderText("Search...")
      await user.type(searchInput, "alice")

      await waitFor(() => {
        expect(screen.getByText("Alice Johnson")).toBeInTheDocument()
        expect(screen.queryByText("Bob Smith")).not.toBeInTheDocument()
      })
    })

    it("should search across multiple searchable columns", async () => {
      const user = userEvent.setup()
      render(<DataTable columns={mockColumns} data={mockData} search={{ enabled: true }} />)

      const searchInput = screen.getByPlaceholderText("Search...")
      await user.type(searchInput, "alice@example.com")

      await waitFor(() => {
        expect(screen.getByText("Alice Johnson")).toBeInTheDocument()
      })
    })

    it("should be case-insensitive", async () => {
      const user = userEvent.setup()
      render(<DataTable columns={mockColumns} data={mockData} search={{ enabled: true }} />)

      const searchInput = screen.getByPlaceholderText("Search...")
      await user.type(searchInput, "ALICE")

      await waitFor(() => {
        expect(screen.getByText("Alice Johnson")).toBeInTheDocument()
      })
    })

    it("should reset to first page on search", async () => {
      const user = userEvent.setup()
      render(
        <DataTable
          columns={mockColumns}
          data={mockData}
          search={{ enabled: true }}
          pagination={{ enabled: true, pageSize: 2 }}
        />
      )

      const searchInput = screen.getByPlaceholderText("Search...")
      await user.type(searchInput, "alice")

      await waitFor(
        () => {
          expect(screen.getByText("Alice Johnson")).toBeInTheDocument()
          expect(screen.queryByText("Bob Smith")).not.toBeInTheDocument()
        },
        { timeout: 500 }
      )
    })

    it("should debounce search input", async () => {
      const user = userEvent.setup()
      render(
        <DataTable
          columns={mockColumns}
          data={mockData}
          search={{ enabled: true, debounceMs: 300 }}
        />
      )

      const searchInput = screen.getByPlaceholderText("Search...")
      await user.type(searchInput, "xyz")

      // Data should still show all rows before debounce completes
      expect(screen.getByText("Bob Smith")).toBeInTheDocument()

      // Wait for debounce to filter the data (no results for "xyz")
      await waitFor(
        () => {
          expect(screen.getByText("No data available")).toBeInTheDocument()
        },
        { timeout: 500 }
      )
    })

    it("should not search in non-searchable columns", async () => {
      const user = userEvent.setup()
      const columnsWithNonSearchable: ColumnConfig<TestData>[] = [
        { key: "name", label: "Name", searchable: true },
        { key: "age", label: "Age", searchable: false }, // Not searchable
      ]

      render(
        <DataTable columns={columnsWithNonSearchable} data={mockData} search={{ enabled: true }} />
      )

      const searchInput = screen.getByPlaceholderText("Search...")
      await user.type(searchInput, "28") // Alice's age

      await waitFor(() => {
        // Should not find results by age since it's not searchable
        expect(screen.queryByText("Alice Johnson")).not.toBeInTheDocument()
      })
    })
  })

  describe("Sorting Functionality", () => {
    it("should display sort buttons for sortable columns", () => {
      render(<DataTable columns={mockColumns} data={mockData} />)

      const nameSortButton = screen.getByLabelText("Sort by Name")
      const ageSortButton = screen.getByLabelText("Sort by Age")

      expect(nameSortButton).toBeInTheDocument()
      expect(ageSortButton).toBeInTheDocument()
    })

    it("should not display sort buttons for non-sortable columns", () => {
      const columnsWithNonSortable: ColumnConfig<TestData>[] = [
        { key: "name", label: "Name", sortable: true },
        { key: "email", label: "Email", sortable: false },
      ]

      render(<DataTable columns={columnsWithNonSortable} data={mockData} />)

      expect(screen.getByLabelText("Sort by Name")).toBeInTheDocument()
      expect(screen.queryByLabelText("Sort by Email")).not.toBeInTheDocument()
    })

    it("should sort data in ascending order on first click", async () => {
      const user = userEvent.setup()
      render(<DataTable columns={mockColumns} data={mockData} />)

      const nameSort = screen.getByLabelText("Sort by Name")
      await user.click(nameSort)

      const rows = screen.getAllByRole("row")
      // Skip header row
      expect(within(rows[1]).getByText("Alice Johnson")).toBeInTheDocument()
      expect(within(rows[2]).getByText("Bob Smith")).toBeInTheDocument()
    })

    it("should sort data in descending order on second click", async () => {
      const user = userEvent.setup()
      render(<DataTable columns={mockColumns} data={mockData} />)

      const nameSort = screen.getByLabelText("Sort by Name")
      await user.click(nameSort)
      await user.click(nameSort)

      const rows = screen.getAllByRole("row")
      // Skip header row
      expect(within(rows[1]).getByText("Eve Davis")).toBeInTheDocument()
    })

    it("should sort numeric columns correctly", async () => {
      const user = userEvent.setup()
      render(<DataTable columns={mockColumns} data={mockData} />)

      const ageSort = screen.getByLabelText("Sort by Age")
      await user.click(ageSort)

      const rows = screen.getAllByRole("row")
      // Ages should be in order: 28, 29, 31, 32, 35
      expect(within(rows[1]).getByText("Alice Johnson")).toBeInTheDocument() // age 28
      expect(within(rows[2]).getByText("David Brown")).toBeInTheDocument() // age 29
    })

    it("should reset to first page on sort", async () => {
      const user = userEvent.setup()
      render(
        <DataTable
          columns={mockColumns}
          data={mockData}
          pagination={{ enabled: true, pageSize: 2 }}
        />
      )

      const nextButton = screen.getAllByText("Next")[0]
      await user.click(nextButton)

      const nameSort = screen.getByLabelText("Sort by Name")
      await user.click(nameSort)

      const pageInfo = screen.getByText(/Page 1 of/)
      expect(pageInfo).toBeInTheDocument()
    })

    it("should indicate current sort direction visually", async () => {
      const user = userEvent.setup()
      render(<DataTable columns={mockColumns} data={mockData} />)

      const nameSort = screen.getByLabelText("Sort by Name")
      await user.click(nameSort)

      const sortIcon = nameSort.querySelector("svg")
      expect(sortIcon).not.toHaveClass("rotate-180")

      await user.click(nameSort)
      expect(sortIcon).toHaveClass("rotate-180")
    })

    it("should handle null and undefined values in sorting", async () => {
      const user = userEvent.setup()
      const dataWithNull: TestData[] = [
        ...mockData.slice(0, 2),
        {
          id: "6",
          name: "Frank",
          email: "frank@example.com",
          age: null as unknown as number,
          department: "Sales",
        },
      ]

      render(<DataTable columns={mockColumns} data={dataWithNull} />)

      const ageSort = screen.getByLabelText("Sort by Age")
      await user.click(ageSort)

      // Should not throw and render correctly
      expect(screen.getByText("Frank")).toBeInTheDocument()
    })
  })

  describe("Pagination", () => {
    it("should display all rows when pagination is disabled", () => {
      render(<DataTable columns={mockColumns} data={mockData} pagination={{ enabled: false }} />)

      mockData.forEach((row) => {
        expect(screen.getByText(row.name)).toBeInTheDocument()
      })
    })

    it("should paginate data when enabled", () => {
      render(
        <DataTable
          columns={mockColumns}
          data={mockData}
          pagination={{ enabled: true, pageSize: 2 }}
        />
      )

      // First page should show 2 rows
      expect(screen.getByText("Alice Johnson")).toBeInTheDocument()
      expect(screen.getByText("Bob Smith")).toBeInTheDocument()

      // Third row should not be visible
      expect(screen.queryByText("Carol Williams")).not.toBeInTheDocument()
    })

    it("should show pagination info", () => {
      render(
        <DataTable
          columns={mockColumns}
          data={mockData}
          pagination={{ enabled: true, pageSize: 2 }}
        />
      )

      expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument()
      expect(screen.getByText(/Showing 2 of 5 results/)).toBeInTheDocument()
    })

    it("should navigate to next page", async () => {
      const user = userEvent.setup()
      render(
        <DataTable
          columns={mockColumns}
          data={mockData}
          pagination={{ enabled: true, pageSize: 2 }}
        />
      )

      const nextButton = screen.getAllByText("Next")[0]
      await user.click(nextButton)

      expect(screen.getByText("Carol Williams")).toBeInTheDocument()
      expect(screen.queryByText("Alice Johnson")).not.toBeInTheDocument()
    })

    it("should navigate to previous page", async () => {
      const user = userEvent.setup()
      render(
        <DataTable
          columns={mockColumns}
          data={mockData}
          pagination={{ enabled: true, pageSize: 2 }}
        />
      )

      const nextButton = screen.getAllByText("Next")[0]
      await user.click(nextButton)

      const prevButton = screen.getAllByText("Previous")[0]
      await user.click(prevButton)

      expect(screen.getByText("Alice Johnson")).toBeInTheDocument()
      expect(screen.queryByText("Carol Williams")).not.toBeInTheDocument()
    })

    it("should disable previous button on first page", () => {
      render(
        <DataTable
          columns={mockColumns}
          data={mockData}
          pagination={{ enabled: true, pageSize: 2 }}
        />
      )

      const prevButton = screen.getAllByText("Previous")[0]
      expect(prevButton).toBeDisabled()
    })

    it("should disable next button on last page", async () => {
      const user = userEvent.setup()
      render(
        <DataTable
          columns={mockColumns}
          data={mockData}
          pagination={{ enabled: true, pageSize: 2 }}
        />
      )

      const nextButton = screen.getAllByText("Next")[0]
      await user.click(nextButton)
      await user.click(nextButton)

      expect(nextButton).toBeDisabled()
    })

    it("should use default page size when not specified", () => {
      render(<DataTable columns={mockColumns} data={mockData} pagination={{ enabled: true }} />)

      // Default page size is 10, so all 5 items should fit on page 1
      mockData.forEach((row) => {
        expect(screen.getByText(row.name)).toBeInTheDocument()
      })
    })

    it("should not show pagination controls with single page", () => {
      const { container } = render(
        <DataTable
          columns={mockColumns}
          data={mockData}
          pagination={{ enabled: true, pageSize: 10 }}
        />
      )

      // Should not render pagination when only 1 page
      const paginationButtons = container.querySelectorAll("button[aria-label*='page']")
      expect(paginationButtons.length).toBe(0)
    })
  })

  describe("Row Click Handler", () => {
    it("should call onRowClick when a row is clicked", async () => {
      const user = userEvent.setup()
      const onRowClick = vi.fn()
      render(<DataTable columns={mockColumns} data={mockData} onRowClick={onRowClick} />)

      const tbody = screen.getByRole("table").querySelector("tbody") as HTMLTableSectionElement
      const dataRows = tbody.querySelectorAll("tr")
      await user.click(dataRows[0]) // Click first data row

      expect(onRowClick).toHaveBeenCalledWith(mockData[0])
    })

    it("should make rows keyboard accessible when onRowClick is provided", () => {
      render(<DataTable columns={mockColumns} data={mockData} onRowClick={vi.fn()} />)

      const tbody = screen.getByRole("table").querySelector("tbody") as HTMLTableSectionElement
      const dataRow = tbody.querySelector("tr") as HTMLTableRowElement
      expect(dataRow).toHaveAttribute("tabIndex", "0")
      expect(dataRow).toHaveAttribute("role", "button")
    })

    it("should not make rows keyboard accessible when onRowClick is not provided", () => {
      render(<DataTable columns={mockColumns} data={mockData} />)

      const tbody = screen.getByRole("table").querySelector("tbody") as HTMLTableSectionElement
      const dataRow = tbody.querySelector("tr") as HTMLTableRowElement
      expect(dataRow).toHaveAttribute("tabIndex", "-1")
      expect(dataRow).not.toHaveAttribute("role", "button")
    })

    it("should handle Enter key on row", async () => {
      const user = userEvent.setup()
      const onRowClick = vi.fn()
      render(<DataTable columns={mockColumns} data={mockData} onRowClick={onRowClick} />)

      const tbody = screen.getByRole("table").querySelector("tbody") as HTMLTableSectionElement
      const row = tbody.querySelector("tr") as HTMLTableRowElement
      row.focus()
      await user.keyboard("{Enter}")

      expect(onRowClick).toHaveBeenCalledWith(mockData[0])
    })

    it("should handle Space key on row", async () => {
      const user = userEvent.setup()
      const onRowClick = vi.fn()
      render(<DataTable columns={mockColumns} data={mockData} onRowClick={onRowClick} />)

      const tbody = screen.getByRole("table").querySelector("tbody") as HTMLTableSectionElement
      const row = tbody.querySelector("tr") as HTMLTableRowElement
      row.focus()
      await user.keyboard(" ")

      expect(onRowClick).toHaveBeenCalledWith(mockData[0])
    })

    it("should add cursor-pointer class when onRowClick is provided", () => {
      const { container } = render(
        <DataTable columns={mockColumns} data={mockData} onRowClick={vi.fn()} />
      )

      const rows = container.querySelectorAll("tbody tr")
      expect(rows[0]).toHaveClass("cursor-pointer")
    })
  })

  describe("Cell Rendering", () => {
    it("should render cell content as string", () => {
      render(<DataTable columns={mockColumns} data={mockData} />)

      expect(screen.getByText("28")).toBeInTheDocument()
    })

    it("should handle null and undefined cell values", () => {
      const dataWithNull: TestData[] = [
        {
          ...mockData[0],
          email: null as unknown as string,
        },
      ]

      render(<DataTable columns={mockColumns} data={dataWithNull} />)

      expect(screen.getByText("Alice Johnson")).toBeInTheDocument()
    })

    it("should render objects as JSON string", () => {
      const columnsWithObject: ColumnConfig<TestData>[] = [
        {
          key: "name",
          label: "Name",
        },
      ]

      const dataWithComplexValue = [
        {
          ...mockData[0],
          name: { first: "Alice", last: "Johnson" } as unknown as string,
        },
      ]

      const { container } = render(
        <DataTable columns={columnsWithObject} data={dataWithComplexValue} />
      )

      expect(container.textContent).toContain("first")
    })
  })

  describe("Accessibility", () => {
    it("should have proper ARIA labels for sort buttons", () => {
      render(<DataTable columns={mockColumns} data={mockData} />)

      expect(screen.getByLabelText("Sort by Name")).toBeInTheDocument()
      expect(screen.getByLabelText("Sort by Age")).toBeInTheDocument()
    })

    it("should have proper ARIA labels for pagination buttons", () => {
      render(
        <DataTable
          columns={mockColumns}
          data={mockData}
          pagination={{ enabled: true, pageSize: 2 }}
        />
      )

      expect(screen.getByLabelText("Previous page")).toBeInTheDocument()
      expect(screen.getByLabelText("Next page")).toBeInTheDocument()
    })

    it("should have proper ARIA label for search input", () => {
      render(<DataTable columns={mockColumns} data={mockData} search={{ enabled: true }} />)

      expect(screen.getByLabelText("Search table")).toBeInTheDocument()
    })

    it("should have scope attribute on table headers", () => {
      const { container } = render(<DataTable columns={mockColumns} data={mockData} />)

      const headers = container.querySelectorAll("th")
      headers.forEach((header) => {
        expect(header).toHaveAttribute("scope", "col")
      })
    })

    it("should mark sort icons as aria-hidden", () => {
      const { container } = render(<DataTable columns={mockColumns} data={mockData} />)

      const sortIcons = container.querySelectorAll("button svg")
      sortIcons.forEach((icon) => {
        expect(icon).toHaveAttribute("aria-hidden", "true")
      })
    })
  })

  describe("Integration", () => {
    it("should work with search and pagination together", async () => {
      const user = userEvent.setup()
      render(
        <DataTable
          columns={mockColumns}
          data={mockData}
          search={{ enabled: true }}
          pagination={{ enabled: true, pageSize: 2 }}
        />
      )

      const searchInput = screen.getByPlaceholderText("Search...")
      await user.type(searchInput, "alice")

      await waitFor(
        () => {
          expect(screen.getByText("Alice Johnson")).toBeInTheDocument()
        },
        { timeout: 500 }
      )
      // Verify pagination is showing results
      expect(screen.getByText(/Showing.*results/)).toBeInTheDocument()
    })

    it("should work with search, sorting, and pagination together", async () => {
      const user = userEvent.setup()
      render(
        <DataTable
          columns={mockColumns}
          data={mockData}
          search={{ enabled: true }}
          pagination={{ enabled: true, pageSize: 2 }}
        />
      )

      const searchInput = screen.getByPlaceholderText("Search...")
      await user.type(searchInput, "alice")

      await waitFor(
        () => {
          expect(screen.getByText("Alice Johnson")).toBeInTheDocument()
        },
        { timeout: 500 }
      )

      const nameSort = screen.getByLabelText("Sort by Name")
      await user.click(nameSort)

      // After sorting, Alice should still be visible (she's the only match for "alice" search)
      expect(screen.getByText("Alice Johnson")).toBeInTheDocument()
    })

    it("should handle rapid clicks on sort and pagination", async () => {
      const user = userEvent.setup()
      render(
        <DataTable
          columns={mockColumns}
          data={mockData}
          pagination={{ enabled: true, pageSize: 2 }}
        />
      )

      const nameSort = screen.getByLabelText("Sort by Name")
      const nextButton = screen.getByRole("button", { name: /Next/ })

      await user.click(nameSort)
      await user.click(nextButton)
      await user.click(nameSort)

      // Should not error and render correctly
      expect(screen.getByText(/Page/)).toBeInTheDocument()
    })
  })
})
