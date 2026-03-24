const express = require('express');
const router = express.Router();
const catalogController = require('../controllers/catalogController');

router.get('/', catalogController.listProducts);
router.get('/:id', catalogController.getProduct);

module.exports = router;
