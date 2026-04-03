const AdminDAO = require('../../dao/AdminDAO');

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

async function createProduct(req, res) {
  try {
    const {
      productId,
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

    if (!productId || typeof productId !== 'string' || !productId.trim()) {
      return res.status(400).json({
        success: false,
        message: 'productId is required.'
      });
    }

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'name is required.'
      });
    }

    if (!model || typeof model !== 'string' || !model.trim()) {
      return res.status(400).json({
        success: false,
        message: 'model is required.'
      });
    }

    if (!colorway || typeof colorway !== 'string' || !colorway.trim()) {
      return res.status(400).json({
        success: false,
        message: 'colorway is required.'
      });
    }

    const parsedPriceCents = Number.parseInt(priceCents, 10);
    if (Number.isNaN(parsedPriceCents) || parsedPriceCents < 0) {
      return res.status(400).json({
        success: false,
        message: 'priceCents must be a non-negative integer.'
      });
    }

    const parsedInventoryQuantity = Number.parseInt(inventoryQuantity, 10);
    if (Number.isNaN(parsedInventoryQuantity) || parsedInventoryQuantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'inventoryQuantity must be a non-negative integer.'
      });
    }

    const parsedBrandId = Number.parseInt(brandId, 10);
    if (Number.isNaN(parsedBrandId) || parsedBrandId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'brandId must be a positive integer.'
      });
    }

    const parsedCategoryId = Number.parseInt(categoryId, 10);
    if (Number.isNaN(parsedCategoryId) || parsedCategoryId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'categoryId must be a positive integer.'
      });
    }

    let parsedReleaseYear = null;
    if (releaseYear !== undefined && releaseYear !== null && releaseYear !== '') {
      parsedReleaseYear = Number.parseInt(releaseYear, 10);
      if (Number.isNaN(parsedReleaseYear) || parsedReleaseYear < 1900) {
        return res.status(400).json({
          success: false,
          message: 'releaseYear must be a valid integer year, null, or omitted.'
        });
      }
    }

    if (description !== undefined && description !== null && typeof description !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'description must be a string or null.'
      });
    }

    if (sizeRange !== undefined && sizeRange !== null && typeof sizeRange !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'sizeRange must be a string or null.'
      });
    }

    if (imageUrl !== undefined && imageUrl !== null && typeof imageUrl !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'imageUrl must be a string or null.'
      });
    }

    if (isActive !== undefined && typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean.'
      });
    }

    const product = await AdminDAO.createProduct({
      productId: productId.trim(),
      name: name.trim(),
      model: model.trim(),
      description: description === undefined || description === null ? null : description.trim(),
      colorway: colorway.trim(),
      priceCents: parsedPriceCents,
      inventoryQuantity: parsedInventoryQuantity,
      releaseYear: parsedReleaseYear,
      sizeRange: sizeRange === undefined || sizeRange === null ? null : sizeRange.trim(),
      brandId: parsedBrandId,
      categoryId: parsedCategoryId,
      imageUrl: imageUrl === undefined || imageUrl === null ? null : imageUrl.trim(),
      isActive: isActive === undefined ? true : isActive
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      product
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'productId already exists.'
      });
    }

    console.error('Admin create product error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating product.'
    });
  }
}

module.exports = {
  listProducts,
  patchProduct,
  createProduct
};
