---
description: This file describes the data fetching strategy for the project. It outlines how data is retrieved, stored, and managed within the application.
applyTo: **/*.ts, **/*.tsx
---
## Data Fetching Strategy
- Use **React Query** for client-side data fetching and caching.
- Use **Next.js API Routes** for server-side data fetching. 
- Prefer **Server Components** for data that does not require frequent updates or user interaction.
- ALWAYS use the helper functions in /data directory for API interactions.
- ALL helper funcitons in the /data should use Drizzle ORM for database operations.
## Implementation Guidelines
- Always define a clear data schema for API responses.
- Handle loading and error states gracefully in the UI.
- Use pagination or infinite scrolling for large datasets to improve performance.
- Cache data effectively to minimize redundant network requests.
- Use optimistic updates for a better user experience during mutations.
## Security Considerations  
- Sanitize and validate all incoming data from external sources.
- Implement proper authentication and authorization checks in API routes.
- Avoid exposing sensitive data in client-side code.
## References
- [React Query Documentation](https://react-query.tanstack.com/)  
- [Next.js Data Fetching](https://nextjs.org/docs/basic-features/data-fetching) 
