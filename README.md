# SmartSupport

SmartSupport is a full-stack SaaS scheduling platform designed for service providers and their clients.

It enables real-time availability management, public booking flows, role-based dashboards, and scalable business logic for service operations.

This repository contains both the backend API and the frontend application, structured for production-readiness and incremental evolution (billing, email automation, AI features).

---

## Overview

SmartSupport solves a common operational problem: fragmented scheduling and poor client management for service providers.

The platform centralizes:

- Availability configuration
- Appointment booking (including public flows)
- Role-based access control
- Client management
- Business scalability (plans, billing, integrations)

---

## Repository Structure

```
smartsuport/
├── backend/        Node.js API (Express, Prisma, PostgreSQL)
├── frontend/       React SPA (Vite, TypeScript, Tailwind)
├── docs/           Visual assets and references (optional)
└── README.md       Project documentation
```

---

## Tech Stack

### Backend

- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT (access & refresh tokens)
- bcrypt
- Zod (validation)

### Frontend

- React 18
- TypeScript
- Vite
- React Router
- Axios
- Tailwind CSS
- i18next (internationalization: pt/en)

---

## Core Features

### Authentication & Security

- JWT-based authentication (access + refresh tokens)
- Password recovery and update flows
- Role-based authorization (RBAC)

### Role System

| Role | Responsibility |
|------|----------------|
| **ADMIN** | Platform management |
| **PROVIDER** | Manages availability, clients, and appointments |
| **CLIENT** | Books and manages appointments |

### Scheduling System

- Public booking (no account required)
- Token-based booking management
- Slot generation based on availability rules
- Confirmation and cancellation flows

### Availability Engine

- Weekly recurring schedules
- Slot duration configuration
- Buffer time between appointments
- Real-time slot preview

### Client Management

- Provider-side client registration
- Client listing and relationship tracking

### Plans & Billing (Extensible)

- Plan structure: **FREE**, **SMART**, **PRO**
- Backend-ready for billing integration (e.g., Stripe)

### Admin Panel

- User and system overview
- Metrics and operational visibility (based on current implementation)

### AI Integration (Optional / Extensible)

- Per-user configuration
- Designed for future automation and intelligent scheduling features

---

## Demo Mode (Frontend)

The frontend includes a demo mode designed for product presentation and portfolio use.

**Key characteristics:**

- Activated via landing page or login screen
- Uses `localStorage` to simulate authentication state
- Bypasses backend dependency
- Data is mocked at the service layer
- Fully navigable interface without real credentials

This allows the application to be demonstrated even when the backend is unavailable.

---

## Getting Started

### Requirements

- Node.js ≥ 18
- npm
- PostgreSQL (local or remote)

### Installation

#### Backend

```bash
cd backend
npm install
cp .env.example .env
```

Configure:

- `DATABASE_URL`
- `JWT_SECRET`
- CORS and frontend URLs

Then:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

**Default:** http://localhost:3000

#### Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Configure:

- `VITE_API_URL` (or use Vite proxy)

Run:

```bash
npm run dev
```

**Default:** http://localhost:5173

---

## Environment Variables

### Backend

**Required:**

- `DATABASE_URL`
- `JWT_SECRET`

**Recommended:**

- `CORS_ORIGIN`
- `FRONTEND_URL`

**Optional integrations:**

- `STRIPE_*`
- `SMTP_*`
- `OPENAI_API_KEY`

See: `backend/.env.example`

### Frontend

- `VITE_API_URL` (API base URL without `/api`)

See: `frontend/.env.example`

---

## API Overview

**Base prefix:** `/api`

| Domain | Endpoints |
|--------|-----------|
| Auth | `/api/auth/*` |
| Appointments | `/api/appointments/*` |
| Availability | `/api/availability/*` |
| Clients | `/api/clients/*` |
| Admin | `/api/admin/*` |
| Billing | `/api/billing/*` |
| AI | `/api/ai/*` |

For full contracts, refer to backend source code.

---

## Testing

```bash
cd backend && npm run test
cd frontend && npm run test
```

---

## Production Build

```bash
cd backend && npm run build
cd frontend && npm run build
```

- **Frontend output:** `frontend/dist`
- **Backend output:** `backend/dist`

Production typically runs compiled backend with environment-configured services.

---

## Design Decisions

- Clear separation between API and client
- Strong typing across stack (TypeScript end-to-end)
- Scalable architecture for SaaS evolution
- Demo-first approach for portfolio usability
- Incremental feature expansion (billing, AI, automation)

---

## Roadmap (Planned Enhancements)

- Stripe billing integration
- Email notifications (SMTP / transactional)
- AI-powered scheduling assistant
- Multi-tenant isolation improvements
- Audit logs and analytics

---

## License

Private project — intended for portfolio and demonstration purposes unless otherwise agreed.
