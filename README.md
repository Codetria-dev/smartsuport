# SmartSupport

<div align="center">

The Intelligent Scheduling Ecosystem

For service providers who refuse to let chaos run their calendar.

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white&style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white&style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white&style=for-the-badge)
![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748?logo=prisma&logoColor=white&style=for-the-badge)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white&style=for-the-badge)
![Tailwind](https://img.shields.io/badge/Tailwind-3.x-06B6D4?logo=tailwindcss&logoColor=white&style=for-the-badge)

[Live Demo](https://smartsuport.vercel.app) | [Watch the 2-Minute Demo](https://youtube.com)

</div>

---

## The Story Behind the Code

Every great product starts with a problem.

**The Problem:** Service providers lose hours every week juggling calls, texts, and sticky notes to manage appointments. Their clients get frustrated with the back-and-forth. Everyone loses time and money.

**The Solution:** SmartSupport -- a complete, white-label scheduling ecosystem. It transforms chaotic availability into a seamless, real-time booking engine. From a solo consultant to a 50-person agency, SmartSupport scales with you.

This isn't a weekend project. This is a production-ready SaaS foundation, built with the rigor of a venture-backed startup and the soul of a craftsman.

**What This Project Proves:**
- End-to-end architecture mastery (frontend, backend, database)
- Security-first mindset (RBAC, JWT, refresh tokens, validation)
- Scalability by design (ready for Stripe, email, AI, multi-tenancy)
- Portfolio-grade presentation (demo mode so you can test it in 2 minutes)

---

## The Experience: What SmartSupport Does

Imagine logging into a dashboard where everything just works.

| For Service Providers | For Clients |
|-----------------------|-------------|
| Set recurring availability in seconds | Book appointments without creating an account |
| See your week at a glance | Get instant confirmation |
| Manage all clients from one place | Cancel or reschedule with a click |
| Focus on your work, not the admin | No back-and-forth calls or texts |

And for the Admin: Full control over users, plans, and platform metrics.

---

## The Architecture: Built Like a Cathedral

This isn't spaghetti code. This is a carefully crafted monorepo where each part knows its role.

```
smartsupport/
|
|-- backend/                 # The Brain (Node.js + Express)
|   |-- src/
|   |   |-- controllers/     # Request handlers
|   |   |-- services/        # Business logic
|   |   |-- repositories/    # Data access (Prisma)
|   |   |-- middlewares/     # Auth, validation, error handling
|   |   +-- utils/           # Helpers, tokens, encryption
|   +-- prisma/              # Database schema & migrations
|
|-- frontend/                # The Face (React + Vite)
|   |-- src/
|   |   |-- components/      # Reusable UI pieces
|   |   |-- pages/           # Complete views
|   |   |-- contexts/        # Global state (Auth)
|   |   |-- services/        # API communication
|   |   +-- utils/           # Formatting, validation
|   +-- public/              # Static assets
|
+-- docs/                    # Visual assets & references
```

---

## The Tech Stack: No Compromises

Every tool was chosen for a reason.

### Backend -- The Foundation

| Tool                  | Why                                          |
|-----------------------|----------------------------------------------|
| Node.js + Express     | Fast, event-driven, perfect for APIs         |
| TypeScript            | Type safety across 100% of the codebase      |
| Prisma ORM            | Type-safe database queries (no SQL injection)|
| PostgreSQL            | Reliable, ACID-compliant, battle-tested      |
| JWT (access+refresh)  | Stateless auth with silent renewal           |
| bcrypt                | Industry-standard password hashing           |
| Zod                   | Runtime validation (never trust the client)  |

### Frontend -- The Experience

| Tool                  | Why                                          |
|-----------------------|----------------------------------------------|
| React 18              | Component-driven UI                          |
| TypeScript            | Same types as the backend                    |
| Vite                  | Dev server in milliseconds                   |
| React Router          | SPA navigation that feels native             |
| Axios                 | Interceptors for auth tokens                 |
| Tailwind CSS          | Utility-first, no context switching          |
| i18next               | Ready for multiple languages (pt/en)         |

---

## Security: Treated as a First-Class Feature

Authentication isn't an afterthought. It's the foundation.

```
+-------------+     +-------------+     +-------------+
|   Login     |---> |  JWT Access |---> |  Protected  |
|  /auth      |     |   + Refresh |     |   Routes    |
+-------------+     +-------------+     +-------------+
                           |
                           v
                    +-------------+
                    |  Token      |
                    |  Expires?   |
                    +-------------+
                      |        |
                   No |        | Yes
                      v        v
              +----------+  +--------------+
              |  Access  |  | Silent       |
              |  Granted |  | Refresh      |
              +----------+  +--------------+
```

**What's implemented:**

- Access tokens (short-lived) + refresh tokens (long-lived)
- Automatic token refresh via Axios interceptor
- Role-Based Access Control (RBAC)
- Password hashing with bcrypt (10+ rounds)
- Input validation with Zod (every endpoint)

---

## Role System: The Right Access for the Right People

Not everyone should see everything.

| Role     | Badge | Responsibility                                                      |
|----------|-------|---------------------------------------------------------------------|
| ADMIN    |       | Full platform control -- view all users, system metrics, manage plans |
| PROVIDER |       | Manage their own availability, clients, and appointments              |
| CLIENT   |       | Book and manage their own appointments only                          |

The result: A provider never sees another provider's clients. An admin sees everything. A client sees only their own bookings. Clean, simple, secure.

---

## Core Features: What Makes SmartSupport Smart

### The Scheduling Engine

This isn't a simple calendar. It's a dynamic slot generator.

- Define weekly recurring schedules (e.g., Mon/Wed 9 AM-12 PM)
- Set slot duration (15, 30, or 60 minutes)
- Add buffer time between appointments
- The system automatically generates available slots in real-time

### Public Booking Flow (No Account Required)

A client lands on your public page. They see your availability. They book. They get a confirmation. No signup friction.

### Client Management

Providers can register clients manually. Every appointment is linked to a client. Build relationships over time.

### Demo Mode (Portfolio Superpower)

Here's what makes recruiters' eyes widen. The frontend includes a complete demo mode that bypasses the backend entirely.

```typescript
// No backend? No problem.
// Demo mode uses localStorage to mock authentication.
// All data is mocked at the service layer.
// The interface remains 100% navigable.

if (demoMode) {
  localStorage.setItem('auth', JSON.stringify(mockUser));
  // User is "logged in" instantly.
  // Perfect for portfolio presentations.
}
```

Why this matters: A recruiter can clone the repo, run `npm install && npm run dev`, and explore the entire application in 2 minutes -- without configuring a database or backend.

---

## Getting Started (From Zero to Running in 5 Minutes)

### Prerequisites

- Node.js >= 18 ([Download](https://nodejs.org/))
- npm (comes with Node.js)
- PostgreSQL (local or remote -- [Download](https://www.postgresql.org/download/))

### Quick Start (Full Stack)

```bash
# 1. Clone the repository
git clone https://github.com/Codetria-dev/smartsuport
cd smartsupport

# 2. Set up the backend
cd backend
npm install
cp .env.example .env
# Edit .env: add DATABASE_URL and JWT_SECRET
npx prisma generate
npx prisma migrate dev --name init
npm run dev
# Backend running on http://localhost:3000

# 3. Set up the frontend (new terminal)
cd ../frontend
npm install
cp .env.example .env
# Edit .env: add VITE_API_URL=http://localhost:3000
npm run dev
# Frontend running on http://localhost:5173
```

**No PostgreSQL?** Use the free tier of [Supabase](https://supabase.com/) or [Neon](https://neon.tech/).

**Want to skip the backend entirely?** The frontend's demo mode works out of the box. Just run `npm run dev` in the frontend directory.

---

## Environment Variables: What Goes Where

### Backend (`backend/.env`)

| Variable           | Required? | Example                                          |
|--------------------|-----------|--------------------------------------------------|
| DATABASE_URL       | Yes       | postgresql://user:pass@localhost:5432/smartsupport|
| JWT_SECRET         | Yes       | your-super-secret-key-min-32-chars                |
| CORS_ORIGIN        | Nice      | http://localhost:5173                             |
| FRONTEND_URL       | Nice      | http://localhost:5173                             |
| STRIPE_SECRET_KEY  | Future    | sk_live_...                                      |
| SMTP_HOST          | Future    | smtp.gmail.com                                    |
| OPENAI_API_KEY     | Future    | sk-...                                            |

### Frontend (`frontend/.env`)

| Variable       | Required? | Example                      |
|----------------|-----------|------------------------------|
| VITE_API_URL   | Yes       | http://localhost:3000         |

---

## API Overview (For the Curious)

Base URL: `http://localhost:3000/api`

| Domain       | Endpoint Example        | Description                              |
|--------------|-------------------------|------------------------------------------|
| Auth         | POST /auth/login        | Login, register, refresh tokens          |
| Appointments | GET /appointments       | List, create, update, cancel             |
| Availability | POST /availability/slots| Generate slots from rules                |
| Clients      | GET /clients            | CRUD for client registry                 |
| Admin        | GET /admin/users        | System overview (admin only)             |
| Billing      | POST /billing/checkout  | Stripe integration (extensible)          |
| AI           | POST /ai/suggest        | AI scheduling assistant (extensible)     |

All endpoints require authentication except `/auth/login` and `/auth/register`.

---

## Testing: Because Bugs Are Embarrassing

```bash
# Backend tests
cd backend
npm run test

# Frontend tests
cd frontend
npm run test
```

Test coverage targets: backend >80%, frontend >70%.

---

## Production Build (When You're Ready to Launch)

```bash
# Backend build
cd backend
npm run build
# Output: dist/

# Frontend build
cd frontend
npm run build
# Output: dist/

# Serve the frontend build (via Nginx, Vercel, or any static host)
# Serve the backend build (via PM2, Docker, or Node.js directly)
```

---

## Design Decisions: Why It's Built This Way

| Decision                   | Rationale                                                       |
|----------------------------|-----------------------------------------------------------------|
| Clear API/UI separation    | Scale independently, change one without breaking the other       |
| TypeScript end-to-end      | Catch bugs at compile time, not in production                    |
| Prisma over raw SQL        | Type-safe queries + auto-completion in IDE                       |
| Demo mode                  | Portfolio-first -- recruiters can test without setup             |
| RBAC from day one          | Security isn't a bolt-on; it's core                             |
| Refresh tokens             | Better UX than logging in every hour                            |

---

## Roadmap: Where SmartSupport Is Headed

This isn't a finished product. It's a foundation that's ready to grow.

| Feature                          | Status                  | Expected   |
|----------------------------------|-------------------------|------------|
| Stripe billing (subscriptions)   | Ready for integration   | Q3 2025    |
| Email notifications (SMTP)       | Ready for integration   | Q3 2025    |
| AI scheduling assistant (OpenAI) | Architecture designed   | Q4 2025    |
| Multi-tenant isolation           | Schema ready            | Q4 2025    |
| Audit logs & analytics           | Researching             | 2026       |
| PWA (offline mode)               | Researching             | 2026       |

**What's already done:** Authentication, RBAC, Appointment CRUD, Availability engine, Demo mode, Client management.

---

## For Recruiters & Hiring Managers (Read This)

You're busy. You see hundreds of portfolios. Here's why this one is different:

**1. It actually works.**
Clone it. Run `npm install && npm run dev` in the frontend. Use demo mode. No database required. You'll see a fully functional scheduling app in under 3 minutes.

**2. It's production-ready, not a toy.**
JWT with refresh tokens. RBAC. Prisma migrations. Environment validation. Error handling. Logging. This is code I'd ship to paying customers.

**3. The architecture tells a story.**
Every file has a purpose. Separation of concerns. DRY principles. The frontend doesn't know about the database. The backend doesn't know about Tailwind. Clean.

**4. It's built to scale.**
Stripe, email, AI, multi-tenancy -- the hooks are there. Adding billing is a matter of implementing the controller, not rewriting the foundation.

**5. I care about the details.**
This README exists. The demo mode exists. The error messages are human-readable. The code is formatted. The types are explicit.

**What this project proves I can do:**

- Architect a full-stack application from zero
- Implement secure authentication (JWT, refresh tokens, RBAC)
- Design a relational database schema (PostgreSQL + Prisma)
- Build a responsive, modern UI (React + Tailwind)
- Write clean, maintainable, typed code
- Think about the future (extensibility, scalability)
- Communicate technical decisions clearly

---

## License

Private project -- This code is shared for portfolio and demonstration purposes. Not licensed for commercial use without permission.

---

## One Last Thing

If you've read this far -- thank you. It means you care about quality as much as I do.

If this README made you smile, nod, or say "finally, someone who gets it," then star the repository. It tells me I'm on the right track.

Now go clone it. Run it. Break it. Fix it. Make it yours.

Let's build something great.

<div align="center">
  <sub>Built with coffee, headphones, and way too much attention to detail.</sub>
</div>
