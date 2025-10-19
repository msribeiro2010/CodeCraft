# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FinControl - Personal finance management application with transactions, invoices, and payment reminders. Full-stack React + Express application with PostgreSQL database and dual deployment support (local + Vercel).

## Development Commands

### Setup & Installation
```bash
npm install                    # Install dependencies
cp .env.example .env          # Create environment file (edit with your credentials)
npm run db:push               # Apply database schema to PostgreSQL
```

### Running the Application
```bash
npm run dev                   # Start development server (http://localhost:5000)
npm run build                 # Full production build (frontend + backend)
npm run start                 # Run production build locally
npm run check                 # TypeScript type checking
```

### Database Operations
```bash
npm run db:push               # Push schema changes to database
node seed.cjs                 # Seed database with default categories
```

## Code Architecture

### Directory Structure
```
client/              # React frontend (Vite)
  src/
    components/      # UI components organized by feature
      auth/          # Authentication components
      dashboard/     # Dashboard widgets
      transactions/  # Transaction management
      invoices/      # Invoice processing
      reminders/     # Payment reminders
      ui/           # Reusable UI components (shadcn/ui)
    pages/          # Page-level components
    hooks/          # Custom React hooks
    lib/            # Utilities and helpers

server/             # Express backend
  index.ts          # Production server entry
  dev.ts           # Development server with HMR
  routes.ts        # API routes and authentication
  storage.ts       # Database operations layer
  db.ts            # PostgreSQL connection (Drizzle)
  db-sqlite.ts     # SQLite alternative (local dev)
  vite.ts          # Vite middleware for development

shared/             # Shared TypeScript code
  schema.ts         # PostgreSQL schema + Zod validation
  schema-sqlite.ts  # SQLite schema variant

api/                # Vercel serverless functions
  index.ts          # Serverless wrapper for production
```

### Key Architectural Patterns

**Database Layer:** Drizzle ORM with repository pattern (`storage.ts`). All database operations go through `DatabaseStorage` class which implements `IStorage` interface. This abstraction allows easy swapping between PostgreSQL and SQLite.

**Authentication:** Passport.js with local strategy. Sessions stored in MemoryStore (development) or connect-pg-simple (production with PostgreSQL). User password hashing via bcrypt.

**File Uploads:** Multer middleware handles invoice uploads (images/PDFs, 5MB limit). Files stored as base64 in database. OCR processing via Tesseract.js for text extraction.

**State Management:** TanStack Query (React Query) for server state. Local state with React hooks. No global state management library.

**Type Safety:** Shared schema between frontend/backend using Drizzle-Zod. Forms validated with react-hook-form + Zod resolvers.

**Dual Schema System:**
- `shared/schema.ts` - PostgreSQL (production/Vercel)
- `shared/schema-sqlite.ts` - SQLite (local development fallback)
Routes import from `@shared/schema-sqlite` by default. Swap imports when changing database.

## Technology Stack

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Radix UI, shadcn/ui components, Wouter (routing), TanStack Query

**Backend:** Node.js 20+, Express, TypeScript, Passport.js (auth), Multer (uploads), Tesseract.js (OCR)

**Database:** PostgreSQL (production), Drizzle ORM, better-sqlite3 (alternative)

**Deployment:** Vercel serverless functions, static frontend hosting

## Environment Variables

Required in `.env`:
```bash
DATABASE_URL=postgresql://user:pass@host:5432/db  # PostgreSQL connection
NODE_ENV=development|production
SESSION_SECRET=random-secret-string
```

Optional (Firebase auth):
```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
```

## Database Schema

**Core entities:** users, categories, transactions, invoices, reminders

**Transaction workflow:** User creates transaction → optionally links invoice → creates reminder → transaction processed

**Status flow:** Transaction status: A_VENCER (upcoming) → PAGAR (due) → PAGO (paid)

**Balance calculation:** User has `initialBalance` + `overdraftLimit`. Real-time balance computed from initial balance ± transactions.

## Path Aliases

TypeScript path aliases configured in `tsconfig.json`:
- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`

Use these imports consistently throughout the codebase.

## Development Workflow

1. Changes to schema: Edit `shared/schema.ts` → run `npm run db:push`
2. New API route: Add to `server/routes.ts` → frontend calls via fetch/TanStack Query
3. New component: Add to `client/src/components/[feature]/` → import in pages
4. UI components: Use shadcn/ui from `client/src/components/ui/`

## Deployment Notes

**Vercel:** Uses `vercel.json` config. Frontend built with `npm run vercel-build`. API routes through `api/index.ts` serverless function. Static files served from `dist/`.

**Database:** Must use PostgreSQL in production (Neon, Supabase, or Vercel Postgres). SQLite only for local development.

**Sessions:** Production requires persistent session store (connect-pg-simple with PostgreSQL). MemoryStore used in development only.
