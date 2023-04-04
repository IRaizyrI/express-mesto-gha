const express = require('express');

const router = express.Router();

const userController = require('../controllers/users');

router.get('/', userController.getUsers);
router.get('/:userId', userController.getUserById);
router.get('/me', userController.getCurrentUser);
router.patch('/me', userController.updateProfile);
router.patch('/me/avatar', userController.updateAvatar);

module.exports = router;
