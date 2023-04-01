const express = require('express');

const router = express.Router();

const cardController = require('../controllers/cards');

router.get('/', cardController.getCards);
router.post('/', cardController.createCard);
router.put('/:cardId/likes', cardController.likeCard);
router.delete('/:cardId/likes', cardController.dislikeCard);
router.delete('/:cardId', cardController.deleteCard);

module.exports = router;
