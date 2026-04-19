const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const requireAdmin = require('../middleware/requireAdmin');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.use(requireAuth);
router.use(requireAdmin);

router.get('/orders', adminController.listOrders);
router.get('/orders/:id/items', adminController.getOrderItems);
router.patch('/orders/:id/status', adminController.updateOrderStatus);

router.get('/customers', adminController.listCustomers);
router.get('/customers/:id', adminController.getCustomer);
router.patch('/customers/:id', adminController.patchCustomer);
router.delete('/customers/:id', adminController.deleteCustomer);
router.delete('/customers/:id/addresses/:addressId', adminController.deleteCustomerAddress);
router.delete('/customers/:id/payment-methods/:pmId', adminController.deleteCustomerPayment);
router.patch('/customers/:id/password', adminController.resetCustomerPassword);

router.get('/meta', adminController.getMeta);
router.get('/products', adminController.listProducts);
router.patch('/products/:id', adminController.patchProduct);
router.post('/products', adminController.createProduct);

module.exports = router;