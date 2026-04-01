const OrderDAO = require('../dao/OrderDAO');
const CartDAO = require('../dao/CartDAO');
const PaymentService = require('../services/PaymentService');

function computeSubtotalCents(items) {
  return items.reduce((total, item) => {
    return total + Number(item.price_cents) * Number(item.quantity);
  }, 0);
}

async function placeOrder(req, res) {
  try {
    const customerId = req.session.user.customerId;
    const { shippingAddressId, paymentMethodId } = req.body;

    const parsedShippingAddressId = Number.parseInt(shippingAddressId, 10);
    const parsedPaymentMethodId = Number.parseInt(paymentMethodId, 10);

    if (Number.isNaN(parsedShippingAddressId) || parsedShippingAddressId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'shippingAddressId must be a positive integer.'
      });
    }

    if (Number.isNaN(parsedPaymentMethodId) || parsedPaymentMethodId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'paymentMethodId must be a positive integer.'
      });
    }

    const checkoutDetails = await OrderDAO.validateCheckoutDetails(
      customerId,
      parsedShippingAddressId,
      parsedPaymentMethodId
    );

    const cartItems = await CartDAO.getCartByCustomer(customerId);
    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty.'
      });
    }

    const subtotalCents = computeSubtotalCents(cartItems);
    const paymentResult = await PaymentService.processPayment({
      amountCents: subtotalCents,
      cardLast4: checkoutDetails.cardLast4
    });

    if (!paymentResult.approved) {
      return res.status(402).json({
        success: false,
        message: paymentResult.reason || 'Credit Card Authorization Failed.'
      });
    }

    const createdOrder = await OrderDAO.createOrder({
      customerId,
      shippingAddressId: parsedShippingAddressId,
      paymentMethodId: parsedPaymentMethodId
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      payment: paymentResult,
      ...createdOrder
    });
  } catch (error) {
    console.error('Place order error:', error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error while placing order.'
    });
  }
}

async function listOrders(req, res) {
  try {
    const customerId = req.session.user.customerId;
    const orders = await OrderDAO.getOrdersByCustomer(customerId);

    return res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('List orders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching orders.'
    });
  }
}

async function getOrder(req, res) {
  try {
    const customerId = req.session.user.customerId;
    const orderId = Number.parseInt(req.params.id, 10);

    if (Number.isNaN(orderId) || orderId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Order id must be a positive integer.'
      });
    }

    const orderDetails = await OrderDAO.getOrderById(orderId, customerId);

    if (!orderDetails) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.'
      });
    }

    return res.status(200).json({
      success: true,
      ...orderDetails
    });
  } catch (error) {
    console.error('Get order error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching order.'
    });
  }
}

module.exports = {
  placeOrder,
  listOrders,
  getOrder
};
