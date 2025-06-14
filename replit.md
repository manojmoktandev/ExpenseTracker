# ExpenseTracker Application

## Overview

ExpenseTracker is a full-stack expense management application built with React, Express.js, and Drizzle ORM. The application provides a clean interface for users to track their expenses across different categories, view spending analytics, and manage their financial data effectively.

## System Architecture

The application follows a modern full-stack architecture with clear separation between client and server components:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Components**: Radix UI primitives with custom shadcn/ui components
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom configuration

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Schema**: Shared TypeScript schemas between client and server
- **API**: RESTful API with JSON responses
- **Development**: Hot reload with Vite integration

## Key Components

### Database Schema
The application uses two main entities:
- **Categories**: Predefined spending categories with icons and colors
- **Expenses**: Individual expense records linked to categories

The database includes foreign key relationships and proper data validation through Drizzle schema definitions.

### API Structure
RESTful endpoints following standard conventions:
- `GET/POST /api/categories` - Category management
- `GET/POST/PUT/DELETE /api/expenses` - Expense CRUD operations
- `GET /api/analytics/*` - Analytics and reporting endpoints

### UI Components
- **Layout Components**: Responsive sidebar navigation and header
- **Dashboard**: Summary cards, recent expenses, and category breakdowns
- **Data Tables**: Sortable and filterable expense listings
- **Forms**: Modal-based expense creation with validation
- **Analytics**: Progress bars and statistical visualizations

## Data Flow

1. **Client Requests**: React components use TanStack Query for API calls
2. **API Processing**: Express routes handle requests and validate data
3. **Database Operations**: Drizzle ORM manages PostgreSQL interactions
4. **Response Handling**: JSON responses update client state automatically
5. **UI Updates**: React Query cache invalidation triggers re-renders

The application uses optimistic updates and proper error handling throughout the data flow.

## External Dependencies

### Frontend Dependencies
- **UI Framework**: Radix UI primitives for accessible components
- **Icons**: Lucide React for consistent iconography
- **Validation**: Zod for runtime type checking
- **Date Handling**: date-fns for date manipulation
- **Carousel**: Embla Carousel for image/content carousels

### Backend Dependencies
- **Database**: Neon PostgreSQL serverless database
- **ORM**: Drizzle with PostgreSQL dialect
- **Session**: connect-pg-simple for PostgreSQL session storage
- **Build**: esbuild for production bundling

### Development Tools
- **Type Checking**: TypeScript with strict configuration
- **Code Quality**: ESLint integration
- **Development**: tsx for TypeScript execution
- **Deployment**: Replit-specific plugins and configuration

## Deployment Strategy

The application is configured for deployment on Replit with the following setup:

### Build Process
- **Development**: `npm run dev` - Runs server with Vite integration
- **Production Build**: `npm run build` - Builds client and server bundles
- **Production Start**: `npm run start` - Serves production bundles

### Configuration
- **Database**: Uses DATABASE_URL environment variable for connection
- **Ports**: Server runs on port 5000 with external port 80
- **Static Files**: Client build served from dist/public directory
- **Environment**: Automatic detection between development and production

### Database Migrations
- **Schema Management**: Drizzle Kit for migration generation
- **Push Command**: `npm run db:push` for schema synchronization
- **Connection**: Neon serverless PostgreSQL with connection pooling

The deployment strategy prioritizes simplicity while maintaining production readiness with proper error handling and logging.

## Changelog

```
Changelog:
- June 14, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```