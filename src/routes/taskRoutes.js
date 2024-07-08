const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/taskController')

router.post('/user/:userId/product/:productId', TaskController.createTask);
router.get('/', TaskController.getTasks);
router.put('/assign', TaskController.assignTasks);
router.put('/:taskId/status', TaskController.updateTaskStatus);

module.exports = router;
