# Agent Instructions

## ⚠️ CRITICAL: READ DOCUMENTATION FIRST

**BEFORE MAKING ANY CHANGES TO THIS PROJECT, YOU MUST:**

1. **Read ALL files in the `/docs` directory** - These contain essential guidelines, conventions, and patterns that must be followed.
2. **Understand the project architecture** - Review `agent-architecture.md` to understand the project structure.
3. **Follow established patterns** - Review `agent-workflow.md` and `agent-coding-standards.md` for required practices.

**Failure to read and follow the documentation in `/docs` may result in:**
- Breaking existing functionality
- Introducing security vulnerabilities
- Violating project conventions
- Creating technical debt
- Requiring rework and additional code reviews

## Documentation Structure

This repository uses modular agent guidance. **ALL** documents below must be reviewed before making changes:

### Essential Reading (Review First)
- **Overview**: Agent scope and goals → `./agent-overview.md`
- **Workflow**: How to plan and apply changes → `./agent-workflow.md`
- **Architecture**: Project structure and routing rules → `./agent-architecture.md`
- **Coding Standards**: Index of all coding guidelines → `./agent-coding-standards.md`

### Detailed Guidelines
- **Code Style**: TypeScript and React conventions → `./agent-code-style.md`
- **UI & Accessibility**: UX and a11y expectations → `./agent-ui-accessibility.md`
- **Authentication (Clerk)**: Current App Router integration → `./agent-clerk.md`
- **Database (Drizzle)**: Schema, migrations, and db access → `./agent-database.md`
- **Security & Secrets**: Environment variables and sensitive data → `./agent-security.md`
- **Testing & Linting**: Quality gates → `./agent-testing-linting.md`
- **Shadcn/UI**: Component library guidelines → `./agent-shadcn.md`

## Quick Reference

### Technology Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Auth**: Clerk
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **UI Components**: Shadcn/ui

### Key Rules
1. ✅ Always use App Router (not Pages Router)
2. ✅ Keep server-only logic separate from client components
3. ✅ Follow existing file structure and naming conventions
4. ✅ Use TypeScript strictly - no `any` types
5. ✅ Keep changes minimal and focused
6. ❌ Do not add new dependencies without clear justification
7. ❌ Do not introduce security vulnerabilities
8. ❌ Do not bypass authentication or authorization checks

## Getting Started

1. Read this document completely
2. Review all files in `/docs` directory
3. Understand the existing codebase structure
4. Plan your changes according to `agent-workflow.md`
5. Implement following all established conventions
6. Test thoroughly before committing

**Remember: The documentation in `/docs` is your source of truth. When in doubt, refer back to these files.**
