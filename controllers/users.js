const mongoose = require('mongoose');
const User = require('../models/user');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    if (req.params.userId.length !== 24 || !mongoose.Types.ObjectId.isValid(req.params.userId)) {
      res.status(400).json({ message: 'Incorrect ID' });
      return;
    }
    const user = await User.findById(req.params.userId);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, about, avatar } = req.body;
    if (!name || !about || !avatar) {
      res.status(400).json({ message: 'Name, about, and avatar are required fields.' });
      return;
    }
    if (name.length < 2 || name.length > 30) {
      res.status(400).json({ message: 'Name must be between 2 and 30 characters' });
      return;
    }
    if (about.length < 2 || about.length > 30) {
      res.status(400).json({ message: 'About must be between 2 and 30 characters' });
      return;
    }
    const user = await User.create({ name, about, avatar });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, about } = req.body;
    if (!name && !about) {
      res.status(400).json({ message: 'Name or about required' });
      return;
    }
    if (name && (name.length < 2 || name.length > 30)) {
      res.status(400).json({ message: 'Name must be between 2 and 30 characters' });
      return;
    }
    if (about && (about.length < 2 || about.length > 30)) {
      res.status(400).json({ message: 'About must be between 2 and 30 characters' });
      return;
    }
    const updateData = {};
    if (name) updateData.name = name;
    if (about) updateData.about = about;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true },
    );
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;
    if (!avatar) {
      res.status(400).json({ message: 'Avatar is required' });
      return;
    }
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true, runValidators: true },
    );
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};
