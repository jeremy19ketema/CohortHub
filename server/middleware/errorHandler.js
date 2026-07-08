const logger = require('../config/logger');
const { AppError } = require('../utils/AppError');
const errorHandler = (err, req, res, next) => {
  logger.error({ message: err.message, path: req.path });
  if (err instanceof AppError) return res.status(err.statusCode).json({ status: err.status, message: err.message });
  if (err.code === '23505') return res.status(409).json({ status: 'fail', message: 'Duplicate entry' });
  res.status(500).json({ status: 'error', message: process.env.NODE_ENV === 'production' ? 'Server error' : err.message });
};
module.exports = { errorHandler };