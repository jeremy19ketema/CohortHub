const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { AppError } = require('../utils/AppError');
const { asyncHandler } = require('../utils/asyncHandler');
const logger = require('../config/logger');

const generateTokens = (user) => {
  if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) throw new AppError('JWT secrets not configured', 500);
  const at = jwt.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_ACCESS_SECRET, { expiresIn: '30m' });
  const rt = jwt.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken: at, refreshToken: rt };
};
const hashToken = (t) => crypto.createHash('sha256').update(t).digest('hex');

exports.register = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  if (await User.findByEmail(email)) throw new AppError('Email already registered', 400);
  const user = await User.create({ email, password, firstName, lastName });
  const tokens = generateTokens(user);
  await User.updateRefreshToken(user.id, hashToken(tokens.refreshToken));
  logger.info(`Registered: ${user.email}`);
  res.status(201).json({ status: 'success', data: { user: user.toSafeObject(), ...tokens } });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  const user = await User.findByEmail(email);
  if (!user) {
    throw new AppError('Invalid email or password. Please check your credentials.', 401);
  }
  
  const isValid = await user.validatePassword(password);
  if (!isValid) {
    throw new AppError('Invalid email or password. Please check your credentials.', 401);
  }
  
  const tokens = generateTokens(user);
  await User.updateRefreshToken(user.id, hashToken(tokens.refreshToken));
  await User.updateLastLogin(user.id);
  await User.updateStreak(user.id);
  
  logger.info(`User logged in: ${user.email}`);
  
  res.json({
    status: 'success',
    data: { user: user.toSafeObject(), accessToken: tokens.accessToken, refreshToken: tokens.refreshToken }
  });
});

exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new AppError('Token required', 400);
  const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.userId);
  if (!user || user.refresh_token !== hashToken(refreshToken)) throw new AppError('Invalid token', 401);
  const tokens = generateTokens(user);
  await User.updateRefreshToken(user.id, hashToken(tokens.refreshToken));
  res.json({ status: 'success', data: tokens });
});

exports.logout = asyncHandler(async (req, res) => {
  await User.updateRefreshToken(req.user.id, null);
  res.json({ status: 'success', message: 'Logged out' });
});