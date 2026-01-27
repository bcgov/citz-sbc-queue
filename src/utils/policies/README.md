# Attribute-Based Access Control (ABAC) Policy System

Each resource exposes a **policy** that determines which actions are allowed for a given user and record.

The component or function that resolves the policy is only concerned with the actions that are returned. The policies map is the only place where polcies are configured (centralized control of permissions).

## Summary

- Policies describe **what a user can do with a resource**
- Actions are **discovered**, not checked individually
- Actions are NOT limited to CRUD operations (could be for example 'publish' or 'lock')

---

## Core Concepts

### 1. User Context
Describes **who** is performing the action. We can add more details to this as needed such as location_id.

```ts
type UserContext = {
	staff_user_id: string | null;
	role: Role | null;
};
```

---

### 2. Resource Data
Represents the **record being acted on** (if applicable).

```ts
type ResourceData = Record<string, unknown> | null;
```

Some actions (e.g. `get`, `create`) may not require data.

---

### 3. Policy
A policy is a function tied to a **resource**.

It receives:
- `user_context` (who)
- `data` (what)

And returns:
- a list of allowed **actions** (`string[]`)

```ts
type Policy = (
	user_context: UserContext,
	data: ResourceData,
) => string[];
```

Actions are **not limited to CRUD**. They can be any string:
`"get"`, `"update"`, `"moderate"`, `"lock"`, `"publish"`, etc.

---

## Defining Policies

Policies are registered in a single object, keyed by **resource name**.

```ts
export const policies: Policies = {
	comment: (user_context, data) => {
		const { staff_user_id, role } = user_context;
		const actions = new Set<string>();

		// Public read
		actions.add("get");

		// Authenticated users can create
		if (staff_user_id) actions.add("create");

		// Administrators can do everything
		if (role === "Administrator") {
			actions.add("update");
			actions.add("delete");
			actions.add("moderate");
			return Array.from(actions);
		}

		// Owners can update/delete their own records
		if (staff_user_id && data?.created_by === staff_user_id) {
			actions.add("update");
			actions.add("delete");
		}

		return Array.from(actions);
	},

	adminPanel: (user_context) => {
		if (user_context.role === "Administrator") {
			return ["get"];
		}

		return [];
	},
};
```

---

## API

### resolvePolicy

Returns all allowed actions for a single resource.

```ts
resolvePolicy(
	resource: string,
	user_context: UserContext,
	data?: ResourceData,
): string[];
```

**Example**

```ts
const actions = resolvePolicy(
	"comment",
	{ staff_user_id: "u1", role: "Staff" },
	{ created_by: "u1" },
);

// ["get", "create", "update", "delete"]
```

If no policy exists for the resource, an empty array is returned.

---

### resolvePolicies

Batch helper for checking multiple resources at once.

```ts
resolvePolicies(
	requests: PolicyRequest[],
	user_context: UserContext,
): Array<{ resource: string; actions: string[] }>;
```

**Example**

```ts
const result = resolvePolicies(
	[
		{ resource: "comment", data: { created_by: "u1" } },
		{ resource: "adminPanel" },
	],
	{ staff_user_id: "u1", role: "Staff" },
);
```

Result:

```ts
[
	{
		resource: "comment",
		actions: ["get", "create", "update", "delete"],
	},
	{
		resource: "adminPanel",
		actions: [],
	},
];
```

---

## Typical Usage

### UI gating

```ts
const actions = resolvePolicy("comment", user_context, comment);

const canEdit = actions.includes("update");
const canDelete = actions.includes("delete");
```
