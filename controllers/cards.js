const mongoose = require('mongoose');
const Card = require('../models/card');

exports.getCards = async (req, res) => {
  try {
    const cards = await Card.find({});
    res.status(200).json(cards);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.createCard = async (req, res) => {
  try {
    const { name, link } = req.body;
    if (!name || !link) {
      res.status(400).json({ message: 'Name and link are required' });
      return;
    }
    if (name && (name.length < 2 || name.length > 30)) {
      res.status(400).json({ message: 'Name must be between 2 and 30 characters' });
      return;
    }
    if (link && (link.length < 2 || link.length > 30)) {
      res.status(400).json({ message: 'Link must be between 2 and 30 characters' });
      return;
    }
    const card = await Card.create({ name, link, owner: req.user._id });
    res.status(201).json(card);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.likeCard = async (req, res) => {
  try {
    if (req.params.cardId.length !== 24 || !mongoose.Types.ObjectId.isValid(req.params.cardId)) {
      res.status(404).json({ message: 'Card not found' });
      return;
    }
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    );
    if (card) {
      res.status(200).json(card);
    } else {
      res.status(404).json({ message: 'Card not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.dislikeCard = async (req, res) => {
  try {
    if (req.params.cardId.length !== 24 || !mongoose.Types.ObjectId.isValid(req.params.cardId)) {
      res.status(404).json({ message: 'Card not found' });
      return;
    }
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    );
    if (card) {
      res.status(200).json(card);
    } else {
      res.status(404).json({ message: 'Card not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};
exports.deleteCard = async (req, res) => {
  try {
    if (req.params.cardId.length !== 24 || !mongoose.Types.ObjectId.isValid(req.params.cardId)) {
      res.status(404).json({ message: 'Card not found' });
      return;
    }
    const card = await Card.findByIdAndDelete(req.params.cardId);
    if (card) {
      res.status(200).json(card);
    } else {
      res.status(404).json({ message: 'Card not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};