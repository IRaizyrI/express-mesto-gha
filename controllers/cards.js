const mongoose = require('mongoose');
const http2 = require('node:http2');
const Card = require('../models/card');

const {
  HTTP_STATUS_OK,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_CREATED,
} = http2.constants;

exports.getCards = async (req, res) => {
  try {
    const cards = await Card.find({}).populate('owner');
    res.status(HTTP_STATUS_OK).json(cards);
  } catch (err) {
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: 'Server Error' });
  }
};

exports.createCard = async (req, res) => {
  try {
    const { name, link } = req.body;
    const card = await Card.create({ name, link, owner: req.user._id });
    res.status(HTTP_STATUS_CREATED).json(card);
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      res.status(HTTP_STATUS_BAD_REQUEST).json({ message: 'Invalid Data' });
      return;
    }
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: 'Server Error' });
  }
};

exports.likeCard = async (req, res) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    );
    if (card) {
      res.status(HTTP_STATUS_OK).json(card);
    } else {
      res.status(HTTP_STATUS_NOT_FOUND).json({ message: 'Card not found' });
    }
  } catch (err) {
    if (err instanceof mongoose.Error.CastError) {
      res.status(HTTP_STATUS_BAD_REQUEST).json({ message: 'Incorrect ID' });
      return;
    }
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: 'Server Error' });
  }
};

exports.dislikeCard = async (req, res) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    );
    if (card) {
      res.status(HTTP_STATUS_OK).json(card);
    } else {
      res.status(HTTP_STATUS_NOT_FOUND).json({ message: 'Card not found' });
    }
  } catch (err) {
    if (err instanceof mongoose.Error.CastError) {
      res.status(HTTP_STATUS_BAD_REQUEST).json({ message: 'Incorrect ID' });
      return;
    }
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: 'Server Error' });
  }
};
exports.deleteCard = async (req, res) => {
  try {
    const card = await Card.findByIdAndDelete(req.params.cardId);
    if (card) {
      res.status(HTTP_STATUS_OK).json(card);
    } else {
      res.status(HTTP_STATUS_NOT_FOUND).json({ message: 'Card not found' });
    }
  } catch (err) {
    if (err instanceof mongoose.Error.CastError) {
      res.status(HTTP_STATUS_BAD_REQUEST).json({ message: 'Incorrect ID' });
      return;
    }
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: 'Server Error' });
  }
};
