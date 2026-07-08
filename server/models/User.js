const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  constructor(data) {
    this.id = data.id; this.email = data.email; this.password_hash = data.password_hash;
    this.first_name = data.first_name; this.last_name = data.last_name;
    this.role = data.role; this.is_active = data.is_active; this.avatar_url = data.avatar_url;
    this.refresh_token = data.refresh_token; this.last_login = data.last_login;
    this.bio = data.bio; this.phone = data.phone; this.github_url = data.github_url;
    this.linkedin_url = data.linkedin_url; this.website = data.website;
  }

  static async create({ email, password, firstName, lastName, role = 'student' }) {
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(password, salt);
    const result = await db.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [email.toLowerCase().trim(), hash, firstName.trim(), lastName.trim(), role]
    );
    const user = new User(result.rows[0]);
    await db.query('INSERT INTO user_profiles (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [user.id]);
    await db.query('INSERT INTO learning_streaks (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [user.id]);
    return user;
  }

  static async findByEmail(email) {
    const result = await db.query(
      `SELECT u.*, up.bio, up.phone, up.github_url, up.linkedin_url, up.website 
       FROM users u LEFT JOIN user_profiles up ON u.id = up.user_id WHERE u.email = $1 AND u.is_active = true`,
      [email.toLowerCase().trim()]
    );
    return result.rows[0] ? new User(result.rows[0]) : null;
  }

  static async findById(id) {
    const result = await db.query(
      `SELECT u.*, up.bio, up.phone, up.github_url, up.linkedin_url, up.website 
       FROM users u LEFT JOIN user_profiles up ON u.id = up.user_id WHERE u.id = $1`, [id]
    );
    return result.rows[0] ? new User(result.rows[0]) : null;
  }

  async validatePassword(password) { return await bcrypt.compare(password, this.password_hash); }
  static async updateRefreshToken(userId, token) { await db.query('UPDATE users SET refresh_token=$1 WHERE id=$2', [token, userId]); }
  static async updateLastLogin(userId) { await db.query('UPDATE users SET last_login=CURRENT_TIMESTAMP WHERE id=$1', [userId]); }

  static async updateProfile(userId, data) {
    const fields = []; const values = []; let i = 1;
    for (const [k, v] of Object.entries(data)) {
      if (['bio','phone','github_url','linkedin_url','website'].includes(k)) {
        fields.push(`${k}=$${i}`); values.push(v); i++;
      }
    }
    if (fields.length === 0) return;
    values.push(userId);
    await db.query(`UPDATE user_profiles SET ${fields.join(',')}, updated_at=CURRENT_TIMESTAMP WHERE user_id=$${i}`, values);
  }

  static async getStats(userId) {
    const result = await db.query(
      `SELECT (SELECT COUNT(*) FROM enrollments WHERE user_id=$1 AND status='active') as active_cohorts,
              (SELECT COUNT(*) FROM enrollments WHERE user_id=$1 AND status='completed') as completed_cohorts,
              (SELECT COUNT(*) FROM module_progress WHERE user_id=$1 AND is_completed=true) as completed_modules,
              (SELECT COUNT(*) FROM certificates WHERE user_id=$1) as certificates_earned,
              COALESCE((SELECT current_streak FROM learning_streaks WHERE user_id=$1),0) as streak`, [userId]
    );
    return result.rows[0];
  }

  static async updateStreak(userId) {
    const today = new Date().toISOString().split('T')[0];
    const s = await db.query('SELECT * FROM learning_streaks WHERE user_id=$1', [userId]);
    if (s.rows.length === 0) { await db.query('INSERT INTO learning_streaks (user_id,current_streak,longest_streak,last_activity_date) VALUES ($1,1,1,$2)', [userId,today]); return; }
    const streak = s.rows[0];
    const y = new Date(); y.setDate(y.getDate()-1); const ys = y.toISOString().split('T')[0];
    const lastDate = streak.last_activity_date ? new Date(streak.last_activity_date).toISOString().split('T')[0] : null;
    if (lastDate === today) return;
    let ns = lastDate === ys ? streak.current_streak + 1 : 1;
    await db.query('UPDATE learning_streaks SET current_streak=$1, longest_streak=GREATEST(longest_streak,$1), last_activity_date=$2 WHERE user_id=$3', [ns, today, userId]);
  }

  toSafeObject() {
    return { id: this.id, email: this.email, firstName: this.first_name, lastName: this.last_name,
             role: this.role, avatarUrl: this.avatar_url, bio: this.bio, phone: this.phone,
             githubUrl: this.github_url, linkedinUrl: this.linkedin_url, website: this.website };
  }
}
module.exports = User;