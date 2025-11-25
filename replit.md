# LangCoachAI - Language Evaluation Platform

## Overview

LangCoachAI is an AI-powered language evaluation platform designed for assessing speaking proficiency in OET (Occupational English Test), IELTS, and Business English. The platform serves three user roles: students who take speaking tests, teachers who create assignments and provide feedback, and administrators who monitor overall system performance.

The application uses AI-powered speech transcription and evaluation to provide detailed feedback on pronunciation, fluency, vocabulary, and grammar. Students can practice with voice exercises, complete assigned tests, and track their progress through gamified elements including XP, levels, and achievements. Teachers can create assignments, review student submissions, and provide personalized feedback.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**UI Component System**: The application uses shadcn/ui components built on Radix UI primitives, following Material Design 3 principles adapted for educational platforms. The design emphasizes clarity, consistent information hierarchy across user roles, and strong visual focus for test-taking interfaces.

**Styling Approach**: Tailwind CSS with a custom design system defined in CSS variables. The theme supports both light and dark modes with carefully crafted color tokens for semantic UI elements (primary, secondary, destructive, muted, accent). Typography uses Inter for UI text and JetBrains Mono for scores/code display.

**State Management**: TanStack Query (React Query) handles server state management, caching, and synchronization. Local component state uses React hooks (useState, useEffect).

**Routing**: Wouter provides lightweight client-side routing with role-based route protection. Routes are segregated by user role (/teacher/*, /student/*, /admin/*).

**Authentication Context**: A custom AuthProvider manages user authentication state globally, providing login, register, and logout methods to the component tree.

### Backend Architecture

**Runtime**: Node.js with Express.js framework

**API Design**: RESTful API with route handlers organized in a single routes file. Endpoints are prefixed with /api and organized by resource (assignments, submissions, users, etc.).

**Session Management**: Express-session middleware with configurable session storage (supports PostgreSQL via connect-pg-simple). Sessions use HTTP-only cookies for security.

**File Upload Handling**: Multer middleware processes audio file uploads with configurable size limits (50MB) and stores files in an uploads directory.

**Development vs Production**: Separate entry points (index-dev.ts, index-prod.ts) handle development with Vite middleware and production with static file serving.

### Data Storage

**Database**: PostgreSQL accessed via Neon serverless driver with WebSocket support

**ORM**: Drizzle ORM provides type-safe database access with schema-first design

**Schema Design**:
- `users` table stores user credentials and role information (teacher/student/admin)
- `assignments` table links teachers to test assignments with metadata
- `testPrompts` table contains reusable test templates by type and difficulty
- `submissions` table tracks student test submissions with audio file paths and status
- `evaluations` table stores AI-generated scores and feedback
- `teacherFeedback` table allows teachers to provide additional personalized feedback
- `resources` table manages learning materials

**Relations**: Drizzle relations define foreign keys between users, assignments, submissions, and evaluations, enabling efficient joins and type-safe queries.

### Authentication & Authorization

**Password Security**: bcrypt (v6.0.0) hashes passwords with appropriate salt rounds before storage

**Session-Based Auth**: Server maintains session state with user ID stored in session data. The session secret is configurable via environment variable.

**Role-Based Access Control**: Frontend routes use a ProtectedRoute component that checks user roles before rendering. Backend endpoints validate user roles from session data.

**Security Headers**: Sessions use httpOnly cookies and secure flag in production to prevent XSS attacks.

### AI Integration Pattern

**Speech Recognition**: OpenAI Whisper API transcribes audio recordings to text. Audio files are streamed to the API using Node.js file streams.

**Evaluation Logic**: GPT-5 model (configured as the latest OpenAI model) evaluates transcriptions based on test type (OET/IELTS/Business English). The system generates structured feedback including:
- Overall score (0-100)
- Dimension-specific scores (pronunciation, fluency, vocabulary, grammar)
- Detailed textual feedback for each dimension
- Identified strengths and improvement areas

**API Key Management**: OpenAI API key is stored in environment variables and validated at startup.

## External Dependencies

### Third-Party Services

**OpenAI API**: 
- Whisper API for audio-to-text transcription
- GPT-5 for language evaluation and feedback generation
- Requires OPENAI_API_KEY environment variable

**Neon Database**:
- Serverless PostgreSQL provider
- WebSocket-based connection pooling
- Requires DATABASE_URL environment variable

### Key NPM Packages

**Core Framework**:
- react (v18+): UI framework
- express: Backend web server
- drizzle-orm: Type-safe ORM
- @neondatabase/serverless: Database driver

**UI Components**:
- @radix-ui/react-*: Accessible component primitives (20+ components)
- tailwindcss: Utility-first CSS framework
- class-variance-authority: Variant-based component styling
- lucide-react: Icon library

**State & Data**:
- @tanstack/react-query: Server state management
- wouter: Lightweight routing
- react-hook-form: Form state management
- zod: Schema validation (via drizzle-zod)

**Audio Processing**:
- multer: File upload middleware
- Web Audio API: Client-side audio recording and visualization

**Development Tools**:
- vite: Frontend build tool and dev server
- typescript: Type safety
- drizzle-kit: Database migrations
- esbuild: Backend bundling for production

### Environment Configuration

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string (Neon)
- `OPENAI_API_KEY`: OpenAI API authentication
- `SESSION_SECRET`: Session encryption key (defaults to development value)
- `NODE_ENV`: Environment indicator (development/production)

### Build & Deployment

**Development**: Vite dev server with HMR, backend runs with tsx for TypeScript execution
**Production Build**: Vite builds frontend to dist/public, esbuild bundles backend to dist/index.js
**Database Migrations**: Drizzle Kit pushes schema changes to database