const User = require('../models/User');
const db = require('../config/database');
const { AppError } = require('../utils/AppError');
const { asyncHandler } = require('../utils/asyncHandler');

exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ status: 'success', data: { user: user.toSafeObject() } });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  await User.updateProfile(req.user.id, req.body);
  const user = await User.findById(req.user.id);
  res.json({ status: 'success', data: { user: user.toSafeObject() } });
});

exports.uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No file', 400);
  const url = '/uploads/' + req.file.filename;
  await db.query('UPDATE users SET avatar_url=$1 WHERE id=$2', [url, req.user.id]);
  res.json({ status: 'success', data: { avatarUrl: url } });
});

exports.getUserStats = asyncHandler(async (req, res) => {
  const stats = await User.getStats(req.user.id);
  res.json({ status: 'success', data: { stats } });
});

exports.getNotifications = asyncHandler(async (req, res) => {
  const r = await db.query(
    'SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 20',
    [req.user.id]
  );
  res.json({ status: 'success', data: { notifications: r.rows } });
});

exports.markNotificationRead = asyncHandler(async (req, res) => {
  await db.query('UPDATE notifications SET is_read=true WHERE id=$1 AND user_id=$2', 
    [req.params.id, req.user.id]);
  res.json({ status: 'success' });
});


exports.getAllUsers = asyncHandler(async (req, res) => {
  const r = await db.query(
    `SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.is_active, u.created_at,
            up.bio, up.phone
     FROM users u 
     LEFT JOIN user_profiles up ON u.id = up.user_id 
     ORDER BY u.created_at DESC`
  );
  res.json({ status: 'success', data: { users: r.rows } });
});

exports.updateUserRole = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;
  
  if (!['student', 'instructor', 'admin'].includes(role)) {
    throw new AppError('Invalid role. Must be student, instructor, or admin', 400);
  }
  
  const r = await db.query(
    'UPDATE users SET role=$1 WHERE id=$2 RETURNING id, email, first_name, last_name, role, is_active',
    [role, userId]
  );
  
  if (r.rows.length === 0) throw new AppError('User not found', 404);
  res.json({ status: 'success', data: { user: r.rows[0] } });
});

exports.toggleUserStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  const user = await db.query('SELECT id, is_active FROM users WHERE id=$1', [userId]);
  if (user.rows.length === 0) throw new AppError('User not found', 404);
  
  const newStatus = !user.rows[0].is_active;
  const r = await db.query(
    'UPDATE users SET is_active=$1 WHERE id=$2 RETURNING id, email, first_name, last_name, role, is_active',
    [newStatus, userId]
  );
  
  res.json({ status: 'success', data: { user: r.rows[0] } });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  const r = await db.query('DELETE FROM users WHERE id=$1 RETURNING id', [userId]);
  if (r.rows.length === 0) throw new AppError('User not found', 404);
  
  res.json({ status: 'success', message: 'User deleted permanently' });
});