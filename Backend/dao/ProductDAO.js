const db = require('../db');

const APPROVED_PRODUCT_IDS = [
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
];

function mapProduct(row) {
  if (!row) return null;
  return {
    productId:         row.product_id,
    name:              row.name,
    model:             row.model,
    brand:             row.brand,
    category:          row.category,
    description:       row.description,
    colorway:          row.colorway,
    priceCents:        row.price_cents,
    inventoryQuantity: row.inventory_quantity,
    releaseYear:       row.release_year,
    sizeRange:         row.size_range,
    imageUrl:          row.image_url
  };
}

async function getAllProducts() {
  const result = await db.query(
    `SELECT
       p.product_id,
       p.name,
       p.model,
       b.name  AS brand,
       c.name  AS category,
       p.description,
       p.colorway,
       p.price_cents,
       p.inventory_quantity,
       p.release_year,
       p.size_range,
       p.image_url
     FROM products p
     JOIN brands     b ON b.brand_id    = p.brand_id
     JOIN categories c ON c.category_id = p.category_id
     WHERE p.is_active = TRUE
       AND p.product_id = ANY($1::text[])
     ORDER BY p.name ASC`,
    [APPROVED_PRODUCT_IDS]
  );
  return result.rows.map(mapProduct);
}

async function getProductById(productId) {
  const result = await db.query(
    `SELECT
       p.product_id,
       p.name,
       p.model,
       b.name  AS brand,
       c.name  AS category,
       p.description,
       p.colorway,
       p.price_cents,
       p.inventory_quantity,
       p.release_year,
       p.size_range,
       p.image_url
     FROM products p
     JOIN brands     b ON b.brand_id    = p.brand_id
     JOIN categories c ON c.category_id = p.category_id
     WHERE p.product_id = $1
       AND p.is_active = TRUE
       AND p.product_id = ANY($2::text[])`,
    [productId, APPROVED_PRODUCT_IDS]
  );
  return mapProduct(result.rows[0]);
}

const SORT_MAP = {
  price_asc:  'p.price_cents ASC',
  price_desc: 'p.price_cents DESC',
  name_asc:   'p.name ASC',
  name_desc:  'p.name DESC'
};

async function getProducts({ brand, category, q, sort } = {}) {
  const orderBy = SORT_MAP[sort] || 'p.name ASC';

  const values = [APPROVED_PRODUCT_IDS];
  const conditions = ['p.is_active = TRUE', 'p.product_id = ANY($1::text[])'];

  if (brand) {
    values.push(brand);
    conditions.push(`LOWER(b.name) = LOWER($${values.length})`);
  }

  if (category) {
    values.push(category);
    conditions.push(`LOWER(c.name) = LOWER($${values.length})`);
  }

  if (q) {
    values.push(`%${q}%`);
    conditions.push(
      `(p.name ILIKE $${values.length} OR p.description ILIKE $${values.length})`
    );
  }

  const where = conditions.join(' AND ');

  const result = await db.query(
    `SELECT
       p.product_id,
       p.name,
       p.model,
       b.name  AS brand,
       c.name  AS category,
       p.description,
       p.colorway,
       p.price_cents,
       p.inventory_quantity,
       p.release_year,
       p.size_range,
       p.image_url
     FROM products p
     JOIN brands     b ON b.brand_id    = p.brand_id
     JOIN categories c ON c.category_id = p.category_id
     WHERE ${where}
     ORDER BY ${orderBy}`,
    values
  );

  return result.rows.map(mapProduct);
}

// Returns every brand that has at least one active product
async function getDistinctBrands() {
  const result = await db.query(
    `SELECT DISTINCT b.name
     FROM brands b
     JOIN products p ON p.brand_id = b.brand_id
     WHERE p.is_active = TRUE
       AND p.product_id = ANY($1::text[])
     ORDER BY b.name ASC`,
    [APPROVED_PRODUCT_IDS]
  );
  return result.rows.map((r) => r.name);
}

// Returns every category that has at least one active product
async function getDistinctCategories() {
  const result = await db.query(
    `SELECT DISTINCT c.name
     FROM categories c
     JOIN products p ON p.category_id = c.category_id
     WHERE p.is_active = TRUE
       AND p.product_id = ANY($1::text[])
     ORDER BY c.name ASC`,
    [APPROVED_PRODUCT_IDS]
  );
  return result.rows.map((r) => r.name);
}

module.exports = {
  getAllProducts,
  getProductById,
  getProducts,
  getDistinctBrands,
  getDistinctCategories,
  VALID_SORT_KEYS: Object.keys(SORT_MAP)
};
