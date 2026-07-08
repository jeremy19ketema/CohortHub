const db = require('../config/database');
class Module {
  static async findByCohort(cohortId, userId) {
    const r = await db.query(`SELECT m.*, COALESCE(mp.is_completed,false) as is_completed FROM modules m LEFT JOIN module_progress mp ON m.id=mp.module_id AND mp.user_id=$1 WHERE m.cohort_id=$2 AND m.is_published=true ORDER BY m.order_number`, [userId, cohortId]);
    return r.rows;
  }
  static async findById(moduleId, userId) {
    const r = await db.query(`SELECT m.*, COALESCE(mp.is_completed,false) as is_completed FROM modules m LEFT JOIN module_progress mp ON m.id=mp.module_id AND mp.user_id=$1 WHERE m.id=$2 AND m.is_published=true`, [userId, moduleId]);
    return r.rows[0] || null;
  }
  static async getContentBlocks(moduleId) {
    const r = await db.query('SELECT * FROM content_blocks WHERE module_id=$1 ORDER BY order_number', [moduleId]);
    return r.rows;
  }
  static async checkPrerequisite(moduleId, userId) {
    const mod = await db.query('SELECT cohort_id, order_number FROM modules WHERE id=$1', [moduleId]);
    if (mod.rows.length === 0) return false;
    const { cohort_id, order_number } = mod.rows[0];
    if (order_number <= 1) return true;
    const prev = await db.query(`SELECT COALESCE(mp.is_completed,false) as done FROM modules m LEFT JOIN module_progress mp ON m.id=mp.module_id AND mp.user_id=$1 WHERE m.cohort_id=$2 AND m.order_number=$3 AND m.is_published=true`, [userId, cohort_id, order_number-1]);
    return prev.rows[0]?.done || false;
  }
  static async trackProgress(moduleId, userId) { await db.query('INSERT INTO module_progress (user_id,module_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [userId, moduleId]); }
  static async markCompleted(moduleId, userId) { await db.query('UPDATE module_progress SET is_completed=true, completed_at=CURRENT_TIMESTAMP WHERE user_id=$1 AND module_id=$2', [userId, moduleId]); }
}
module.exports = Module;