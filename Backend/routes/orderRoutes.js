const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const orderController = require('../controllers/orderController');

const router = express.Router();

router.use(requireAuth);

router.post('/', orderController.placeOrder);
router.get('/', orderController.listOrders);
router.get('/:id', orderController.getOrder);

module.exports = router;