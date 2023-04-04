const jwt = require('jsonwebtoken');
const http2 = require('node:http2');
require('dotenv').config();

const {
  HTTP_STATUS_BAD_REQUEST,
} = http2.constants;
require('dotenv').config();

const auth = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    res.status(HTTP_STATUS_BAD_REQUEST).json({ message: 'Необходима авторизация' });
    return;
  }

  let payload;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    res.status(HTTP_STATUS_BAD_REQUEST).json({ message: 'Необходима авторизация' });
    return;
  }

  req.user = payload;
  next();
};

module.exports = auth;
