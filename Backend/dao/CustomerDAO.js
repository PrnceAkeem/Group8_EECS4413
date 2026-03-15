//Pull in the database connection pool from db.js
const db = require('../db');

/*
INSERT a new customer into the database
Called when a user submits the Sign Up form
*/

async function insertCustomer(firstName, lastName, dob, email, password) {

  //$1, $2, $3... are placeholders — pg fills them in safely
  //This prevents SQL injection (someone typing SQL into your form fields)
  const result = await db.query(
    `INSERT INTO Customer (firstName, lastName, dob, email, password)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING customerID, firstName, email`,
    [firstName, lastName, dob, email, password]
  );

  return result.rows[0]; //PostgreSQL gives back the newly created row
} //rows[0] grabs the first (and only) row from the result


//FIND a customer by their email address
async function findByEmail(email) {

  const result = await db.query(
    `SELECT * FROM Customer WHERE email = $1`, //Called when a user submits the Sign In form
    [email]
  );

  //Returns the customer row if found, or undefined if no match
  return result.rows[0];
}

//Export both functions so the controller can call them
module.exports = { insertCustomer, findByEmail };
