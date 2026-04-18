const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const requireAdmin = require('../middleware/requireAdmin');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.use(requireAuth);
router.use(requireAdmin);

router.get('/orders', adminController.listOrders);
router.get('/orders/:id/items', adminController.getOrderItems);

router.get('/customers', adminController.listCustomers);
router.patch('/customers/:id', adminController.patchCustomer);

router.get('/meta', adminController.getMeta);
router.get('/products', adminController.listProducts);
router.patch('/products/:id', adminController.patchProduct);
router.post('/products', adminController.createProduct);

module.exports = router;