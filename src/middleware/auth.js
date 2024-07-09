const jwt = require('jsonwebtoken');
const {getAsync} = require('../config/redis');
const {unless} = require('express-unless');


const authMiddleware= async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: 'Access Denied: No Token Provided!' });
    }

    const token = authHeader.replace('Bearer ', '');
    const data = await getAsync(token);

    if (!data) {
      return res.status(401).json({ message: 'Invalid Token' });
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid Token' });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Error in authenticateToken middleware:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

authMiddleware.unless = unless;
module.exports = authMiddleware;
