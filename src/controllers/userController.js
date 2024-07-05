const { body, param, validationResult } = require('express-validator');
const { UserService } = require('@services/userService');

const userService = new UserService();

exports.createUser = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  body('address').optional().isString().withMessage('Address must be a string'),
  body('designationId').optional().isInt().withMessage('Designation ID must be an integer'),
  body('managerId').optional().isInt().withMessage('Manager ID must be an integer'),
  async (req, res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }else {
      return next();
    }
  },
  async (req, res) => {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      if (error.message === 'Email address already in use!') {
        return res.status(400).json({ msg: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }
];

exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserById = [
  param('id').isInt().withMessage('ID must be an integer'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await userService.getUserById(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];

exports.updateUser = [
  param('id').isInt().withMessage('ID must be an integer'),
  body('firstName').optional().notEmpty().withMessage('First name must not be empty'),
  body('lastName').optional().notEmpty().withMessage('Last name must not be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('password').optional().notEmpty().withMessage('Password must not be empty'),
  body('address').optional().isString().withMessage('Address must be a string'),
  body('designationId').optional().isInt().withMessage('Designation ID must be an integer'),
  body('managerId').optional().isInt().withMessage('Manager ID must be an integer'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await userService.updateUser(parseInt(req.params.id), req.body);
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];

exports.deleteUser = [
  param('id').isInt().withMessage('ID must be an integer'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      await userService.deleteUser(req.params.id);
      res.status(204).send();
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }
];

exports.getSubordinates = [
  param('userId').isInt().withMessage('User ID must be an integer'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const subordinates = await userService.getSubordinates(parseInt(req.params.userId));
      res.status(200).json(subordinates);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];

exports.getManager = [
  param('userId').isInt().withMessage('User ID must be an integer'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const manager = await userService.getManager(parseInt(req.params.userId));
      if (!manager) return res.status(404).json({ error: 'Manager not found' });
      res.status(200).json(manager);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];
