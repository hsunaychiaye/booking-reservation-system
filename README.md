# Internal Seat Reservation System

Next.js App Router dashboard for internal venue table reservations with Prisma + PostgreSQL (Neon-ready) + Auth.js.

## Stack

- Next.js 16 (App Router, Server Actions)
- Prisma ORM with PostgreSQL
- Auth.js / NextAuth v5 with Google sign-in
- Tailwind CSS + shadcn-style UI primitives (`dialog`, `input`, `toasts`)

## Access Control

Only these emails can sign in:

- `admin1@gmail.com`
- `admin2@gmail.com`
- `admin3@gmail.com`

Access restriction is enforced in both:

- Auth.js `signIn` callback
- `middleware.ts` route protection

## Neon Quickstart

1. Create a Neon project and database in Neon Console.
2. Copy both connection strings:
- pooled connection string for app runtime
- direct connection string for migrations
3. Put them in `.env`:

```env
DATABASE_URL="postgresql://...neon.../db?sslmode=require&channel_binding=require"
DIRECT_URL="postgresql://...neon.../db?sslmode=require&channel_binding=require"
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables and fill values:

```bash
cp .env.example .env
```

3. Generate Prisma client and migrate:

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
```

4. Seed tables:

```bash
npm run prisma:seed
```

5. Run dev server:

```bash
npm run dev
```

## Business Rules Implemented

- Red VVIP `A1` to `A20`: `500,000 MMK`, capacity `5`, max pax `6` (1 extra = `35,000 MMK`)
- Yellow VIP `B1` to `B15`: `400,000 MMK`, capacity `5`, max pax `6` (1 extra = `35,000 MMK`)
- Payment statuses: `AVAILABLE`, `BOOKED`, `DEPOSIT_PAID`, `FULLY_PAID`
