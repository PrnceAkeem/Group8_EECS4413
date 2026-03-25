const express = require('express');
const router = express.Router();
const catalogController = require('../controllers/catalogController');

router.get('/',            catalogController.listProducts);
router.get('/brands',     catalogController.listBrands);
router.get('/categories', catalogController.listCategories);
router.get('/:id',        catalogController.getProduct);

module.exports = router;
