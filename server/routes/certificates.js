const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', certificateController.getUserCertificates);
router.get('/:id/pdf', certificateController.generateCertificatePDF);

module.exports = router;