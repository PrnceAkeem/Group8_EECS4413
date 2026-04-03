# Phase 2 — Manual Smoke Test Checklist

Run these checks after starting the stack with `docker compose up --build` and opening the frontend at `http://localhost:3000`.

---

## 1. Catalog loads (public)

- [ ] Navigate to `/` or `/catalog`
- [ ] Product grid renders (should show ~25 products)
- [ ] Each card shows brand, name, category, and price formatted as `$X.XX`

---

## 2. Sort dropdown (Strategy pattern)

- [ ] Select **Price: Low to High** — cheapest shoes appear first
- [ ] Select **Price: High to Low** — most expensive appear first
- [ ] Select **Name: A to Z** — alphabetical order
- [ ] Select **Name: Z to A** — reverse alphabetical
- [ ] Refresh the page — sort selection is preserved in the URL (`?sort=price_asc`)

---

## 3. Brand filter

- [ ] Open the Brand dropdown in the sidebar, select **Nike**
- [ ] Only Nike products appear; count updates in the heading
- [ ] Select **Adidas** — only Adidas products appear
- [ ] Refresh the page — brand filter is preserved in the URL (`?brand=Nike`)

---

## 4. Audience tabs (category-style filter)

- [ ] Click top tabs: **New Arrivals**, **Men**, **Women**, **Kids**
- [ ] Product list updates per selected tab
- [ ] Selection is preserved in URL query param `?audience=...`

---

## 5. Search input

- [ ] Type `air` in the search box — only products with "air" in the name or description appear
- [ ] Clear the search — full product list returns
- [ ] Refresh the page — search term is preserved in the URL (`?q=air`)

---

## 6. Clear Filters button

- [ ] Apply any filter or sort
- [ ] A **Clear Filters** button appears at the bottom of the sidebar
- [ ] Click it — color/size/price/brand selections clear and full list returns for default tab
- [ ] URL resets to default audience (`?audience=new-arrivals`)

---

## 7. Product detail page (ProductDetailPage)

- [ ] Click **View Product** on any catalog card
- [ ] URL changes to `/catalog/SNK-NIKE-DUNK` (or whichever product)
- [ ] Product name, brand, category, price, description, colorway, year, and sizes are displayed
- [ ] **Back to Catalog** button returns to `/catalog`
- [ ] Navigate to a fake ID like `/catalog/FAKE-ID-999` — "Product not found" message appears with a back button

---

## 8. Authentication (Observer pattern via AuthContext)

- [ ] Click **Sign In**, log in with `maya@sixoutside.com` / `demo123`
- [ ] After login, navbar on `/catalog` shows **Hi, Maya** and a **Sign Out** button (no Sign In/Sign Up links)
- [ ] Same greeting appears on the product detail page — context is shared across both pages
- [ ] Click **Sign Out** — navbar reverts to Sign In / Sign Up

---

## 9. Auth — register flow

- [ ] Click **Sign Up**, fill in the form with a new email
- [ ] On success, a confirmation message appears

---

## 10. API error handling

- [ ] Stop the backend (`docker compose stop backend`) and refresh `/catalog`
- [ ] "Failed to load products. Please try again." message appears (not a blank screen)
- [ ] Restart the backend — catalog loads again

---

## 11. Docker compose

- [ ] `docker compose up --build` starts `db`, `backend`, and `frontend` without errors
- [ ] `GET http://localhost:5050/health` returns `{ status: "ok" }`
- [ ] `GET http://localhost:5050/api/catalog` returns a JSON array of products
- [ ] `GET http://localhost:5050/api/catalog/SNK-NIKE-DUNK` returns a single product object
- [ ] `GET http://localhost:5050/api/catalog?brand=Nike&sort=price_asc` returns only Nike products, cheapest first

---

_All checkboxes should be ticked before submitting Phase 2._
