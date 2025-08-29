# Contributing to Altitude

Thank you for your interest in contributing to Altitude — a next-generation crew center platform for virtual airlines.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Database Management](#database-management)
- [Coding Guidelines](#coding-guidelines)
  - [General Principles](#general-principles)
  - [TypeScript](#typescript)
  - [React/Next](#reactnext)
  - [Styling](#styling)
- [Commit, Branch, and PR](#commit-branch-and-pr)
- [Areas of Contribution](#areas-of-contribution)
- [Community and Support](#community-and-support)

## Getting Started

1. First, fork the repository on GitHub using the "Fork" button. This creates your own copy of the project under your account.

   Next, clone your fork locally:

   ```bash
   git clone https://github.com/<your-username>/altitude.git
   cd altitude
   ```

   Then, add the original repository as an upstream remote so you can keep your fork in sync with future changes:

   ```bash
   git remote add upstream https://github.com/flyaltitudeapp/altitude.git
   ```

2. Install prerequisites.
   - Install Bun: https://bun.sh
   - Copy environment file and fill in required values:

     ```bash
     cp .env.example .env
     ```

3. Install dependencies using Bun.

   ```bash
   bun install
   ```

4. Create/migrate the databse.

   ```bash
   bun db:migrate
   ```

5. Run dev server.

   ```bash
   bun dev
   ```

## Development Workflow

1. Create a focused branch for your work.

   ```bash
   git checkout -b feat/short-description
   # or
   git checkout -b fix/issue-key
   ```

2. Make changes aligned with this guide and the project structure:
   - `app/` for App Router pages/layouts/components
   - `components/` for shared client components
   - `actions/` for Server Actions
   - `domains/` for business logic modules
   - `lib/` for framework-agnostic helpers
   - `db/` for Drizzle schema and queries
   - `bot/` for the Discord bot

3. Keep your branch up to date.

   ```bash
   git fetch upstream
   git merge upstream/main
   ```

4. Format and lint before pushing.

   ```bash
   bun run lint:fix
   bun run format
   bun run check:types
   ```

5. Push your branch and open a Pull Request.
   - Keep PRs small and focused
   - Describe the change, rationale, and impact
   - Include screenshots/videos for UI changes where helpful
   - Link related issues

## Database Management

Altitude uses Drizzle ORM (SQLite/libSQL).

- If you need sample data locally, use the provided seed script:

  ```bash
  bun run db:seed
  ```

- Propose any schema changes via an issue or draft PR first for discussion.
- Keep queries and schema definitions in `db/` clear, typed, and minimal.

## Coding Guidelines

### General Principles

- Write clean, readable, maintainable code; prefer composition over deep inheritance.
- Follow existing patterns and directory conventions; avoid gratuitous abstractions.
- Keep modules small and cohesive; favor pure functions and clear interfaces.
- Validate all external inputs with Zod schemas.

### TypeScript

- TypeScript 5.8 with `strict` enabled; no implicit anys.
- Never use `any`. Prefer `unknown` with proper narrowing.
- Use `import type` for type-only imports (enforced by ESLint).
- Respect `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, and related strictness.
- Keep public function signatures stable and explicit; avoid broad generics unless necessary.

### React/Next

- App Router (Next.js 15) with React 19.
- Co-locate server actions under `actions/` and business logic under `domains/`.
- Use the pre-configured safe action client

- Use Zod for all input validation at boundaries (APIs, actions, user input).
- Prefer server components by default; use client components only when needed.

### Styling

- Tailwind CSS 4.
- Use CSS variables from `:root` in `app/globals.css` — the authoritative color source.
  - Example class usage: `className="text-foreground"`
- No inline colors beyond CSS variable references.
- Optional alternate themes live under `public/styles/` — do not redefine colors elsewhere.

## Commit, Branch, and PR

- Branching is trunk-based; keep feature branches short-lived.
- Write clear, descriptive commit messages.
- Ensure local commits pass:

  ```bash
  bun run check:types
  ```

- Do not force-push to `main`. If a rebase is necessary for a PR, use `--force-with-lease`.
- PRs should explain the problem, the approach, and any trade-offs.

## Areas of Contribution

- UI/UX improvements in `app/` and `components/`
- Server Actions in `actions/`
- Business logic in `domains/`
- Database schema and query refinements in `db/` (discuss first)
- Discord bot features and stability in `bot/`
- Documentation, DX tooling, and developer experience
- Tests

## Community and Support

- Open an issue for discussion before large or structural changes.
- Be respectful and inclusive; assume good intent and provide constructive feedback.
- If you have questions or need help:
  1. Check existing issues and documentation
  2. Open a GitHub issue with context and repro details
  3. Propose a draft PR to discuss implementation direction

---

Thank you for contributing to Altitude! Your work helps virtual airlines run smoother. ✈️
