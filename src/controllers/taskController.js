const { body, param, validationResult } = require('express-validator');
const { TaskService } = require('@services/taskService');

const taskService = new TaskService();

exports.createTask = [
  body('title').notEmpty().withMessage('Title is required'),
  body('status').optional().isIn(['backlog', 'In Progress', 'In QA', 'Done']).withMessage('Invalid status'),
  body('precedence').optional().isIn(['hot', 'medium', 'low']).withMessage('Invalid! Precedence should be hot, medium or low'),
  body('estimate').optional().isInt().withMessage('Task Estimate should be an integer'),
  body('branchName').optional().isString().withMessage('Branch Name must be a string'),
  body('productId').isInt().withMessage('Product ID must be an integer'),
  body('createdBy').isInt().withMessage('CreatedBy must be an integer'),
  body('deadline').optional().isISO8601().toDate().withMessage('Invalid date format'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const task = await taskService.createTask(req.body);
      res.status(201).json(task);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];

