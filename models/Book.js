const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['book', 'movie'],
    required: true,
    default: 'book'
  },
  serialNo: {
    type: String,
    required: true,
    unique: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Book', bookSchema);

