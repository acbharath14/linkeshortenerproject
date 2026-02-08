# Link Shortener

A full-stack link shortener built with Next.js App Router, Clerk authentication, and Drizzle ORM. It provides a protected dashboard to create, manage, and track short links with click analytics.

## Features

- **Authenticated dashboard** with Clerk (protected `/dashboard` route).
- **Create short links** with random short codes or custom aliases.
- **Click tracking** with automatic dashboard refresh every 5 seconds.
- **Soft delete** links (inactive links return 410).
- **Link expiration** support (expired links return 410).
- **Rate limiting** on link creation (simple in-memory limiter for development).
- **API-first design** with Next.js route handlers.
- **PostgreSQL + Drizzle ORM** schema and migrations.

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Clerk authentication
- Drizzle ORM + PostgreSQL (Neon compatible)
- React Query for client-side caching
- Tailwind CSS + shadcn/ui components

## Project Structure

- `app/` — Next.js routes and pages
- `app/dashboard/` — protected dashboard UI
- `app/l/[shortcode]/` — redirect handler
- `app/api/shorten/` — API routes for link management
- `data/` — API helpers and database access wrappers
- `db/` — Drizzle schema
- `drizzle/` — migration output
- `scripts/` — optional seed data scripts

## Routes & API

### App Routes

- `/` — marketing homepage
- `/dashboard` — authenticated dashboard
- `/l/[shortcode]` — redirect endpoint (increments clicks)

### API Routes

- `GET /api/shorten` — list current user links
- `POST /api/shorten` — create a short link
- `GET /api/shorten/[shortCode]` — fetch link + increment clicks
- `GET /api/shorten/manage/[id]` — fetch a specific link (ownership required)
- `DELETE /api/shorten/manage/[id]` — soft delete a link (ownership required)

## Data Model (Shortened URLs)

Stored in PostgreSQL via Drizzle schema in `db/schema.ts`:

- `short_code` (unique)
- `original_url`
- `custom_alias` (optional)
- `description` (optional)
- `clicks`
- `is_active`
- `expires_at`
- `created_at`, `updated_at`

## Local Setup

### 1) Fork or Clone

```bash
# Fork on GitHub, then clone your fork
git clone https://github.com/<your-username>/linkeshortenerproject.git
cd linkeshortenerproject
```

### 2) Install Dependencies

```bash
pnpm install
```

### 3) Configure Environment Variables

Create a `.env.local` file at the project root:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Notes**
- Clerk is required for auth. Create a Clerk app and add your keys.
- `DATABASE_URL` must point to a PostgreSQL database.

### Security and Secrets

- **Never commit secrets**. `.env*` files are gitignored (except `.env.example`).
- A pre-commit hook is included to block common key files and secret patterns.

Enable the hook locally:

```bash
git config core.hooksPath .githooks
chmod +x .githooks/pre-commit
```

If secrets were already committed, remove them from git history and rotate the keys:

```bash
git rm --cached .env .env.local
```

### 4) Apply Database Schema

This project uses Drizzle ORM. The schema is defined in `db/schema.ts`, and migrations are stored in `drizzle/`.

Use Drizzle Kit (see `drizzle.config.ts`) or your preferred migration workflow to apply the schema before running the app.

### 5) Start the Dev Server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000).

## Optional: Seed Example Links

There is a seed script at `scripts/seed-example-links.ts` which inserts sample data. Update the `userId` in that script to match a real Clerk user ID before running.

```bash
pnpm tsx scripts/seed-example-links.ts
```

## Scripts

- `pnpm dev` — start dev server
- `pnpm build` — production build
- `pnpm start` — start production server
- `pnpm lint` — lint

## Development Notes

- Short codes are normalized to lowercase for consistency.
- Redirects use **307** to avoid browser caching and ensure each click is counted.
- `/dashboard` is protected via Clerk and requires authentication.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request

