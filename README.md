# Steno - Demand Letter Generator

AI-powered demand letter generator for law firms, built with React, TypeScript, Express, and PostgreSQL.

## Project Structure

```
steno-demand-letter-generator/
├── frontend/                 # React + Vite + TypeScript frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── store/           # Redux store and slices
│   │   ├── api/             # API client configuration
│   │   └── types/           # TypeScript type definitions
│   └── package.json
├── backend/                  # Express + TypeScript backend
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Express middleware
│   │   └── services/        # Business logic services
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── package.json
├── docs/                     # Project documentation
├── .env.example             # Environment variables template
├── docker-compose.yml       # Local PostgreSQL setup
└── package.json             # Root workspace configuration
```

## Tech Stack

### Frontend
- **React 18.2+** - UI framework
- **Vite 5.0+** - Build tool
- **TypeScript 5.3+** - Type safety
- **Tailwind CSS 3.4+** - Styling
- **Redux Toolkit 2.0+** - State management
- **React Router 6.20+** - Routing
- **TipTap 2.1+** - Rich text editor
- **Axios 1.6+** - HTTP client
- **Vitest** - Unit testing

### Backend
- **Node.js 20.x LTS** - Runtime
- **Express 4.18+** - Web framework
- **TypeScript 5.3+** - Type safety
- **Prisma 5.7+** - ORM
- **PostgreSQL 15** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing

## Prerequisites

- **Node.js** >= 20.0.0
- **npm** >= 10.0.0
- **Docker** (for local PostgreSQL)

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd steno-demand-letter-generator
```

### 2. Install Dependencies

```bash
npm install
```

This will install dependencies for both frontend and backend workspaces.

### 3. Setup Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/demand_letter_generator?schema=public"

# Backend
PORT=3001
NODE_ENV=development
JWT_SECRET=your-development-secret-key-change-in-production

# Anthropic AI (optional for MVP)
ANTHROPIC_API_KEY=your-anthropic-api-key-here

# Frontend
VITE_API_URL=http://localhost:3001/api
```

### 4. Start PostgreSQL Database

```bash
npm run db:setup
```

This will:
- Start PostgreSQL in Docker
- Run Prisma migrations to create database schema

Alternatively, start just the database:

```bash
docker-compose up -d
```

### 5. Run Database Migrations

```bash
npm run db:migrate
```

### 6. Start Development Servers

Start both frontend and backend simultaneously:

```bash
npm run dev
```

Or start them individually:

```bash
# Frontend only (http://localhost:5174)
npm run dev:frontend

# Backend only (http://localhost:3001)
npm run dev:backend
```

### 7. Access the Application

- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:3001/api
- **API Health**: http://localhost:3001/api/health

## Development Scripts

### Root Level

```bash
npm run dev              # Start frontend & backend concurrently
npm run build            # Build both workspaces
npm run lint             # Lint all code
npm run format           # Format all code with Prettier
npm run format:check     # Check code formatting
npm run test             # Run all tests
npm run db:setup         # Setup database (Docker + migrations)
npm run db:migrate       # Run Prisma migrations
npm run db:studio        # Open Prisma Studio (database GUI)
```

### Frontend

```bash
cd frontend
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Lint code
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run type-check       # TypeScript type checking
```

### Backend

```bash
cd backend
npm run dev              # Start dev server with hot reload
npm run build            # Build TypeScript to JavaScript
npm run start            # Start production server
npm run lint             # Lint code
npm run test             # Run tests
npm run db:migrate       # Run Prisma migrations
npm run db:generate      # Generate Prisma client
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed database with sample data
```

## Database Management

### View Database in GUI

```bash
npm run db:studio
```

This opens Prisma Studio at http://localhost:5555

### Reset Database

```bash
cd backend
npx prisma migrate reset
```

### Create New Migration

```bash
cd backend
npx prisma migrate dev --name migration-name
```

## Project Features

### MVP Features
- ✅ User authentication (JWT)
- ✅ Multi-tenant firm isolation
- ✅ Demand letter CRUD operations
- ✅ Template management
- ✅ Rich text editing (TipTap)
- ✅ Document upload (source documents)
- ✅ Letter versioning
- ⏳ AI-powered letter generation (Anthropic Claude)
- ⏳ AI-powered letter refinement
- ⏳ Export to Word/PDF

### Phase 1 (Post-MVP)
- Real-time collaboration (WebSocket)
- Redis caching
- Advanced search and filtering
- Email notifications
- Audit logs

## Code Quality

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format              # Auto-fix formatting
npm run format:check        # Check only
```

### Pre-commit Hooks

Husky and lint-staged are configured to run linting and formatting automatically on commit.

## Testing

```bash
# Run all tests
npm run test

# Frontend tests
cd frontend && npm run test

# Backend tests
cd backend && npm run test
```

## Deployment

### Build for Production

```bash
npm run build
```

This builds both frontend and backend for production.

### Frontend Deployment
- Build output: `frontend/dist`
- Deploy to: Vercel, Netlify, AWS S3 + CloudFront

### Backend Deployment
- Build output: `backend/dist`
- Deploy to: AWS Lambda, Heroku, Railway, Render

### Database
- Production: AWS RDS PostgreSQL, Supabase, or Neon

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps

# Check database logs
docker logs demand-letter-postgres

# Restart database
docker-compose restart
```

### Port Already in Use

```bash
# Kill process on port 3001 (backend)
npx kill-port 3001

# Kill process on port 5174 (frontend)
npx kill-port 5174
```

### Prisma Client Issues

```bash
cd backend
npx prisma generate
```

## Documentation

- **Architecture**: `docs/architecture/`
- **PRD**: `docs/prd/`
- **API Design**: `docs/architecture/api-design.md`
- **Data Model**: `docs/architecture/data-model.md`
- **Deployment**: `docs/architecture/deployment.md`

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Ensure tests pass and code is formatted
4. Submit a pull request

## License

Proprietary - Steno © 2025
