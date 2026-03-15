//Pull in the pg package so Node can talk to PostgreSQL
const { Pool } = require('pg');

//Connection pool
const pool = new Pool({
  user: 'sixoutside',
  host: 'localhost',
  database: 'sixoutsidedb',
  password: 'sixpassword',
  port: 5432
});

//Export the pool so any other file can use it to query the database
module.exports = pool;