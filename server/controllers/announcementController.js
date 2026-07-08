const db = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');

exports.getAnnouncements = asyncHandler(async (req, res) => {
  const r = await db.query(`SELECT a.*, u.first_name, u.last_name FROM announcements a JOIN users u ON a.user_id=u.id WHERE a.cohort_id=$1 ORDER BY a.is_important DESC, a.created_at DESC LIMIT 10`, [req.params.cohortId]);
  res.json({ status: 'success', data: { announcements: r.rows } });
});
exports.createAnnouncement = asyncHandler(async (req, res) => {
  const r = await db.query(`INSERT INTO announcements (cohort_id,user_id,title,content,is_important) VALUES ($1,$2,$3,$4,$5) RETURNING *`, [req.params.cohortId, req.user.id, req.body.title, req.body.content, req.body.isImportant||false]);
  res.status(201).json({ status: 'success', data: { announcement: r.rows[0] } });
});