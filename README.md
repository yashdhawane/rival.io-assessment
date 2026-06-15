# Task Management Application

A full-stack task management application with user authentication, task CRUD operations, file uploads, and activity logging.

## Features

- User authentication (signup, login, logout)
- Task management (create, read, update, delete)
- Task filtering and sorting
- File upload with Cloudinary integration
- Activity logging for task changes
- Dark/light mode toggle
- Responsive design with Tailwind CSS

## Tech Stack

### Backend
- Node.js with Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Cloudinary for file storage

### Frontend
- Next.js 16
- TypeScript
- Tailwind CSS
- TanStack Query for data fetching
- Zustand for state management
- Axios for API calls

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Docker and Docker Compose (for Docker setup)
- Cloudinary account (for file uploads)

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/task_manager
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Setup Without Docker (Local Development)

### 1. Clone the Repository

```bash
git clone https://github.com/yashdhawane/rival.io-assessment.git
cd rival.io-assessment
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run Prisma migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev
```

The backend will run on `http://localhost:3001`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## Setup With Docker

### 1. Clone the Repository

```bash
git clone https://github.com/yashdhawane/rival.io-assessment.git
cd rival.io-assessment
```

### 2. Configure Environment Variables

The docker-compose.yml file already includes the necessary environment variables. You can modify them in the `docker-compose.yml` file if needed:

```yaml
services:
  backend:
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/task_manager
      JWT_SECRET: your-jwt-secret-key-change-in-production
      # ... other variables
```

### 3. Start Services

```bash
# Start all services
docker-compose up --build

# Or run in detached mode
docker-compose up --build -d
```

This will start:
- PostgreSQL database on port 5432
- Backend API on port 3001
- Frontend application on port 3000

### 4. Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Running Tests

### Backend Tests

```bash
cd backend

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

The backend tests cover:
- Authentication flow (signup, login, failed login)
- Task CRUD operations
- Cloudinary upload signature generation

## Project Structure

```
.
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── __tests__/
│   │   └── app.ts
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── dashboard/
│   │   └── tasks/
│   ├── src/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── store/
│   │   └── hooks/
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - Get all tasks for authenticated user
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create a new task
- `PATCH /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

### Attachments
- `POST /api/attachments/tasks/:taskId/attachments/signature` - Get Cloudinary upload signature
- `POST /api/attachments/tasks/:taskId/attachments/metadata` - Save attachment metadata

### Activities
- `GET /api/activities/tasks/:taskId` - Get activities for a task

## Troubleshooting

### Docker Issues

**Port already in use:**
```bash
# Check what's using the port
netstat -ano | findstr :3001
# Kill the process or change the port in docker-compose.yml
```

**Container won't start:**
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Rebuild containers
docker-compose down
docker-compose up --build
```

**Database connection issues:**
```bash
# Check if PostgreSQL is healthy
docker-compose ps postgres

# Restart database
docker-compose restart postgres
```

### Local Development Issues

**Prisma migration errors:**
```bash
# Reset database (WARNING: This deletes all data)
npx prisma migrate reset

# Or create a new migration
npx prisma migrate dev --name init
```

**Frontend build errors:**
```bash
# Clear Next.js cache
rm -rf .next
rm -rf node_modules
npm install
npm run dev
```

**Backend build errors:**
```bash
# Clear build artifacts
rm -rf dist
rm -rf node_modules
npm install
npm run dev
```

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
