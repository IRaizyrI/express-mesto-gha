const mongoose = require('mongoose');
const http2 = require('node:http2');
const Card = require('../models/card');
const BadRequestError = require('../errors/bad-request-err');
const NotFoundError = require('../errors/not-found-err');
const ForbiddenError = require('../errors/forbidden-err');

const {
  HTTP_STATUS_OK,
  HTTP_STATUS_CREATED,
} = http2.constants;

exports.getCards = async (req, res, next) => {
  try {
    const cards = await Card.find({}).populate(['owner', 'likes']);
    res.status(HTTP_STATUS_OK).json(cards);
  } catch (err) {
    next(err);
  }
};

exports.createCard = async (req, res, next) => {
  try {
    const { name, link } = req.body;
    const card = await Card.create({ name, link, owner: req.user._id });
    await card.populate('owner');
    res.status(HTTP_STATUS_CREATED).json(card);
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      next(new BadRequestError('Invalid Data'));
    } else {
      next(err);
    }
  }
};

exports.likeCard = async (req, res, next) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    ).populate('likes').populate('owner');
    if (card) {
      res.status(HTTP_STATUS_OK).json(card);
    } else {
      throw new NotFoundError('Card not found');
    }
  } catch (err) {
    if (err instanceof mongoose.Error.CastError) {
      next(new BadRequestError('Incorrect ID'));
    } else {
      next(err);
    }
  }
};

exports.dislikeCard = async (req, res, next) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    ).populate('likes').populate('owner');
    if (card) {
      res.status(HTTP_STATUS_OK).json(card);
    } else {
      throw new NotFoundError('Card not found');
    }
  } catch (err) {
    if (err instanceof mongoose.Error.CastError) {
      next(new BadRequestError('Incorrect ID'));
    } else {
      next(err);
    }
  }
};
exports.deleteCard = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.cardId);
    if (card.owner.toString() !== req.user._id) {
      throw ForbiddenError({ message: 'You are not allowed to delete this card' });
    }
    res.status(HTTP_STATUS_OK).json(card);
    await card.deleteOne();
  } catch (err) {
    if (err instanceof TypeError) {
      next(new NotFoundError('Card not found'));
    } else if (err instanceof mongoose.Error.CastError) {
      next(new BadRequestError('Incorrect ID'));
    } else {
      next(err);
    }
  }
};
