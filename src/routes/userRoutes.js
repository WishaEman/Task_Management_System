const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
  

router.post('/', userController.createUser);
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.get('/:userId/subordinates', userController.getSubordinates);
router.get('/:userId/manager', userController.getManager);



module.exports = router;
