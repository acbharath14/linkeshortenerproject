---
name: Data mutations via server actions
description: Rules for performing data mutations using server actions, validation, auth checks, and data helpers.
applyTo: "**/*.{ts,tsx}"
---

- All data mutations must be performed through **server actions**.
- Server actions must be **called from client components**.
- Server action files **must be named** `actions.ts` and **co-located** with the component that calls them.
- All data passed to server actions must have **explicit TypeScript types** (do **not** use `FormData`).
- All inputs must be **validated with Zod** inside server actions.
- Server actions must **verify a logged-in user** before any database operation.
- On authentication failure, server actions must **return a typed error/success object** (no throwing errors).
- Database operations must use **helper functions in `/data`**; **no direct Drizzle queries** inside server actions.