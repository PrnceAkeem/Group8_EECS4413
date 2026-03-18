BEGIN;

INSERT INTO brands (name)
VALUES
  ('Nike'),
  ('Adidas'),
  ('New Balance'),
  ('ASICS'),
  ('Salomon')
ON CONFLICT (name) DO NOTHING;

INSERT INTO categories (name)
VALUES
  ('Basketball'),
  ('Running'),
  ('Lifestyle'),
  ('Trail Running'),
  ('Skate')
ON CONFLICT (name) DO NOTHING;

INSERT INTO products (
  product_id,
  category_id,
  brand_id,
  name,
  model,
  description,
  colorway,
  price_cents,
  inventory_quantity,
  release_year,
  size_range,
  image_url
)
VALUES
  (
    'SNK-NIKE-AJ1',
    (SELECT category_id FROM categories WHERE name = 'Basketball'),
    (SELECT brand_id FROM brands WHERE name = 'Nike'),
    'Air Jordan 1 Retro High OG',
    'Air Jordan 1',
    'Classic high-top sneaker with premium leather panels and all-day lifestyle appeal.',
    'Chicago',
    23500,
    18,
    2024,
    'US 7-13',
    'https://placehold.co/600x400?text=Air+Jordan+1'
  ),
  (
    'SNK-NIKE-V5',
    (SELECT category_id FROM categories WHERE name = 'Running'),
    (SELECT brand_id FROM brands WHERE name = 'Nike'),
    'Nike Zoom Vomero 5',
    'Zoom Vomero 5',
    'Mesh runner with layered support cages and cushioned everyday comfort.',
    'Photon Dust',
    21000,
    24,
    2023,
    'US 7-13',
    'https://placehold.co/600x400?text=Vomero+5'
  ),
  (
    'SNK-ADI-SAMBA',
    (SELECT category_id FROM categories WHERE name = 'Lifestyle'),
    (SELECT brand_id FROM brands WHERE name = 'Adidas'),
    'Adidas Samba OG',
    'Samba',
    'Low-profile terrace classic with gum sole and leather upper.',
    'Cloud White / Core Black',
    15000,
    30,
    2024,
    'US 6-12',
    'https://placehold.co/600x400?text=Samba+OG'
  ),
  (
    'SNK-NB-2002R',
    (SELECT category_id FROM categories WHERE name = 'Lifestyle'),
    (SELECT brand_id FROM brands WHERE name = 'New Balance'),
    'New Balance 2002R',
    '2002R',
    'Retro running silhouette with suede overlays and ABZORB cushioning.',
    'Grey',
    19500,
    16,
    2023,
    'US 7-13',
    'https://placehold.co/600x400?text=NB+2002R'
  ),
  (
    'SNK-ASC-K14',
    (SELECT category_id FROM categories WHERE name = 'Running'),
    (SELECT brand_id FROM brands WHERE name = 'ASICS'),
    'ASICS GEL-KAYANO 14',
    'GEL-KAYANO 14',
    'Performance-inspired runner with metallic overlays and GEL cushioning.',
    'Cream / Black',
    21000,
    14,
    2024,
    'US 7-13',
    'https://placehold.co/600x400?text=GEL-KAYANO+14'
  ),
  (
    'SNK-SAL-XT6',
    (SELECT category_id FROM categories WHERE name = 'Trail Running'),
    (SELECT brand_id FROM brands WHERE name = 'Salomon'),
    'Salomon XT-6',
    'XT-6',
    'Trail-ready technical shoe with aggressive outsole and quicklace system.',
    'Black / Lunar Rock',
    26000,
    10,
    2024,
    'US 7-12',
    'https://placehold.co/600x400?text=Salomon+XT-6'
  )
ON CONFLICT (product_id) DO NOTHING;

INSERT INTO customers (
  first_name,
  last_name,
  dob,
  email,
  password,
  phone,
  is_admin
)
VALUES
  ('Maya', 'Chen', '2001-05-12', 'maya@sixoutside.com', 'demo123', '647-555-0142', FALSE),
  ('Admin', 'User', '1998-02-20', 'admin@sixoutside.com', 'admin123', '416-555-0199', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO addresses (
  customer_id,
  label,
  recipient_name,
  street_line1,
  city,
  province,
  country,
  postal_code,
  phone,
  is_default_shipping,
  is_default_billing
)
SELECT
  customer_id,
  'home',
  'Maya Chen',
  '215 Queen St W',
  'Toronto',
  'ON',
  'Canada',
  'M5V 1Z4',
  '647-555-0142',
  TRUE,
  TRUE
FROM customers
WHERE email = 'maya@sixoutside.com'
  AND NOT EXISTS (
    SELECT 1
    FROM addresses
    WHERE customer_id = customers.customer_id
      AND label = 'home'
  );

INSERT INTO payment_methods (
  customer_id,
  billing_address_id,
  cardholder_name,
  card_brand,
  card_last4,
  expiry_month,
  expiry_year,
  is_default
)
SELECT
  c.customer_id,
  a.address_id,
  'Maya Chen',
  'Visa',
  '4242',
  10,
  2028,
  TRUE
FROM customers c
JOIN addresses a ON a.customer_id = c.customer_id
WHERE c.email = 'maya@sixoutside.com'
  AND a.is_default_billing = TRUE
  AND NOT EXISTS (
    SELECT 1
    FROM payment_methods pm
    WHERE pm.customer_id = c.customer_id
      AND pm.card_last4 = '4242'
  );

INSERT INTO purchase_orders (
  customer_id,
  shipping_address_id,
  payment_method_id,
  order_status,
  payment_status,
  subtotal_cents,
  shipping_cents,
  tax_cents,
  total_cents,
  placed_at
)
SELECT
  c.customer_id,
  a.address_id,
  pm.payment_method_id,
  'completed',
  'approved',
  36000,
  1200,
  4680,
  41880,
  NOW() - INTERVAL '10 days'
FROM customers c
JOIN addresses a ON a.customer_id = c.customer_id AND a.is_default_shipping = TRUE
JOIN payment_methods pm ON pm.customer_id = c.customer_id AND pm.is_default = TRUE
WHERE c.email = 'maya@sixoutside.com'
  AND NOT EXISTS (
    SELECT 1
    FROM purchase_orders po
    WHERE po.customer_id = c.customer_id
  );

INSERT INTO order_items (
  order_id,
  product_id,
  product_name,
  unit_price_cents,
  quantity,
  line_total_cents
)
SELECT
  po.order_id,
  p.product_id,
  p.name,
  p.price_cents,
  item.quantity,
  p.price_cents * item.quantity
FROM purchase_orders po
JOIN customers c ON c.customer_id = po.customer_id
JOIN (
  VALUES
    ('SNK-ADI-SAMBA', 1),
    ('SNK-NIKE-V5', 1)
) AS item(product_id, quantity) ON TRUE
JOIN products p ON p.product_id = item.product_id
WHERE c.email = 'maya@sixoutside.com'
  AND NOT EXISTS (
    SELECT 1
    FROM order_items oi
    WHERE oi.order_id = po.order_id
  );

INSERT INTO inventory_transactions (
  product_id,
  change_amount,
  reason,
  related_order_id
)
SELECT
  p.product_id,
  movement.change_amount,
  movement.reason,
  po.order_id
FROM purchase_orders po
JOIN customers c ON c.customer_id = po.customer_id
JOIN (
  VALUES
    ('SNK-ADI-SAMBA', -1, 'seeded sample order'),
    ('SNK-NIKE-V5', -1, 'seeded sample order')
) AS movement(product_id, change_amount, reason) ON TRUE
JOIN products p ON p.product_id = movement.product_id
WHERE c.email = 'maya@sixoutside.com'
  AND NOT EXISTS (
    SELECT 1
    FROM inventory_transactions it
    WHERE it.related_order_id = po.order_id
  );

COMMIT;
