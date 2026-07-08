const crypto = require('crypto');
const User = require('../models/User');
const db = require('../config/database');
const { sendEmail } = require('../config/email');
const { AppError } = require('../utils/AppError');
const { asyncHandler } = require('../utils/asyncHandler');


exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  const user = await User.findByEmail(email);
  if (!user) {
    throw new AppError('No user found with this email', 404);
  }
  
  
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
  const resetExpires = new Date(Date.now() + 3600000); // 1 hour
  
  
  await db.query(
    'UPDATE users SET reset_token = $1, reset_expires = $2 WHERE id = $3',
    [resetTokenHash, resetExpires, user.id]
  );
  
 
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/views/reset-password.html?token=${resetToken}`;
  
  await sendEmail({
    to: email,
    subject: 'Password Reset Request - CohortHub',
    html: `
      <h1>Reset Your Password</h1>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #24443B; color: white; text-decoration: none; border-radius: 4px;">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  });
  
  res.json({ status: 'success', message: 'Password reset email sent' });
});


exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  
  const result = await db.query(
    'SELECT id FROM users WHERE reset_token = $1 AND reset_expires > NOW()',
    [tokenHash]
  );
  
  if (result.rows.length === 0) {
    throw new AppError('Invalid or expired token', 400);
  }
  
  const user = await User.findById(result.rows[0].id);
  
  
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(password, salt);
  
  await db.query(
    'UPDATE users SET password_hash = $1, reset_token = NULL, reset_expires = NULL WHERE id = $2',
    [hash, user.id]
  );
  
  res.json({ status: 'success', message: 'Password reset successfully' });
});