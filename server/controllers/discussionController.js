const db = require('../config/database');
const { AppError } = require('../utils/AppError');
const { asyncHandler } = require('../utils/asyncHandler');

exports.getDiscussions = asyncHandler(async (req, res) => {
  const r = await db.query(`SELECT d.*, u.first_name, u.last_name, (SELECT COUNT(*) FROM discussion_replies WHERE discussion_id=d.id) as reply_count FROM discussions d JOIN users u ON d.user_id=u.id WHERE d.cohort_id=$1 ORDER BY d.is_pinned DESC, d.created_at DESC`, [req.params.cohortId]);
  res.json({ status: 'success', data: { discussions: r.rows } });
});
exports.getDiscussion = asyncHandler(async (req, res) => {
  const d = await db.query(`SELECT d.*, u.first_name, u.last_name FROM discussions d JOIN users u ON d.user_id=u.id WHERE d.id=$1`, [req.params.id]);
  if (d.rows.length === 0) throw new AppError('Not found', 404);
  const replies = await db.query(`SELECT r.*, u.first_name, u.last_name FROM discussion_replies r JOIN users u ON r.user_id=u.id WHERE r.discussion_id=$1 ORDER BY r.created_at`, [req.params.id]);
  res.json({ status: 'success', data: { discussion: d.rows[0], replies: replies.rows } });
});
exports.createDiscussion = asyncHandler(async (req, res) => {
  const r = await db.query(`INSERT INTO discussions (cohort_id,user_id,title,content) VALUES ($1,$2,$3,$4) RETURNING *`, [req.params.cohortId, req.user.id, req.body.title, req.body.content]);
  res.status(201).json({ status: 'success', data: { discussion: r.rows[0] } });
});
exports.addReply = asyncHandler(async (req, res) => {
  const r = await db.query(`INSERT INTO discussion_replies (discussion_id,user_id,content) VALUES ($1,$2,$3) RETURNING *`, [req.params.id, req.user.id, req.body.content]);
  res.status(201).json({ status: 'success', data: { reply: r.rows[0] } });
});