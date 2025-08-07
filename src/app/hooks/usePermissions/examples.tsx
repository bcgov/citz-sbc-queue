/**
 * Example component demonstrating usePermissions hook usage
 * This file shows practical examples of how to use the permissions system
 */

import type { Role } from './types';
import { usePermissions } from './usePermissions';

// Mock user data for example
type User = {
  id: string;
  name: string;
  role: Role;
};

type Appointment = {
  id: string;
  title: string;
  userId: string;
  assignedTo?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
};

type ExampleProps = {
  currentUser: User;
  appointment: Appointment;
  onEdit?: () => void;
  onCancel?: () => void;
  onApprove?: () => void;
  onAssign?: () => void;
};

/**
 * Example component showing permission-based UI rendering
 */
export const AppointmentCardExample = ({
  currentUser,
  appointment,
  onEdit,
  onCancel,
  onApprove,
  onAssign
}: ExampleProps) => {
  const { hasPermission, hasAnyPermission, permissions } = usePermissions({
    userId: currentUser.id,
    role: currentUser.role,
    resource: 'appointment',
    data: {
      assignedTo: appointment.assignedTo,
      userId: appointment.userId
    }
  });

  // Check if user can perform any management actions
  const canManage = hasAnyPermission(['update', 'assign', 'approve', 'cancel']);

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold">{appointment.title}</h3>
        <span className={`px-2 py-1 rounded text-sm ${
          appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
          appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {appointment.status}
        </span>
      </div>

      <div className="text-sm text-gray-600">
        <p>ID: {appointment.id}</p>
        {appointment.assignedTo && (
          <p>Assigned to: {appointment.assignedTo}</p>
        )}
      </div>

      {/* Show management section only if user has any management permissions */}
      {canManage && (
        <div className="border-t pt-3">
          <h4 className="text-sm font-medium mb-2">Actions</h4>
          <div className="flex gap-2 flex-wrap">
            {hasPermission('update') && onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Edit
              </button>
            )}

            {hasPermission('assign') && onAssign && (
              <button
                type="button"
                onClick={onAssign}
                className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
              >
                Assign
              </button>
            )}

            {hasPermission('approve') && onApprove && (
              <button
                type="button"
                onClick={onApprove}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                Approve
              </button>
            )}

            {hasPermission('cancel') && onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {/* Debug info (remove in production) */}
      <details className="text-xs text-gray-500">
        <summary>Debug: Permissions ({permissions.length})</summary>
        <div className="mt-1">
          <strong>Allowed actions:</strong> {permissions.join(', ') || 'None'}
        </div>
      </details>
    </div>
  );
};

/**
 * Example showing how to use permissions in navigation/routing
 */
export const NavigationExample = ({ currentUser }: { currentUser: User }) => {
  // Check permissions for different navigation items
  const appointmentPerms = usePermissions({
    userId: currentUser.id,
    role: currentUser.role,
    resource: 'appointment',
  });

  const userPerms = usePermissions({
    userId: currentUser.id,
    role: currentUser.role,
    resource: 'user',
  });

  const reportPerms = usePermissions({
    userId: currentUser.id,
    role: currentUser.role,
    resource: 'report',
  });

  const settingsPerms = usePermissions({
    userId: currentUser.id,
    role: currentUser.role,
    resource: 'settings',
  });

  const navItems = [
    {
      label: 'Appointments',
      href: '/appointments',
      show: appointmentPerms.hasPermission('view'),
      canCreate: appointmentPerms.hasPermission('create'),
    },
    {
      label: 'Users',
      href: '/users',
      show: userPerms.hasPermission('view'),
      canCreate: userPerms.hasPermission('create'),
    },
    {
      label: 'Reports',
      href: '/reports',
      show: reportPerms.hasPermission('view'),
      canCreate: reportPerms.hasPermission('create'),
    },
    {
      label: 'Settings',
      href: '/settings',
      show: settingsPerms.hasPermission('view'),
      canCreate: false, // Settings don't have create action
    },
  ];

  return (
    <nav className="space-y-1">
      {navItems
        .filter(item => item.show)
        .map(item => (
          <div key={item.label} className="flex justify-between items-center p-2 hover:bg-gray-100 rounded">
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
  );
};

/**
 * Example showing server action integration
 */
export const ServerActionExample = () => {
  // This would typically be in a server action or API route
  const exampleServerAction = async (_formData: FormData) => {
    'use server';

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

      const permissions = evaluatePermissions({
        userId: user.id,
        role: user.role,
        resource: 'appointment',
        data: {
          assignedTo: appointment.assignedTo,
          userId: appointment.userId
        }
      });

      if (!permissions.includes('update')) {
        throw new Error('Insufficient permissions to update appointment');
      }

      // Proceed with update...
    }
    `;

    console.log('Server-side permission checking example:', mockPermissionCheck);
  };

  return (
    <div className="p-4 bg-gray-50 rounded">
      <h3 className="font-medium mb-2">Server Action Integration</h3>
      <p className="text-sm text-gray-600 mb-3">
        The <code>evaluatePermissions</code> function can be used on the server
        for secure permission checking in API routes and server actions.
      </p>
      <form action={exampleServerAction}>
        <button
          type="submit"
          className="px-3 py-1 bg-gray-600 text-white rounded text-sm"
        >
          See Console for Example
        </button>
      </form>
    </div>
  );
};
