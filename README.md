# 6ixOutside — EECS 4413 Group 8

Sneaker e-store built for the EECS 4413 (Building E-Commerce Systems) course at York University.

---

## How to Run

Make sure Docker Desktop is open, then from the project root:

**Mac / Linux:**
```bash
./start.sh
```

**Windows:**
```
start.bat
```
Double-click `start.bat` in File Explorer, or run it from CMD.

Or manually on any platform:

```bash
docker compose down --remove-orphans
docker compose up --build -d
```

The app runs at **http://localhost:5050**

Docker starts two containers:

| Container | What it does | Port |
|-----------|-------------|------|
| `db` | PostgreSQL — runs `01_schema.sql` then `02_seed.sql` on first start | 5432 |
| `backend` | Node/Express server — serves the API and all HTML pages | 5050 |

First boot creates all tables and seeds demo products automatically. No manual SQL needed.

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Customer | maya@sixoutside.com | demo123 |
| Admin | admin@sixoutside.com | admin123 |

---

## Project Structure

```
Group8_EECS4413/
├── Backend/
│   ├── server.js               — Entry point. Sets up Express, session, and all routes.
│   ├── db.js                   — Singleton PostgreSQL connection pool (shared by all DAOs)
│   ├── controllers/            — Handle HTTP requests, call DAOs, return JSON (same role as Servlets in labs)
│   ├── dao/                    — All SQL lives here (same role as JDBC DAO from Lab 6)
│   ├── routes/                 — Map URLs to controller functions (same role as web.xml mappings)
│   ├── middleware/             — requireAuth and requireAdmin guards
│   ├── services/               — PaymentService (simulates credit card processing)
│   └── db/init/
│       ├── 01_schema.sql       — Table definitions
│       └── 02_seed.sql         — Demo products and accounts
├── Frontend/
│   ├── catalog.html            — Browse and filter products (main/home page)
│   ├── product.html            — Single product detail view
│   ├── cart.html               — Shopping cart (login required)
│   ├── checkout.html           — Checkout with address and payment (login required)
│   ├── orders.html             — Order history (login required)
│   ├── profile.html            — Manage account, addresses, payment methods (login required)
│   ├── admin.html              — Admin panel — manage products, customers, orders (admin only)
│   ├── login.html              — Sign in page
│   ├── register.html           — Create account page
│   ├── css/                    — One CSS file per page + global.css for shared styles
│   └── assets/                 — Product images (named by product_id e.g. SNK-NIKE-AF1.jpg)
├── docker-compose.yml
├── start.sh
└── .env.example
```

---

## Architecture — Three-Tier (from Lab 3+)

The course introduced three-tier architecture as the standard structure for e-commerce systems.

| Tier | Lab equivalent | Our implementation |
|------|---------------|-------------------|
| Presentation | JSP views | HTML/CSS/JS pages in `Frontend/` |
| Logic | Servlets | Express controllers in `Backend/controllers/` |
| Data | MySQL + JDBC | PostgreSQL + `pg` library in `Backend/dao/` |

---

## Design Patterns Used

### MVC (Lab 5)
- **Model** — DAOs own all data access and SQL
- **View** — HTML pages render what the API returns
- **Controller** — Express controllers receive requests, call the right DAO, send back JSON

### DAO Pattern (Lab 6)
All SQL is inside DAO files. Controllers never write SQL directly. Uses `$1, $2` parameterized queries to prevent SQL injection — same idea as `?` placeholders with JDBC PreparedStatement.

### Session Tracking (Lab 4)
`express-session` is the direct equivalent of `HttpSession` from the lab. On login, `req.session.user` is set with the customer's ID, name, and role. The session ID travels as a cookie. Cart state, auth checks, and order placement all read from `req.session.user`.

### Singleton Pattern (GoF)
`Backend/db.js` creates one `pg.Pool` and exports it. Every DAO imports the same pool — they never open their own connections.

### Strategy Pattern (GoF)
Sort options (`price_asc`, `price_desc`, `name_asc`, `name_desc`) are validated against a fixed list in `ProductDAO.js`. The selected key maps to an SQL `ORDER BY` clause — user input never touches the query string directly.

---

## API Endpoints

### Auth — `/api/auth`

| Method | Path | What it does |
|--------|------|-------------|
| POST | `/register` | Create a new customer account |
| POST | `/login` | Log in, sets session cookie |
| POST | `/logout` | Destroy session and clear cookie |
| GET | `/me` | Return logged-in user from session (or 401) |

### Catalog — `/api/catalog`

| Method | Path | What it does |
|--------|------|-------------|
| GET | `/` | All active products. Supports `?brand=`, `?category=`, `?q=`, `?sort=` |
| GET | `/:id` | Single product by ID e.g. `SNK-NIKE-DUNK` |
| GET | `/brands` | List of distinct brands |
| GET | `/categories` | List of distinct categories |

### Cart — `/api/cart` (login required)

| Method | Path | What it does |
|--------|------|-------------|
| GET | `/` | Get all cart items + subtotal for current session |
| POST | `/` | Add item or update quantity. Body: `{ productId, quantity }` |
| POST | `/merge` | Merge guest localStorage cart on login. Body: `{ items: [{productId, quantity}] }` |
| PATCH | `/:productId` | Update quantity of one item. Body: `{ quantity }` |
| DELETE | `/:productId` | Remove one item from cart |

### Orders — `/api/orders` (login required)

| Method | Path | What it does |
|--------|------|-------------|
| POST | `/` | Place order from current cart. Body: `{ shippingAddressId, paymentMethodId }` |
| GET | `/` | List all orders for logged-in customer |
| GET | `/:id` | Get one order with its line items |

### Profile — `/api/profile` (login required)

| Method | Path | What it does |
|--------|------|-------------|
| GET | `/` | Get customer info, addresses, and payment methods |
| PATCH | `/` | Update name, dob, or phone |
| POST | `/address` | Add or update a shipping/billing address |
| POST | `/payment-method` | Add or update a saved payment method |

### Admin — `/api/admin` (admin login required)

| Method | Path | What it does |
|--------|------|-------------|
| GET | `/meta` | Returns all brands and categories (used to populate add-product form) |
| GET | `/orders` | List all orders. Supports `?customerId=`, `?status=`, `?from=`, `?to=` filters |
| GET | `/orders/:id/items` | Get line items for one order |
| GET | `/customers` | List all customers |
| PATCH | `/customers/:id` | Update customer name, email, or phone |
| GET | `/products` | List all products including inactive |
| POST | `/products` | Add a new product. Body: `{ name, brand, category, priceDollars, inventoryQuantity, colorway, imageUrl?, sizeRange?, releaseYear?, description? }` |
| PATCH | `/products/:id` | Update product details or inventory |

---

## Database Tables (from `01_schema.sql`)

| Table | Purpose |
|-------|---------|
| `brands` | Nike, Jordan, Adidas, Converse, New Balance |
| `categories` | Basketball, Running, Lifestyle, Trail Running, Skate |
| `products` | All shoe listings with inventory, price in cents, and image URL |
| `customers` | Registered users. `is_admin` flag separates admin from customer |
| `addresses` | Shipping/billing addresses linked to a customer |
| `payment_methods` | Saved cards (stores last 4 digits only, not full card number) |
| `shopping_cart_items` | Persistent cart rows: customer + product + quantity |
| `purchase_orders` | Order header: customer, total, status, shipping address used |
| `order_items` | Order lines: one row per product per order with price snapshot |
| `inventory_transactions` | Tracks every stock change in or out |

Price is stored as `INT` (cents) to avoid floating-point rounding errors. Display divides by 100: `(priceCents / 100).toFixed(2)`.

---

## Environment Variables

Copy `.env.example` to `.env` to override defaults:

| Variable | Default | Notes |
|----------|---------|-------|
| `POSTGRES_DB` | `sixoutsidedb` | |
| `POSTGRES_USER` | `sixoutside` | |
| `POSTGRES_PASSWORD` | `sixpassword` | |
| `BACKEND_PORT` | `5050` | |
| `SESSION_SECRET` | `change-me-before-production` | Any random string works locally |
| `SESSION_COOKIE_SECURE` | `false` | Set `true` if deployed over HTTPS |
