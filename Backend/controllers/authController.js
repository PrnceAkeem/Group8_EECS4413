const CustomerDAO = require('../dao/CustomerDAO');

// REGISTER
async function register(req, res) {
  try {
    const { firstName, lastName, dob, email, password } = req.body;

    // basic validation
    if (!firstName || !lastName || !dob || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required.'
      });
    }

    // check if user already exists
    const existingCustomer = await CustomerDAO.findByEmail(email);

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered.'
      });
    }

    // insert new customer
    const newCustomer = await CustomerDAO.insertCustomer(
      firstName,
      lastName,
      dob,
      email,
      password
    );

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      customer: newCustomer
    });

  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration.'
    });
  }
}

// LOGIN
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    // find user by email
    const customer = await CustomerDAO.findByEmail(email);

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // plain text password check for now
    // later you can replace with bcrypt
    if (customer.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // create session
    req.session.user = {
      customerID: customer.customerid || customer.customerID,
      firstName: customer.firstname || customer.firstName,
      email: customer.email
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