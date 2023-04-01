const express = require('express');
const mongoose = require('mongoose');

const userRoutes = require('./routes/users');
const cardRoutes = require('./routes/cards');

const app = express();
app.use((req, res, next) => {
  req.user = {
    _id: '64286c87e37203db54c87adb',
  };

  next();
});

app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/mestodb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

app.use('/users', userRoutes);
app.use('/cards', cardRoutes);
app.use('', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
