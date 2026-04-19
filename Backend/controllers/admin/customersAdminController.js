const AdminDAO = require('../../dao/AdminDAO');

async function listCustomers(req, res) {
  try {
    const customers = await AdminDAO.getAllCustomers();

    return res.status(200).json({
      success: true,
      customers
    });
  } catch (error) {
    console.error('Admin list customers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching customers.'
    });
  }
}

async function patchCustomer(req, res) {
  try {
    const customerId = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(customerId) || customerId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Customer id must be a positive integer.'
      });
    }

    const { firstName, lastName, email, phone, isAdmin } = req.body;
    const updates = {};

    if (firstName !== undefined) {
      if (typeof firstName !== 'string' || !firstName.trim()) {
        return res.status(400).json({
          success: false,
          message: 'firstName must be a non-empty string.'
        });
      }
      updates.firstName = firstName.trim();
    }

    if (lastName !== undefined) {
      if (typeof lastName !== 'string' || !lastName.trim()) {
        return res.status(400).json({
          success: false,
          message: 'lastName must be a non-empty string.'
        });
      }
      updates.lastName = lastName.trim();
    }

    if (email !== undefined) {
      if (typeof email !== 'string' || !email.trim()) {
        return res.status(400).json({
          success: false,
          message: 'email must be a non-empty string.'
        });
      }
      updates.email = email.trim().toLowerCase();
    }

    if (phone !== undefined) {
      if (phone !== null && typeof phone !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'phone must be a string or null.'
        });
      }
      updates.phone = phone === null ? null : phone.trim();
    }

    if (isAdmin !== undefined) {
      if (typeof isAdmin !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'isAdmin must be a boolean.'
        });
      }
      updates.isAdmin = isAdmin;
    }

    const customer = await AdminDAO.updateCustomer(customerId, updates);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Customer updated successfully.',
      customer
    });
  } catch (error) {
    console.error('Admin patch customer error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating customer.'
    });
  }
}

async function getCustomer(req, res) {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id) || id <= 0) return res.status(400).json({ success: false, message: 'Invalid customer ID.' });
    const customer = await AdminDAO.getCustomerById(id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found.' });
    return res.status(200).json({ success: true, customer });
  } catch (error) {
    console.error('Admin get customer error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

async function deleteCustomer(req, res) {
  try {
    const id = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(id) || id <= 0) return res.status(400).json({ success: false, message: 'Invalid customer ID.' });
    await AdminDAO.deleteCustomer(id);
    return res.status(200).json({ success: true, message: 'Customer deleted.' });
  } catch (error) {
    console.error('Admin delete customer error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

async function deleteCustomerAddress(req, res) {
  try {
    const customerId = Number.parseInt(req.params.id, 10);
    const addressId  = Number.parseInt(req.params.addressId, 10);
    await AdminDAO.deleteAddress(addressId, customerId);
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

async function deleteCustomerPayment(req, res) {
  try {
    const customerId      = Number.parseInt(req.params.id, 10);
    const paymentMethodId = Number.parseInt(req.params.pmId, 10);
    await AdminDAO.deletePaymentMethod(paymentMethodId, customerId);
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

async function resetCustomerPassword(req, res) {
  try {
    const id = Number.parseInt(req.params.id, 10);
    const { password } = req.body;
    if (!password || password.length < 4) {
      return res.status(400).json({ success: false, message: 'Password must be at least 4 characters.' });
    }
    await AdminDAO.updateCustomerPassword(id, password);
    return res.status(200).json({ success: true, message: 'Password updated.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

module.exports = {
  listCustomers,
  patchCustomer,
  getCustomer,
  deleteCustomer,
  deleteCustomerAddress,
  deleteCustomerPayment,
  resetCustomerPassword
};
