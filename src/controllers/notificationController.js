const { query, validationResult } = require('express-validator');
const { NotificationService } = require('@services/notificationService');

const notificationService = new NotificationService();


exports.getAllNotifications = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('pageSize').optional().isInt({ min: 1 }).withMessage('Page size must be a positive integer'),
  query('userId').optional().isInt().withMessage('User Id must be an integer'),
  query('date').optional().isISO8601().withMessage('Deadline must be a valid ISO8601 date'),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = req.query.page ? parseInt(req.query.page) : 1;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;
    const userId = req.query.userId ? parseInt(req.query.userId) : undefined;
    const date =  req.query.date ? new Date(req.query.date) : undefined;

    try {
      const { notifications, count } = await notificationService.getAllNotifications(page, pageSize, userId, date);
      return res.status(200).json({
        notifications,
        meta: {
          totalItems: count,
          currentPage: page,
          pageSize,
          totalPages: Math.ceil(count / pageSize)
        }
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
];

