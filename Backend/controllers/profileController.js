const ProfileDAO = require('../dao/ProfileDAO');

async function getProfile(req, res) {
  try {
    const customerId = req.session.user.customerId;
    const profile = await ProfileDAO.getProfile(customerId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found.'
      });
    }

    return res.status(200).json({
      success: true,
      ...profile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Server error while fetching profile.'
    });
  }
}

async function updateProfile(req, res) {
  try {
    const customerId = req.session.user.customerId;
    const { firstName, lastName, dob, phone } = req.body;

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

    if (dob !== undefined) {
      if (typeof dob !== 'string' || !dob.trim()) {
        return res.status(400).json({
          success: false,
          message: 'dob must be a non-empty string.'
        });
      }
      updates.dob = dob.trim();
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

    const customer = await ProfileDAO.updateProfile(customerId, updates);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      customer
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Server error while updating profile.'
    });
  }
}

async function upsertAddress(req, res) {
  try {
    const customerId = req.session.user.customerId;
    const {
      addressId,
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
    } = req.body;

    let parsedAddressId;
    if (addressId !== undefined) {
      parsedAddressId = Number.parseInt(addressId, 10);
      if (Number.isNaN(parsedAddressId) || parsedAddressId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'addressId must be a positive integer.'
        });
      }
    }

    if (!label || typeof label !== 'string' || !label.trim()) {
      return res.status(400).json({
        success: false,
        message: 'label is required.'
      });
    }

    if (!recipientName || typeof recipientName !== 'string' || !recipientName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'recipientName is required.'
      });
    }

    if (!streetLine1 || typeof streetLine1 !== 'string' || !streetLine1.trim()) {
      return res.status(400).json({
        success: false,
        message: 'streetLine1 is required.'
      });
    }

    if (!city || typeof city !== 'string' || !city.trim()) {
      return res.status(400).json({
        success: false,
        message: 'city is required.'
      });
    }

    if (!province || typeof province !== 'string' || !province.trim()) {
      return res.status(400).json({
        success: false,
        message: 'province is required.'
      });
    }

    if (!postalCode || typeof postalCode !== 'string' || !postalCode.trim()) {
      return res.status(400).json({
        success: false,
        message: 'postalCode is required.'
      });
    }

    const address = await ProfileDAO.upsertAddress(customerId, {
      addressId: parsedAddressId,
      label: label.trim(),
      recipientName: recipientName.trim(),
      streetLine1: streetLine1.trim(),
      streetLine2: typeof streetLine2 === 'string' ? streetLine2.trim() : null,
      city: city.trim(),
      province: province.trim(),
      country: typeof country === 'string' && country.trim() ? country.trim() : 'Canada',
      postalCode: postalCode.trim(),
      phone: typeof phone === 'string' ? phone.trim() : null,
      isDefaultShipping: Boolean(isDefaultShipping),
      isDefaultBilling: Boolean(isDefaultBilling)
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Address saved successfully.',
      address
    });
  } catch (error) {
    console.error('Upsert address error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Server error while saving address.'
    });
  }
}

async function upsertPaymentMethod(req, res) {
  try {
    const customerId = req.session.user.customerId;
    const {
      paymentMethodId,
      billingAddressId,
      cardholderName,
      cardBrand,
      cardLast4,
      expiryMonth,
      expiryYear,
      isDefault
    } = req.body;

    let parsedPaymentMethodId;
    if (paymentMethodId !== undefined) {
      parsedPaymentMethodId = Number.parseInt(paymentMethodId, 10);
      if (Number.isNaN(parsedPaymentMethodId) || parsedPaymentMethodId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'paymentMethodId must be a positive integer.'
        });
      }
    }

    let parsedBillingAddressId = null;
    if (billingAddressId !== undefined && billingAddressId !== null && billingAddressId !== '') {
      parsedBillingAddressId = Number.parseInt(billingAddressId, 10);
      if (Number.isNaN(parsedBillingAddressId) || parsedBillingAddressId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'billingAddressId must be a positive integer, null, or omitted.'
        });
      }
    }

    if (!cardholderName || typeof cardholderName !== 'string' || !cardholderName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'cardholderName is required.'
      });
    }

    if (!cardBrand || typeof cardBrand !== 'string' || !cardBrand.trim()) {
      return res.status(400).json({
        success: false,
        message: 'cardBrand is required.'
      });
    }

    if (!cardLast4 || typeof cardLast4 !== 'string' || !/^\d{4}$/.test(cardLast4.trim())) {
      return res.status(400).json({
        success: false,
        message: 'cardLast4 must be exactly 4 digits.'
      });
    }

    const parsedExpiryMonth = Number.parseInt(expiryMonth, 10);
    if (Number.isNaN(parsedExpiryMonth) || parsedExpiryMonth < 1 || parsedExpiryMonth > 12) {
      return res.status(400).json({
        success: false,
        message: 'expiryMonth must be an integer between 1 and 12.'
      });
    }

    const parsedExpiryYear = Number.parseInt(expiryYear, 10);
    if (Number.isNaN(parsedExpiryYear) || parsedExpiryYear < 2024) {
      return res.status(400).json({
        success: false,
        message: 'expiryYear must be an integer greater than or equal to 2024.'
      });
    }

    const paymentMethod = await ProfileDAO.upsertPaymentMethod(customerId, {
      paymentMethodId: parsedPaymentMethodId,
      billingAddressId: parsedBillingAddressId,
      cardholderName: cardholderName.trim(),
      cardBrand: cardBrand.trim(),
      cardLast4: cardLast4.trim(),
      expiryMonth: parsedExpiryMonth,
      expiryYear: parsedExpiryYear,
      isDefault: Boolean(isDefault)
    });

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Payment method saved successfully.',
      paymentMethod
    });
  } catch (error) {
    console.error('Upsert payment method error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Server error while saving payment method.'
    });
  }
}

module.exports = {
  getProfile,
  updateProfile,
  upsertAddress,
  upsertPaymentMethod
};