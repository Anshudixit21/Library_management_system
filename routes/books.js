const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const Book = require('../models/Book');

router.get('/', async (req, res) => {
  try {
    const { name, author, type, serialNo } = req.query;
    const query = {};

    if (name) query.name = { $regex: name, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (type) query.type = type;
    if (serialNo) query.serialNo = serialNo;

    const books = await Book.find(query);
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/available', async (req, res) => {
  try {
    const { name, author, type, serialNo } = req.query;
    const query = { isAvailable: true };

    if (name) query.name = { $regex: name, $options: 'i' };
    if (author) query.author = { $regex: author, $options: 'i' };
    if (type) query.type = type;
    if (serialNo) query.serialNo = serialNo;

    const books = await Book.find(query);
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { name, author, type, serialNo } = req.body;

    if (!name || !author || !serialNo) {
      return res.status(400).json({ message: 'All fields are mandatory' });
    }

    const existingBook = await Book.findOne({ serialNo });
    if (existingBook) {
      return res.status(400).json({ message: 'Book with this serial number already exists' });
    }

    const book = new Book({
      name,
      author,
      type: type || 'book',
      serialNo
    });

    await book.save();
    res.status(201).json({ message: 'Book added successfully', book });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { name, author, type, serialNo } = req.body;

    if (!name || !author || !serialNo) {
      return res.status(400).json({ message: 'All fields are mandatory' });
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (serialNo !== book.serialNo) {
      const existingBook = await Book.findOne({ serialNo });
      if (existingBook) {
        return res.status(400).json({ message: 'Book with this serial number already exists' });
      }
    }

    book.name = name;
    book.author = author;
    book.type = type || 'book';
    book.serialNo = serialNo;

    await book.save();
    res.json({ message: 'Book updated successfully', book });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

