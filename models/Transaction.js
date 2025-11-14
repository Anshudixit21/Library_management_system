const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  bookName: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  serialNo: {
    type: String,
    required: true
  },
  membershipNumber: {
    type: String,
    required: true
  },
  issueDate: {
    type: Date,
    required: true
  },
  returnDate: {
    type: Date,
    required: true
  },
  actualReturnDate: {
    type: Date
  },
  fineAmount: {
    type: Number,
    default: 0
  },
  finePaid: {
    type: Boolean,
    default: false
  },
  remarks: {
    type: String
  },
  status: {
    type: String,
    enum: ['issued', 'returned'],
    default: 'issued'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Transaction', transactionSchema);

