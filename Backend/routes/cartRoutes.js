const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const cartController = require('../controllers/cartController');

const router = express.Router();

router.use(requireAuth);

router.get('/', cartController.getCart);
router.post('/merge', cartController.mergeGuestCart);
router.post('/', cartController.addOrUpdate);
router.patch('/:productId', cartController.updateQuantity);
router.delete('/:productId', cartController.removeItem);

module.exports = router;