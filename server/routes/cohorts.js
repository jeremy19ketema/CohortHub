const express = require('express');
const router = express.Router();
const cohortController = require('../controllers/cohortController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

router.use(authenticate);


router.get('/', cohortController.getAllCohorts);
router.get('/my-cohorts', cohortController.getMyCohorts);
router.get('/:id', cohortController.getCohort);
router.post('/:id/enroll', cohortController.enrollInCohort);


router.post('/', authorize('instructor', 'admin'), cohortController.createCohort);
router.patch('/:id', authorize('instructor', 'admin'), cohortController.updateCohort);
router.delete('/:id', authorize('instructor', 'admin'), cohortController.deleteCohort);

module.exports = router;