const express = require('express');
const { celebrate, Joi } = require('celebrate');

const router = express.Router();

const cardController = require('../controllers/cards');

router.get('/', cardController.getCards);
router.post(
  '/',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required().min(2).max(30),
      link: Joi.string().required().uri({ domain: {} }),
    }),
  }),
  cardController.createCard,
);
router.put(
  '/:cardId/likes',
  celebrate({
    params: Joi.object().keys({
      cardId: Joi.string().hex().length(24),
    }),
  }),
  cardController.likeCard,
);
router.delete(
  '/:cardId/likes',
  celebrate({
    params: Joi.object().keys({
      cardId: Joi.string().hex().length(24),
    }),
  }),
  cardController.dislikeCard,
);

router.delete(
  '/:cardId',
  celebrate({
    params: Joi.object().keys({
      cardId: Joi.string().hex().length(24),
    }),
  }),
  cardController.deleteCard,
);

module.exports = router;
