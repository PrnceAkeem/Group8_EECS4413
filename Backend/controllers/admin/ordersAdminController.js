const AdminDAO = require('../../dao/AdminDAO');

async function listOrders(req, res) {
  try {
    const {
      status,
      customerId,
      paymentStatus,
      productId,
      from,
      to,
      dateFrom,
      dateTo
    } = req.query;

    let parsedCustomerId;
    if (customerId !== undefined && customerId !== '') {
      parsedCustomerId = Number.parseInt(customerId, 10);
      if (Number.isNaN(parsedCustomerId) || parsedCustomerId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'customerId must be a positive integer.'
        });
      }
    }

    const parsedProductId =
      productId === undefined || productId === '' ? undefined : productId.trim();

    const rawFrom = from ?? dateFrom;
    const rawTo = to ?? dateTo;

    const parsedFrom = rawFrom === undefined || rawFrom === '' ? undefined : rawFrom.trim();
    const parsedTo = rawTo === undefined || rawTo === '' ? undefined : rawTo.trim();

    const orders = await AdminDAO.getAllOrders({
      status,
      customerId: parsedCustomerId,
      paymentStatus,
      productId: parsedProductId,
      from: parsedFrom,
      to: parsedTo
    });

    return res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Admin list orders error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching orders.'
    });
  }
}

async function getOrderItems(req, res) {
  try {
    const orderId = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(orderId) || orderId <= 0) {
      return res.status(400).json({ success: false, message: 'Order id must be a positive integer.' });
    }
    const items = await AdminDAO.getOrderItems(orderId);
    return res.status(200).json({ success: true, items });
  } catch (error) {
    console.error('Admin get order items error:', error);
    return res.status(500).json({ success: false, message: 'Server error while fetching order items.' });
  }
}

async function updateOrderStatus(req, res) {
  try {
    const orderId = Number.parseInt(req.params.id, 10);
    if (Number.isNaN(orderId) || orderId <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid order ID.' });
    }
    const { status } = req.body;
    const VALID = ['processing', 'shipped', 'delivered', 'cancelled'];
    if (!VALID.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${VALID.join(', ')}` });
    }
    const result = await AdminDAO.updateOrderStatus(orderId, status);
    if (!result) return res.status(404).json({ success: false, message: 'Order not found.' });
    return res.status(200).json({ success: true, orderId: result.order_id, orderStatus: result.order_status });
  } catch (error) {
    console.error('Admin update order status error:', error);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

module.exports = {
  listOrders,
  getOrderItems,
  updateOrderStatus
};
