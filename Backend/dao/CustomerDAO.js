const db = require('../db');

function mapCustomer(row) {
  if (!row) {
    return undefined;
  }

  return {
    customerId: row.customer_id,
    firstName: row.first_name,
    lastName: row.last_name,
    dob: row.dob,
    email: row.email,
    password: row.password,
    isAdmin: row.is_admin
  };
}

async function insertCustomer(firstName, lastName, dob, email, password) {
  const result = await db.query(
    `INSERT INTO customers (first_name, last_name, dob, email, password)
     VALUES ($1, $2, $3::date, $4, $5)
     RETURNING customer_id, first_name, last_name, dob, email, is_admin`,
    [firstName, lastName, dob, email, password]
  );

  return mapCustomer(result.rows[0]);
}

async function findByEmail(email) {
  const result = await db.query(
    `SELECT customer_id, first_name, last_name, dob, email, password, is_admin
     FROM customers
     WHERE LOWER(email) = LOWER($1)`,
    [email]
  );

  return mapCustomer(result.rows[0]);
}

module.exports = {
  insertCustomer,
  findByEmail
};
