const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, OTP, Log } = require('../models');
const asyncHandler = fn => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) return res.status(400).json({ message: 'Missing fields' });
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: 'User already exists' });
  const user = await User.create({ name, email, password, role });
  res.status(201).json({ message: 'User registered', user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user._id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
  // log
  await Log.create({ action: 'login', user: user._id });
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});