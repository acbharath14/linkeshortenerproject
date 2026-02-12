---
description: This file outlines the authentication requirements for the Next.js application using Clerk. It specifies the implementation details, core principles, and prohibited practices to ensure a secure and consistent authentication system across the project.
applyTo: **/*.ts, **/*.tsx
---

## Core Principles
- **Clerk is the ONLY authentication method** for this application
- All authentication logic must use Clerk and its provided utilities
- No alternative auth methods are permitted

## Required Implementation

### Middleware Setup
- Create `middleware.ts` in the root `app/` directory
- Import and use `clerkMiddleware()` from `@clerk/nextjs/server`
- Configure protected routes using the middleware
- Example:
  ```typescript
  import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
  
  const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);
  
  export default clerkMiddleware((auth, req) => {
    if (isProtectedRoute(req)) {
      auth().protect();
    }
  });
  
  export const config = {
    matcher: ['/((?!_next|static|.*\\.png).*)'],
  };
  ```

### Layout Configuration
- Wrap the entire app with `ClerkProvider` in `app/layout.tsx`
- Use Clerk UI components:
  - `SignInButton`, `SignUpButton` - for unauthenticated users
  - `UserButton` - for authenticated users
  - `SignedIn`, `SignedOut` - conditional rendering based on auth state

### Protected Routes
- `/dashboard` is a **protected route** requiring user authentication
- Users must be logged in to access `/dashboard`
- Any attempt to access without authentication redirects to sign-in

### Homepage Redirect Logic
- If a logged-in user accesses the homepage (`/`), redirect them to `/dashboard`
- Implement this in `app/page.tsx` using `useAuth()` hook and `redirect()` from `next/navigation`
- Example:
  ```typescript
  'use client';
  import { useAuth } from '@clerk/nextjs';
  import { redirect } from 'next/navigation';
  
  export default function Home() {
    const { isSignedIn } = useAuth();
    
    if (isSignedIn) {
      redirect('/dashboard');
    }
    
    // Homepage content for unauthenticated users
    return <div>Welcome</div>;
  }
  ```

## Prohibited
- Do not use `authMiddleware` or `withAuth` (deprecated)
- Do not use Pages Router or `_app.tsx`
- Do not hardcode or log secrets in code
- **Do not implement any alternative authentication methods**
- Do not expose `CLERK_SECRET_KEY` in client-side code

## Environment Variables
- Use `.env.local` with placeholders only
- Required keys:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY=YOUR_SECRET_KEY`
- These must be configured before the app can run

## References
- [Clerk Next.js Documentation](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk App Router Guide](https://clerk.com/docs/references/nextjs/overview)
