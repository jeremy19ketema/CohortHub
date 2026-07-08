const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const upload = require('../config/upload');


router.use(authenticate);


router.get('/profile', userController.getProfile);
router.patch('/profile', userController.updateProfile);
router.post('/avatar', upload.single('avatar'), userController.uploadAvatar);
router.get('/stats', userController.getUserStats);
router.get('/notifications', userController.getNotifications);
router.patch('/notifications/:id/read', userController.markNotificationRead);


router.get('/', authorize('admin'), userController.getAllUsers);
router.patch('/:userId/role', authorize('admin'), userController.updateUserRole);
router.patch('/:userId/toggle-status', authorize('admin'), userController.toggleUserStatus);
router.delete('/:userId', authorize('admin'), userController.deleteUser);

module.exports = router;