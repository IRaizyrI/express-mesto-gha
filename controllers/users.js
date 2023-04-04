const mongoose = require('mongoose');
const http2 = require('node:http2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BadRequestError = require('../errors/bad-request-err');
const NotFoundError = require('../errors/not-found-err');
const ConflictError = require('../errors/conflict-err');
const InternalServerError = require('../errors/internal-server-err');
require('dotenv').config();

const {
  HTTP_STATUS_OK,
  HTTP_STATUS_CREATED,
} = http2.constants;

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    res.status(HTTP_STATUS_OK).json(users);
  } catch (err) {
    next(new InternalServerError('Error fetching users'));
  }
};
exports.getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.status(HTTP_STATUS_OK).json(user);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new NotFoundError('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new NotFoundError('Invalid email or password');
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(HTTP_STATUS_OK).cookie('jwt', token, {
      maxAge: 3600000,
      httpOnly: true,
    }).end();
  } catch (err) {
    next(err);
  }
};

exports.createUser = async (req, res, next) => {
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
      next(new BadRequestError('Invalid user data'));
    }
    if (err.code === 11000) {
      next(new ConflictError('User with this email already exists'));
    } else {
      next(err);
    }
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (user) {
      res.status(HTTP_STATUS_OK).json(user);
    } else {
      throw new NotFoundError('User not found');
    }
  } catch (err) {
    if (err instanceof mongoose.Error.CastError) {
      next(new BadRequestError('Incorrect ID'));
    } else {
      next(err);
    }
  }
};

exports.updateProfile = async (req, res, next) => {
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
      throw new NotFoundError('User not found');
    }
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      next(new BadRequestError('Invalid Data'));
    } else {
      next(err);
    }
  }
};

exports.updateAvatar = async (req, res, next) => {
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
      throw new NotFoundError('User not found');
    }
  } catch (err) {
    next(err);
  }
};
