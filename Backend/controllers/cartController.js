const CartDAO = require('../dao/CartDAO');
const ProductDAO = require('../dao/ProductDAO');

function computeSubtotalCents(items) {
  return items.reduce((total, item) => {
    return total + Number(item.price_cents) * Number(item.quantity);
  }, 0);
}

async function getCart(req, res) {
  try {
    const customerId = req.session.user.customerId;
    const items = await CartDAO.getCartByCustomer(customerId);
    const subtotalCents = computeSubtotalCents(items);

    return res.status(200).json({
      success: true,
      items,
      subtotalCents
    });
  } catch (error) {
    console.error('Get cart error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching cart.'
    });
  }
}

async function addOrUpdate(req, res) {
  try {
    const customerId = req.session.user.customerId;
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'productId is required.'
      });
    }

    const parsedQuantity = Number.parseInt(quantity, 10);

    if (Number.isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'quantity must be a positive integer.'
      });
    }

    const product = await ProductDAO.getProductById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    if (parsedQuantity > product.inventoryQuantity) {
      return res.status(400).json({
        success: false,
        message: 'Requested quantity exceeds available inventory.'
      });
    }

    await CartDAO.upsertItem(customerId, productId, parsedQuantity);

    const items = await CartDAO.getCartByCustomer(customerId);
    const subtotalCents = computeSubtotalCents(items);

    return res.status(200).json({
      success: true,
      message: 'Cart updated successfully.',
      items,
      subtotalCents
    });
  } catch (error) {
    console.error('Add or update cart item error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating cart.'
    });
  }
}

async function updateQuantity(req, res) {
  try {
    const customerId = req.session.user.customerId;
    const { productId } = req.params;
    const { quantity } = req.body;

    const parsedQuantity = Number.parseInt(quantity, 10);

    if (Number.isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'quantity must be a positive integer.'
      });
    }

    const product = await ProductDAO.getProductById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    if (parsedQuantity > product.inventoryQuantity) {
      return res.status(400).json({
        success: false,
        message: 'Requested quantity exceeds available inventory.'
      });
    }

    await CartDAO.upsertItem(customerId, productId, parsedQuantity);

    const items = await CartDAO.getCartByCustomer(customerId);
    const subtotalCents = computeSubtotalCents(items);

    return res.status(200).json({
      success: true,
      message: 'Cart item quantity updated successfully.',
      items,
      subtotalCents
    });
  } catch (error) {
    console.error('Update cart item quantity error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating cart item quantity.'
    });
  }
}

async function removeItem(req, res) {
  try {
    const customerId = req.session.user.customerId;
    const { productId } = req.params;

    const deletedItem = await CartDAO.removeItem(customerId, productId);

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found.'
      });
    }

    const items = await CartDAO.getCartByCustomer(customerId);
    const subtotalCents = computeSubtotalCents(items);

    return res.status(200).json({
      success: true,
      message: 'Cart item removed successfully.',
      items,
      subtotalCents
    });
  } catch (error) {
    console.error('Remove cart item error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while removing cart item.'
    });
  }
}

module.exports = {
  getCart,
  addOrUpdate,
  updateQuantity,
  removeItem,
  computeSubtotalCents
};