BEGIN;

-- Keep only the approved Phase 2 catalog active.
-- Older teammate/test products stay in DB history but are hidden from the storefront.
UPDATE products
SET is_active = FALSE
WHERE product_id NOT IN (
  'SNK-NIKE-AF1',
  'SNK-NIKE-DUNK',
  'SNK-NIKE-AM90',
  'SNK-NIKE-AM95',
  'SNK-NIKE-V5',
  'SNK-JOR-AJ1',
  'SNK-JOR-AJ3',
  'SNK-JOR-RET7',
  'SNK-JOR-AJ11',
  'SNK-JOR-AJ12',
  'SNK-ADI-SAMBA',
  'SNK-ADI-GAZ',
  'SNK-ADI-CAMP',
  'SNK-ADI-SPEZ',
  'SNK-ADI-YZY',
  'SNK-CON-CTAS',
  'SNK-CON-C70',
  'SNK-CON-ONEST',
  'SNK-CON-RSH',
  'SNK-CON-SHAI',
  'SNK-NB-550',
  'SNK-NB-2002R',
  'SNK-NB-1906R',
  'SNK-NB-9060',
  'SNK-NB-530'
);

INSERT INTO brands (name)
VALUES
  ('Nike'),
  ('Jordan'),
  ('Adidas'),
  ('Converse'),
  ('New Balance')
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
  -- Nike (5)
  (
    'SNK-NIKE-AF1',
    (SELECT category_id FROM categories WHERE name = 'Lifestyle'),
    (SELECT brand_id FROM brands WHERE name = 'Nike'),
    'Air Force 1 Low',
    'Air Force 1',
    'The original basketball shoe turned streetwear staple. All-white leather upper with a perforated toe box.',
    'White / White',
    13000,
    40,
    2024,
    'US 6-14',
    -- 'https://placehold.co/600x400?text=Air+Force+1'
    'https://image-cdn.hypb.st/https%3A%2F%2Fhypebeast.com%2Fimage%2F2022%2F06%2Fnike-air-force-1-low-snkrs-day-dx2666-100-release-info-001.jpg?q=75&w=800&cbr=1&fit=max'
  ),
  (
    'SNK-NIKE-DUNK',
    (SELECT category_id FROM categories WHERE name = 'Lifestyle'),
    (SELECT brand_id FROM brands WHERE name = 'Nike'),
    'Dunk Low',
    'Dunk Low',
    'Court-inspired low-top with padded collar and iconic two-tone colorblocking.',
    'Panda (Black / White)',
    12000,
    28,
    2024,
    'US 6-13',
    -- 'https://placehold.co/600x400?text=Dunk+Low'
    'https://images.stockx.com/360/Nike-SB-Dunk-Low-Pro-Why-So-Sad/Images/Nike-SB-Dunk-Low-Pro-Why-So-Sad/Lv2/img01.jpg?w=480&q=60&dpr=1&updated_at=1667895818&h=320'
  ),
  (
    'SNK-NIKE-AM90',
    (SELECT category_id FROM categories WHERE name = 'Running'),
    (SELECT brand_id FROM brands WHERE name = 'Nike'),
    'Air Max 90',
    'Air Max 90',
    'Visible Air unit in the heel and waffle outsole. An icon since 1990.',
    'White / Wolf Grey',
    13000,
    20,
    2023,
    'US 7-13',
    -- 'https://placehold.co/600x400?text=Air+Max+90'
    'https://i.ebayimg.com/images/g/B3wAAOSw16hlFn-B/s-l400.jpg'
  ),
  (
    'SNK-NIKE-AM95',
    (SELECT category_id FROM categories WHERE name = 'Running'),
    (SELECT brand_id FROM brands WHERE name = 'Nike'),
    'Air Max 95',
    'Air Max 95',
    'Gradient mesh upper and full-length Air cushioning. A Toronto staple.',
    'Neon (Black / Neon Yellow)',
    17500,
    15,
    2024,
    'US 7-13',
    -- 'https://placehold.co/600x400?text=Air+Max+95'
    'https://static.nike.com/a/images/t_web_pw_592_v2/f_auto/u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/b8ff2462-46de-4db6-a295-245d956196ca/NIKE+AIR+MAX+95+BIG+BUBBLE.png'
  ),
  (
    'SNK-NIKE-V5',
    (SELECT category_id FROM categories WHERE name = 'Running'),
    (SELECT brand_id FROM brands WHERE name = 'Nike'),
    'Zoom Vomero 5',
    'Zoom Vomero 5',
    'Layered mesh upper with support cages and Zoom Air cushioning. Built for everyday wear.',
    'Photon Dust',
    21000,
    24,
    2023,
    'US 7-13',
    -- 'https://placehold.co/600x400?text=Vomero+5'
    'https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto,u_9ddf04c7-2a9a-4d76-add1-d15af8f0263d,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/2a5edc77-8dec-40c3-a7b7-13f5e1a1d00c/NIKE+V5+RNR.png'
  ),
  -- Jordan (5)
  (
    'SNK-JOR-AJ1',
    (SELECT category_id FROM categories WHERE name = 'Basketball'),
    (SELECT brand_id FROM brands WHERE name = 'Jordan'),
    'AJ1 Retro High OG',
    'Air Jordan 1',
    'The shoe that started it all. Premium leather panels, ankle collar, and unmistakable Wings logo.',
    'Chicago (Red / Black / White)',
    18000,
    18,
    2024,
    'US 7-13',
    -- 'https://placehold.co/600x400?text=Air+Jordan+1'
    'https://static.nike.com/a/images/w_1280,q_auto,f_auto/882c8d1f-2ff0-41ca-9d33-04438ab90473/air-jordan-1-low-og-chicago-hq6998-600-release-date.jpg'
  ),
  (
    'SNK-JOR-AJ3',
    (SELECT category_id FROM categories WHERE name = 'Basketball'),
    (SELECT brand_id FROM brands WHERE name = 'Jordan'),
    'AJ3 Retro',
    'Air Jordan 3',
    'Elephant print overlays, visible Air unit, and Jumpman logo. A sneaker culture classic.',
    'White / Cement Grey',
    20000,
    12,
    2024,
    'US 7-13',
    -- 'https://placehold.co/600x400?text=Air+Jordan+3'
    'https://snkrzgarden.com/cdn/shop/files/imagen_2025-03-14_124743783.png?v=1741952868&width=533'
  ),
  (
    'SNK-JOR-RET7',
    (SELECT category_id FROM categories WHERE name = 'Basketball'),
    (SELECT brand_id FROM brands WHERE name = 'Jordan'),
    'Jordan Retro 7',
    'Air Jordan 7',
    'Nubuck upper with vibrant color blocking and encapsulated Air in the heel.',
    'Chambray (Blue / White)',
    19000,
    10,
    2023,
    'US 7-13',
    -- 'https://placehold.co/600x400?text=Jordan+Retro+7'
    'https://m.media-amazon.com/images/I/61a-mhjiprL._AC_UY900_.jpg'
  ),
  (
    'SNK-JOR-AJ11',
    (SELECT category_id FROM categories WHERE name = 'Basketball'),
    (SELECT brand_id FROM brands WHERE name = 'Jordan'),
    'AJ11 Retro',
    'Air Jordan 11',
    'Patent leather mudguard, carbon fibre plate, and full-length Air sole. The cleanest Jordan ever made.',
    'Concord (Black / White)',
    22000,
    8,
    2023,
    'US 7-13',
    -- 'https://placehold.co/600x400?text=Air+Jordan+11'
    'https://ca.kith.com/cdn/shop/files/JBCT8012-104.jpg?v=1741870921&width=1920'
  ),
  (
    'SNK-JOR-AJ12',
    (SELECT category_id FROM categories WHERE name = 'Basketball'),
    (SELECT brand_id FROM brands WHERE name = 'Jordan'),
    'AJ12 Retro',
    'Air Jordan 12',
    'Quilted leather upper inspired by the Japanese rising sun flag. Zoom Air cushioning throughout.',
    'Taxi (Black / Yellow)',
    21000,
    9,
    2024,
    'US 7-13',
    -- 'https://placehold.co/600x400?text=Air+Jordan+12'
    'https://jdsports.ca/cdn/shop/files/CT8013-117_air_jordan_12_retro_white__black___taxi_4.jpg?v=1762338775&width=1200'
  ),
  -- Adidas (5)
  (
    'SNK-ADI-SAMBA',
    (SELECT category_id FROM categories WHERE name = 'Lifestyle'),
    (SELECT brand_id FROM brands WHERE name = 'Adidas'),
    'Samba OG',
    'Samba',
    'The terrace classic. Leather upper, gum sole, and T-toe construction. Originally a indoor football shoe.',
    'Cloud White / Core Black',
    10000,
    35,
    2024,
    'US 6-12',
    -- 'https://placehold.co/600x400?text=Samba+OG'
    'https://static.ilmalteselab.com/Adidas-Samba-Triple-Rose-Snk-_43A8448.webp'
  ),
  (
    'SNK-ADI-GAZ',
    (SELECT category_id FROM categories WHERE name = 'Lifestyle'),
    (SELECT brand_id FROM brands WHERE name = 'Adidas'),
    'Gazelle',
    'Gazelle',
    'Suede upper, flat gum sole, and Three Stripes branding. One of the most versatile silhouettes in the Adidas lineup.',
    'Bold Green / Cloud White',
    11000,
    22,
    2024,
    'US 6-12',
    -- 'https://placehold.co/600x400?text=Gazelle'
    'https://assets.adidas.com/images/c_fill,g_auto,w_1200,h_630,f_auto,q_auto/w_600,f_auto,q_auto/30796291304b4797bf57650571a6600a_9366/GAZELLE_ADV_Shoes_Brown_HQ7547_01_00_standard.jpg'
  ),
  (
    'SNK-ADI-CAMP',
    (SELECT category_id FROM categories WHERE name = 'Lifestyle'),
    (SELECT brand_id FROM brands WHERE name = 'Adidas'),
    'Campus 00s',
    'Campus 00s',
    'Chunky reissue of the 80s low-top. Suede upper with an oversized cupsole.',
    'Cloud White / Core Black',
    10000,
    30,
    2024,
    'US 6-12',
    -- 'https://placehold.co/600x400?text=Campus+00s'
    'https://assets.adidas.com/images/c_fill,g_auto,w_1200,h_630,f_auto,q_auto/w_600,f_auto,q_auto/4659ee058ba34bd2a5d0af500104c17d_9366/Campus_00s_Shoes_Black_HQ8708_01_standard.jpg'
  ),
  (
    'SNK-ADI-SPEZ',
    (SELECT category_id FROM categories WHERE name = 'Lifestyle'),
    (SELECT brand_id FROM brands WHERE name = 'Adidas'),
    'Handball Spezial',
    'Handball Spezial',
    'Slim suede upper with gum sole and contrast Three Stripes. Originally made for handball, now a street essential.',
    'Bold Blue / Cloud White',
    11000,
    18,
    2024,
    'US 6-12',
    -- 'https://placehold.co/600x400?text=Handball+Spezial'
    'https://www.svpsports.ca/cdn/shop/files/adidas---Unisex-Handball-Spezial-Shoes-_JS3867_-01.jpg?v=1771361014&width=2400'
  ),
  (
    'SNK-ADI-YZY',
    (SELECT category_id FROM categories WHERE name = 'Lifestyle'),
    (SELECT brand_id FROM brands WHERE name = 'Adidas'),
    'Yeezy Slide',
    'Yeezy Slide',
    'One-piece EVA foam slide with textured footbed. Minimal and comfortable.',
    'Bone',
    7000,
    50,
    2023,
    'US 5-14',
    -- 'https://placehold.co/600x400?text=Yeezy+Slide'
    'https://www.8pmshop.ca/cdn/shop/products/img01_a02d4b10-bab5-408c-8a92-153bf7f6e659.jpg?v=1589005596&width=1000'
  ),
  -- Converse (5)
  (
    'SNK-CON-CTAS',
    (SELECT category_id FROM categories WHERE name = 'Lifestyle'),
    (SELECT brand_id FROM brands WHERE name = 'Converse'),
    'Chuck Taylor All Star',
    'Chuck Taylor All Star',
    'The original canvas sneaker. Vulcanised sole, ankle patch, and a silhouette unchanged since 1917.',
    'Black',
    6500,
    60,
    2024,
    'US 4-13',
    -- 'https://placehold.co/600x400?text=Chuck+Taylor'
    'https://boathousestores.com/cdn/shop/files/CON-560845C-BLK-1.jpg?v=1773840598&width=1000'
  ),
  (
    'SNK-CON-C70',
    (SELECT category_id FROM categories WHERE name = 'Lifestyle'),
    (SELECT brand_id FROM brands WHERE name = 'Converse'),
    'Chuck 70',
    'Chuck 70',
    'Premium version of the All Star with a higher rubber foxing, ortholite insole, and reinforced canvas.',
    'Vintage White',
    8500,
    40,
    2024,
    'US 4-13',
    -- 'https://placehold.co/600x400?text=Chuck+70'
    'https://converse.ca/cdn/shop/files/162050C_162050C_A_107X1_694044a4-56b0-4d45-b19b-c92b45fb2fc1.jpg?v=1754070916&width=2048'
  ),
  (
    'SNK-CON-ONEST',
    (SELECT category_id FROM categories WHERE name = 'Skate'),
    (SELECT brand_id FROM brands WHERE name = 'Converse'),
    'One Star',
    'One Star',
    'Suede upper, single star logo, and flat vulcanised sole. A skate-influenced classic.',
    'Navy / White',
    7500,
    25,
    2023,
    'US 4-13',
    -- 'https://placehold.co/600x400?text=One+Star'
    'https://scene7.zumiez.com/is/image/zumiez/product_main_medium/Converse-One-Star-Pro-Black-%26-White-Suede-Skate-Shoes-_344519-front-US.jpg'
  ),
  (
    'SNK-CON-RSH',
    (SELECT category_id FROM categories WHERE name = 'Lifestyle'),
    (SELECT brand_id FROM brands WHERE name = 'Converse'),
    'Run Star Hike',
    'Run Star Hike',
    'Platform sole with bold chevron tread and canvas upper. The most aggressive silhouette in the Converse lineup.',
    'Black / White',
    11000,
    20,
    2023,
    'US 4-13',
    -- 'https://placehold.co/600x400?text=Run+Star+Hike'
    'https://cdn.shoplightspeed.com/shops/613683/files/57227044/1600x2048x2/run-star-hike-hi-leather-black-white-gum-cc060b-a0.jpg'
  ),
  (
    'SNK-CON-SHAI',
    (SELECT category_id FROM categories WHERE name = 'Basketball'),
    (SELECT brand_id FROM brands WHERE name = 'Converse'),
    'Shai 001',
    'Shai 001',
    'SGA''s signature shoe. Low-profile basketball build with suede overlays and Converse heritage detailing.',
    'Black / Egret',
    9500,
    16,
    2024,
    'US 6-14',
    -- 'https://placehold.co/600x400?text=Shai+001'
    'https://converse.ca/cdn/shop/files/A18977C_A_08X1_db5fce0c-2955-4930-a941-db0fe9457aae.png?v=1758037504&width=574'
  ),
  -- New Balance (5)
  (
    'SNK-NB-550',
    (SELECT category_id FROM categories WHERE name = 'Basketball'),
    (SELECT brand_id FROM brands WHERE name = 'New Balance'),
    '550',
    '550',
    'Court-to-street 80s basketball silhouette. Leather panelling and a clean low profile.',
    'White / Navy',
    11000,
    30,
    2024,
    'US 7-13',
    -- 'https://placehold.co/600x400?text=NB+550'
    'https://nb.scene7.com/is/image/NB/bb550ha1_nb_02_i?$pdpflexf2$&wid=440&hei=440'
  ),
  (
    'SNK-NB-2002R',
    (SELECT category_id FROM categories WHERE name = 'Lifestyle'),
    (SELECT brand_id FROM brands WHERE name = 'New Balance'),
    '2002R',
    '2002R',
    'Retro running silhouette with suede overlays, N logo, and ABZORB cushioning.',
    'Grey / Silver',
    15000,
    18,
    2023,
    'US 7-13',
    -- 'https://placehold.co/600x400?text=NB+2002R'
    'https://media-www.sportchek.ca/product/div-05-footwear/dpt-80-footwear/sdpt-01-mens/334152349/new-balance-2002r-grey-white-823-m-5e774340-3668-4226-b11e-04fdcf7a22c2-jpgrendition.jpg'
  ),
  (
    'SNK-NB-1906R',
    (SELECT category_id FROM categories WHERE name = 'Running'),
    (SELECT brand_id FROM brands WHERE name = 'New Balance'),
    '1906R',
    '1906R',
    'Protection Pack-inspired silhouette with ACTEVA midsole and 3M reflective detailing.',
    'Sea Salt / Teal',
    16000,
    15,
    2023,
    'US 7-13',
    -- 'https://placehold.co/600x400?text=NB+1906R'
    'https://www.mytheresa.com/image/1094/1238/100/88/P00919155.jpg'
  ),
  (
    'SNK-NB-9060',
    (SELECT category_id FROM categories WHERE name = 'Lifestyle'),
    (SELECT brand_id FROM brands WHERE name = 'New Balance'),
    '9060',
    '9060',
    'Dad-shoe silhouette with chunky midsole, suede/mesh panelling, and premium materials throughout.',
    'Rain Cloud / Grey',
    17000,
    14,
    2024,
    'US 7-13',
    -- 'https://placehold.co/600x400?text=NB+9060'
    'https://nb.scene7.com/is/image/NB/u9060493_nb_02_i?$pdpflexf2$&wid=440&hei=440'
  ),
  (
    'SNK-NB-530',
    (SELECT category_id FROM categories WHERE name = 'Running'),
    (SELECT brand_id FROM brands WHERE name = 'New Balance'),
    '530',
    '530',
    'Lightweight mesh runner with ABZORB cushioning. Retro look at an accessible price.',
    'White / Silver / Blue',
    10000,
    35,
    2024,
    'US 7-13',
    -- 'https://placehold.co/600x400?text=NB+530'
    'https://nb.scene7.com/is/image/NB/u530csb_nb_02_i?$pdpflexf2$&wid=440&hei=440'
  )
ON CONFLICT (product_id) DO UPDATE
SET
  category_id = EXCLUDED.category_id,
  brand_id = EXCLUDED.brand_id,
  name = EXCLUDED.name,
  model = EXCLUDED.model,
  description = EXCLUDED.description,
  colorway = EXCLUDED.colorway,
  price_cents = EXCLUDED.price_cents,
  inventory_quantity = EXCLUDED.inventory_quantity,
  release_year = EXCLUDED.release_year,
  size_range = EXCLUDED.size_range,
  image_url = EXCLUDED.image_url,
  is_active = TRUE;

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
    ('SNK-NIKE-DUNK', 1)
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
    ('SNK-NIKE-DUNK', -1, 'seeded sample order')
) AS movement(product_id, change_amount, reason) ON TRUE
JOIN products p ON p.product_id = movement.product_id
WHERE c.email = 'maya@sixoutside.com'
  AND NOT EXISTS (
    SELECT 1
    FROM inventory_transactions it
    WHERE it.related_order_id = po.order_id
  );

COMMIT;
