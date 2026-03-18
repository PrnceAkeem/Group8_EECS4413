const CustomerDAO = require('../dao/CustomerDAO');

async function register(req, res) {
  try {
    const { firstName, lastName, dob, email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!firstName || !lastName || !dob || !normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required.'
      });
    }

    const existingCustomer = await CustomerDAO.findByEmail(normalizedEmail);

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered.'
      });
    }

    const newCustomer = await CustomerDAO.insertCustomer(
      firstName.trim(),
      lastName.trim(),
      dob,
      normalizedEmail,
      password
    );

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      customer: newCustomer
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Email already registered.'
      });
    }

    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration.'
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const customer = await CustomerDAO.findByEmail(normalizedEmail);

    if (!customer || customer.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    req.session.user = {
      customerId: customer.customerId,
      firstName: customer.firstName,
      email: customer.email,
      isAdmin: customer.isAdmin
    };

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      user: req.session.user
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login.'
    });
  }
}

module.exports = {
  register,
  login
};
