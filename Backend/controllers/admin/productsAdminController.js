const AdminDAO = require('../../dao/AdminDAO');
const db = require('../../db');

async function listProducts(req, res) {
  try {
    const products = await AdminDAO.getAllProducts();

    return res.status(200).json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Admin list products error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching products.'
    });
  }
}

async function patchProduct(req, res) {
  try {
    const productId = req.params.id;

    if (!productId || typeof productId !== 'string' || !productId.trim()) {
      return res.status(400).json({
        success: false,
        message: 'productId is required.'
      });
    }

    const {
      name,
      model,
      description,
      colorway,
      priceCents,
      inventoryQuantity,
      releaseYear,
      sizeRange,
      brandId,
      categoryId,
      imageUrl,
      isActive
    } = req.body;

    const updates = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'name must be a non-empty string.'
        });
      }
      updates.name = name.trim();
    }

    if (model !== undefined) {
      if (typeof model !== 'string' || !model.trim()) {
        return res.status(400).json({
          success: false,
          message: 'model must be a non-empty string.'
        });
      }
      updates.model = model.trim();
    }

    if (description !== undefined) {
      if (description !== null && typeof description !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'description must be a string or null.'
        });
      }
      updates.description = description === null ? null : description.trim();
    }

    if (colorway !== undefined) {
      if (typeof colorway !== 'string' || !colorway.trim()) {
        return res.status(400).json({
          success: false,
          message: 'colorway must be a non-empty string.'
        });
      }
      updates.colorway = colorway.trim();
    }

    if (priceCents !== undefined) {
      const parsedPriceCents = Number.parseInt(priceCents, 10);
      if (Number.isNaN(parsedPriceCents) || parsedPriceCents < 0) {
        return res.status(400).json({
          success: false,
          message: 'priceCents must be a non-negative integer.'
        });
      }
      updates.priceCents = parsedPriceCents;
    }

    if (inventoryQuantity !== undefined) {
      const parsedInventoryQuantity = Number.parseInt(inventoryQuantity, 10);
      if (Number.isNaN(parsedInventoryQuantity) || parsedInventoryQuantity < 0) {
        return res.status(400).json({
          success: false,
          message: 'inventoryQuantity must be a non-negative integer.'
        });
      }
      updates.inventoryQuantity = parsedInventoryQuantity;
    }

    if (releaseYear !== undefined) {
      if (releaseYear === null || releaseYear === '') {
        updates.releaseYear = null;
      } else {
        const parsedReleaseYear = Number.parseInt(releaseYear, 10);
        if (Number.isNaN(parsedReleaseYear) || parsedReleaseYear < 1900) {
          return res.status(400).json({
            success: false,
            message: 'releaseYear must be a valid integer year, null, or omitted.'
          });
        }
        updates.releaseYear = parsedReleaseYear;
      }
    }

    if (sizeRange !== undefined) {
      if (sizeRange !== null && typeof sizeRange !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'sizeRange must be a string or null.'
        });
      }
      updates.sizeRange = sizeRange === null ? null : sizeRange.trim();
    }

    if (brandId !== undefined) {
      const parsedBrandId = Number.parseInt(brandId, 10);
      if (Number.isNaN(parsedBrandId) || parsedBrandId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'brandId must be a positive integer.'
        });
      }
      updates.brandId = parsedBrandId;
    }

    if (categoryId !== undefined) {
      const parsedCategoryId = Number.parseInt(categoryId, 10);
      if (Number.isNaN(parsedCategoryId) || parsedCategoryId <= 0) {
        return res.status(400).json({
          success: false,
          message: 'categoryId must be a positive integer.'
        });
      }
      updates.categoryId = parsedCategoryId;
    }

    if (imageUrl !== undefined) {
      if (imageUrl !== null && typeof imageUrl !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'imageUrl must be a string or null.'
        });
      }
      updates.imageUrl = imageUrl === null ? null : imageUrl.trim();
    }

    if (isActive !== undefined) {
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'isActive must be a boolean.'
        });
      }
      updates.isActive = isActive;
    }

    const product = await AdminDAO.updateProduct(productId.trim(), updates);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      product
    });
  } catch (error) {
    console.error('Admin patch product error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating product.'
    });
  }
}

async function getMeta(req, res) {
  try {
    const [brandsResult, categoriesResult] = await Promise.all([
      db.query('SELECT brand_id, name FROM brands ORDER BY name ASC'),
      db.query('SELECT category_id, name FROM categories ORDER BY name ASC')
    ]);
    return res.status(200).json({
      success: true,
      brands:     brandsResult.rows.map(r => ({ id: r.brand_id, name: r.name })),
      categories: categoriesResult.rows.map(r => ({ id: r.category_id, name: r.name }))
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

async function createProduct(req, res) {
  try {
    const {
      name,
      brand,
      category,
      priceDollars,
      inventoryQuantity,
      colorway,
      imageUrl,
      sizeRange,
      description
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required.' });
    }
    if (!brand) {
      return res.status(400).json({ success: false, message: 'Brand is required.' });
    }
    if (!category) {
      return res.status(400).json({ success: false, message: 'Category is required.' });
    }
    if (!colorway || !colorway.trim()) {
      return res.status(400).json({ success: false, message: 'Colorway is required.' });
    }

    const priceNum = parseFloat(priceDollars);
    if (isNaN(priceNum) || priceNum < 0) {
      return res.status(400).json({ success: false, message: 'Price must be a valid number.' });
    }
    const priceCents = Math.round(priceNum * 100);

    const parsedQty = parseInt(inventoryQuantity, 10);
    if (isNaN(parsedQty) || parsedQty < 0) {
      return res.status(400).json({ success: false, message: 'Inventory must be a non-negative number.' });
    }

    const brandRow = await db.query('SELECT brand_id FROM brands WHERE LOWER(name) = LOWER($1)', [brand]);
    if (brandRow.rows.length === 0) {
      return res.status(400).json({ success: false, message: `Brand "${brand}" not found.` });
    }
    const brandId = brandRow.rows[0].brand_id;

    const catRow = await db.query('SELECT category_id FROM categories WHERE LOWER(name) = LOWER($1)', [category]);
    if (catRow.rows.length === 0) {
      return res.status(400).json({ success: false, message: `Category "${category}" not found.` });
    }
    const categoryId = catRow.rows[0].category_id;

    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const brandSlug = brand.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const productId = `SNK-${brandSlug}-${slug}-${Date.now()}`.slice(0, 64);

    const product = await AdminDAO.createProduct({
      productId,
      name: name.trim(),
      model: name.trim(),
      description: description ? description.trim() : null,
      colorway: colorway.trim(),
      priceCents,
      inventoryQuantity: parsedQty,
      releaseYear: null,
      sizeRange: sizeRange || 'US 7-13',
      brandId,
      categoryId,
      imageUrl: imageUrl ? imageUrl.trim() : null,
      isActive: true
    });

    return res.status(201).json({
      success: true,
      message: 'Product added successfully.',
      product
    });
  } catch (error) {
    console.error('Admin create product error:', error);
    return res.status(500).json({ success: false, message: 'Server error while creating product.' });
  }
}

module.exports = {
  listProducts,
  patchProduct,
  createProduct,
  getMeta
};
