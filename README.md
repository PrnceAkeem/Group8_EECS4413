# Group8_EECS4413

LE/EECS 4413 M - Building E-Commerce Systems (Winter 2025-2026)

## 6ixOutside E-Store

6ixOutside is a multi-tier shoe e-commerce project focused on sneakers and streetwear footwear.
The application is being built to satisfy the official course project specification in
`26w -- v1 EECS_Project_Specs-2023.pdf`.

The spec requires:

- Clear front-end/back-end separation
- MVC architecture with a Web API layer
- DAO-based data access
- A runnable deployment target, ideally public cloud or Docker
- An extendable e-store schema with products, customers, checkout, sales history, and admin inventory management

## Current Backend Scope

The repository currently includes an Express back-end with:

- Authentication routes for register and login
- A PostgreSQL DAO layer for customer lookup and creation
- Docker-based local runtime for the back-end and database
- Seed data tailored to a shoe store domain

## Database Setup

The PostgreSQL setup now includes an extendable schema for the main e-commerce entities:

- `brands`
- `categories`
- `products`
- `customers`
- `addresses`
- `payment_methods`
- `shopping_cart_items`
- `purchase_orders`
- `order_items`
- `inventory_transactions`

The initial SQL is located in [Backend/db/init/01_schema.sql](/Users/qi/Projects/York/4413/Group8_EECS4413/Backend/db/init/01_schema.sql) and [Backend/db/init/02_seed.sql](/Users/qi/Projects/York/4413/Group8_EECS4413/Backend/db/init/02_seed.sql).

The seed data includes:

- Sneaker products across multiple brands and categories
- A demo customer account
- A demo admin account
- Sample addresses, payment methods, purchase history, and inventory movement rows

Demo accounts:

- Customer: `maya@sixoutside.com` / `demo123`
- Admin: `admin@sixoutside.com` / `admin123`

## Docker Run

The project can now be started with Docker Compose from the repository root:

```bash
docker compose up --build
```

Services:

- `db`: PostgreSQL 16 with automatic schema and seed initialization
- `backend`: Node/Express API on port `5050`

Default endpoints:

- `GET /` -> basic service info
- `GET /health` -> API + database health check
- `POST /api/auth/register`
- `POST /api/auth/login`

## Catalog API Examples

Contract details are documented in `docs/catalog-api.md`.

- `GET /api/catalog`
- `GET /api/catalog?brand=Nike&sort=price_asc`
- `GET /api/catalog?category=Lifestyle&q=air`
- `GET /api/catalog/SNK-NIKE-AF1`

## Environment Variables

Compose defaults are provided, but you can override them through a local `.env` file using
[.env.example](/Users/qi/Projects/York/4413/Group8_EECS4413/.env.example).

Important variables:

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_PORT`
- `BACKEND_PORT`
- `SESSION_SECRET`
- `SESSION_COOKIE_SECURE`

## Notes For The Team

- The database design intentionally goes beyond the current auth-only code so front-end and business-logic work can build on top of it without redoing the schema later.
- The back-end now reads database and session configuration from environment variables instead of hard-coded localhost settings.
- The Dockerized workflow is designed to satisfy the course deployment requirement on page 6 of the spec while keeping the project runnable on another machine with a single command.
