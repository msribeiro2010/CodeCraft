# FinControl - Personal Finance Management System

## Overview

FinControl is a comprehensive personal finance management application built with a modern full-stack architecture. The system enables users to track income and expenses, manage invoices through OCR processing, set payment reminders, and gain insights through financial dashboards. The application uses a monorepo structure with shared code between client and server, emphasizing type safety and modern development practices.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Build Tool**: Vite for fast development and optimized production builds
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for RESTful API
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with local strategy and bcrypt for password hashing
- **Session Management**: Express session with PostgreSQL store
- **File Processing**: Tesseract.js for OCR processing of invoices
- **File Upload**: Multer for handling multipart form data

### Database Architecture
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Type-safe database schema with Zod validation
- **Connection**: Neon serverless PostgreSQL with connection pooling
- **Migrations**: Drizzle Kit for schema migrations

## Key Components

### Data Models
- **Users**: Core user entity with balance tracking and notification preferences
- **Categories**: User-defined transaction categories
- **Transactions**: Income and expense records with status tracking
- **Invoices**: File storage with OCR-processed content
- **Reminders**: Payment reminder system

### Authentication System
- Local authentication with email/password
- Session-based authentication with secure cookies
- Password hashing using bcrypt
- Protected routes with authentication middleware

### Financial Management
- Real-time balance calculation with overdraft limits
- Transaction categorization and filtering
- Monthly financial summaries
- Status-based transaction workflow (A_VENCER, PAGAR, PAGO)

### Invoice Processing
- File upload supporting images and PDFs (up to 5MB)
- OCR text extraction using Tesseract.js
- Base64 file content storage
- Invoice-to-transaction linking

### User Interface
- Responsive design with mobile-first approach
- Dark/light theme support
- Modern card-based layouts
- Interactive charts and data visualizations
- Toast notifications for user feedback

## Data Flow

### Transaction Management Flow
1. User creates transaction through form
2. Data validation using Zod schemas
3. Database insertion via Drizzle ORM
4. Real-time UI updates through React Query
5. Balance recalculation and dashboard refresh

### Invoice Processing Flow
1. User uploads invoice file
2. File validation and size checking
3. OCR processing with Tesseract.js
4. Text extraction and database storage
5. Optional transaction creation from invoice data

### Authentication Flow
1. User credentials validated against database
2. Password verification using bcrypt
3. Session creation with secure cookie
4. Protected route access control
5. Automatic session refresh on activity

## External Dependencies

### Core Libraries
- React ecosystem (React, React DOM, React Hook Form)
- TanStack Query for server state management
- Radix UI for accessible component primitives
- Tailwind CSS for utility-first styling
- Zod for runtime type validation

### Backend Dependencies
- Express.js with middleware (session, multer, passport)
- Drizzle ORM with PostgreSQL adapter
- Neon serverless PostgreSQL client
- Tesseract.js for OCR processing
- bcrypt for password security

### Development Tools
- Vite for build tooling and development server
- TypeScript for type safety
- ESBuild for production bundling
- Drizzle Kit for database operations

## Deployment Strategy

### Development Environment
- Hot module replacement via Vite
- Automatic TypeScript compilation
- Database connection via environment variables
- Session storage in memory for development

### Production Build
- Static asset optimization through Vite
- Server bundling with ESBuild
- PostgreSQL session persistence
- Environment-based configuration

### Hosting Configuration
- Replit deployment with autoscale target
- PostgreSQL module for database provisioning
- Port 5000 internal, port 80 external mapping
- Parallel workflow execution for development

## Changelog
- June 23, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.