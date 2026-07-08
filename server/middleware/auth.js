const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/AppError');
const authenticate = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) token = req.headers.authorization.split(' ')[1];
    if (!token) return next(new AppError('Please log in', 401));
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = { id: decoded.userId, email: decoded.email, role: decoded.role };
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') return next(new AppError('Invalid token', 401));
    if (error.name === 'TokenExpiredError') return next(new AppError('Token expired', 401));
    next(error);
  }
};
module.exports = { authenticate };