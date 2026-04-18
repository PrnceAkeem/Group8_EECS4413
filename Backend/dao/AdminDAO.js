const db = require('../db');

function mapAdminOrder(row) {
  if (!row) return null;

  return {
    orderId: row.order_id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
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

function mapAdminCustomer(row) {
  if (!row) return null;

  return {
    customerId: row.customer_id,
    firstName: row.first_name,
    lastName: row.last_name,
    dob: row.dob,
    email: row.email,
    phone: row.phone,
    isAdmin: row.is_admin,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapAdminProduct(row) {
  if (!row) return null;

  return {
    productId: row.product_id,
    name: row.name,
    model: row.model,
    description: row.description,
    colorway: row.colorway,
    priceCents: row.price_cents,
    inventoryQuantity: row.inventory_quantity,
    releaseYear: row.release_year,
    sizeRange: row.size_range,
    brandId: row.brand_id,
    brandName: row.brand_name,
    categoryId: row.category_id,
    categoryName: row.category_name,
    imageUrl: row.image_url,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function getAllOrders(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.status !== undefined && filters.status !== '') {
    values.push(filters.status);
    conditions.push(`po.order_status = $${values.length}`);
  }

  if (filters.customerId !== undefined && filters.customerId !== '') {
    values.push(filters.customerId);
    conditions.push(`po.customer_id = $${values.length}`);
  }

  if (filters.paymentStatus !== undefined && filters.paymentStatus !== '') {
    values.push(filters.paymentStatus);
    conditions.push(`po.payment_status = $${values.length}`);
  }

  if (filters.productId !== undefined && filters.productId !== '') {
    values.push(filters.productId);
    conditions.push(`
      EXISTS (
        SELECT 1
        FROM order_items oi
        WHERE oi.order_id = po.order_id
          AND oi.product_id = $${values.length}
      )
    `);
  }

  const from = filters.from ?? filters.dateFrom;
  const to = filters.to ?? filters.dateTo;

  if (from !== undefined && from !== '') {
    values.push(from);
    conditions.push(`po.placed_at >= $${values.length}::timestamptz`);
  }

  if (to !== undefined && to !== '') {
    values.push(to);
    conditions.push(`po.placed_at <= $${values.length}::timestamptz`);
  }

  const whereClause =
    conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

  const result = await db.query(
    `
      SELECT
        po.order_id,
        po.customer_id,
        CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
        c.email AS customer_email,
        po.shipping_address_id,
        po.payment_method_id,
        po.order_status,
        po.payment_status,
        po.subtotal_cents,
        po.shipping_cents,
        po.tax_cents,
        po.total_cents,
        po.placed_at
      FROM purchase_orders po
      JOIN customers c
        ON po.customer_id = c.customer_id
      ${whereClause}
      ORDER BY po.placed_at DESC, po.order_id DESC
    `,
    values
  );

  return result.rows.map(mapAdminOrder);
}

async function getAllCustomers() {
  const result = await db.query(
    `
      SELECT
        customer_id,
        first_name,
        last_name,
        dob,
        email,
        phone,
        is_admin,
        created_at,
        updated_at
      FROM customers
      ORDER BY customer_id ASC
    `
  );

  return result.rows.map(mapAdminCustomer);
}

async function updateCustomer(customerId, updates) {
  const fields = [];
  const values = [];

  if (updates.firstName !== undefined) {
    values.push(updates.firstName);
    fields.push(`first_name = $${values.length}`);
  }

  if (updates.lastName !== undefined) {
    values.push(updates.lastName);
    fields.push(`last_name = $${values.length}`);
  }

  if (updates.email !== undefined) {
    values.push(updates.email);
    fields.push(`email = $${values.length}`);
  }

  if (updates.phone !== undefined) {
    values.push(updates.phone);
    fields.push(`phone = $${values.length}`);
  }

  if (updates.isAdmin !== undefined) {
    values.push(updates.isAdmin);
    fields.push(`is_admin = $${values.length}`);
  }

  if (fields.length === 0) {
    const existingResult = await db.query(
      `
        SELECT
          customer_id,
          first_name,
          last_name,
          dob,
          email,
          phone,
          is_admin,
          created_at,
          updated_at
        FROM customers
        WHERE customer_id = $1
      `,
      [customerId]
    );

    return mapAdminCustomer(existingResult.rows[0]);
  }

  values.push(customerId);

  const result = await db.query(
    `
      UPDATE customers
      SET
        ${fields.join(', ')},
        updated_at = NOW()
      WHERE customer_id = $${values.length}
      RETURNING
        customer_id,
        first_name,
        last_name,
        dob,
        email,
        phone,
        is_admin,
        created_at,
        updated_at
    `,
    values
  );

  return mapAdminCustomer(result.rows[0]);
}

async function getAllProducts() {
  const result = await db.query(
    `
      SELECT
        p.product_id,
        p.name,
        p.model,
        p.description,
        p.colorway,
        p.price_cents,
        p.inventory_quantity,
        p.release_year,
        p.size_range,
        p.brand_id,
        b.name AS brand_name,
        p.category_id,
        c.name AS category_name,
        p.image_url,
        p.is_active,
        p.created_at,
        p.updated_at
      FROM products p
      LEFT JOIN brands b
        ON p.brand_id = b.brand_id
      LEFT JOIN categories c
        ON p.category_id = c.category_id
      ORDER BY p.name ASC, p.product_id ASC
    `
  );

  return result.rows.map(mapAdminProduct);
}

async function getProductById(productId) {
  const result = await db.query(
    `
      SELECT
        p.product_id,
        p.name,
        p.model,
        p.description,
        p.colorway,
        p.price_cents,
        p.inventory_quantity,
        p.release_year,
        p.size_range,
        p.brand_id,
        b.name AS brand_name,
        p.category_id,
        c.name AS category_name,
        p.image_url,
        p.is_active,
        p.created_at,
        p.updated_at
      FROM products p
      LEFT JOIN brands b
        ON p.brand_id = b.brand_id
      LEFT JOIN categories c
        ON p.category_id = c.category_id
      WHERE p.product_id = $1
    `,
    [productId]
  );

  return mapAdminProduct(result.rows[0]);
}

async function updateProduct(productId, updates) {
  const fields = [];
  const values = [];

  if (updates.name !== undefined) {
    values.push(updates.name);
    fields.push(`name = $${values.length}`);
  }

  if (updates.model !== undefined) {
    values.push(updates.model);
    fields.push(`model = $${values.length}`);
  }

  if (updates.description !== undefined) {
    values.push(updates.description);
    fields.push(`description = $${values.length}`);
  }

  if (updates.colorway !== undefined) {
    values.push(updates.colorway);
    fields.push(`colorway = $${values.length}`);
  }

  if (updates.priceCents !== undefined) {
    values.push(updates.priceCents);
    fields.push(`price_cents = $${values.length}`);
  }

  if (updates.inventoryQuantity !== undefined) {
    values.push(updates.inventoryQuantity);
    fields.push(`inventory_quantity = $${values.length}`);
  }

  if (updates.releaseYear !== undefined) {
    values.push(updates.releaseYear);
    fields.push(`release_year = $${values.length}`);
  }

  if (updates.sizeRange !== undefined) {
    values.push(updates.sizeRange);
    fields.push(`size_range = $${values.length}`);
  }

  if (updates.brandId !== undefined) {
    values.push(updates.brandId);
    fields.push(`brand_id = $${values.length}`);
  }

  if (updates.categoryId !== undefined) {
    values.push(updates.categoryId);
    fields.push(`category_id = $${values.length}`);
  }

  if (updates.imageUrl !== undefined) {
    values.push(updates.imageUrl);
    fields.push(`image_url = $${values.length}`);
  }

  if (updates.isActive !== undefined) {
    values.push(updates.isActive);
    fields.push(`is_active = $${values.length}`);
  }

  if (fields.length === 0) {
    return getProductById(productId);
  }

  values.push(productId);

  const result = await db.query(
    `
      UPDATE products
      SET
        ${fields.join(', ')},
        updated_at = NOW()
      WHERE product_id = $${values.length}
      RETURNING product_id
    `,
    values
  );

  if (!result.rows[0]) {
    return null;
  }

  return getProductById(productId);
}

async function createProduct(productData) {
  const {
    productId,
    name,
    model,
    description = null,
    colorway,
    priceCents,
    inventoryQuantity,
    releaseYear = null,
    sizeRange = null,
    brandId,
    categoryId,
    imageUrl = null,
    isActive = true
  } = productData;

  await db.query(
    `
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
        image_url,
        is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `,
    [
      productId,
      categoryId,
      brandId,
      name,
      model,
      description,
      colorway,
      priceCents,
      inventoryQuantity,
      releaseYear,
      sizeRange,
      imageUrl,
      isActive
    ]
  );

  return getProductById(productId);
}

async function getOrderItems(orderId) {
  const result = await db.query(
    `SELECT
       oi.order_item_id,
       oi.order_id,
       oi.product_id,
       p.name AS product_name,
       oi.unit_price_cents,
       oi.quantity,
       (oi.unit_price_cents * oi.quantity) AS line_total_cents
     FROM order_items oi
     JOIN products p ON p.product_id = oi.product_id
     WHERE oi.order_id = $1
     ORDER BY oi.order_item_id ASC`,
    [orderId]
  );
  return result.rows.map(row => ({
    orderItemId:    row.order_item_id,
    productId:      row.product_id,
    productName:    row.product_name,
    unitPriceCents: row.unit_price_cents,
    quantity:       row.quantity,
    lineTotalCents: row.line_total_cents
  }));
}

module.exports = {
  getAllOrders,
  getAllCustomers,
  updateCustomer,
  getAllProducts,
  updateProduct,
  createProduct,
  getProductById,
  getOrderItems
};
