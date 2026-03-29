const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const pool = require('./db');
const authRoutes = require('./routes/authRoutes');
const catalogRoutes = require('./routes/catalogRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const profileRoutes = require('./routes/profileRoutes');
const adminRoutes = require('./routes/adminRoutes');

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

app.get('/', (req, res) => {
  res.json({
    service: '6ixOutside Backend',
    status: 'ok'
  });
});

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

app.listen(PORT, () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
