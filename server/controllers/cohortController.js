const Cohort = require('../models/Cohort');
const db = require('../config/database');
const { AppError } = require('../utils/AppError');
const { asyncHandler } = require('../utils/asyncHandler');

exports.getAllCohorts = asyncHandler(async (req, res) => {
  const { page, limit, search } = req.query;
  const result = await Cohort.findAll({ 
    page: parseInt(page) || 1, 
    limit: parseInt(limit) || 12, 
    search: search || '' 
  });
  res.json({ status: 'success', data: result });
});

exports.getMyCohorts = asyncHandler(async (req, res) => {
  const cohorts = await Cohort.findByUser(req.user.id);
  res.json({ status: 'success', data: { cohorts } });
});

exports.getCohort = asyncHandler(async (req, res) => {
  const cohort = await Cohort.findById(req.params.id);
  if (!cohort) throw new AppError('Cohort not found', 404);
  
  
  const lecturerInfo = await db.query(
    `SELECT 
      u.id, 
      u.first_name, 
      u.last_name, 
      u.avatar_url,
      up.bio,
      up.phone,
      up.github_url,
      up.linkedin_url,
      up.website
     FROM users u
     LEFT JOIN user_profiles up ON u.id = up.user_id
     WHERE u.id = $1`,
    [cohort.instructor_id]
  );
  
  cohort.lecturer = lecturerInfo.rows[0] || null;
  
  res.json({ status: 'success', data: { cohort } });
});

exports.enrollInCohort = asyncHandler(async (req, res) => {
  await Cohort.enrollUser(req.params.id, req.user.id);
  await db.query(
    'INSERT INTO notifications (user_id, type, title, message) VALUES ($1,$2,$3,$4)',
    [req.user.id, 'enrollment', 'Enrolled!', 'Successfully enrolled in the cohort']
  );
  res.json({ status: 'success', message: 'Successfully enrolled' });
});

exports.createCohort = asyncHandler(async (req, res) => {
  const { name, description, startDate, endDate, maxStudents, about, requirements, whatYouWillLearn } = req.body;
  
  if (!name || !startDate || !endDate) {
    throw new AppError('Name, start date, and end date are required', 400);
  }
  
  const cohort = await Cohort.create({
    name,
    description: description || '',
    startDate,
    endDate,
    instructorId: req.user.id,
    maxStudents: maxStudents || 30,
    about: about || '',
    requirements: requirements || '',
    whatYouWillLearn: whatYouWillLearn || ''
  });
  
  res.status(201).json({ status: 'success', data: { cohort } });
});

exports.updateCohort = asyncHandler(async (req, res) => {
  const cohort = await Cohort.findById(req.params.id);
  if (!cohort) throw new AppError('Cohort not found', 404);
  
  if (cohort.instructor_id !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('You are not authorized to update this cohort', 403);
  }
  
  const updated = await Cohort.update(req.params.id, req.body);
  res.json({ status: 'success', data: { cohort: updated } });
});

exports.deleteCohort = asyncHandler(async (req, res) => {
  const cohort = await Cohort.findById(req.params.id);
  if (!cohort) throw new AppError('Cohort not found', 404);
  
  if (cohort.instructor_id !== req.user.id && req.user.role !== 'admin') {
    throw new AppError('You are not authorized to delete this cohort', 403);
  }
  
  await Cohort.delete(req.params.id);
  res.json({ status: 'success', message: 'Cohort deleted successfully' });
});