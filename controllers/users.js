const mongoose = require('mongoose');
const http2 = require('node:http2');
const User = require('../models/user');

const {
  HTTP_STATUS_OK,
  HTTP_STATUS_NOT_FOUND,
  HTTP_STATUS_BAD_REQUEST,
  HTTP_STATUS_INTERNAL_SERVER_ERROR,
  HTTP_STATUS_CREATED,
} = http2.constants;

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(HTTP_STATUS_OK).json(users);
  } catch (err) {
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: 'Server Error' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, about, avatar } = req.body;
    const user = await User.create({ name, about, avatar });
    res.status(HTTP_STATUS_CREATED).json(user);
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      res.status(HTTP_STATUS_BAD_REQUEST).json({ message: 'Invalid Data' });
      return;
    }
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: 'Server Error' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (user) {
      res.status(HTTP_STATUS_OK).json(user);
    } else {
      res.status(HTTP_STATUS_NOT_FOUND).json({ message: 'User not found' });
    }
  } catch (err) {
    if (err instanceof mongoose.Error.CastError) {
      res.status(HTTP_STATUS_BAD_REQUEST).json({ message: 'Incorrect ID' });
      return;
    }
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: 'Server Error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, about } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (about) updateData.about = about;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true },
    );
    if (user) {
      res.status(HTTP_STATUS_OK).json(user);
    } else {
      res.status(HTTP_STATUS_NOT_FOUND).json({ message: 'User not found' });
    }
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      res.status(HTTP_STATUS_BAD_REQUEST).json({ message: 'Invalid Data' });
      return;
    }
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: 'Server Error' });
  }
};

exports.updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true, runValidators: true },
    );
    if (user) {
      res.status(HTTP_STATUS_OK).json(user);
    } else {
      res.status(HTTP_STATUS_NOT_FOUND).json({ message: 'User not found' });
    }
  } catch (err) {
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: 'Server Error' });
  }
};
