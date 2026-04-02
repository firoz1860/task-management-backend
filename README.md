# TaskFlow — Backend API

REST API for the TaskFlow Task Management System.

## Tech Stack

- **Node.js** + **Express.js** — Web framework
- **TypeScript** (strict mode) — Type safety
- **Prisma ORM** + **SQLite** (dev) / **PostgreSQL** (prod)
- **JWT** — Access + refresh token auth
- **bcryptjs** — Password hashing
- **Zod** — Request validation
- **Helmet** + **CORS** + **Rate Limiting** — Security

## Getting Started

```bash
# 1. Install dependencies
cd backend && npm install

# 2. Copy and fill environment variables
cp .env.example .env

# 3. Create database and run migrations
npm run db:push

# 4. Generate Prisma client
npm run db:generate

# 5. Start development server
npm run dev
```

Server runs at `http://localhost:5000`

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `file:./dev.db` |
| `JWT_ACCESS_SECRET` | Access token secret (≥32 chars) | `super-secret-key-...` |
| `JWT_REFRESH_SECRET` | Refresh token secret (≥32 chars) | `another-secret-...` |
| `JWT_ACCESS_EXPIRES_IN` | Access token TTL | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL | `7d` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:3000` |

## API Endpoints

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | ❌ | Register new user |
| `POST` | `/api/auth/login` | ❌ | Login, receive tokens |
| `POST` | `/api/auth/refresh` | ❌ | Refresh access token |
| `POST` | `/api/auth/logout` | ✅ | Invalidate refresh token |
| `GET` | `/api/auth/me` | ✅ | Get current user |

### Tasks

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/tasks` | ✅ | List tasks (paginated, filtered) |
| `GET` | `/api/tasks/stats` | ✅ | Get task counts by status |
| `POST` | `/api/tasks` | ✅ | Create a task |
| `GET` | `/api/tasks/:id` | ✅ | Get single task |
| `PATCH` | `/api/tasks/:id` | ✅ | Update task |
| `DELETE` | `/api/tasks/:id` | ✅ | Delete task |
| `PATCH` | `/api/tasks/:id/toggle` | ✅ | Cycle task status |

### Task Query Params

```
GET /api/tasks?page=1&limit=10&status=PENDING&priority=HIGH&search=meeting&sortBy=createdAt&sortOrder=desc
```

## Authentication Flow

```
1. POST /register or /login → receive { accessToken, refreshToken }
2. Send: Authorization: Bearer <accessToken> on protected routes
3. On 401 → POST /refresh with { refreshToken } → new tokens
4. On logout → POST /logout → refresh token invalidated in DB
```

Token rotation: each refresh issues a new pair and invalidates the old one.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start with hot-reload (tsx + nodemon) |
| `npm run build` | Compile TypeScript to dist/ |
| `npm run start` | Start compiled production build |
| `npm run db:push` | Push schema to DB (no migration file) |
| `npm run db:migrate` | Create migration + apply |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:studio` | Open Prisma Studio GUI |

## Error Response Shape

```json
{
  "success": false,
  "message": "Error description",
  "errors": { "field": ["Validation message"] }
}
```

## Moving to PostgreSQL

1. Change `provider = "sqlite"` to `provider = "postgresql"` in `prisma/schema.prisma`
2. Update `DATABASE_URL` to your PostgreSQL connection string
3. Run `npm run db:migrate`
