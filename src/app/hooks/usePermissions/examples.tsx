/**
 * Example components demonstrating enhanced usePermissions hook with type inference
 * This file shows practical examples of the multi-resource permission system
 */

import type { PermissionContext } from "./types"
import { usePermissions } from "./usePermissions"

// Example permission rules with type inference
const BLOG_RULES = [
  {
    role: "admin",
    resource: "post",
    actions: ["read", "write", "delete", "publish"],
  },
  {
    role: "author",
    resource: "post",
    actions: ["read", "write", "publish"],
    condition: (ctx: PermissionContext) =>
      (ctx.data as Record<string, unknown>)?.authorId === ctx.userId,
  },
  {
    role: "editor",
    resource: "post",
    actions: ["read", "write"],
    condition: (ctx: PermissionContext) => {
      const data = ctx.data as Record<string, unknown>
      const editorIds = data?.editorIds as string[]
      return Array.isArray(editorIds) && editorIds.includes(ctx.userId as string)
    },
  },
  {
    role: "reader",
    resource: "post",
    actions: ["read"],
    condition: (ctx: PermissionContext) =>
      (ctx.data as Record<string, unknown>)?.status === "published",
  },
] as const

const QUEUE_RULES = [
  {
    role: "admin",
    resource: "appointment",
    actions: ["view", "create", "update", "delete", "approve", "assign", "cancel"],
  },
  {
    role: "manager",
    resource: "appointment",
    actions: ["view", "create", "update", "approve", "assign", "cancel"],
  },
  {
    role: "staff",
    resource: "appointment",
    actions: ["view", "create", "update", "assign"],
    condition: (ctx: PermissionContext) => {
      const data = ctx.data as Record<string, unknown>
      return !data?.assignedTo || data?.assignedTo === ctx.userId
    },
  },
  {
    role: "citizen",
    resource: "appointment",
    actions: ["view", "create", "update", "cancel"],
    condition: (ctx: PermissionContext) =>
      (ctx.data as Record<string, unknown>)?.userId === ctx.userId,
  },
  {
    role: "admin",
    resource: "user",
    actions: ["view", "create", "update", "delete"],
  },
  {
    role: "manager",
    resource: "user",
    actions: ["view", "update"],
    condition: (ctx: PermissionContext) => {
      const data = ctx.data as Record<string, unknown>
      return ["staff", "citizen"].includes(data?.role as string)
    },
  },
  {
    role: "staff",
    resource: "user",
    actions: ["view"],
    condition: (ctx: PermissionContext) =>
      (ctx.data as Record<string, unknown>)?.role === "citizen",
  },
  {
    role: "admin",
    resource: "report",
    actions: ["view", "create"],
  },
  {
    role: "manager",
    resource: "report",
    actions: ["view", "create"],
  },
  {
    role: "staff",
    resource: "report",
    actions: ["view"],
  },
  {
    role: "admin",
    resource: "settings",
    actions: ["view", "update"],
  },
  {
    role: "manager",
    resource: "settings",
    actions: ["view"],
  },
] as const

// Mock user and data types
type User = {
  id: string
  name: string
  role: string
}

type BlogPost = {
  id: string
  title: string
  content: string
  authorId: string
  editorIds: string[]
  status: "draft" | "published" | "archived"
}

type BlogPostCardProps = {
  post: BlogPost
  currentUser: User
  onEdit?: () => void
  onDelete?: () => void
  onPublish?: () => void
}

/**
 * Example showing multi-resource permission checking for a blog post
 */
export const BlogPostCard = ({
  post,
  currentUser,
  onEdit,
  onDelete,
  onPublish,
}: BlogPostCardProps) => {
  const { hasPermission, getResourcePermissions } = usePermissions({
    userRole: currentUser.role as "admin" | "author" | "editor" | "reader",
    context: { userId: currentUser.id },
    rules: BLOG_RULES,
    checks: [
      {
        resource: "post",
        action: "read",
        data: { authorId: post.authorId, editorIds: post.editorIds, status: post.status },
      },
      {
        resource: "post",
        action: "write",
        data: { authorId: post.authorId, editorIds: post.editorIds, status: post.status },
      },
      {
        resource: "post",
        action: "delete",
        data: { authorId: post.authorId, editorIds: post.editorIds, status: post.status },
      },
      {
        resource: "post",
        action: "publish",
        data: { authorId: post.authorId, editorIds: post.editorIds, status: post.status },
      },
    ],
  })

  // Get all permissions for this post
  const postPermissions = getResourcePermissions("post")
  const allowedActions = postPermissions.filter((p) => p.hasPermission).map((p) => p.action)

  // Type-safe permission checking
  const canEdit = hasPermission("post", "write")
  const canDelete = hasPermission("post", "delete")
  const canPublish = hasPermission("post", "publish")

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold">{post.title}</h3>
        <span
          className={`px-2 py-1 rounded text-sm ${
            post.status === "published"
              ? "bg-green-100 text-green-800"
              : post.status === "draft"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800"
          }`}
        >
          {post.status}
        </span>
      </div>

      <div className="text-sm text-gray-600">
        <p>ID: {post.id}</p>
        <p>Author: {post.authorId}</p>
        {post.editorIds.length > 0 && <p>Editors: {post.editorIds.join(", ")}</p>}
      </div>

      {/* Show action buttons based on permissions */}
      {allowedActions.length > 0 && (
        <div className="border-t pt-3">
          <h4 className="text-sm font-medium mb-2">Actions</h4>
          <div className="flex gap-2 flex-wrap">
            {canEdit && onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Edit
              </button>
            )}

            {canPublish && onPublish && (
              <button
                type="button"
                onClick={onPublish}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                Publish
              </button>
            )}

            {canDelete && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      )}

      {/* Debug info (remove in production) */}
      <details className="text-xs text-gray-500">
        <summary>Debug: Permissions ({allowedActions.length})</summary>
        <div className="mt-1">
          <strong>Allowed actions:</strong> {allowedActions.join(", ") || "None"}
        </div>
      </details>
    </div>
  )
}

/**
 * Example showing navigation permissions with queue management rules
 */
export const NavigationExample = ({ currentUser }: { currentUser: User }) => {
  // Check permissions for different navigation items using queue rules
  const appointmentPerms = usePermissions({
    userRole: currentUser.role as "admin" | "manager" | "staff" | "citizen",
    context: { userId: currentUser.id },
    rules: QUEUE_RULES,
    checks: [
      { resource: "appointment", action: "view" },
      { resource: "appointment", action: "create" },
    ],
  })

  const userPerms = usePermissions({
    userRole: currentUser.role as "admin" | "manager" | "staff" | "citizen",
    context: { userId: currentUser.id },
    rules: QUEUE_RULES,
    checks: [
      { resource: "user", action: "view" },
      { resource: "user", action: "create" },
    ],
  })

  const reportPerms = usePermissions({
    userRole: currentUser.role as "admin" | "manager" | "staff" | "citizen",
    context: { userId: currentUser.id },
    rules: QUEUE_RULES,
    checks: [
      { resource: "report", action: "view" },
      { resource: "report", action: "create" },
    ],
  })

  const settingsPerms = usePermissions({
    userRole: currentUser.role as "admin" | "manager" | "staff" | "citizen",
    context: { userId: currentUser.id },
    rules: QUEUE_RULES,
    checks: [{ resource: "settings", action: "view" }],
  })

  const navItems = [
    {
      label: "Appointments",
      href: "/appointments",
      show: appointmentPerms.hasPermission("appointment", "view"),
      canCreate: appointmentPerms.hasPermission("appointment", "create"),
    },
    {
      label: "Users",
      href: "/users",
      show: userPerms.hasPermission("user", "view"),
      canCreate: userPerms.hasPermission("user", "create"),
    },
    {
      label: "Reports",
      href: "/reports",
      show: reportPerms.hasPermission("report", "view"),
      canCreate: reportPerms.hasPermission("report", "create"),
    },
    {
      label: "Settings",
      href: "/settings",
      show: settingsPerms.hasPermission("settings", "view"),
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
    userRole: currentUser.role as "admin" | "manager" | "staff" | "citizen",
    context: { userId: currentUser.id },
    rules: QUEUE_RULES,
    checks: [
      { resource: "appointment", action: "view" },
      { resource: "appointment", action: "create" },
      { resource: "appointment", action: "update" },
      { resource: "appointment", action: "delete" },
      { resource: "user", action: "view" },
      { resource: "user", action: "create" },
      { resource: "user", action: "update" },
      { resource: "report", action: "view" },
      { resource: "report", action: "create" },
      { resource: "settings", action: "view" },
      { resource: "settings", action: "update" },
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
 * Example showing server action integration pattern
 */
export const ServerActionExample = () => {
  // This would typically be in a server action or API route
  const exampleServerAction = async (_formData: FormData) => {
    "use server"

    // In a real implementation, you would:
    // 1. Get user from session/auth
    // 2. Extract appointment data from form
    // 3. Use evaluatePermissions on the server

    const mockPermissionCheck = `
    import { evaluatePermissions } from '@/hooks/usePermissions';

    export async function updateAppointment(formData: FormData) {
      const user = await getCurrentUser();
      const appointmentId = formData.get('appointmentId') as string;
      const appointment = await getAppointment(appointmentId);

      const canUpdate = evaluatePermissions({
        userRole: user.role,
        resource: 'appointment',
        action: 'update',
        context: {
          userId: user.id,
          data: {
            assignedTo: appointment.assignedTo,
            userId: appointment.userId
          }
        },
        rules: QUEUE_RULES
      });

      if (!canUpdate) {
        throw new Error('Insufficient permissions to update appointment');
      }

      // Proceed with update...
    }
    `

    console.log("Server-side permission checking example:", mockPermissionCheck)
  }

  return (
    <div className="p-4 bg-gray-50 rounded">
      <h3 className="font-medium mb-2">Server Action Integration</h3>
      <p className="text-sm text-gray-600 mb-3">
        The <code>evaluatePermissions</code> function can be used on the server for secure
        permission checking in API routes and server actions.
      </p>
      <form action={exampleServerAction}>
        <button type="submit" className="px-3 py-1 bg-gray-600 text-white rounded text-sm">
          See Console for Example
        </button>
      </form>
    </div>
  )
}
