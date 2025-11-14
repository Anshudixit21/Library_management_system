const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const User = require('../models/User');

router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { username, password, role, name, email } = req.body;

    if (!username || !password || !role || !name || !email) {
      return res.status(400).json({ message: 'All fields are mandatory' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ username, password, role, name, email });
    await user.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { username, password, role, name, email } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (username) user.username = username;
    if (password) user.password = password;
    if (role) user.role = role;
    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

