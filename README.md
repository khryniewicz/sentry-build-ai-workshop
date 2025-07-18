# Sentry Academy Workshop Application

A full-stack web application built for hands-on debugging workshops that demonstrate realistic SSO authentication and search functionality failures using Sentry monitoring and distributed tracing.

## 📚 Application Overview

The Sentry Academy Application is an educational platform that simulates a course management system with user authentication, course browsing, and search functionality. It's specifically designed to showcase common real-world debugging scenarios where frontend and backend teams have miscommunications about API contracts.

### Key Features

- **SSO Authentication** - Google, Microsoft, and Okta login integration
- **Course Management** - Browse courses with categories, levels, and detailed content
- **Search Functionality** - Search courses with filtering capabilities
- **User Profiles** - Student, instructor, and admin role management
- **Progress Tracking** - Lesson completion and enrollment tracking
- **Monitoring & Observability** - Comprehensive Sentry integration for error tracking

### Workshop Scenarios

1. **JWT Authentication Debugging** - SSO login failures due to missing login signatures
2. **Search Functionality Debugging** - API parameter mismatches with distributed tracing

## 🏗️ Architecture

This is a **pnpm monorepo** with two main applications:

```
├── apps/
│   ├── frontend/          # React + Vite frontend application
│   └── server/            # Node.js + Express backend server
├── scripts/               # Shared utility scripts
├── workshop.md            # Detailed workshop instructions
├── pnpm-workspace.yaml    # pnpm workspace configuration
└── package.json           # Root workspace package.json
```

### Frontend Application (`apps/frontend/`)
- **Framework:** React 19.1.0 with TypeScript and Vite
- **Styling:** Tailwind CSS 4.1.8
- **Routing:** React Router DOM 7.6.2  
- **State Management:** React contexts (AuthContext, UserStateContext)
- **Monitoring:** Sentry React SDK for error tracking and performance
- **Key Features:**
  - Modern React with hooks and contexts
  - Responsive design with Tailwind CSS
  - SSO authentication flows
  - Course browsing and search interface
  - User profile and progress tracking

### Backend Application (`apps/server/`)
- **Framework:** Express 5.1.0 with TypeScript
- **Database:** PostgreSQL with Drizzle ORM 0.44.2
- **Build:** esbuild for production builds
- **Development:** tsx for hot reload
- **Monitoring:** Sentry Node SDK with profiling and distributed tracing
- **Key Features:**
  - RESTful API with modular route structure
  - JWT-based authentication with SSO providers
  - Course and user management
  - Search functionality with filtering
  - Comprehensive error handling and monitoring

### Database Schema
- **users** - User accounts with roles (student, instructor, admin)
- **courses** - Course catalog with categories, levels, and metadata
- **lessons** - Individual lessons within courses (video, text, quiz, assignment)
- **enrollments** - User-course relationships with progress tracking
- **lessonProgress** - Detailed progress tracking per lesson
- **reviews** - Course reviews and ratings
- **categories** - Course categorization
- **certificates** - Course completion certificates

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **pnpm** (v9 or higher)
- **OpenAI API Key** (for AI-powered features)

### Quick Setup (Workshop)

For workshop participants, follow these steps:

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd sentry-academy-workshop
   pnpm install
   ```

2. **Database setup with Neon:**
   ```bash
   cd apps/server
   npx neondb -y  # Creates a PostgreSQL database (Neon is awesome!)
   npx drizzle-kit push  # Push schema to database
   pnpm db:seed  # Seed with course data
   ```

3. **Environment configuration:**
   
   **Server (`apps/server/.env`):**
   ```env
   PORT=3001
   DATABASE_URL=<from-neon-setup>
   OPENAI_API_KEY=your-openai-api-key
   SENTRY_DSN=your-sentry-dsn
   ```
   
   **Frontend (`apps/frontend/.env`):**
   ```env
   VITE_API_URL=http://localhost:3001
   VITE_SENTRY_DSN=your-sentry-dsn
   ```

4. **Update Sentry configuration:**
   - Update Sentry initialization in both apps with your project details
   - See `apps/frontend/src/main.tsx` and `apps/server/src/index.ts`

5. **Start the application:**
   ```bash
   cd ../..  # Back to root directory
   pnpm dev
   ```

### Manual Database Setup (Alternative)

If you prefer to set up PostgreSQL manually:

1. **Install and configure PostgreSQL**
2. **Create database:**
   ```sql
   CREATE DATABASE sentry_academy;
   ```
3. **Run migrations:**
   ```bash
   cd apps/server
   pnpm db:generate
   pnpm db:migrate
   pnpm db:seed
   ```

### Accessing the Application

Once everything is running:

- **Frontend:** `http://localhost:5173` - React application with course browsing and authentication
- **Backend:** `http://localhost:3001` - Express API server
- **Database Studio:** `pnpm db:studio` - Drizzle Studio for database management

You'll see the Sentry Academy homepage with:
- Course catalog browsing
- Search functionality 
- SSO login options (Google, Microsoft, Okta)
- User profile and progress tracking

## 🛠️ Available Scripts

### Root Level Scripts
- `pnpm dev` - Start both frontend and server in development mode
- `pnpm dev:frontend` - Start only the frontend application
- `pnpm dev:server` - Start only the server application
- `pnpm build` - Build both applications for production
- `pnpm build:frontend` - Build only the frontend
- `pnpm build:server` - Build only the server
- `pnpm lint` - Run linting on all packages

### Frontend Scripts (`apps/frontend`)
- `pnpm dev` - Start Vite development server
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint
- `pnpm preview` - Preview production build

### Server Scripts (`apps/server`)
- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production using esbuild
- `pnpm start` - Start production server
- `pnpm db:generate` - Generate database migrations
- `pnpm db:migrate` - Run database migrations
- `pnpm db:push` - Push schema changes to database
- `pnpm db:studio` - Open Drizzle Studio for database management
- `pnpm db:seed` - Seed database with initial data
- `pnpm db:create-readonly-user` - Create read-only database user

## 🐛 Workshop Modules

### Module 1: JWT Authentication Debugging

**Scenario:** Frontend generates JWT tokens from SSO providers but doesn't always send them to the backend, causing authentication failures.

**Key Learning Points:**
- API contract mismatches between teams
- JWT token flow and validation
- Unhandled error debugging
- Sentry error capture and analysis

**Steps:**
1. Try SSO login (Google, Microsoft, Okta)
2. Observe backend crashes from `JSON.parse(atob(undefined))`
3. Debug using API testing
4. Fix missing login signature issues

### Module 2: Search Functionality with Distributed Tracing

**Scenario:** Frontend and backend teams have different assumptions about search API parameters, leading to "no results found" errors.

**Key Learning Points:**
- Search API integration patterns
- Parameter name mismatches (`query` vs `q`)
- Distributed tracing implementation
- Performance monitoring with spans

**Steps:**
1. Experience search failures
2. Implement custom tracing spans
3. Analyze trace data to identify root cause
4. Fix parameter mismatches

## 🔍 Key API Endpoints

The server provides several REST API endpoints:

- `GET /api/courses` - List all courses with pagination
- `GET /api/search/courses?q=term` - Search courses (note: uses `q` parameter)
- `POST /api/auth/sso/:provider` - SSO authentication (Google, Microsoft, Okta)
- `GET /api/lessons` - List lessons with course relationships
- `GET /api/users` - List users with role information
- `GET /api/enrollments` - List user course enrollments with progress

## 📊 Monitoring & Observability

Both applications are pre-configured with **Sentry** for:

### Frontend Monitoring
- React error boundaries
- Performance monitoring
- User session tracking
- Custom event tracking

### Backend Monitoring  
- Express.js error handling
- Database query performance
- API endpoint monitoring
- Profiling and performance metrics

### Distributed Tracing
- Custom spans for API calls
- Database operation tracing
- Search functionality tracing
- Authentication flow tracking

## 🗄️ Database Management

The application uses **PostgreSQL** with **Drizzle ORM** for type-safe database operations.

### Available Database Commands
- `pnpm db:generate` - Generate database migrations
- `pnpm db:migrate` - Run database migrations  
- `pnpm db:seed` - Seed database with sample data
- `pnpm db:studio` - Open Drizzle Studio for database management
- `pnpm db:export` - Export database data to JSON files
- `pnpm db:import` - Import database data from JSON files

### Main Entities
- **users** - User accounts with roles (student, instructor, admin)
- **courses** - Course catalog with categories and metadata
- **lessons** - Individual lessons within courses
- **enrollments** - User-course relationships with progress tracking

## 🧪 Testing the Workshop

1. **Authentication Errors:**
   ```bash
   curl -X POST http://localhost:3001/api/auth/sso/google \
     -H "Content-Type: application/json" \
     -d '{"userData": {"email": "test@example.com", "name": "Test User"}}'
   ```

2. **Search API Testing:**
   ```bash
   # This will fail (missing query parameter)
   curl -X GET "http://localhost:3001/api/search/courses"
   
   # This will succeed
   curl -X GET "http://localhost:3001/api/search/courses?q=javascript"
   ```

## 🎓 Learning Outcomes

After completing this workshop, you'll understand:

- ✅ Real-world API contract debugging
- ✅ JWT authentication flows and common pitfalls
- ✅ Search API implementation patterns
- ✅ Error monitoring with Sentry
- ✅ Distributed tracing for microservices
- ✅ Frontend/backend communication debugging
- ✅ Production debugging workflows

## 📚 Additional Resources

- **Workshop Guide:** See `workshop.md` for detailed step-by-step instructions
- **Sentry Documentation:** [docs.sentry.io](https://docs.sentry.io)
- **Drizzle ORM:** [orm.drizzle.team](https://orm.drizzle.team)
- **React 19 Features:** [react.dev](https://react.dev)

## 🤝 Contributing

This is a workshop project designed for learning. Feel free to experiment with:
- Adding new authentication providers
- Implementing additional search filters
- Creating custom Sentry integrations
- Extending the tracing implementation

---

**Happy Debugging! 🐛🔍** 