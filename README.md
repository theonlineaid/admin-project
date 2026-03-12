# E-commerce Admin Dashboard

Full-featured admin dashboard built with **Next.js** (App Router), **TypeScript**, **Tailwind CSS**, **Prisma**, and **PostgreSQL**. Runs in **Docker** with **PostgreSQL** and **pgAdmin**.

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Prisma ORM** + **PostgreSQL**
- **NextAuth.js v5** (credentials)
- **React Hook Form** + **Zod**
- **Recharts** (dashboard charts)
- **Lucide React** (icons)
- **Docker** + **Docker Compose** (Postgres, pgAdmin)

## Docker (recommended)

The project is set up to run entirely in Docker: **PostgreSQL**, **pgAdmin**, and the **Next.js app**.

### 1. Environment

Copy `.env.example` to `.env`. Defaults work for Docker:

- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` – used by Postgres and the app
- `PGADMIN_EMAIL`, `PGADMIN_PASSWORD` – pgAdmin login
- `AUTH_SECRET` – set to a random string in production (e.g. `openssl rand -base64 32`)
- `AUTH_URL` – `http://localhost:3000` for local Docker

### 2. Run everything

```bash
docker compose up -d --build
```

- **App:** [http://localhost:3000](http://localhost:3000) (login → dashboard)
- **pgAdmin:** [http://localhost:5050](http://localhost:5050) (default login: `admin@admin.com` / `admin`)

The app container runs Prisma `db push` and the seed on startup. **Seeded admin:** `admin@example.com` / `admin123`.

### 3. pgAdmin: connect to Postgres

In pgAdmin, add a server:

- **Host:** `postgres` (service name)
- **Port:** `5432`
- **Username:** `ecommerce`
- **Password:** `ecommerce_secret`
- **Database:** `ecommerce`

(Or use the same values from your `.env`.)

### 4. Optional: Postgres + pgAdmin only (app locally)

To run only the database and pgAdmin in Docker and the app on your machine:

```bash
docker compose -f docker-compose.dev.yml up -d
```

Then set in `.env`: `DATABASE_URL=postgresql://ecommerce:ecommerce_secret@localhost:5432/ecommerce?schema=public` and run `npm run dev`.

---

## Getting Started (without Docker)

### 1. Environment

Copy `.env.example` to `.env` and set `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`.

### 2. Database

```bash
npm run db:push
npm run db:seed
```

**Seeded admin:** `admin@example.com` / `admin123`

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in at `/login`, then use the dashboard at `/dashboard`.

## Project Structure

- `app/dashboard/*` – Dashboard pages (products, orders, customers, sellers, categories, brands, payments, analytics)
- `app/api/*` – API routes (auth, products, orders, users, categories, brands, payments, dashboard stats)
- `components/ui` – Reusable UI (Button, Card, Input, Table, Badge, Dialog, etc.)
- `components/dashboard` – Sidebar, charts
- `lib/` – Prisma client, auth, utils, dashboard helpers
- `prisma/` – Schema and seed

## Dashboard Modules

| Module       | Routes | Description |
|-------------|--------|-------------|
| Dashboard   | `/dashboard` | Stats, revenue & orders charts |
| Products   | `/dashboard/products`, create, edit | CRUD, search, filters |
| Orders     | `/dashboard/orders`, `[id]` | List, detail, status update |
| Customers  | `/dashboard/customers`, `[id]` | List, detail, block user |
| Sellers    | `/dashboard/sellers`, `[id]` | List, detail, products & sales |
| Payments   | `/dashboard/payments` | Payment list, status, method |
| Categories | `/dashboard/categories` | CRUD categories |
| Subcategories | `/dashboard/subcategories` | CRUD subcategories |
| Brands     | `/dashboard/brands` | CRUD brands |
| Analytics  | `/dashboard/analytics` | 90-day revenue & orders |

## Roles & Permissions

- **Admin** – Full access: products, orders, users, sellers, payments, categories, brands, analytics.
- **Seller** – Own products, orders that include their products, dashboard stats for their data.
- **Customer** – Own orders only (if you add a storefront).

## Scripts

- `npm run dev` – Start dev server
- `npm run build` – Production build
- `npm run start` – Start production server
- `npm run db:push` – Push Prisma schema to DB
- `npm run db:studio` – Open Prisma Studio
- `npm run db:seed` – Run seed (admin + sample data)

**Docker**

- `docker compose up -d --build` – Build and run app + Postgres + pgAdmin
- `docker compose -f docker-compose.dev.yml up -d` – Run only Postgres + pgAdmin

## Optional: Stripe

Add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` to `.env` when you integrate Stripe for payments.
