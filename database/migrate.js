
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'cohort_hub',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Starting migration...');
    
    
    await client.query(`
      DROP TABLE IF EXISTS user_answers, question_options, questions, quiz_attempts, quizzes,
        content_blocks, module_progress, modules, discussion_replies, discussions,
        announcements, notifications, certificates, enrollments, learning_streaks,
        user_profiles, cohorts, users CASCADE;
      DROP TYPE IF EXISTS user_role, enrollment_status, quiz_status CASCADE;
    `);
    console.log('Dropped existing tables');
    
    
    const schemaPath = path.join(__dirname, 'schema.sql');
    console.log(`Reading schema from: ${schemaPath}`);
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schema);
    console.log('Schema created successfully');
    
  
    const seedPath = path.join(__dirname, 'seed.sql');
    console.log(`Reading seed from: ${seedPath}`);
    const seed = fs.readFileSync(seedPath, 'utf8');
    await client.query(seed);
    console.log('Seed data inserted successfully');
    
    console.log('✅ Migration complete!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();