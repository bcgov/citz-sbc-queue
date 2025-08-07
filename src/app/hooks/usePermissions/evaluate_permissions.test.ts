import { describe, expect, it } from 'vitest';
import { evaluatePermissions } from './evaluate_permissions';
import type { PermissionContext, Resource, Role } from './types';

describe('evaluatePermissions', () => {
  describe('Admin permissions', () => {
    it('should grant full access to all resources', () => {
      const context: PermissionContext = {
        userId: 'admin-user',
        role: 'admin',
        resource: 'appointment',
      };

      const permissions = evaluatePermissions(context);

      expect(permissions).toContain('view');
      expect(permissions).toContain('create');
      expect(permissions).toContain('update');
      expect(permissions).toContain('delete');
      expect(permissions).toContain('approve');
      expect(permissions).toContain('assign');
      expect(permissions).toContain('cancel');
    });

    it('should have permissions for all resource types', () => {
      const resources: Resource[] = ['appointment', 'queue', 'service', 'user', 'report', 'settings'];

      resources.forEach(resource => {
        const context: PermissionContext = {
          userId: 'admin-user',
          role: 'admin',
          resource,
        };

        const permissions = evaluatePermissions(context);
        expect(permissions.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Manager permissions', () => {
    it('should grant management permissions for appointments', () => {
      const context: PermissionContext = {
        userId: 'manager-user',
        role: 'manager',
        resource: 'appointment',
      };

      const permissions = evaluatePermissions(context);

      expect(permissions).toContain('view');
      expect(permissions).toContain('create');
      expect(permissions).toContain('update');
      expect(permissions).toContain('approve');
      expect(permissions).toContain('assign');
      expect(permissions).toContain('cancel');
      expect(permissions).not.toContain('delete');
    });

    it('should allow managing staff users but not other managers', () => {
      const contextStaff: PermissionContext = {
        userId: 'manager-user',
        role: 'manager',
        resource: 'user',
        data: { role: 'staff' },
      };

      const contextManager: PermissionContext = {
        userId: 'manager-user',
        role: 'manager',
        resource: 'user',
        data: { role: 'manager' },
      };

      const staffPermissions = evaluatePermissions(contextStaff);
      const managerPermissions = evaluatePermissions(contextManager);

      expect(staffPermissions).toContain('view');
      expect(staffPermissions).toContain('update');
      expect(managerPermissions).toEqual([]);
    });

    it('should have read-only access to settings', () => {
      const context: PermissionContext = {
        userId: 'manager-user',
        role: 'manager',
        resource: 'settings',
      };

      const permissions = evaluatePermissions(context);

      expect(permissions).toContain('view');
      expect(permissions).not.toContain('update');
    });
  });

  describe('Staff permissions', () => {
    it('should allow modifying own assigned appointments', () => {
      const context: PermissionContext = {
        userId: 'staff-user',
        role: 'staff',
        resource: 'appointment',
        data: { assignedTo: 'staff-user' },
      };

      const permissions = evaluatePermissions(context);

      expect(permissions).toContain('view');
      expect(permissions).toContain('create');
      expect(permissions).toContain('update');
      expect(permissions).toContain('assign');
      expect(permissions).not.toContain('delete');
      expect(permissions).not.toContain('approve');
    });

    it('should allow modifying unassigned appointments', () => {
      const context: PermissionContext = {
        userId: 'staff-user',
        role: 'staff',
        resource: 'appointment',
        data: { assignedTo: undefined },
      };

      const permissions = evaluatePermissions(context);

      expect(permissions).toContain('view');
      expect(permissions).toContain('update');
    });

    it('should not allow modifying appointments assigned to others', () => {
      const context: PermissionContext = {
        userId: 'staff-user',
        role: 'staff',
        resource: 'appointment',
        data: { assignedTo: 'other-staff' },
      };

      const permissions = evaluatePermissions(context);

      expect(permissions).toEqual([]);
    });

    it('should only view citizen profiles', () => {
      const contextCitizen: PermissionContext = {
        userId: 'staff-user',
        role: 'staff',
        resource: 'user',
        data: { role: 'citizen' },
      };

      const contextStaff: PermissionContext = {
        userId: 'staff-user',
        role: 'staff',
        resource: 'user',
        data: { role: 'staff' },
      };

      const citizenPermissions = evaluatePermissions(contextCitizen);
      const staffPermissions = evaluatePermissions(contextStaff);

      expect(citizenPermissions).toContain('view');
      expect(staffPermissions).toEqual([]);
    });
  });

  describe('Citizen permissions', () => {
    it('should allow managing own appointments', () => {
      const context: PermissionContext = {
        userId: 'citizen-user',
        role: 'citizen',
        resource: 'appointment',
        data: { userId: 'citizen-user' },
      };

      const permissions = evaluatePermissions(context);

      expect(permissions).toContain('view');
      expect(permissions).toContain('create');
      expect(permissions).toContain('update');
      expect(permissions).toContain('cancel');
      expect(permissions).not.toContain('delete');
      expect(permissions).not.toContain('approve');
      expect(permissions).not.toContain('assign');
    });

    it('should not allow accessing other users appointments', () => {
      const context: PermissionContext = {
        userId: 'citizen-user',
        role: 'citizen',
        resource: 'appointment',
        data: { userId: 'other-citizen' },
      };

      const permissions = evaluatePermissions(context);

      expect(permissions).toEqual([]);
    });

    it('should allow managing own profile only', () => {
      const ownContext: PermissionContext = {
        userId: 'citizen-user',
        role: 'citizen',
        resource: 'user',
        data: { userId: 'citizen-user' },
      };

      const otherContext: PermissionContext = {
        userId: 'citizen-user',
        role: 'citizen',
        resource: 'user',
        data: { userId: 'other-user' },
      };

      const ownPermissions = evaluatePermissions(ownContext);
      const otherPermissions = evaluatePermissions(otherContext);

      expect(ownPermissions).toContain('view');
      expect(ownPermissions).toContain('update');
      expect(otherPermissions).toEqual([]);
    });

    it('should have read access to services and queues', () => {
      const serviceContext: PermissionContext = {
        userId: 'citizen-user',
        role: 'citizen',
        resource: 'service',
      };

      const queueContext: PermissionContext = {
        userId: 'citizen-user',
        role: 'citizen',
        resource: 'queue',
      };

      const servicePermissions = evaluatePermissions(serviceContext);
      const queuePermissions = evaluatePermissions(queueContext);

      expect(servicePermissions).toContain('view');
      expect(queuePermissions).toContain('view');
    });
  });

  describe('Guest permissions', () => {
    it('should have limited read access to services and queues', () => {
      const serviceContext: PermissionContext = {
        userId: 'guest-user',
        role: 'guest',
        resource: 'service',
      };

      const queueContext: PermissionContext = {
        userId: 'guest-user',
        role: 'guest',
        resource: 'queue',
      };

      const servicePermissions = evaluatePermissions(serviceContext);
      const queuePermissions = evaluatePermissions(queueContext);

      expect(servicePermissions).toEqual(['view']);
      expect(queuePermissions).toEqual(['view']);
    });

    it('should have no access to restricted resources', () => {
      const resources: Resource[] = ['appointment', 'user', 'report', 'settings'];

      resources.forEach(resource => {
        const context: PermissionContext = {
          userId: 'guest-user',
          role: 'guest',
          resource,
        };

        const permissions = evaluatePermissions(context);
        expect(permissions).toEqual([]);
      });
    });
  });

  describe('Edge cases', () => {
    it('should return empty array for unknown role', () => {
      const context: PermissionContext = {
        userId: 'unknown-user',
        role: 'unknown' as Role,
        resource: 'appointment',
      };

      const permissions = evaluatePermissions(context);
      expect(permissions).toEqual([]);
    });

    it('should return empty array for unknown resource', () => {
      const context: PermissionContext = {
        userId: 'admin-user',
        role: 'admin',
        resource: 'unknown' as Resource,
      };

      const permissions = evaluatePermissions(context);
      expect(permissions).toEqual([]);
    });

    it('should handle missing data context gracefully', () => {
      const context: PermissionContext = {
        userId: 'staff-user',
        role: 'staff',
        resource: 'appointment',
        // No data provided
      };

      const permissions = evaluatePermissions(context);
      // Should still allow access since condition checks for undefined assignedTo
      expect(permissions).toContain('view');
    });
  });
});
