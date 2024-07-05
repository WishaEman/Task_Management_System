const express = require('express');
const router = express.Router();
const userProductController = require('../controllers/userProductController');


router.get('/user/:userId/products', userProductController.getUserProducts);
router.post('/user/:userId/product', userProductController.createUserProduct);
router.delete('/user/:userId/product/:productId', userProductController.deleteUserProduct);

module.exports = router;