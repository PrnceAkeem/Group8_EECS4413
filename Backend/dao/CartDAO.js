const pool = require('../db');

async function getCartByCustomer(customerId) {
  const query = `
    SELECT
      sci.cart_item_id,
      sci.customer_id,
      sci.product_id,
      sci.quantity,
      sci.created_at,
      sci.updated_at,
      p.name,
      p.model,
      p.description,
      p.colorway,
      p.price_cents,
      p.inventory_quantity,
      p.size_range,
      p.image_url,
      p.is_active
    FROM shopping_cart_items sci
    JOIN products p
      ON sci.product_id = p.product_id
    WHERE sci.customer_id = $1
    ORDER BY sci.created_at ASC
  `;

  const result = await pool.query(query, [customerId]);
  return result.rows;
}

async function upsertItem(customerId, productId, quantity) {
  const query = `
    INSERT INTO shopping_cart_items (customer_id, product_id, quantity)
    VALUES ($1, $2, $3)
    ON CONFLICT (customer_id, product_id)
    DO UPDATE SET
      quantity = EXCLUDED.quantity,
      updated_at = NOW()
    RETURNING
      cart_item_id,
      customer_id,
      product_id,
      quantity,
      created_at,
      updated_at
  `;

  const result = await pool.query(query, [customerId, productId, quantity]);
  return result.rows[0];
}

async function removeItem(customerId, productId) {
  const query = `
    DELETE FROM shopping_cart_items
    WHERE customer_id = $1 AND product_id = $2
    RETURNING
      cart_item_id,
      customer_id,
      product_id,
      quantity
  `;

  const result = await pool.query(query, [customerId, productId]);
  return result.rows[0] || null;
}

async function clearCart(customerId) {
  const query = `
    DELETE FROM shopping_cart_items
    WHERE customer_id = $1
  `;

  await pool.query(query, [customerId]);
}

module.exports = {
  getCartByCustomer,
  upsertItem,
  removeItem,
  clearCart
};
