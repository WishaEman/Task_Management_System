const { ProductService } = require('@services/productService');
const { body, param, validationResult } = require('express-validator');

const productService = new ProductService();

exports.createProduct = [
  body('name').notEmpty().withMessage('Product name is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const product = await productService.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];

exports.getAllProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProductById = [
  param('id').isInt().withMessage('ID must be an integer'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const product = await productService.getProductById(parseInt(req.params.id));
      if (!product) return res.status(404).json({ error: 'Product not found' });
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];

exports.updateProduct = [
  param('id').isInt().withMessage('ID must be an integer'),
  body('name').optional().notEmpty().withMessage('Product name must not be empty'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const [affectedCount, affectedRows] = await productService.updateProduct(parseInt(req.params.id), req.body);
      if (affectedCount === 0) return res.status(404).json({ error: 'Product not found' });
      res.status(200).json(affectedRows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];

exports.deleteProduct = [
  param('id').isInt().withMessage('ID must be an integer'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const deletedCount = await productService.deleteProduct(parseInt(req.params.id));
      if (deletedCount === 0) return res.status(404).json({ error: 'Product not found' });
      res.status(204).json({msg: 'Successfully Deleted'});
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];
