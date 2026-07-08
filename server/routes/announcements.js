const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
router.use(authenticate);
router.get('/cohort/:cohortId', announcementController.getAnnouncements);
router.post('/cohort/:cohortId', authorize('instructor','admin'), announcementController.createAnnouncement);
module.exports = router;