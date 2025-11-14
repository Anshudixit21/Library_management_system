const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const Book = require('../models/Book');
const Membership = require('../models/Membership');

router.get('/', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/issue', auth, async (req, res) => {
  try {
    const { bookName, serialNo, membershipNumber, issueDate, returnDate, remarks } = req.body;

    if (!bookName || !serialNo || !membershipNumber || !issueDate || !returnDate) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    const book = await Book.findOne({ serialNo });
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (!book.isAvailable) {
      return res.status(400).json({ message: 'Book is not available' });
    }

    const membership = await Membership.findOne({ membershipNumber });
    if (!membership || !membership.isActive) {
      return res.status(400).json({ message: 'Invalid or inactive membership' });
    }

    book.isAvailable = false;
    await book.save();

    const transaction = new Transaction({
      bookName,
      author: book.author,
      serialNo,
      membershipNumber,
      issueDate: new Date(issueDate),
      returnDate: new Date(returnDate),
      remarks
    });

    await transaction.save();
    res.status(201).json({ message: 'Book issued successfully', transaction });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/return', auth, async (req, res) => {
  try {
    const { bookName, serialNo, actualReturnDate } = req.body;

    if (!bookName || !serialNo) {
      return res.status(400).json({ message: 'Book name and serial number are required' });
    }

    const transaction = await Transaction.findOne({
      bookName,
      serialNo,
      status: 'issued'
    }).sort({ createdAt: -1 });

    if (!transaction) {
      return res.status(404).json({ message: 'No active transaction found for this book' });
    }

    const returnDate = actualReturnDate ? new Date(actualReturnDate) : new Date();
    const expectedReturnDate = new Date(transaction.returnDate);
    
    let fineAmount = 0;
    if (returnDate > expectedReturnDate) {
      const daysLate = Math.ceil((returnDate - expectedReturnDate) / (1000 * 60 * 60 * 24));
      fineAmount = daysLate * 10;
    }

    transaction.actualReturnDate = returnDate;
    transaction.fineAmount = fineAmount;
    transaction.status = 'returned';

    await transaction.save();

    const book = await Book.findOne({ serialNo });
    if (book) {
      book.isAvailable = true;
      await book.save();
    }

    res.json({ message: 'Return processed', transaction });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/pay-fine/:id', auth, async (req, res) => {
  try {
    const { finePaid, remarks } = req.body;
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.fineAmount > 0 && !finePaid) {
      return res.status(400).json({ message: 'Fine must be paid before completing return' });
    }

    transaction.finePaid = finePaid || false;
    if (remarks) transaction.remarks = remarks;

    await transaction.save();
    res.json({ message: 'Fine payment processed', transaction });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

