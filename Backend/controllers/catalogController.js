const ProductDAO = require('../dao/ProductDAO');

async function listProducts(req, res) {
  try {
    const { brand, category, q, sort } = req.query;

    if (sort && !ProductDAO.VALID_SORT_KEYS.includes(sort)) {
      return res.status(400).json({
        error: 'invalid_param',
        message: `sort must be one of: ${ProductDAO.VALID_SORT_KEYS.join(', ')}`
      });
    }

    const products = await ProductDAO.getProducts({ brand, category, q, sort });

    return res.status(200).json({ products });
  } catch (error) {
    console.error('listProducts error:', error);
    return res.status(500).json({
      error: 'server_error',
      message: 'An unexpected error occurred'
    });
  }
}

async function getProduct(req, res) {
  try {
    const product = await ProductDAO.getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({
        error: 'not_found',
        message: `Product ${req.params.id} not found`
      });
    }

    return res.status(200).json({ product });
  } catch (error) {
    console.error('getProduct error:', error);
    return res.status(500).json({
      error: 'server_error',
      message: 'An unexpected error occurred'
    });
  }
}

async function listBrands(req, res) {
  try {
    const brands = await ProductDAO.getDistinctBrands();
    return res.status(200).json({ brands });
  } catch (error) {
    console.error('listBrands error:', error);
    return res.status(500).json({ error: 'server_error', message: 'An unexpected error occurred' });
  }
}

async function listCategories(req, res) {
  try {
    const categories = await ProductDAO.getDistinctCategories();
    return res.status(200).json({ categories });
  } catch (error) {
    console.error('listCategories error:', error);
    return res.status(500).json({ error: 'server_error', message: 'An unexpected error occurred' });
  }
}

module.exports = {
  listProducts,
  getProduct,
  listBrands,
  listCategories
};
