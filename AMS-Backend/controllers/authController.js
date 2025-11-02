const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ---------------------
// Helper: Generate JWT
// ---------------------
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ---------------------
// Signup
// ---------------------
exports.signup = async (req, res) => {
  try {
    let { name, email, password, role } = req.body;

    // Normalize role values from frontend (e.g., 'student' -> 'Student')
    if (role && typeof role === 'string') {
      role = role.trim().toLowerCase()
      if (role === 'student') role = 'Student'
      else if (role === 'teacher' || role === 'subject_teacher' || role === 'class_teacher') role = 'Teacher'
      else if (role === 'admin' || role === 'administrator') role = 'Admin'
    }

    // Prevent admin signup (if applicable)
    if (role === 'Admin') {
      return res.status(403).json({ message: 'Admin accounts cannot be created manually.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'Student'
    });

    const token = generateToken(user);
    res.status(201).json({ message: 'Signup successful', token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------------
// Login
// ---------------------
exports.login = async (req, res) => {
  try {
    const { email, password, role: requestedRole } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // Normalizer for role values
    const normalize = (r) => {
      if (!r) return null;
      const s = String(r).toLowerCase();
      if (s === 'student') return 'Student';
      if (s === 'admin') return 'Admin';
      if (s.includes('teacher')) return 'Teacher';
      return null;
    };

    const normalizedRequested = normalize(requestedRole);
    const normalizedStored = normalize(user.role);

    // If a role was requested and it doesn't match the stored role, reject
    if (normalizedRequested && normalizedStored && normalizedRequested !== normalizedStored) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user);
    res.status(200).json({ message: 'Login successful', token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------------
// Change Password (User)
// ---------------------
exports.changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { oldPassword, newPassword } = req.body;

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Old password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------------
// Reset Password (Admin)
// ---------------------
exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const newPassword = '123456'; // default or random

    const hashed = await bcrypt.hash(newPassword, 10);
    const user = await User.findByIdAndUpdate(id, { password: hashed }, { new: true });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
      message: 'Password reset successfully by Admin',
      newPassword,
      user
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------------
// Delete Account (User)
// ---------------------
exports.deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
