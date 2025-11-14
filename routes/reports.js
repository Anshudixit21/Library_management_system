const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const Book = require('../models/Book');
const Membership = require('../models/Membership');

router.get('/', auth, async (req, res) => {
  try {
    const { type } = req.query;

    let data = {};

    if (!type || type === 'transactions') {
      data.transactions = await Transaction.find().sort({ createdAt: -1 });
    }

    if (!type || type === 'books') {
      data.books = await Book.find();
      data.availableBooks = await Book.countDocuments({ isAvailable: true });
      data.issuedBooks = await Book.countDocuments({ isAvailable: false });
    }

    if (!type || type === 'memberships') {
      data.memberships = await Membership.find();
      data.activeMemberships = await Membership.countDocuments({ isActive: true });
      data.inactiveMemberships = await Membership.countDocuments({ isActive: false });
    }

    if (!type || type === 'fines') {
      const transactionsWithFines = await Transaction.find({ fineAmount: { $gt: 0 } });
      const totalFines = transactionsWithFines.reduce((sum, t) => sum + t.fineAmount, 0);
      const paidFines = transactionsWithFines
        .filter(t => t.finePaid)
        .reduce((sum, t) => sum + t.fineAmount, 0);
      const pendingFines = totalFines - paidFines;

      data.fines = {
        transactions: transactionsWithFines,
        totalFines,
        paidFines,
        pendingFines
      };
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

