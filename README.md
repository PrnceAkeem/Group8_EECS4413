# EECS 4413 — Group 8 Project (Winter 2025–2026)

**6ixOutside** — Sneakers & Streetwear E-Store

---

## What Is This?

This is our group project for EECS 4413: Building E-Commerce Systems. We built a sneaker and streetwear store called **6ixOutside** that sells shoes from Nike, Jordan, Adidas, Converse, and New Balance.

The project follows the three-tier architecture covered in class:

- **Presentation tier** — React frontend (what the user sees and interacts with)
- **Logic tier** — Node.js + Express backend (business rules, API endpoints)
- **Data tier** — PostgreSQL database (stores all products, users, orders)

This structure is the same idea as the warehouse lab from class — a clean boundary between each layer so they don't bleed into each other.

---

## Tech Stack

| Layer       | What We Used                               | Why                                                      |
|-------------|--------------------------------------------|----------------------------------------------------------|
| Frontend    | React 18, React Router v7, Axios           | Component-based UI, client-side routing, HTTP calls      |
| Backend     | Node.js, Express 4                         | Same setup as the warehouse lab                          |
| Database    | PostgreSQL 16 (`pg` library)               | Relational DB with JOINs across products/brands/orders   |
| Auth        | `express-session` + cookies                | Session-based auth as covered in the auth lab            |
| Deployment  | Docker Compose                             | Course spec requires a runnable deployment target        |

---

## How To Run It

### Step 1 — Start the backend and database (Docker)

Make sure Docker Desktop is running, then from the project root:

```bash
docker compose up --build
```

This spins up:

| Container  | What it does                                           | Port |
|------------|--------------------------------------------------------|------|
| `db`       | PostgreSQL — automatically runs our schema + seed SQL  | 5432 |
| `backend`  | Express API                                            | 5050 |

The first time it runs, Docker will execute `01_schema.sql` (creates all tables) and `02_seed.sql` (inserts demo products and accounts) automatically.

### Step 2 — Start the React frontend

```bash
cd Frontend
npm install
npm start
```

Frontend opens at `http://localhost:3000`. It proxies all `/api/*` requests to the backend at port 5050 — this is set in `Frontend/package.json` so we never hardcode the backend URL in our components.

---

## Demo Accounts (from seed data)

| Role     | Email                   | Password  |
|----------|-------------------------|-----------|
| Customer | maya@sixoutside.com     | demo123   |
| Admin    | admin@sixoutside.com    | admin123  |

---

## Project Structure

```
Group8_EECS4413/
├── Backend/
│   ├── server.js               # Entry point — sets up Express, middleware, mounts routes
│   ├── controllers/            # MVC Controllers — handle req/res, call DAOs, send JSON
│   │   ├── authController.js   # register, login
│   │   └── catalogController.js# listProducts, getProduct, listBrands, listCategories
│   ├── dao/                    # Data Access Objects — all SQL lives here (warehouse lab pattern)
│   │   ├── CustomerDAO.js
│   │   └── ProductDAO.js
│   ├── routes/                 # Express routers — map URL paths to controller functions
│   │   ├── authRoutes.js       # /api/auth/*
│   │   └── catalogRoutes.js    # /api/catalog/*
│   └── db/
│       └── init/
│           ├── 01_schema.sql   # Creates all tables
│           └── 02_seed.sql     # Inserts products, demo users, sample orders
├── Frontend/
│   └── src/
│       ├── App.js              # Root component — defines all routes
│       ├── context/
│       │   └── AuthContext.js  # Observer pattern — shared login state across all pages
│       ├── pages/
│       │   ├── LandingPage.jsx
│       │   ├── CatalogPage.jsx         # Product listing with filters, sort, search
│       │   ├── ProductDetailPage.jsx   # Single product view
│       │   ├── LoginPage.jsx
│       │   └── RegisterPage.jsx
│       ├── services/
│       │   └── catalogApi.js   # All Axios calls to /api/catalog — keeps fetch logic out of pages
│       └── utils/
│           └── sortStrategies.js  # Strategy pattern — sort options as swappable objects
├── docs/
│   ├── catalog-api.md          # API contract (request/response shapes, error codes)
│   └── phase2-smoke-test.md    # Manual test checklist for Phase 2
└── docker-compose.yml
```

---

## API Reference

### Auth — `/api/auth`

| Method | Path        | Body                                | Returns                  |
|--------|-------------|-------------------------------------|--------------------------|
| POST   | `/register` | `firstName, lastName, dob, email, password` | `201` + customer object |
| POST   | `/login`    | `email, password`                   | `200` + sets session cookie |

### Catalog — `/api/catalog`

| Method | Path          | Description                                          |
|--------|---------------|------------------------------------------------------|
| GET    | `/`           | All active products — supports filter/sort/search    |
| GET    | `/:id`        | Single product by product ID (e.g. `SNK-NIKE-DUNK`)  |
| GET    | `/brands`     | List of brands that have active products             |
| GET    | `/categories` | List of categories that have active products         |

**Query params for `GET /api/catalog`:**

| Param      | Example      | What it does                        |
|------------|--------------|-------------------------------------|
| `brand`    | `Nike`       | Filter to one brand                 |
| `category` | `Basketball` | Filter to one category              |
| `q`        | `air`        | Search product name and description |
| `sort`     | `price_asc`  | Order results (see valid values)    |

**Valid sort values:** `price_asc`, `price_desc`, `name_asc`, `name_desc`

See [`docs/catalog-api.md`](docs/catalog-api.md) for full request/response shapes and error codes.

---

## Design Patterns

These are the GoF and architectural patterns we applied, as covered in the EECS 4413 lectures and labs:

### MVC (Model–View–Controller)
This is the main architectural pattern from the course. The three layers are:
- **Model** = DAOs (`ProductDAO.js`, `CustomerDAO.js`) — the only files that touch SQL
- **View** = React pages (`CatalogPage.jsx`, `ProductDetailPage.jsx`, etc.)
- **Controller** = Express controllers (`catalogController.js`, `authController.js`) — receives the HTTP request, calls the right DAO, sends back JSON

The route files (`catalogRoutes.js`, `authRoutes.js`) sit in front of the controllers and just map URLs to the right function — same layout as the warehouse lab.

### DAO (Data Access Object)
From the warehouse lab: all SQL is isolated inside the `dao/` folder. Controllers never write SQL — they call a DAO function and get back a plain JavaScript object. This means if we ever change the database, we only touch one file.

We also use a `mapProduct(row)` helper inside the DAO to convert PostgreSQL's `snake_case` column names to camelCase before sending them to the frontend — same pattern from the lab.

### Strategy Pattern (GoF Behavioral)
**File:** `Frontend/src/utils/sortStrategies.js`

Each sorting option (price low-to-high, name A-Z, etc.) is a strategy object:
```js
{ key: 'price_asc', label: 'Price: Low to High' }
```
The `CatalogPage` dropdown maps over `SORT_STRATEGIES` — it doesn't care how sorting works, just which strategy is selected. On the backend, `SORT_MAP` in `ProductDAO.js` does the same thing: it maps the user's chosen key to the actual SQL `ORDER BY` clause, which also prevents SQL injection since raw user input never touches the query string directly.

### Observer Pattern (GoF Behavioral)
**File:** `Frontend/src/context/AuthContext.js`

From the design pattern lectures — a subject notifies all its observers when state changes. Here:
- `AuthProvider` is the **subject** — it holds the logged-in user object
- Any page that calls `useAuth()` is an **observer** — it re-renders automatically when the user logs in or out

This is why the navbar on `CatalogPage` and `ProductDetailPage` both update to show "Hi, Maya" the moment you log in, without us passing the user object through every component manually (prop-drilling).

### Singleton Pattern (GoF Creational)
**File:** `Backend/db/index.js`

We create one `pg.Pool` instance for the whole application and export it. Every DAO file imports this same pool — they never create their own database connections. This is the Singleton pattern: one shared instance, one point of control.

---

## Database Design

Tables in `01_schema.sql`:

```
brands              — brand_id (serial), name
categories          — category_id (serial), name
products            — product_id (VARCHAR PK), brand_id, category_id, name,
                      price_cents (INT), inventory_quantity, is_active (BOOL)
customers           — customer_id, first_name, last_name, email, password, is_admin
addresses           — linked to customers
payment_methods     — linked to customers
shopping_cart_items — customer_id + product_id + quantity
purchase_orders     — order header (customer, total, status)
order_items         — order lines (order_id + product_id + qty + price snapshot)
inventory_transactions — tracks stock movements
```

A few decisions worth noting:

- **`price_cents` is an INT, not a DECIMAL** — avoids floating-point rounding errors when doing math on money. We divide by 100 only when displaying: `(priceCents / 100).toFixed(2)`.
- **`product_id` is a VARCHAR** like `SNK-NIKE-DUNK` instead of a serial integer — makes URLs and seed data readable.
- **`is_active` boolean** — lets us "soft delete" a product (hide it from the store) without actually removing the row, which keeps old order history intact.
- **JOINs on every product query** — we join `brands` and `categories` so the API returns `"brand": "Nike"` instead of `"brand_id": 3`.

---

## Security Notes

Things we applied from the course to avoid common vulnerabilities:

- **Parameterized queries everywhere** — all user input goes through `$1, $2, ...` placeholders in `pg`. Never string-concatenated into SQL.
- **SORT_MAP whitelist** — `ORDER BY` can't be parameterized in PostgreSQL, so we validate the sort key against a hardcoded whitelist in `ProductDAO.js` before it touches the query.
- **Session cookies** — `express-session` manages login state server-side. The cookie just stores a session ID, not the user data itself.

---

## Environment Variables

Copy `.env.example` to `.env` to override the Docker defaults:

| Variable                | Default       | Notes                              |
|-------------------------|---------------|------------------------------------|
| `POSTGRES_DB`           | `sixoutside`  |                                    |
| `POSTGRES_USER`         | `admin`       |                                    |
| `POSTGRES_PASSWORD`     | `password`    | Change this in production          |
| `POSTGRES_PORT`         | `5432`        |                                    |
| `BACKEND_PORT`          | `5050`        |                                    |
| `SESSION_SECRET`        | *(required)*  | Any random string works locally    |
| `SESSION_COOKIE_SECURE` | `false`       | Set to `true` if deployed on HTTPS |

---

## What's Coming in Phase 3

The schema already has `shopping_cart_items`, `purchase_orders`, and `order_items` tables ready. Phase 3 will add:

- Add to Cart / view cart
- Checkout flow
- Order history
- Admin inventory management
