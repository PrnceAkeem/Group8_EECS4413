BEGIN;

CREATE TABLE IF NOT EXISTS brands (
  brand_id SERIAL PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS categories (
  category_id SERIAL PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS customers (
  customer_id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  dob DATE NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(25),
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_email_lower
  ON customers (LOWER(email));

CREATE TABLE IF NOT EXISTS addresses (
  address_id SERIAL PRIMARY KEY,
  customer_id INT NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
  label VARCHAR(50) NOT NULL DEFAULT 'home',
  recipient_name VARCHAR(120) NOT NULL,
  street_line1 VARCHAR(150) NOT NULL,
  street_line2 VARCHAR(150),
  city VARCHAR(80) NOT NULL,
  province VARCHAR(40) NOT NULL,
  country VARCHAR(60) NOT NULL DEFAULT 'Canada',
  postal_code VARCHAR(20) NOT NULL,
  phone VARCHAR(25),
  is_default_shipping BOOLEAN NOT NULL DEFAULT FALSE,
  is_default_billing BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_methods (
  payment_method_id SERIAL PRIMARY KEY,
  customer_id INT NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
  billing_address_id INT REFERENCES addresses(address_id) ON DELETE SET NULL,
  cardholder_name VARCHAR(120) NOT NULL,
  card_brand VARCHAR(40) NOT NULL,
  card_last4 VARCHAR(4) NOT NULL,
  expiry_month INT NOT NULL CHECK (expiry_month BETWEEN 1 AND 12),
  expiry_year INT NOT NULL CHECK (expiry_year >= 2024),
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  product_id VARCHAR(30) PRIMARY KEY,
  category_id INT NOT NULL REFERENCES categories(category_id),
  brand_id INT NOT NULL REFERENCES brands(brand_id),
  name VARCHAR(160) NOT NULL,
  model VARCHAR(120) NOT NULL,
  description TEXT NOT NULL,
  colorway VARCHAR(120) NOT NULL,
  price_cents INT NOT NULL CHECK (price_cents >= 0),
  inventory_quantity INT NOT NULL CHECK (inventory_quantity >= 0),
  release_year INT,
  size_range VARCHAR(40),
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

CREATE TABLE IF NOT EXISTS shopping_cart_items (
  cart_item_id SERIAL PRIMARY KEY,
  customer_id INT NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
  product_id VARCHAR(30) NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  quantity INT NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(customer_id, product_id)
);

CREATE TABLE IF NOT EXISTS purchase_orders (
  order_id SERIAL PRIMARY KEY,
  customer_id INT NOT NULL REFERENCES customers(customer_id),
  shipping_address_id INT REFERENCES addresses(address_id),
  payment_method_id INT REFERENCES payment_methods(payment_method_id),
  order_status VARCHAR(30) NOT NULL DEFAULT 'processing',
  payment_status VARCHAR(30) NOT NULL DEFAULT 'approved',
  subtotal_cents INT NOT NULL DEFAULT 0 CHECK (subtotal_cents >= 0),
  shipping_cents INT NOT NULL DEFAULT 0 CHECK (shipping_cents >= 0),
  tax_cents INT NOT NULL DEFAULT 0 CHECK (tax_cents >= 0),
  total_cents INT NOT NULL CHECK (total_cents >= 0),
  placed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_customer
  ON purchase_orders(customer_id);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_placed_at
  ON purchase_orders(placed_at);

CREATE TABLE IF NOT EXISTS order_items (
  order_item_id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES purchase_orders(order_id) ON DELETE CASCADE,
  product_id VARCHAR(30) NOT NULL REFERENCES products(product_id),
  product_name VARCHAR(160) NOT NULL,
  unit_price_cents INT NOT NULL CHECK (unit_price_cents >= 0),
  quantity INT NOT NULL CHECK (quantity > 0),
  line_total_cents INT NOT NULL CHECK (line_total_cents >= 0)
);

CREATE TABLE IF NOT EXISTS inventory_transactions (
  inventory_transaction_id SERIAL PRIMARY KEY,
  product_id VARCHAR(30) NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  change_amount INT NOT NULL,
  reason VARCHAR(120) NOT NULL,
  related_order_id INT REFERENCES purchase_orders(order_id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMIT;
