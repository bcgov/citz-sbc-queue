# DataTable Component

A reusable, accessible data table component with built-in support for search, sorting, pagination, and custom cell rendering.

## Features

- **Configurable columns** with custom labels and keys
- **Search** with debounced input and multi-column support
- **Sorting** with ascending/descending toggle
- **Pagination** with customizable page size
- **Custom rendering** for complex cell content
- **Row selection** with click handlers and keyboard support
- **Sticky headers** for improved UX during scrolling
- **Accessibility** (WCAG 2.1 AA compliant)

## Basic Usage

```tsx
"use client"

import { DataTable } from "@/components/common/datatable"
import type { ColumnConfig } from "@/components/common/datatable/types"

type User = {
  id: string
  name: string
  email: string
  role: string
}

const columns: ColumnConfig<User>[] = [
  { key: "name", label: "Name", sortable: true, searchable: true },
  { key: "email", label: "Email", searchable: true },
  { key: "role", label: "Role", sortable: true },
]

const users: User[] = [
  { id: "1", name: "Alice", email: "alice@example.com", role: "Admin" },
  { id: "2", name: "Bob", email: "bob@example.com", role: "User" },
]

export function UserTable() {
  return (
    <DataTable
      columns={columns}
      data={users}
      search={{ enabled: true }}
      pagination={{ enabled: true, pageSize: 10 }}
    />
  )
}
```

### Column Configuration

```tsx
type ColumnConfig<T> = {
  key: keyof T                    // Data property key
  label: string                   // Column header label
  sortable?: boolean              // Enable sorting (default: false)
  searchable?: boolean            // Include in search (default: false)
  render?: (value, row) => ReactNode  // Custom cell renderer
}
```

### Pagination Configuration

```tsx
type PaginationConfig = {
  enabled: boolean      // Enable pagination
  pageSize?: number     // Items per page (default: 10)
}
```

### Search Configuration

```tsx
type SearchConfig = {
  enabled: boolean      // Enable search bar
  debounceMs?: number   // Debounce delay in ms (default: 300)
}
```

## Advanced Examples

### Custom Cell Rendering

```tsx
const columns: ColumnConfig<User>[] = [
  {
    key: "name",
    label: "Name",
    searchable: true,
  },
  {
    key: "status",
    label: "Status",
    render: (value) => (
      <span className={value === "active" ? "text-green-600" : "text-red-600"}>
        {value}
      </span>
    ),
  },
  {
    key: "joinDate",
    label: "Join Date",
    sortable: true,
    render: (value) => new Date(value as string).toLocaleDateString(),
  },
]
```

### Row Click Handling

```tsx
const [selectedUser, setSelectedUser] = useState<User | null>(null)

<DataTable
  columns={columns}
  data={users}
  onRowClick={setSelectedUser}
/>

{selectedUser && (
  <UserDetails user={selectedUser} />
)}
```

## Hook

### `useDataTable`

The underlying hook that manages all table state and logic.

```tsx
import { useDataTable } from "@/hooks/useDataTable"

const {
  paginatedData,
  sortConfig,
  currentPage,
  handleSearchChange,
  handleSort,
  setCurrentPage,
} = useDataTable({
  data: users,
  columns,
  pagination: { enabled: true, pageSize: 10 },
  search: { enabled: true },
})
```

## Accessibility

The DataTable component includes:

- **Semantic HTML**: Uses `<table>`, `<th>`, and `<td>` elements properly
- **Keyboard navigation**: Rows are focusable with `Tab` key; `Enter`/`Space` trigger row click
- **Screen reader support**: Column headers have `scope="col"` attribute
- **Focus management**: Clear focus indicators for keyboard users
- **ARIA labels**: Search input has appropriate labeling

## See Also

- [ExampleDataTable](../examples/ExampleDataTable.tsx) - Complete working example
- [useDataTable Hook](../../hooks/useDataTable/) - State management hook
