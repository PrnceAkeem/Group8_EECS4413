const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const profileController = require('../controllers/profileController');

const router = express.Router();

router.use(requireAuth);

router.get('/', profileController.getProfile);
router.patch('/', profileController.updateProfile);
router.post('/addresses', profileController.upsertAddress);
router.post('/payment-methods', profileController.upsertPaymentMethod);

module.exports = router;