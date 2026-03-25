# EECS 4413 — Group 8 Project (Winter 2025–2026)

**6ixOutside** — Sneakers & Streetwear E-Store

---

## What Is This?

This is our group project for EECS 4413: Building E-Commerce Systems at York University. We built a sneaker and streetwear store called **6ixOutside** that lets users browse, filter, and view shoes from Nike, Jordan, Adidas, Converse, and New Balance.

The course taught us how to build e-commerce systems using a **three-tier architecture** (covered from Lab 3 onward):

- **Presentation tier** — what the user sees (React frontend, same role as JSP views in the labs)
- **Logic tier** — business rules and request handling (Node.js + Express, same role as Servlets in the labs)
- **Data tier** — persistent storage (PostgreSQL, same role as MySQL/SQLite in Lab 6)

We chose a JavaScript/React stack instead of Java Servlets/JSP because the course spec allows any implementation language, but all the architectural patterns we apply come directly from the labs.

---

## Tech Stack

| Layer       | What We Used                       | Course Equivalent (from labs)                       |
|-------------|------------------------------------|-----------------------------------------------------|
| Frontend    | React 18, React Router v7, Axios   | HTML/CSS/JS (Lab 1), JSP views (Lab 5)              |
| Backend     | Node.js, Express 4                 | Java Servlets (Lab 3, 4, 5)                         |
| Database    | PostgreSQL 16 (`pg` library)       | MySQL / SQLite + JDBC (Lab 6)                       |
| Auth        | `express-session` + cookies        | HttpSession / Cookie tracking (Lab 4)               |
| Deployment  | Docker Compose                     | Course spec requirement — runnable on any machine   |

---

## How To Run It

### Step 1 — Start the backend and database (Docker)

Make sure Docker Desktop is open, then from the project root:

```bash
docker compose up --build
```

This starts two containers:

| Container  | What it does                                                      | Port |
|------------|-------------------------------------------------------------------|------|
| `db`       | PostgreSQL — runs `01_schema.sql` then `02_seed.sql` on startup   | 5432 |
| `backend`  | Node/Express REST API                                             | 5050 |

The first time you run it, Docker automatically creates all tables and inserts the demo products and accounts — no manual SQL needed.

### Step 2 — Start the React frontend

```bash
cd Frontend
npm install
npm start
```

Frontend opens at `http://localhost:3000`. It proxies all `/api/*` requests to the backend at port 5050 using the `"proxy"` field in `Frontend/package.json` — so we never hardcode the backend URL inside any component.

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
│   ├── server.js               # Entry point — sets up Express, mounts routes
│   ├── controllers/            # MVC Controllers (Lab 5 concept — same job as Servlets)
│   │   ├── authController.js   # register, login
│   │   └── catalogController.js# listProducts, getProduct, listBrands, listCategories
│   ├── dao/                    # Data Access Objects (Lab 6 pattern — isolates all SQL)
│   │   ├── CustomerDAO.js
│   │   └── ProductDAO.js
│   ├── routes/                 # Express routers — map URLs to controller functions
│   │   ├── authRoutes.js       # /api/auth/*
│   │   └── catalogRoutes.js    # /api/catalog/*
│   └── db/
│       └── init/
│           ├── 01_schema.sql   # Table definitions (brands, products, customers, orders...)
│           └── 02_seed.sql     # Demo products and accounts
├── Frontend/
│   └── src/
│       ├── App.js              # Root component — defines all client-side routes
│       ├── context/
│       │   └── AuthContext.js  # Observer pattern — shared login state across all pages
│       ├── pages/
│       │   ├── LandingPage.jsx
│       │   ├── CatalogPage.jsx         # Browse products, filter by brand/category, search
│       │   ├── ProductDetailPage.jsx   # Single product view with inventory status
│       │   ├── LoginPage.jsx
│       │   └── RegisterPage.jsx
│       ├── services/
│       │   └── catalogApi.js   # Axios wrapper — keeps fetch logic out of page components
│       └── utils/
│           └── sortStrategies.js  # Strategy pattern — each sort option as a swappable object
├── docs/
│   ├── catalog-api.md          # API contract (endpoints, params, response shapes, errors)
│   └── phase2-smoke-test.md    # Manual test checklist
└── docker-compose.yml
```

---

## API Reference

### Auth — `/api/auth`

| Method | Path        | Body                                              | Response              |
|--------|-------------|---------------------------------------------------|-----------------------|
| POST   | `/register` | `firstName, lastName, dob, email, password`       | `201` + customer info |
| POST   | `/login`    | `email, password`                                 | `200` + sets session cookie |

### Catalog — `/api/catalog`

| Method | Path          | Description                                          |
|--------|---------------|------------------------------------------------------|
| GET    | `/`           | All active products — supports filtering and sorting |
| GET    | `/:id`        | Single product by ID (e.g. `SNK-NIKE-DUNK`)          |
| GET    | `/brands`     | Distinct brands that have at least one active product |
| GET    | `/categories` | Distinct categories that have at least one active product |

**Query params for `GET /api/catalog`:**

| Param      | Example      | What it does                            |
|------------|--------------|-----------------------------------------|
| `brand`    | `Nike`       | Filter to one brand                     |
| `category` | `Basketball` | Filter to one category                  |
| `q`        | `air`        | Search product name and description     |
| `sort`     | `price_asc`  | Sort results (see valid values below)   |

**Valid sort values:** `price_asc`, `price_desc`, `name_asc`, `name_desc`

Full request/response contract in [`docs/catalog-api.md`](docs/catalog-api.md).

---

## Design Patterns & Architecture

All patterns below come from EECS 4413 course content. Where the lab used Java, we applied the same concept in JavaScript.

---

### Three-Tier Architecture
**Referenced throughout the course from Lab 3 onward.**

The course introduced three-tier architecture as the standard structure for e-commerce systems: a client layer, an application server layer, and a data layer, each with a clear boundary.

| Tier         | Lab equivalent         | Our implementation                  |
|--------------|------------------------|-------------------------------------|
| Presentation | HTML/CSS/JS, JSP views | React pages (CatalogPage, etc.)     |
| Logic        | Servlets               | Express controllers                 |
| Data         | MySQL + JDBC           | PostgreSQL + `pg` library           |

---

### MVC (Model–View–Controller)
**From Lab 5 — JSP and MVC pattern lab.**

Lab 5 introduced MVC using Servlets as controllers, JSP as views, and Java Beans as the model. We apply the same pattern:

- **Model** = DAOs (`ProductDAO.js`, `CustomerDAO.js`) — own all data access
- **View** = React pages — render the data returned by the API
- **Controller** = Express controllers (`catalogController.js`, `authController.js`) — receive HTTP requests, call the right DAO, return JSON

The route files sit in front of the controllers and map incoming URLs to the right function — the same role that Servlet URL mappings played in `web.xml`.

---

### DAO (Data Access Object)
**From Lab 6 — JDBC and DAO pattern lab.**

Lab 6 taught the DAO pattern: define a DAO interface, implement it with database-specific code (JDBC), and keep all SQL out of the controllers. This means if you swap databases, you only change one file.

We apply the same idea with Node.js:
- `ProductDAO.js` and `CustomerDAO.js` contain all SQL queries
- Controllers never write SQL — they call a DAO function and get back a plain object
- Each DAO has a `mapProduct(row)` / `mapCustomer(row)` helper that converts PostgreSQL's `snake_case` column names to camelCase before returning data — same as mapping a ResultSet to a Java Bean in the lab

In Lab 6, JDBC used `?` placeholders to prevent SQL injection. We use PostgreSQL's `$1, $2` parameterized syntax for the same reason.

---

### Session Tracking / Authentication
**From Lab 4 — Advanced Servlets, session tracking lab.**

Lab 4 covered three ways to track sessions: hidden fields, cookies, and `HttpSession`. We use the cookie + server session approach (`express-session`), which is the direct equivalent of `HttpSession` from the lab:

- On login, `authController.js` sets `req.session.user = { customerId, firstName, email, isAdmin }`
- The session is stored server-side; only a session ID is sent to the browser as a cookie
- This is the same model as `session.setAttribute("user", userObject)` in Lab 4

Lab 4 also introduced shopping cart state management using sessions — Phase 3 of our project will build on this using the `shopping_cart_items` table.

---

### Strategy Pattern (GoF Behavioral)
**From GoF design pattern lectures.**

Each sorting option is a strategy — a swappable object with a `key` and `label`:

```js
// Frontend/src/utils/sortStrategies.js
{ key: 'price_asc',  label: 'Price: Low to High' }
{ key: 'price_desc', label: 'Price: High to Low' }
```

`CatalogPage` maps over `SORT_STRATEGIES` to render the dropdown without knowing anything about the sorting logic. On the backend, `SORT_MAP` in `ProductDAO.js` maps the selected key to the actual SQL `ORDER BY` clause — this also prevents SQL injection since user input never touches the query string directly.

---

### Observer Pattern (GoF Behavioral)
**From GoF design pattern lectures.**

A subject notifies all observers when its state changes. In our app:

- `AuthContext.js` (`AuthProvider`) is the **subject** — it holds the logged-in user
- Any page that calls `useAuth()` is an **observer** — it re-renders automatically on login or logout

This is why the navbar on `CatalogPage` and `ProductDetailPage` both immediately update to "Hi, Maya" when you log in, without passing the user object through every component.

---

### Singleton Pattern (GoF Creational)
**From GoF design pattern lectures.**

`Backend/db/index.js` creates one `pg.Pool` instance and exports it. Every DAO imports this same pool — they never open their own connections. One instance, one point of control.

---

## Database Design

Tables defined in `Backend/db/init/01_schema.sql`:

```
brands              — brand_id (serial PK), name
categories          — category_id (serial PK), name
products            — product_id (VARCHAR PK), brand_id FK, category_id FK,
                      name, price_cents (INT), inventory_quantity, is_active BOOL
customers           — customer_id, first_name, last_name, email, password, is_admin
addresses           — linked to customers
payment_methods     — linked to customers
shopping_cart_items — customer_id + product_id + quantity  (ready for Phase 3)
purchase_orders     — order header (customer, total, status)
order_items         — order lines (order_id + product_id + qty + price snapshot)
inventory_transactions — tracks stock movements in/out
```

**Key design decisions:**

- **`price_cents` is INT, not DECIMAL** — avoids floating-point rounding errors when doing arithmetic on money. We divide by 100 only at display time: `(priceCents / 100).toFixed(2)`. This is the same principle as working with fixed-point numbers in financial systems.

- **`product_id` is VARCHAR** like `SNK-NIKE-DUNK` instead of a serial integer — makes URLs and seed data human-readable.

- **`is_active` boolean** — lets us "soft delete" a product (hide it from the store) without deleting the database row, which keeps old order history intact. Lab 6 introduced the idea of database-backed catalogs; this extends it with lifecycle management.

- **JOINs on every product query** — we join `brands` and `categories` so the API returns `"brand": "Nike"` instead of `"brand_id": 3`. In Lab 6 this was done with SQLite JOINs across BOOK, AUTHOR, and CATEGORY tables.

---

## Security Notes

Concepts applied from the course:

- **Parameterized queries** — all user input is passed through `$1, $2, ...` parameters in `pg`. Never string-concatenated into SQL. Lab 6 used `PreparedStatement` with `?` placeholders for the same reason.
- **SORT_MAP whitelist** — `ORDER BY` cannot be parameterized in SQL, so the sort key is validated against a hardcoded object before it touches any query string.
- **Server-side sessions** — `express-session` stores session data on the server. The browser only holds a session ID cookie, same as `HttpSession` in Lab 4.

---

## Environment Variables

Copy `.env.example` to `.env` to override Docker defaults:

| Variable                | Default       | Notes                               |
|-------------------------|---------------|-------------------------------------|
| `POSTGRES_DB`           | `sixoutside`  |                                     |
| `POSTGRES_USER`         | `admin`       |                                     |
| `POSTGRES_PASSWORD`     | `password`    | Change in production                |
| `POSTGRES_PORT`         | `5432`        |                                     |
| `BACKEND_PORT`          | `5050`        |                                     |
| `SESSION_SECRET`        | *(required)*  | Any random string works locally     |
| `SESSION_COOKIE_SECURE` | `false`       | Set `true` if deployed on HTTPS     |

---

## What's Coming in Phase 3

The schema already has `shopping_cart_items`, `purchase_orders`, and `order_items` tables ready to go. Phase 3 will add:

- **Shopping cart** — add/remove items, update quantities (builds on session tracking from Lab 4)
- **Checkout flow** — create an order from the cart
- **Order history** — logged-in users can view past orders
- **Admin inventory management** — update stock levels, manage products
