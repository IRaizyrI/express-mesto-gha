const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorized-err');

require('dotenv').config();

const JWT_SECRET = 'fcbefc985e39544e8cdbd19cfbed78dd4d81562a7acec0b6d58bc0e9809eb958';
const auth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    const payload = jwt.verify(token, JWT_SECRET);

    req.user = payload;
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Authorization required'));
    } else {
      next(err);
    }
  }
};

module.exports = auth;
