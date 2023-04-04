const mongoose = require('mongoose');
const http2 = require('node:http2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();

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
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      res.status(HTTP_STATUS_NOT_FOUND).json({ message: 'Пользователь не найден' });
      return;
    }

    res.status(HTTP_STATUS_OK).json(user);
  } catch (err) {
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: 'Ошибка сервера' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(HTTP_STATUS_BAD_REQUEST).json({ message: 'Invalid email or password' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(HTTP_STATUS_BAD_REQUEST).json({ message: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(HTTP_STATUS_OK).cookie('jwt', token, {
      maxAge: 3600000,
      httpOnly: true,
    });
  } catch (err) {
    res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ message: 'Server Error' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const {
      name, about, avatar, email, password,
    } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      about,
      avatar,
      email,
      password: hashedPassword,
    });

    res.status(HTTP_STATUS_CREATED).json(user);
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      res.status(HTTP_STATUS_BAD_REQUEST).json({ message: 'Invalid Data' });
      return;
    }
    if (err.code === 11000) {
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
