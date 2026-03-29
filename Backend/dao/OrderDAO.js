const pool = require('../db');

function mapOrder(row) {
  if (!row) return null;

  return {
    orderId: row.order_id,
    customerId: row.customer_id,
    shippingAddressId: row.shipping_address_id,
    paymentMethodId: row.payment_method_id,
    orderStatus: row.order_status,
    paymentStatus: row.payment_status,
    subtotalCents: row.subtotal_cents,
    shippingCents: row.shipping_cents,
    taxCents: row.tax_cents,
    totalCents: row.total_cents,
    placedAt: row.placed_at
  };
}

function mapOrderItem(row) {
  if (!row) return null;

  return {
    orderItemId: row.order_item_id,
    orderId: row.order_id,
    productId: row.product_id,
    productName: row.product_name,
    unitPriceCents: row.unit_price_cents,
    quantity: row.quantity,
    lineTotalCents: row.line_total_cents
  };
}

async function getCartItemsForCheckout(client, customerId) {
  const query = `
    SELECT
      sci.product_id,
      sci.quantity,
      p.name,
      p.price_cents,
      p.inventory_quantity,
      p.is_active
    FROM shopping_cart_items sci
    JOIN products p
      ON sci.product_id = p.product_id
    WHERE sci.customer_id = $1
    ORDER BY sci.created_at ASC
  `;

  const result = await client.query(query, [customerId]);
  return result.rows;
}

async function validateCheckoutOwnership(
  client,
  customerId,
  shippingAddressId,
  paymentMethodId
) {
  const addressResult = await client.query(
    `
      SELECT address_id
      FROM addresses
      WHERE address_id = $1
        AND customer_id = $2
    `,
    [shippingAddressId, customerId]
  );

  if (addressResult.rows.length === 0) {
    const error = new Error('Shipping address does not belong to this customer.');
    error.statusCode = 400;
    throw error;
  }

  const paymentResult = await client.query(
    `
      SELECT payment_method_id
      FROM payment_methods
      WHERE payment_method_id = $1
        AND customer_id = $2
    `,
    [paymentMethodId, customerId]
  );

  if (paymentResult.rows.length === 0) {
    const error = new Error('Payment method does not belong to this customer.');
    error.statusCode = 400;
    throw error;
  }
}

async function createOrder({
  customerId,
  shippingAddressId,
  paymentMethodId,
  shippingCents = 0,
  taxRate = 0.13
}) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await validateCheckoutOwnership(
      client,
      customerId,
      shippingAddressId,
      paymentMethodId
    );

    const cartItems = await getCartItemsForCheckout(client, customerId);

    if (cartItems.length === 0) {
      const error = new Error('Cart is empty.');
      error.statusCode = 400;
      throw error;
    }

    for (const item of cartItems) {
      if (!item.is_active) {
        const error = new Error(`Product ${item.product_id} is inactive.`);
        error.statusCode = 400;
        throw error;
      }

      if (Number(item.quantity) > Number(item.inventory_quantity)) {
        const error = new Error(
          `Insufficient inventory for product ${item.product_id}.`
        );
        error.statusCode = 400;
        throw error;
      }
    }

    const subtotalCents = cartItems.reduce((sum, item) => {
      return sum + Number(item.price_cents) * Number(item.quantity);
    }, 0);

    const normalizedShippingCents = Number.parseInt(shippingCents, 10) || 0;
    const taxCents = Math.round(subtotalCents * taxRate);
    const totalCents = subtotalCents + normalizedShippingCents + taxCents;

    const insertOrderQuery = `
      INSERT INTO purchase_orders (
        customer_id,
        shipping_address_id,
        payment_method_id,
        order_status,
        payment_status,
        subtotal_cents,
        shipping_cents,
        tax_cents,
        total_cents
      )
      VALUES ($1, $2, $3, 'processing', 'approved', $4, $5, $6, $7)
      RETURNING
        order_id,
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
    `;

    const orderResult = await client.query(insertOrderQuery, [
      customerId,
      shippingAddressId,
      paymentMethodId,
      subtotalCents,
      normalizedShippingCents,
      taxCents,
      totalCents
    ]);

    const createdOrder = orderResult.rows[0];
    const createdItems = [];

    for (const item of cartItems) {
      const unitPriceCents = Number(item.price_cents);
      const quantity = Number(item.quantity);
      const lineTotalCents = unitPriceCents * quantity;

      const insertItemQuery = `
        INSERT INTO order_items (
          order_id,
          product_id,
          product_name,
          unit_price_cents,
          quantity,
          line_total_cents
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING
          order_item_id,
          order_id,
          product_id,
          product_name,
          unit_price_cents,
          quantity,
          line_total_cents
      `;

      const itemResult = await client.query(insertItemQuery, [
        createdOrder.order_id,
        item.product_id,
        item.name,
        unitPriceCents,
        quantity,
        lineTotalCents
      ]);

      createdItems.push(mapOrderItem(itemResult.rows[0]));

      const updateInventoryQuery = `
        UPDATE products
        SET
          inventory_quantity = inventory_quantity - $1,
          updated_at = NOW()
        WHERE product_id = $2
      `;

      await client.query(updateInventoryQuery, [quantity, item.product_id]);

      const insertInventoryTransactionQuery = `
        INSERT INTO inventory_transactions (
          product_id,
          change_amount,
          reason,
          related_order_id
        )
        VALUES ($1, $2, $3, $4)
      `;

      await client.query(insertInventoryTransactionQuery, [
        item.product_id,
        -quantity,
        'purchase',
        createdOrder.order_id
      ]);
    }

    await client.query(
      `
        DELETE FROM shopping_cart_items
        WHERE customer_id = $1
      `,
      [customerId]
    );

    await client.query('COMMIT');

    return {
      order: mapOrder(createdOrder),
      items: createdItems
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function getOrdersByCustomer(customerId) {
  const ordersResult = await pool.query(
    `
      SELECT
        order_id,
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
      FROM purchase_orders
      WHERE customer_id = $1
      ORDER BY placed_at DESC, order_id DESC
    `,
    [customerId]
  );

  return ordersResult.rows.map(mapOrder);
}

async function getOrderById(orderId, customerId) {
  const orderResult = await pool.query(
    `
      SELECT
        order_id,
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
      FROM purchase_orders
      WHERE order_id = $1
        AND customer_id = $2
    `,
    [orderId, customerId]
  );

  const order = mapOrder(orderResult.rows[0]);

  if (!order) {
    return null;
  }

  const itemsResult = await pool.query(
    `
      SELECT
        order_item_id,
        order_id,
        product_id,
        product_name,
        unit_price_cents,
        quantity,
        line_total_cents
      FROM order_items
      WHERE order_id = $1
      ORDER BY order_item_id ASC
    `,
    [orderId]
  );

  return {
    order,
    items: itemsResult.rows.map(mapOrderItem)
  };
}

module.exports = {
  createOrder,
  getOrdersByCustomer,
  getOrderById
};
