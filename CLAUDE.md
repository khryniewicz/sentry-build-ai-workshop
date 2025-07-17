# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

This is a **pnpm monorepo** with two main applications. All commands should be run from the root directory:

### Development
- `pnpm dev` - Start both frontend and backend in development mode
- `pnpm dev:frontend` - Start only the React frontend (http://localhost:5173)
- `pnpm dev:server` - Start only the Express backend (http://localhost:3001)

### Building
- `pnpm build` - Build both applications for production
- `pnpm build:frontend` - Build only the frontend
- `pnpm build:server` - Build only the backend

### Linting
- `pnpm lint` - Run ESLint on all packages

### Database Operations (run from root)
- `pnpm --filter @sentry-academy/server db:generate` - Generate database migrations
- `pnpm --filter @sentry-academy/server db:migrate` - Run database migrations  
- `pnpm --filter @sentry-academy/server db:seed` - Seed database with sample data
- `pnpm --filter @sentry-academy/server db:studio` - Open Drizzle Studio for database management
- `pnpm db:export` - Export database data to JSON files
- `pnpm db:import` - Import database data from JSON files

## Architecture Overview

### Frontend Application (`apps/frontend/`)
- **Framework**: React 19.1.0 with TypeScript and Vite
- **Styling**: Tailwind CSS 4.1.8
- **Routing**: React Router DOM 7.6.2
- **State Management**: React contexts (`AuthContext`, `UserStateContext`)
- **Key Components**:
  - `pages/` - Route components (HomePage, CoursesPage, etc.)
  - `components/` - Reusable UI components organized by feature
  - `services/` - API clients and authentication service
  - `hooks/` - Custom React hooks (useAuth, useApi, etc.)
  - `types/` - TypeScript interfaces

### Backend Application (`apps/server/`)
- **Framework**: Express 5.1.0 with TypeScript
- **Database**: PostgreSQL with Drizzle ORM 0.44.2
- **Build**: esbuild for production builds
- **Development**: tsx for hot reload
- **API Structure**: Modular routes in `src/modules/`
  - `auth/` - SSO authentication endpoints
  - `courses/` - Course management
  - `search/` - Search functionality
  - `users/`, `lessons/`, `enrollments/` - Core entities

### Database Schema
The application uses PostgreSQL with these main entities:
- **users** - User accounts with roles (student, instructor, admin)
- **courses** - Course catalog with categories, levels, and metadata
- **lessons** - Individual lessons within courses (video, text, quiz, assignment)
- **enrollments** - User-course relationships with progress tracking
- **lessonProgress** - Detailed progress tracking per lesson
- **reviews** - Course reviews and ratings
- **categories** - Course categorization
- **certificates** - Course completion certificates

### Key API Endpoints
- `GET /api/courses` - List all courses
- `GET /api/search/courses?q=term` - Search courses (note: uses `q` parameter)
- `POST /api/auth/sso/:provider` - SSO authentication
- `GET /api/lessons` - List lessons
- `GET /api/users` - List users
- `GET /api/enrollments` - List enrollments

## Workshop Context

This is a Sentry Academy debugging workshop designed to simulate real-world SSO authentication and search functionality failures. The codebase intentionally contains bugs for educational purposes:

1. **JWT Authentication Issues** - Missing login signatures causing backend crashes
2. **Search API Mismatches** - Parameter name conflicts between frontend and backend

When working on this codebase, be aware that some errors may be intentional for workshop demonstration purposes.

## Environment Setup

Both applications require `.env` files:

**Frontend** (`apps/frontend/.env`):
```env
VITE_API_URL=http://localhost:3001
VITE_SENTRY_DSN=your-sentry-dsn
```

**Server** (`apps/server/.env`):
```env
PORT=3001
DATABASE_URL=postgresql://username:password@localhost:5432/sentry_academy
SENTRY_DSN=your-sentry-dsn
```

## Testing

No specific test framework is configured. Use manual testing and API testing tools like curl for debugging scenarios.