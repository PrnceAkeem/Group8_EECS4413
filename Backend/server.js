const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');

const pool = require('./db');
const authRoutes = require('./routes/authRoutes');
const catalogRoutes = require('./routes/catalogRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const profileRoutes = require('./routes/profileRoutes');
const adminRoutes = require('./routes/adminRoutes');

async function initDatabase() {
  const schema = fs.readFileSync(path.join(__dirname, 'db/init/01_schema.sql'), 'utf8');
  const seed   = fs.readFileSync(path.join(__dirname, 'db/init/02_seed.sql'),   'utf8');
  await pool.query(schema);
  await pool.query(seed);
  console.log('Database initialised.');
}

const app = express();
const PORT = Number.parseInt(process.env.PORT || '5050', 10);
const sessionMaxAgeMs = Number.parseInt(
  process.env.SESSION_MAX_AGE_MS || `${1000 * 60 * 30}`,
  10
);
const useSecureSessionCookie = process.env.SESSION_COOKIE_SECURE === 'true';

app.use(express.json());
app.use(cookieParser());


app.use(
  session({
    secret: process.env.SESSION_SECRET || 'sixoutside_dev_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: useSecureSessionCookie,
      sameSite: 'lax',
      maxAge: Number.isNaN(sessionMaxAgeMs) ? 1000 * 60 * 30 : sessionMaxAgeMs
    }
  })
);

app.use(express.static(path.join(__dirname, '..', 'Frontend')));

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'error',
      message: 'Database unavailable'
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found.'
  });
});

initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://0.0.0.0:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialise database:', err);
    process.exit(1);
  });
