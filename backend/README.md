# SmartSupport Backend

Backend API for the SmartSupport SaaS Scheduling Platform, built with Node.js, Express and TypeScript.

This service provides authentication, appointment management, availability configuration, public booking flows, and role-based access control.

---

## Tech Stack

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Bcrypt
- Zod Validation

---

## Requirements

- Node.js 18+
- npm or yarn
- PostgreSQL (local, Docker, or hosted e.g. Railway). Set `DATABASE_URL` in `.env`.

---

## Installation

Install dependencies:

```bash
npm install
```

Create environment file:

```bash
cp .env.example .env
```

---

## Database Setup

Generate Prisma Client:

```bash
npm run prisma:generate
```

Run migrations (uses `DATABASE_URL` from `.env`):

```bash
npm run prisma:migrate
```

For production deploy (e.g. Railway), run: `npx prisma migrate deploy`

---

## Running the Server

Start development server:

```bash
npm run dev
```

Server runs at: **http://localhost:3000**

---

## Project Structure

```
backend/
│
├── src/
│   ├── config/
│   │       Environment and configuration
│   │
│   ├── middleware/
│   │       Authentication
│   │       Validation
│   │       Error handling
│   │
│   ├── services/
│   │       Business logic
│   │
│   ├── controllers/
│   │       Route controllers
│   │
│   ├── routes/
│   │       API routes
│   │
│   ├── utils/
│   │       Helpers and utilities
│   │
│   ├── types/
│   │       TypeScript types
│   │
│   ├── app.ts
│   └── server.ts
│
├── prisma/
│       schema.prisma
│
└── package.json
```

---

## Authentication

SmartSupport uses JWT authentication with refresh tokens.

### Token Configuration

| Token | Default Expiration |
|-------|--------------------|
| Access Token | 15 minutes |
| Refresh Token | 7 days |

Both values are configurable via environment variables.

### Authentication Middleware

Example usage:

```typescript
import { authenticateToken, requireRole } from "./middleware/auth.middleware";

router.get(
  "/protected",
  authenticateToken,
  handler
);

router.get(
  "/admin",
  authenticateToken,
  requireRole("ADMIN"),
  handler
);
```

---

## Environment Variables

**Required**

```env
# PostgreSQL URL from your provider (e.g. Railway Connect tab). Do not commit real credentials.
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
JWT_SECRET="your-secret"
JWT_ACCESS_TOKEN_EXPIRES_IN="15m"
JWT_REFRESH_TOKEN_EXPIRES_IN="7d"
```

**Optional**

```env
STRIPE_SECRET_KEY=
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
OPENAI_API_KEY=
```

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Build TypeScript |
| `npm start` | Production server |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run migrations |
| `npm run prisma:studio` | Open Prisma Studio |

---

## API Modules

```
/api/auth
/api/appointments
/api/availability
/api/admin
/api/ai
/api/billing
```

---

## Production Notes

The backend is production-ready and supports:

- PostgreSQL
- Stripe billing
- Email providers
- AI integrations
- Environment configuration

---

## Status

Core features implemented:

- Authentication
- Appointment system
- Availability system
- Public booking
- Role-based access
- Admin management
