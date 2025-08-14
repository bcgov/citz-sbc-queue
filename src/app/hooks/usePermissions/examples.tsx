/**
 * Example components demonstrating the enhanced usePermissions hook with simplified API
 * This file shows practical examples of the multi-resource permission system using queue management
 */

import { usePermissions } from "./usePermissions"

// Mock user and data types for queue management
type User = {
  id: string
  name: string
  role: "admin" | "manager" | "staff" | "citizen" | "guest"
}

type Appointment = {
  id: string
  title: string
  assignedTo?: string
  userId: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
}

type AppointmentCardProps = {
  appointment: Appointment
  currentUser: User
  onEdit?: () => void
  onDelete?: () => void
  onAssign?: () => void
}

/**
 * Example showing multi-resource permission checking for an appointment
 */
export const AppointmentCard = ({
  appointment,
  currentUser,
  onEdit,
  onDelete,
  onAssign,
}: AppointmentCardProps) => {
  const { hasPermission, getResourcePermissions } = usePermissions({
    userRole: currentUser.role,
    context: { user_id: currentUser.id },
    checks: [
      {
        resource: "appointment",
        data: {
          assignedTo: appointment.assignedTo,
          userId: appointment.userId,
          status: appointment.status
        },
      },
    ],
  })

  // Get all permissions for this appointment
  const appointmentPermissions = getResourcePermissions("appointment")
  const allowedActions = appointmentPermissions.filter((p) => p.hasPermission).map((p) => p.action)

  // Type-safe permission checking
  const canView = hasPermission("appointment", "view")
  const canUpdate = hasPermission("appointment", "update")
  const canDelete = hasPermission("appointment", "delete")
  const canAssign = hasPermission("appointment", "assign")

  if (!canView) {
    return null // User can't even see this appointment
  }

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{appointment.title}</h3>
          <p className="text-sm text-gray-600">
            Status: {appointment.status}
            {appointment.assignedTo && ` • Assigned to: ${appointment.assignedTo}`}
          </p>
        </div>
      </div>

      <div className="text-sm text-gray-600">
        <p>Appointment ID: {appointment.id}</p>
        <p>User: {appointment.userId}</p>
      </div>

      {/* Show action buttons based on permissions */}
      {allowedActions.length > 1 && ( // More than just "view"
        <div className="border-t pt-3 space-x-2">
          {canUpdate && (
            <button
              type="button"
              onClick={onEdit}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
            >
              Edit
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm"
            >
              Delete
            </button>
          )}
          {canAssign && (
            <button
              type="button"
              onClick={onAssign}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm"
            >
              Assign
            </button>
          )}
        </div>
      )}

      {/* Debug info (remove in production) */}
      <details className="text-xs text-gray-500">
        <summary>Permission Details</summary>
        <div className="mt-2 space-y-1">
          <p>User Role: {currentUser.role}</p>
          <p>Allowed Actions: {allowedActions.join(", ") || "None"}</p>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {appointmentPermissions.map((perm) => (
              <div key={perm.action} className={perm.hasPermission ? "text-green-600" : "text-red-600"}>
                {perm.action}: {perm.hasPermission ? "✓" : "✗"}
              </div>
            ))}
          </div>
        </div>
      </details>
    </div>
  )
}

/**
 * Example showing navigation permissions
 */
export const NavigationExample = ({ currentUser }: { currentUser: User }) => {
  // Check permissions for different navigation items
  const permissions = usePermissions({
    userRole: currentUser.role,
    context: { user_id: currentUser.id },
    checks: [
      { resource: "appointment" },
      { resource: "user" },
      { resource: "report" },
      { resource: "settings" },
    ],
  })

  const navItems = [
    {
      label: "Appointments",
      href: "/appointments",
      show: permissions.hasPermission("appointment", "view"),
      canCreate: permissions.hasPermission("appointment", "create"),
    },
    {
      label: "Users",
      href: "/users",
      show: permissions.hasPermission("user", "view"),
      canCreate: permissions.hasPermission("user", "create"),
    },
    {
      label: "Reports",
      href: "/reports",
      show: permissions.hasPermission("report", "view"),
      canCreate: permissions.hasPermission("report", "create"),
    },
    {
      label: "Settings",
      href: "/settings",
      show: permissions.hasPermission("settings", "view"),
      canCreate: false, // Settings don't have create action
    },
  ]

  return (
    <nav className="space-y-1">
      {navItems
        .filter((item) => item.show)
        .map((item) => (
          <div
            key={item.label}
            className="flex justify-between items-center p-2 hover:bg-gray-100 rounded"
          >
            <a href={item.href} className="text-gray-700 hover:text-gray-900">
              {item.label}
            </a>
            {item.canCreate && (
              <button type="button" className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                + New
              </button>
            )}
          </div>
        ))}
    </nav>
  )
}

/**
 * Example showing batch permission checking and results analysis
 */
export const PermissionsDashboard = ({ currentUser }: { currentUser: User }) => {
  const { results } = usePermissions({
    userRole: currentUser.role,
    context: { user_id: currentUser.id },
    checks: [
      { resource: "appointment" },
      { resource: "user" },
      { resource: "report" },
      { resource: "settings" },
    ],
  })

  // Group results by resource for organized display
  const permissionsByResource = results.reduce(
    (acc, result) => {
      if (!acc[result.resource]) {
        acc[result.resource] = []
      }
      acc[result.resource].push(result)
      return acc
    },
    {} as Record<string, typeof results>
  )

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Your Permissions</h1>
      <p className="text-gray-600 mb-6">
        Role: <span className="font-semibold">{currentUser.role}</span>
      </p>

      {Object.entries(permissionsByResource).map(([resource, perms]) => (
        <div key={resource} className="mb-6">
          <h2 className="text-lg font-semibold mb-2 capitalize">{resource}</h2>
          <div className="grid grid-cols-2 gap-2">
            {perms.map((perm) => (
              <div
                key={perm.action}
                className={`p-2 rounded text-sm ${
                  perm.hasPermission ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
              >
                <span className="font-medium">{perm.action}</span>
                <span className="ml-2">{perm.hasPermission ? "✓" : "✗"}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Example showing user management with permissions
 */
export const UserManagementExample = ({ currentUser }: { currentUser: User }) => {
  const users = [
    { id: "1", name: "John Admin", role: "admin" as const },
    { id: "2", name: "Jane Manager", role: "manager" as const },
    { id: "3", name: "Bob Staff", role: "staff" as const },
    { id: "4", name: "Alice Citizen", role: "citizen" as const },
  ]

  const { hasPermission } = usePermissions({
    userRole: currentUser.role,
    context: { user_id: currentUser.id },
    checks: [
      { resource: "user" },
    ],
  })

  const canViewUsers = hasPermission("user", "view")
  const canCreateUsers = hasPermission("user", "create")
  const canUpdateUsers = hasPermission("user", "update")
  const canDeleteUsers = hasPermission("user", "delete")

  if (!canViewUsers) {
    return <div className="p-4 text-red-600">You don't have permission to view users.</div>
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">User Management</h2>
        {canCreateUsers && (
          <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded">
            Add User
          </button>
        )}
      </div>

      <div className="space-y-2">
        {users.map((user) => (
          <div key={user.id} className="flex justify-between items-center p-3 border rounded">
            <div>
              <span className="font-medium">{user.name}</span>
              <span className="ml-2 text-sm text-gray-600">({user.role})</span>
            </div>
            <div className="space-x-2">
              {canUpdateUsers && (
                <button type="button" className="px-2 py-1 text-sm bg-yellow-100 text-yellow-800 rounded">
                  Edit
                </button>
              )}
              {canDeleteUsers && user.id !== currentUser.id && (
                <button type="button" className="px-2 py-1 text-sm bg-red-100 text-red-800 rounded">
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
