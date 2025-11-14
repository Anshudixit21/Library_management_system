const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const Membership = require('../models/Membership');

router.get('/', auth, async (req, res) => {
  try {
    const memberships = await Membership.find();
    res.json(memberships);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:membershipNumber', auth, async (req, res) => {
  try {
    const membership = await Membership.findOne({ membershipNumber: req.params.membershipNumber });
    if (!membership) {
      return res.status(404).json({ message: 'Membership not found' });
    }
    res.json(membership);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { membershipNumber, name, email, phone, address, membershipType } = req.body;

    if (!membershipNumber || !name || !email || !phone || !address || !membershipType) {
      return res.status(400).json({ message: 'All fields are mandatory' });
    }

    const existingMembership = await Membership.findOne({ membershipNumber });
    if (existingMembership) {
      return res.status(400).json({ message: 'Membership number already exists' });
    }

    const startDate = new Date();
    const endDate = new Date();
    
    if (membershipType === '6 months') {
      endDate.setMonth(endDate.getMonth() + 6);
    } else if (membershipType === '1 year') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else if (membershipType === '2 years') {
      endDate.setFullYear(endDate.getFullYear() + 2);
    }

    const membership = new Membership({
      membershipNumber,
      name,
      email,
      phone,
      address,
      membershipType,
      startDate,
      endDate
    });

    await membership.save();
    res.status(201).json({ message: 'Membership added successfully', membership });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:membershipNumber', auth, adminAuth, async (req, res) => {
  try {
    const { name, email, phone, address, membershipType, isActive } = req.body;

    const membership = await Membership.findOne({ membershipNumber: req.params.membershipNumber });
    if (!membership) {
      return res.status(404).json({ message: 'Membership not found' });
    }

    if (name) membership.name = name;
    if (email) membership.email = email;
    if (phone) membership.phone = phone;
    if (address) membership.address = address;
    if (isActive !== undefined) membership.isActive = isActive;

    if (membershipType) {
      const extensionMonths = membershipType === '6 months' ? 6 : 
                             membershipType === '1 year' ? 12 : 24;
      const newEndDate = new Date(membership.endDate);
      newEndDate.setMonth(newEndDate.getMonth() + extensionMonths);
      membership.endDate = newEndDate;
      membership.membershipType = membershipType;
    }

    await membership.save();
    res.json({ message: 'Membership updated successfully', membership });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

