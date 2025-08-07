import type { PermissionRule, Role } from './types';

/**
 * Permission Rules Configuration
 *
 * This file contains all ABAC permission rules organized by role.
 * Each rule defines what actions a role can perform on a resource,
 * with optional conditions for context-aware permissions.
 */

export const PERMISSION_RULES: PermissionRule[] = [
  // Admin permissions - full access to everything
  {
    role: 'admin',
    resource: 'appointment',
    actions: ['view', 'create', 'update', 'delete', 'approve', 'assign', 'cancel'],
  },
  {
    role: 'admin',
    resource: 'queue',
    actions: ['view', 'create', 'update', 'delete'],
  },
  {
    role: 'admin',
    resource: 'service',
    actions: ['view', 'create', 'update', 'delete'],
  },
  {
    role: 'admin',
    resource: 'user',
    actions: ['view', 'create', 'update', 'delete'],
  },
  {
    role: 'admin',
    resource: 'report',
    actions: ['view', 'create'],
  },
  {
    role: 'admin',
    resource: 'settings',
    actions: ['view', 'update'],
  },

  // Manager permissions - manage staff and operations
  {
    role: 'manager',
    resource: 'appointment',
    actions: ['view', 'create', 'update', 'approve', 'assign', 'cancel'],
  },
  {
    role: 'manager',
    resource: 'queue',
    actions: ['view', 'create', 'update'],
  },
  {
    role: 'manager',
    resource: 'service',
    actions: ['view', 'create', 'update'],
  },
  {
    role: 'manager',
    resource: 'user',
    actions: ['view', 'update'],
    condition: (ctx) => {
      // Managers can only manage staff users, not other managers/admins
      const targetRole = ctx.data?.role as Role;
      return targetRole === 'staff' || targetRole === 'citizen';
    },
  },
  {
    role: 'manager',
    resource: 'report',
    actions: ['view', 'create'],
  },
  {
    role: 'manager',
    resource: 'settings',
    actions: ['view'],
  },

  // Staff permissions - handle appointments and basic operations
  {
    role: 'staff',
    resource: 'appointment',
    actions: ['view', 'create', 'update', 'assign'],
    condition: (ctx) => {
      // Staff can only modify appointments assigned to them or unassigned
      const assignedTo = ctx.data?.assignedTo as string;
      return !assignedTo || assignedTo === ctx.userId;
    },
  },
  {
    role: 'staff',
    resource: 'queue',
    actions: ['view'],
  },
  {
    role: 'staff',
    resource: 'service',
    actions: ['view'],
  },
  {
    role: 'staff',
    resource: 'user',
    actions: ['view'],
    condition: (ctx) => {
      // Staff can only view citizen profiles
      const targetRole = ctx.data?.role as Role;
      return targetRole === 'citizen';
    },
  },
  {
    role: 'staff',
    resource: 'report',
    actions: ['view'],
  },

  // Citizen permissions - manage own appointments
  {
    role: 'citizen',
    resource: 'appointment',
    actions: ['view', 'create', 'update', 'cancel'],
    condition: (ctx) => {
      // Citizens can only access their own appointments
      const ownerId = ctx.data?.userId as string;
      return ownerId === ctx.userId;
    },
  },
  {
    role: 'citizen',
    resource: 'queue',
    actions: ['view'],
  },
  {
    role: 'citizen',
    resource: 'service',
    actions: ['view'],
  },
  {
    role: 'citizen',
    resource: 'user',
    actions: ['view', 'update'],
    condition: (ctx) => {
      // Citizens can only access their own profile
      const targetUserId = ctx.data?.userId as string;
      return targetUserId === ctx.userId;
    },
  },

  // Guest permissions - very limited read access
  {
    role: 'guest',
    resource: 'service',
    actions: ['view'],
  },
  {
    role: 'guest',
    resource: 'queue',
    actions: ['view'],
  },
];
