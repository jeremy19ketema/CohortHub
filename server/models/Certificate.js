const db = require('../config/database');

class Certificate {
  static async findByUser(userId) {
    const result = await db.query(`
      SELECT c.*, co.name as cohort_name 
      FROM certificates c 
      JOIN cohorts co ON c.cohort_id = co.id 
      WHERE c.user_id = $1 
      ORDER BY c.issue_date DESC
    `, [userId]);
    return result.rows;
  }

  static async generate(userId, cohortId) {
    const certNumber = 'CERT-' + Date.now() + '-' + userId.substring(0, 8);
    const result = await db.query(
      'INSERT INTO certificates (user_id, cohort_id, certificate_number) VALUES ($1, $2, $3) ON CONFLICT (user_id, cohort_id) DO NOTHING RETURNING *',
      [userId, cohortId, certNumber]
    );
    return result.rows[0] || null;
  }

  static async findById(id, userId) {
    const result = await db.query(`
      SELECT c.*, co.name as cohort_name, u.first_name, u.last_name 
      FROM certificates c 
      JOIN cohorts co ON c.cohort_id = co.id 
      JOIN users u ON c.user_id = u.id 
      WHERE c.id = $1 AND c.user_id = $2
    `, [id, userId]);
    return result.rows[0] || null;
  }
}

module.exports = Certificate;