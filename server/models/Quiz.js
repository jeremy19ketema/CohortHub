const db = require('../config/database');

class Quiz {
  static async findByModule(moduleId) {
    const result = await db.query(
      'SELECT * FROM quizzes WHERE module_id = $1 AND is_active = true',
      [moduleId]
    );
    return result.rows[0] || null;
  }

  static async getQuestions(quizId) {
    const result = await db.query(`
      SELECT 
        q.id,
        q.question_text,
        q.points,
        q.order_number,
        COALESCE(
          json_agg(
            json_build_object(
              'id', qo.id,
              'text', qo.option_text,
              'order_number', qo.order_number
            ) ORDER BY qo.order_number
          ) FILTER (WHERE qo.id IS NOT NULL),
          '[]'
        ) as options
      FROM questions q
      LEFT JOIN question_options qo ON q.id = qo.question_id
      WHERE q.quiz_id = $1
      GROUP BY q.id, q.question_text, q.points, q.order_number
      ORDER BY q.order_number
    `, [quizId]);
    
    return result.rows;
  }

  static async getAttemptCount(userId, quizId) {
    const result = await db.query(
      'SELECT COUNT(*) as count FROM quiz_attempts WHERE user_id = $1 AND quiz_id = $2',
      [userId, quizId]
    );
    return parseInt(result.rows[0].count);
  }

  static async createAttempt(userId, quizId, attemptNumber) {
    const result = await db.query(
      'INSERT INTO quiz_attempts (user_id, quiz_id, attempt_number) VALUES ($1, $2, $3) RETURNING *',
      [userId, quizId, attemptNumber]
    );
    return result.rows[0];
  }

  static async getCorrectOption(questionId) {
    const result = await db.query(
      'SELECT id FROM question_options WHERE question_id = $1 AND is_correct = true',
      [questionId]
    );
    return result.rows[0]?.id;
  }

  static async saveAnswer(attemptId, questionId, selectedOptionId, isCorrect) {
    await db.query(
      'INSERT INTO user_answers (attempt_id, question_id, selected_option_id, is_correct) VALUES ($1, $2, $3, $4)',
      [attemptId, questionId, selectedOptionId, isCorrect]
    );
  }

  static async updateAttemptResult(attemptId, score, passed) {
    await db.query(
      'UPDATE quiz_attempts SET score = $1, status = $2, completed_at = CURRENT_TIMESTAMP WHERE id = $3',
      [score, passed ? 'passed' : 'failed', attemptId]
    );
  }
}

module.exports = Quiz;