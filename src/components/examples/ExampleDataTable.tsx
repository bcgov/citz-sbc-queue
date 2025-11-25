"use client"

import { useState } from "react"
import { DataTable } from "@/components/common/datatable"
import type { ColumnConfig } from "@/components/common/datatable/types"

/**
 * Example data type for the DataTable
 */
type Employee = {
  id: string
  name: string
  email: string
  department: string
  role: string
  salary: number
  startDate: string
}

/**
 * Sample employee data
 */
const sampleEmployees: Employee[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
    department: "Engineering",
    role: "Senior Developer",
    salary: 120000,
    startDate: "2020-03-15",
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob.smith@example.com",
    department: "Marketing",
    role: "Marketing Manager",
    salary: 95000,
    startDate: "2021-07-20",
  },
  {
    id: "3",
    name: "Carol Williams",
    email: "carol.williams@example.com",
    department: "Engineering",
    role: "DevOps Engineer",
    salary: 115000,
    startDate: "2019-11-03",
  },
  {
    id: "4",
    name: "David Brown",
    email: "david.brown@example.com",
    department: "Sales",
    role: "Sales Representative",
    salary: 85000,
    startDate: "2022-01-10",
  },
  {
    id: "5",
    name: "Eve Davis",
    email: "eve.davis@example.com",
    department: "Human Resources",
    role: "HR Specialist",
    salary: 80000,
    startDate: "2021-05-05",
  },
  {
    id: "6",
    name: "Frank Miller",
    email: "frank.miller@example.com",
    department: "Engineering",
    role: "Junior Developer",
    salary: 75000,
    startDate: "2023-02-14",
  },
  {
    id: "7",
    name: "Grace Lee",
    email: "grace.lee@example.com",
    department: "Finance",
    role: "Financial Analyst",
    salary: 90000,
    startDate: "2020-09-22",
  },
  {
    id: "8",
    name: "Henry Taylor",
    email: "henry.taylor@example.com",
    department: "Engineering",
    role: "Tech Lead",
    salary: 130000,
    startDate: "2018-06-11",
  },
]

/**
 * Column configuration for the employee table
 */
const employeeColumns: ColumnConfig<Employee>[] = [
  {
    key: "name",
    label: "Name",
    sortable: true,
    searchable: true,
  },
  {
    key: "email",
    label: "Email",
    searchable: true,
  },
  {
    key: "department",
    label: "Department",
    sortable: true,
    searchable: true,
  },
  {
    key: "role",
    label: "Role",
    searchable: true,
  },
  {
    key: "salary",
    label: "Salary",
    sortable: true,
    render: (value): string => {
      if (typeof value === "number") {
        return `$${value.toLocaleString()}`
      }
      return String(value ?? "")
    },
  },
  {
    key: "startDate",
    label: "Start Date",
    sortable: true,
  },
]

/**
 * ExampleDataTable component demonstrating DataTable usage
 * Shows all major features: search, sorting, pagination, and row click handling
 */
export const ExampleDataTable = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)

  const handleRowClick = (employee: Employee) => {
    setSelectedEmployee(employee)
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-typography-primary">Employee Directory</h1>
        <p className="mt-1 text-typography-secondary">
          Search, sort, and browse through our company employees
        </p>
      </div>

      {/* Main DataTable */}
      <div className="rounded-lg border border-border-light bg-background-default p-4">
        <DataTable
          columns={employeeColumns}
          data={sampleEmployees}
          search={{
            enabled: true,
            debounceMs: 300,
          }}
          pagination={{
            enabled: true,
            pageSize: 5,
          }}
          sticky={true}
          emptyMessage="No employees found matching your search."
          onRowClick={handleRowClick}
        />
      </div>

      {/* Selected Employee Details */}
      {selectedEmployee && (
        <div className="rounded-lg border border-border-light bg-background-light-gray p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-typography-primary">
                {selectedEmployee.name}
              </h2>
              <p className="mt-1 text-typography-secondary">{selectedEmployee.role}</p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedEmployee(null)}
              className="text-typography-secondary hover:text-typography-primary"
              aria-label="Close details"
            >
              ✕
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-typography-secondary">Email</p>
              <p className="text-typography-primary">{selectedEmployee.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-typography-secondary">Department</p>
              <p className="text-typography-primary">{selectedEmployee.department}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-typography-secondary">Salary</p>
              <p className="text-typography-primary">${selectedEmployee.salary.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-typography-secondary">Start Date</p>
              <p className="text-typography-primary">
                {new Date(selectedEmployee.startDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExampleDataTable
