const { body, param, validationResult } = require('express-validator');
const { UserProductService } = require('@services/userProductService');
const userProductService = new UserProductService();

exports.createUserProduct = [
    param('userId').isInt().withMessage('User ID must be an integer'),
    body('productId').isInt().withMessage('Product ID must be an integer'),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      try {
        const userProduct = await userProductService.createUserProduct(parseInt(req.params.userId), req.body.productId);
        res.status(201).json(userProduct);
      } catch (error) {
        if (error.message === 'User already Enrolled in this product!') {
          return res.status(400).json({ msg: error.message });
        }
        res.status(500).json({ error: error.message });
      }
    }
];

exports.getUserProducts = [
  param('userId').isInt().withMessage('User ID must be an integer'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId } = req.params;

    try {
      const userProducts = await userProductService.getUserProducts(parseInt(userId));
      if (!userProducts.length) {
        return res.status(404).json({ error: 'No products found for this user' });
      }
      res.status(200).json(userProducts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];

exports.deleteUserProduct = [
    param('userId').isInt().withMessage('User ID must be an integer'),
    param('productId').isInt().withMessage('Product ID must be an integer'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }

        const { userId, productId } = req.params;

        try {
        await userProductService.deleteUserProduct(parseInt(userId), parseInt(productId));
        return res.status(200).json({msg: "Successfully Deleted"});
        } catch (error) {
          if (error.message === 'UserProduct association not found') {
            return res.status(404).json({ error: error.message });
          }
          res.status(500).json({ error: error.message });
        }
    }
];
