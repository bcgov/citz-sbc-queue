# lib Directory

## Purpose

The `lib` directory contains centralized, library-like implementations of external dependencies and integrations. This keeps implementation details separate from application code, making it easy to swap or update underlying technologies.

## Key Benefits

- **Encapsulation**: Implementation details are hidden behind a consistent interface
- **Maintainability**: Changes to external dependencies are isolated to one location
- **Reusability**: Common patterns are abstracted into reusable functions
- **Testability**: Library functions can be thoroughly tested independently

## Example: Swapping ORM

Suppose we decide to replace Prisma with another ORM. Currently, all database access goes through `lib/prisma/`. To make the switch:

1. Update functions in `lib/prisma/` to use the new ORM's API
2. Application code remains unchanged because it depends on the interface, not the implementation
3. No changes needed in components, hooks, or server actions

## Prisma Example Use Cases

```
lib/prisma/
├── users/
│   ├── getUserById.ts          # Fetch single user by ID
│   ├── getAdminUsers.ts        # Get users with admin role
│   ├── insertStaffUser.ts      # Create new staff user
├── appointments/
│   ├── getAppointmentById.ts   # Fetch single appointment
│   ├── listAppointments.ts     # List with pagination/filtering
│   └── createAppointment.ts    # Create new appointment
└── queues/
    ├── getQueueStatus.ts       # Get real-time queue info
    └── updateQueueMetrics.ts   # Update queue statistics
```
