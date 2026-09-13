# Order Management System

A small Order Management System built with **NestJS** (REST API), **Next.js** (web UI) and **MySQL 8.4**, fully dockerized. It lets a small internal team manage customers, a product catalog, and orders with a simple lifecycle.

- **Backend**: NestJS 11 + TypeORM, modular architecture, class-validator DTOs, Swagger docs
- **Frontend**: Next.js 16 (App Router, Server Components + Server Actions, Tailwind 4)
- **Database**: MySQL 8.4 with TypeORM migrations (schema is never auto-synced)
- **Containers**: single `docker-compose.yml` orchestrates db + backend + frontend

## Project layout

```
.
├── docker-compose.yml        # Orchestrates db, backend and frontend
├── backend/                  # NestJS API
│   └── src/
│       ├── common/           # Pagination DTO + helpers
│       ├── database/         # DataSource (CLI) + migrations
│       └── modules/
│           ├── customers/    # entity, DTOs, service, controller
│           ├── products/
│           └── orders/       # order + order item entities, state-machine rules
└── frontend/                 # Next.js app
    └── app/
        ├── customers|products|orders/   # pages + forms
        ├── components/       # shared UI bits (pagination)
        └── lib/              # server-side API client + Server Actions
```

## How to run (Docker, recommended)

Requirements: Docker with the Compose plugin. No other local dependencies needed.

```bash
docker compose up --build
```

That builds all three images and starts them with the correct dependency order
(the backend waits until MySQL reports *healthy*, and applies the pending
migrations on startup).

| Piece     | URL                              |
| --------- | -------------------------------- |
| Web UI    | http://localhost:3000            |
| REST API  | http://localhost:3001/api        |
| Swagger   | http://localhost:3001/api/docs   |
| MySQL     | `localhost:3307` (user `app` / `apppass`, db `order_management`) |

> MySQL is exposed on host port **3307** (not 3306) to avoid clashing with a
> local MySQL installation. Override with `DB_PORT` in `.env`
> (see `.env.example`).

To stop and remove everything (including data):

```bash
docker compose down -v
```

## Running locally for development

```bash
# 1. Database only
docker compose up -d db

# 2. API  (backend/.env is configured for localhost:3307)
cd backend
npm install
npm run migration:run      # optional: the app also runs migrations on boot
npm run start:dev

# 3. Web UI
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

## API overview

Base URL: `/api`. All list endpoints support `?page=&limit=` (defaults `1` and `10`, max `100`) and return `{ data, meta: { total, page, limit, totalPages } }`.

| Method | Endpoint                | Description                                        |
| ------ | ----------------------- | -------------------------------------------------- |
| GET    | `/health`               | Liveness check                                     |
| CRUD   | `/customers`, `/customers/:id` | Create/list/get/update/delete customers     |
| CRUD   | `/products`, `/products/:id`   | Create/list/get/update/delete products      |
| GET    | `/orders`               | List orders; optional `?status=pending\|completed\|cancelled` |
| GET    | `/orders/:id`           | Order detail with items                            |
| POST   | `/orders`               | Create an order `{ customerId, items: [{ productId, quantity }] }` |
| PATCH  | `/orders/:id/status`    | Change status `{ status }` with transition rules   |

Errors follow the NestJS convention: `{ statusCode, message, error }` with proper
HTTP codes (`400` validation, `404` not found, `409` business-rule conflicts such
as duplicate email or illegal status transition).

## Technical Decisions & Assumptions

### Product price changes → snapshot pricing

The biggest ambiguity: *what happens to an order when a product's price changes?*
I chose **snapshot pricing**. Each `order_items` row stores its own copy of
`product_name` and `unit_price` taken at creation time, and `orders.total` is
persisted (not recomputed on read). Consequences:

- Editing or repricing a product never mutates historical orders — orders become
  immutable financial records.
- The name is snapshotted too, so a renamed product doesn't retroactively change
  what a customer purchased.
- Trade-off: there is no link between what you *see* on an old order and the
  *current* catalog price. For an internal order system this is the behavior I
  would expect as a user.

### Order lifecycle → explicit state machine with terminal states

Status transitions are defined in `ORDER_TRANSITIONS`:

```
pending ──▶ completed     pending ──▶ cancelled     completed/cancelled: terminal
```

Invalid transitions (e.g. completing a cancelled order) return `409 Conflict`
with a message listing the allowed targets. These are hard rules: reopening a
completed order would blur auditability, so a "reopen" feature would instead be
a separate, explicit business operation. Rules live in `order.rules.ts` as pure
functions with unit tests — no NestJS/DB needed to test the business logic.

### Deletion policy → database-enforced with friendly errors

Foreign keys use `ON DELETE RESTRICT`: a customer or product referenced by any
order cannot be deleted (409 with a clear message). `order_items` cascade with
their order. I used the DB constraint as the source of truth and map the MySQL
error (`ER_ROW_IS_REFERENCED*`) to a domain error, instead of pre-checks only —
this avoids race conditions.

Assumption: no soft-delete was implemented to keep the scope in check; it's the
first thing I'd add for production (a `deleted_at` column and filtered queries).

### Money handling

Prices/totals are `DECIMAL(10,2)`/`DECIMAL(12,2)` in MySQL — never `FLOAT`.
Line math is done in integer cents (`order.rules.ts`) so binary float artifacts
(e.g. `0.1 + 0.2`) can't leak into persisted totals. A TypeORM value transformer
exposes them as numbers in the JSON API.

### API design

REST with a versioned-feeling `/api` prefix, nested sub-resource only where it
adds meaning (`/orders/:id/status` makes the state transition an explicit,
auditable action instead of a generic PATCH that could rewrite anything).
Consistent envelope for lists (data + meta) to prepare for scale.

### Database design notes

- `VARCHAR` + TS union for order status instead of a MySQL `ENUM`, so adding a
  status doesn't require an `ALTER TABLE` and stays type-safe in TS.
- Indexes: unique on `customers.email`; index on `orders.status` (filterable
  listing); FK columns are indexed by InnoDB.
- Schema is managed **only** through TypeORM migrations (`synchronize: false`);
  `migrationsRun: true` applies pending migrations on boot so a fresh
  `docker compose up` works with zero manual steps.

### Frontend approach

Server Components fetch from the API on the server; mutations are Server
Actions (`'use server'`) that call the API and then `revalidatePath`/`redirect`.
All API traffic is server-to-server, so inside Docker the frontend uses the
internal network address (`http://backend:3001`) and CORS only matters for
direct browser API usage. Form errors from the API (e.g. validation messages)
are surfaced in the UI via `useActionState`.

### Scalability considerations

Pagination is enforced on every list (max `limit=100`). The hot read paths are
indexed. For "thousands of records" this is adequate; the next real steps, in
order, would be: cursor-based pagination for very large offsets, read replicas
for reporting, and moving order totals to a job if order lines got much heavier.

## What I would change for production

- **Authentication/authorization** (intentionally out of scope here).
- **Soft deletes** for customers/products instead of hard 409s.
- **Secrets management** instead of `.env` files; compose credentials here are
  development defaults.
- **CI** (lint + tests + build), structured request logging, and rate limiting.
- **Seed script** for demo data.
- Multi-worker backend behind a load balancer is trivial since the API is
  stateless.

## Known limitations

- Pending orders cannot be edited item-by-item (cancel + recreate instead) —
  deliberate simplification.
- No inventory/stock tracking — documented assumption.
- No auth: anyone with network access can mutate everything.
- The legacy `docker-compose.yml` `version` key is omitted on purpose (v2 spec).

## Tests

```bash
cd backend
npm test        # unit tests for order business rules
```
