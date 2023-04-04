const express = require('express');
const { celebrate, Joi } = require('celebrate');

const router = express.Router();

const userController = require('../controllers/users');

router.get('/', userController.getUsers);
router.get('/me', userController.getCurrentUser);
router.get(
  '/:userId',
  celebrate({
    params: Joi.object().keys({
      userId: Joi.string().hex().length(24),
    }),
  }),
  userController.getUserById,
);

router.patch(
  '/me',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      about: Joi.string().min(2).max(30),
    }),
  }),
  userController.updateProfile,
);

router.patch(
  '/me/avatar',
  celebrate({
    body: Joi.object().keys({
      avatar: Joi.string().uri({ domain: {} }).required(),
    }),
  }),
  userController.updateAvatar,
);

module.exports = router;
