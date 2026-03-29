const db = require('../db');

function mapCustomerProfile(row) {
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

function mapAddress(row) {
  if (!row) return null;

  return {
    addressId: row.address_id,
    customerId: row.customer_id,
    label: row.label,
    recipientName: row.recipient_name,
    streetLine1: row.street_line1,
    streetLine2: row.street_line2,
    city: row.city,
    province: row.province,
    country: row.country,
    postalCode: row.postal_code,
    phone: row.phone,
    isDefaultShipping: row.is_default_shipping,
    isDefaultBilling: row.is_default_billing,
    createdAt: row.created_at
  };
}

function mapPaymentMethod(row) {
  if (!row) return null;

  return {
    paymentMethodId: row.payment_method_id,
    customerId: row.customer_id,
    billingAddressId: row.billing_address_id,
    cardholderName: row.cardholder_name,
    cardBrand: row.card_brand,
    cardLast4: row.card_last4,
    expiryMonth: row.expiry_month,
    expiryYear: row.expiry_year,
    isDefault: row.is_default,
    createdAt: row.created_at
  };
}

async function ensureAddressBelongsToCustomer(customerId, addressId) {
  if (addressId == null) return;

  const result = await db.query(
    `
      SELECT address_id
      FROM addresses
      WHERE address_id = $1
        AND customer_id = $2
    `,
    [addressId, customerId]
  );

  if (result.rows.length === 0) {
    const error = new Error('billingAddressId does not belong to this customer.');
    error.statusCode = 400;
    throw error;
  }
}

async function getProfile(customerId) {
  const customerResult = await db.query(
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

  const customer = mapCustomerProfile(customerResult.rows[0]);

  if (!customer) {
    return null;
  }

  const addressesResult = await db.query(
    `
      SELECT
        address_id,
        customer_id,
        label,
        recipient_name,
        street_line1,
        street_line2,
        city,
        province,
        country,
        postal_code,
        phone,
        is_default_shipping,
        is_default_billing,
        created_at
      FROM addresses
      WHERE customer_id = $1
      ORDER BY address_id ASC
    `,
    [customerId]
  );

  const paymentMethodsResult = await db.query(
    `
      SELECT
        payment_method_id,
        customer_id,
        billing_address_id,
        cardholder_name,
        card_brand,
        card_last4,
        expiry_month,
        expiry_year,
        is_default,
        created_at
      FROM payment_methods
      WHERE customer_id = $1
      ORDER BY payment_method_id ASC
    `,
    [customerId]
  );

  return {
    customer,
    addresses: addressesResult.rows.map(mapAddress),
    paymentMethods: paymentMethodsResult.rows.map(mapPaymentMethod)
  };
}

async function updateProfile(customerId, updates) {
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

  if (updates.dob !== undefined) {
    values.push(updates.dob);
    fields.push(`dob = $${values.length}`);
  }

  if (updates.phone !== undefined) {
    values.push(updates.phone);
    fields.push(`phone = $${values.length}`);
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

    return mapCustomerProfile(existingResult.rows[0]);
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

  return mapCustomerProfile(result.rows[0]);
}

async function upsertAddress(customerId, addressData) {
  const {
    addressId,
    label,
    recipientName,
    streetLine1,
    streetLine2 = null,
    city,
    province,
    country = 'Canada',
    postalCode,
    phone = null,
    isDefaultShipping = false,
    isDefaultBilling = false
  } = addressData;

  if (isDefaultShipping) {
    await db.query(
      `
        UPDATE addresses
        SET is_default_shipping = FALSE
        WHERE customer_id = $1
      `,
      [customerId]
    );
  }

  if (isDefaultBilling) {
    await db.query(
      `
        UPDATE addresses
        SET is_default_billing = FALSE
        WHERE customer_id = $1
      `,
      [customerId]
    );
  }

  if (addressId) {
    const result = await db.query(
      `
        UPDATE addresses
        SET
          label = $1,
          recipient_name = $2,
          street_line1 = $3,
          street_line2 = $4,
          city = $5,
          province = $6,
          country = $7,
          postal_code = $8,
          phone = $9,
          is_default_shipping = $10,
          is_default_billing = $11
        WHERE address_id = $12
          AND customer_id = $13
        RETURNING
          address_id,
          customer_id,
          label,
          recipient_name,
          street_line1,
          street_line2,
          city,
          province,
          country,
          postal_code,
          phone,
          is_default_shipping,
          is_default_billing,
          created_at
      `,
      [
        label,
        recipientName,
        streetLine1,
        streetLine2,
        city,
        province,
        country,
        postalCode,
        phone,
        isDefaultShipping,
        isDefaultBilling,
        addressId,
        customerId
      ]
    );

    return mapAddress(result.rows[0]);
  }

  const result = await db.query(
    `
      INSERT INTO addresses (
        customer_id,
        label,
        recipient_name,
        street_line1,
        street_line2,
        city,
        province,
        country,
        postal_code,
        phone,
        is_default_shipping,
        is_default_billing
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING
        address_id,
        customer_id,
        label,
        recipient_name,
        street_line1,
        street_line2,
        city,
        province,
        country,
        postal_code,
        phone,
        is_default_shipping,
        is_default_billing,
        created_at
    `,
    [
      customerId,
      label,
      recipientName,
      streetLine1,
      streetLine2,
      city,
      province,
      country,
      postalCode,
      phone,
      isDefaultShipping,
      isDefaultBilling
    ]
  );

  return mapAddress(result.rows[0]);
}

async function upsertPaymentMethod(customerId, paymentMethodData) {
  const {
    paymentMethodId,
    billingAddressId = null,
    cardholderName,
    cardBrand,
    cardLast4,
    expiryMonth,
    expiryYear,
    isDefault = false
  } = paymentMethodData;

  await ensureAddressBelongsToCustomer(customerId, billingAddressId);

  if (isDefault) {
    await db.query(
      `
        UPDATE payment_methods
        SET is_default = FALSE
        WHERE customer_id = $1
      `,
      [customerId]
    );
  }

  if (paymentMethodId) {
    const result = await db.query(
      `
        UPDATE payment_methods
        SET
          billing_address_id = $1,
          cardholder_name = $2,
          card_brand = $3,
          card_last4 = $4,
          expiry_month = $5,
          expiry_year = $6,
          is_default = $7
        WHERE payment_method_id = $8
          AND customer_id = $9
        RETURNING
          payment_method_id,
          customer_id,
          billing_address_id,
          cardholder_name,
          card_brand,
          card_last4,
          expiry_month,
          expiry_year,
          is_default,
          created_at
      `,
      [
        billingAddressId,
        cardholderName,
        cardBrand,
        cardLast4,
        expiryMonth,
        expiryYear,
        isDefault,
        paymentMethodId,
        customerId
      ]
    );

    return mapPaymentMethod(result.rows[0]);
  }

  const result = await db.query(
    `
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
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING
        payment_method_id,
        customer_id,
        billing_address_id,
        cardholder_name,
        card_brand,
        card_last4,
        expiry_month,
        expiry_year,
        is_default,
        created_at
    `,
    [
      customerId,
      billingAddressId,
      cardholderName,
      cardBrand,
      cardLast4,
      expiryMonth,
      expiryYear,
      isDefault
    ]
  );

  return mapPaymentMethod(result.rows[0]);
}

module.exports = {
  getProfile,
  updateProfile,
  upsertAddress,
  upsertPaymentMethod
};