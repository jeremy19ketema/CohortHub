const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/moduleController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

router.use(authenticate);

router.get('/cohort/:cohortId', moduleController.getModules);
router.get('/:id', moduleController.getModule);


router.post('/:moduleId/content', authorize('instructor', 'admin'), moduleController.createModuleContent);
router.patch('/content/:blockId', authorize('instructor', 'admin'), moduleController.updateModuleContent);
router.delete('/content/:blockId', authorize('instructor', 'admin'), moduleController.deleteModuleContent);

module.exports = router;