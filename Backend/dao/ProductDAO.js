const db = require('../db');

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
     ORDER BY p.name ASC`
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
       AND p.is_active = TRUE`,
    [productId]
  );
  return mapProduct(result.rows[0]);
}

module.exports = {
  getAllProducts,
  getProductById
};
