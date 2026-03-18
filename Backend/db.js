const { Pool } = require('pg');

function parseInteger(value, fallback) {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

const sslEnabled = process.env.DB_SSL === 'true';
const sharedPoolConfig = {
  max: parseInteger(process.env.DB_POOL_MAX, 10),
  idleTimeoutMillis: parseInteger(process.env.DB_IDLE_TIMEOUT_MS, 10000)
};

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: sslEnabled ? { rejectUnauthorized: false } : false,
      ...sharedPoolConfig
    })
  : new Pool({
      user: process.env.DB_USER || 'sixoutside',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'sixoutsidedb',
      password: process.env.DB_PASSWORD || 'sixpassword',
      port: parseInteger(process.env.DB_PORT, 5432),
      ssl: sslEnabled ? { rejectUnauthorized: false } : false,
      ...sharedPoolConfig
    });

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error);
});

module.exports = pool;
