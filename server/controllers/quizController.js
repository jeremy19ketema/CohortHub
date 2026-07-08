const Quiz = require('../models/Quiz');
const Module = require('../models/Module');
const Certificate = require('../models/Certificate');
const db = require('../config/database');
const { AppError } = require('../utils/AppError');
const { asyncHandler } = require('../utils/asyncHandler');

exports.getQuiz = asyncHandler(async (req, res) => {
  const { moduleId } = req.params;
  

  const moduleCheck = await db.query('SELECT * FROM modules WHERE id = $1 AND is_published = true', [moduleId]);
  if (moduleCheck.rows.length === 0) {
    throw new AppError('Module not found', 404);
  }
  

  if (!(await Module.checkPrerequisite(moduleId, req.user.id))) {
    throw new AppError('Complete previous modules first', 403);
  }
  
  const quiz = await Quiz.findByModule(moduleId);
  if (!quiz) {
    throw new AppError('No quiz available for this module', 404);
  }
  

  const attempts = await Quiz.getAttemptCount(req.user.id, quiz.id);
  if (attempts >= quiz.max_attempts) {
    throw new AppError('Maximum attempts reached', 403);
  }
  
 
  const questions = await Quiz.getQuestions(quiz.id);
  
 
  console.log('✅ Quiz found:', quiz.id, quiz.title);
  console.log('📝 Questions found:', questions.length);
  
  
  if (questions.length === 0) {
    throw new AppError('No questions found for this quiz', 404);
  }
  
  
  res.json({
    status: 'success',
    data: {
      quiz: {
        id: quiz.id,
        title: quiz.title,
        passingScore: quiz.passing_score,
        questions: questions
      },
      attemptsRemaining: quiz.max_attempts - attempts
    }
  });
});

exports.submitQuiz = asyncHandler(async (req, res) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    
   
    const quizResult = await client.query('SELECT * FROM quizzes WHERE id = $1', [req.params.id]);
    if (quizResult.rows.length === 0) {
      throw new AppError('Quiz not found', 404);
    }
    const quiz = quizResult.rows[0];
    
    
    const attemptsResult = await client.query(
      'SELECT COUNT(*) as count FROM quiz_attempts WHERE user_id = $1 AND quiz_id = $2',
      [req.user.id, quiz.id]
    );
    const attempts = parseInt(attemptsResult.rows[0].count);
    if (attempts >= quiz.max_attempts) {
      throw new AppError('Maximum attempts reached', 403);
    }
    
  
    const attemptResult = await client.query(
      'INSERT INTO quiz_attempts (user_id, quiz_id, attempt_number) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, quiz.id, attempts + 1]
    );
    const attempt = attemptResult.rows[0];
    
    let totalPoints = 0;
    let earnedPoints = 0;
    
    
    for (const answer of req.body.answers) {
     
      const questionResult = await client.query(
        'SELECT points FROM questions WHERE id = $1',
        [answer.questionId]
      );
      if (questionResult.rows.length === 0) continue;
      
      const points = questionResult.rows[0].points;
      totalPoints += points;
      
     
      const correctResult = await client.query(
        'SELECT id FROM question_options WHERE question_id = $1 AND is_correct = true',
        [answer.questionId]
      );
      
      const isCorrect = correctResult.rows[0]?.id === answer.selectedOptionId;
      if (isCorrect) earnedPoints += points;
      
    
      await client.query(
        'INSERT INTO user_answers (attempt_id, question_id, selected_option_id, is_correct) VALUES ($1, $2, $3, $4)',
        [attempt.id, answer.questionId, answer.selectedOptionId, isCorrect]
      );
    }
    
   
    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const passed = score >= quiz.passing_score;
    
    
    await client.query(
      'UPDATE quiz_attempts SET score = $1, status = $2, completed_at = CURRENT_TIMESTAMP WHERE id = $3',
      [score, passed ? 'passed' : 'failed', attempt.id]
    );
    
    
if (passed) {
  
  await client.query(
    'UPDATE module_progress SET is_completed = true, completed_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND module_id = $2',
    [req.user.id, quiz.module_id]
  );
  
  
  const moduleResult = await client.query(
    'SELECT cohort_id FROM modules WHERE id = $1',
    [quiz.module_id]
  );
  const cohortId = moduleResult.rows[0]?.cohort_id;
  
  if (cohortId) {
    
    const completionResult = await client.query(
      `SELECT 
        COUNT(m.id) as total,
        COUNT(mp.id) FILTER (WHERE mp.is_completed) as completed
       FROM modules m
       LEFT JOIN module_progress mp ON m.id = mp.module_id AND mp.user_id = $1
       WHERE m.cohort_id = $2 AND m.is_published = true`,
      [req.user.id, cohortId]
    );
    
    const total = parseInt(completionResult.rows[0].total);
    const completed = parseInt(completionResult.rows[0].completed);
    
    console.log(`📊 Cohort progress: ${completed}/${total} modules completed`);
    
    
    if (total > 0 && completed >= total) {
      const certNumber = 'CERT-' + Date.now() + '-' + req.user.id.substring(0, 8);
      await client.query(
        'INSERT INTO certificates (user_id, cohort_id, certificate_number) VALUES ($1, $2, $3) ON CONFLICT (user_id, cohort_id) DO NOTHING',
        [req.user.id, cohortId, certNumber]
      );
      
      await client.query(
        'INSERT INTO notifications (user_id, type, title, message) VALUES ($1, $2, $3, $4)',
        [req.user.id, 'certificate', '🎓 Certificate Earned!', `You completed all modules in the cohort!`]
      );
      
      console.log(`✅ Certificate generated for user ${req.user.id} for cohort ${cohortId}`);
    }
  
       
        await client.query(
          'INSERT INTO notifications (user_id, type, title, message) VALUES ($1, $2, $3, $4)',
          [req.user.id, 'quiz_passed', 'Quiz Passed!', `✅ You scored ${Math.round(score)}% on "${quiz.title}"`]
        );
      }
    }
    
    await client.query('COMMIT');
    
    res.json({
      status: 'success',
      data: {
        score: score,
        passed: passed,
        earnedPoints: earnedPoints,
        totalPoints: totalPoints,
        passingScore: quiz.passing_score
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});