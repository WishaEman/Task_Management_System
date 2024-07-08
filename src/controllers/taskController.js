const { body, param, query, validationResult } = require('express-validator');
const { TaskService } = require('@services/taskService');

const taskService = new TaskService();

exports.createTask = [
  param('userId').isInt().withMessage('ID must be an integer'),
  param('productId').isInt().withMessage('ID must be an integer'),
  body('title').notEmpty().withMessage('Title is required'),
  body('status').optional().isIn(['backlog']).withMessage('Invalid status'),
  body('precedence').optional().isIn(['hot', 'medium', 'low']).withMessage('Invalid! Precedence should be hot, medium or low'),
  body('estimate').optional().isInt().withMessage('Task Estimate should be an integer'),
  body('branchName').optional().isString().withMessage('Branch Name must be a string'),
  body('deadline').optional().isISO8601().toDate().withMessage('Invalid date format'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const task = await taskService.createTask(req.body, req.params.userId, req.params.productId);
      res.status(201).json(task);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];

exports.assignTasks = async function (req, res) {
  try {
      const result = await taskService.assignTaskAutomatically();

      if (result && result.status && result.message) {
          return res.status(result.status).json({ message: result.message });
      }

      return res.status(200).json({ message: 'Tasks assigned successfully' });
  } catch (error) {
      console.error('Error in assignTasks:', error);
      return res.status(500).json({ message: 'Error assigning tasks', error: error.message });
  }
};


exports.getTasks = [
  query('userId').optional().isInt().withMessage('User Id must be an integer'),
  query('precedence').optional().isIn(['hot', 'medium', 'low']).withMessage('Precedence must be hot, medium, low'),
  query('status').optional().isIn(['backlog', 'In Progress', 'In QA', 'Done']).withMessage('Status must be backlog, In Progress, In QA, Done'),
  query('productId').optional().isInt().withMessage('Product Id must be an integer'),
  query('taskId').optional().isInt().withMessage('Task Id must be an integer'),
  query('deadline').optional().isISO8601().withMessage('Deadline must be a valid ISO8601 date'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('pageSize').optional().isInt({ min: 1 }).withMessage('Page size must be a positive integer'),
  query('includeProducts').optional().isBoolean().withMessage('IncludeProducts must be a boolean'),
  query('includeCreator').optional().isBoolean().withMessage('IncludeCreator must be a boolean'),
  query('includeLogs').optional().isBoolean().withMessage('IncludeLogs must be a boolean'),
  query('includeAssigneeDetails').optional().isBoolean().withMessage('IncludeAssigneeDetails must be a boolean'),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const options = {
      assignedTo: req.query.userId,
      precedence: req.query.precedence,
      status: req.query.status,
      deadline: req.query.deadline ? new Date(req.query.deadline) : undefined,
      productId: req.query.productId,
      id: req.query.taskId,
      page: req.query.page ? parseInt(req.query.page) : 1,
      pageSize: req.query.pageSize ? parseInt(req.query.pageSize) : 10,
      includeProducts: req.query.includeProducts === 'true',
      includeCreator: req.query.includeCreator === 'true',
      includeLogs: req.query.includeLogs === 'true',
      includeAssigneeDetails: req.query.includeAssigneeDetails === 'true'
    };
    
    const validParams = ['userId', 'precedence', 'status', 'productId','taskId', 'deadline', 'page', 'pageSize', 'includeProducts', 'includeCreator', 'includeLogs', 'includeAssigneeDetails'];
    const invalidParams = Object.keys(req.query).filter(param => !validParams.includes(param));
    if (invalidParams.length > 0) {
      return res.status(400).json({ message: `Invalid query parameters: ${invalidParams.join(', ')}` });
    }

    try {
      const result = await taskService.getTasks(options);
      
      if (result.tasks.length === 0) {
        return res.status(404).json({ message: 'No tasks found' });
      }

      return res.status(200).json({
        tasks: result.tasks,
        meta: {
          totalItems: result.count,
          currentPage: options.page,
        }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
];


const validateStatusTransition = async (req, res, next) => {
  const { taskId } = req.params;
  const { status } = req.body;

  try {
    const task = await taskService.getTaskById(parseInt(taskId)); 
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const currentStatus = task.status;
    const allowedTransitions = {
      'In Progress': ['In QA'],
      'In QA': ['Done'],
      'Done': []
    };

    if (!allowedTransitions[currentStatus]?.includes(status)) {
      return res.status(406).json({ message: `Invalid status transition from ${currentStatus} to ${status}` });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

exports.updateTaskStatus = [
  param('taskId').isInt().withMessage('Task ID must be an integer'),
  body('status').isIn(['To Do', 'In Progress', 'In QA', 'Done']).withMessage('Invalid status'),
  validateStatusTransition,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { taskId } = req.params;
    const { status } = req.body;

    try {
      const task = await taskService.updateTaskStatus(parseInt(taskId), status);
      res.status(200).json({ message: 'Task status updated successfully', task });
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  }
];
