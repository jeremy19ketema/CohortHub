const db = require('../config/database');

class Cohort {
  static async findAll({ page = 1, limit = 12, search = '' }) {
    const offset = (page-1)*limit;
    let q = `SELECT c.*, u.first_name || ' ' || u.last_name as instructor_name, u.avatar_url, COUNT(e.id) FILTER (WHERE e.status='active') as enrolled_count FROM cohorts c LEFT JOIN users u ON c.instructor_id=u.id LEFT JOIN enrollments e ON c.id=e.cohort_id WHERE c.is_active=true`;
    const p = [];
    if (search) { q += ` AND (c.name ILIKE $1 OR c.description ILIKE $1 OR c.about ILIKE $1)`; p.push(`%${search}%`); }
    q += ` GROUP BY c.id, u.first_name, u.last_name, u.avatar_url ORDER BY c.start_date DESC LIMIT $${p.length+1} OFFSET $${p.length+2}`;
    p.push(limit, offset);
    const r = await db.query(q, p);
    const cq = search ? 'SELECT COUNT(*) FROM cohorts WHERE is_active=true AND (name ILIKE $1 OR description ILIKE $1 OR about ILIKE $1)' : 'SELECT COUNT(*) FROM cohorts WHERE is_active=true';
    const cr = await db.query(cq, search ? [`%${search}%`] : []);
    return { cohorts: r.rows, total: parseInt(cr.rows[0].count), page, limit };
  }

  static async findByUser(userId) {
    const r = await db.query(
      `SELECT c.*, e.status as enrollment_status, e.enrolled_at, u.first_name || ' ' || u.last_name as instructor_name,
              COALESCE(ROUND(COUNT(mp.id) FILTER (WHERE mp.is_completed)*100.0/NULLIF(COUNT(m.id),0)),0) as progress
       FROM cohorts c JOIN enrollments e ON c.id=e.cohort_id LEFT JOIN users u ON c.instructor_id=u.id
       LEFT JOIN modules m ON c.id=m.cohort_id AND m.is_published=true
       LEFT JOIN module_progress mp ON m.id=mp.module_id AND mp.user_id=$1
       WHERE e.user_id=$1 AND e.status!='dropped' GROUP BY c.id,e.status,e.enrolled_at,u.first_name,u.last_name ORDER BY c.start_date DESC`, [userId]
    );
    return r.rows;
  }

  static async findById(id) {
    const r = await db.query(
      `SELECT c.*, u.first_name || ' ' || u.last_name as instructor_name, u.avatar_url, 
              COUNT(e.id) FILTER (WHERE e.status='active') as enrolled_count
       FROM cohorts c 
       LEFT JOIN users u ON c.instructor_id=u.id 
       LEFT JOIN enrollments e ON c.id=e.cohort_id 
       WHERE c.id=$1 
       GROUP BY c.id, u.first_name, u.last_name, u.avatar_url`, 
      [id]
    );
    return r.rows[0] || null;
  }

  static async enrollUser(cohortId, userId) {
    const chk = await db.query(`SELECT c.max_students, COUNT(e.id) as cnt FROM cohorts c LEFT JOIN enrollments e ON c.id=e.cohort_id AND e.status='active' WHERE c.id=$1 GROUP BY c.max_students`, [cohortId]);
    if (chk.rows[0] && parseInt(chk.rows[0].cnt) >= chk.rows[0].max_students) throw new Error('Cohort is full');
    const r = await db.query(`INSERT INTO enrollments (user_id, cohort_id) VALUES ($1,$2) ON CONFLICT (user_id,cohort_id) DO UPDATE SET status='active' RETURNING *`, [userId, cohortId]);
    return r.rows[0];
  }

  static async create(data) {
    const r = await db.query(
      `INSERT INTO cohorts (name, description, about, requirements, what_you_will_learn, start_date, end_date, instructor_id, max_students) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [data.name, data.description, data.about, data.requirements, data.whatYouWillLearn, data.startDate, data.endDate, data.instructorId, data.maxStudents]
    );
    return r.rows[0];
  }

  static async update(id, data) {
    const fields = []; const vals = []; let i = 1;
    const allowedFields = ['name','description','about','requirements','what_you_will_learn'];
    for (const [k, v] of Object.entries(data)) {
      if (allowedFields.includes(k) && v !== undefined) {
        fields.push(`${k}=$${i}`); vals.push(v); i++;
      }
    }
    if (!fields.length) return null;
    vals.push(id);
    const r = await db.query(`UPDATE cohorts SET ${fields.join(',')} WHERE id=$${i} RETURNING *`, vals);
    return r.rows[0];
  }

  static async delete(id) {
    await db.query('DELETE FROM cohorts WHERE id=$1', [id]);
  }
}

module.exports = Cohort;