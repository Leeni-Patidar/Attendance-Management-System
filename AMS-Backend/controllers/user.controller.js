const { User, Class } = require('../models');
const asyncHandler = fn => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);

exports.getProfile = asyncHandler(async (req,res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json({ user });
});

exports.updateProfile = asyncHandler(async (req,res) => {
  const updates = req.body;
  const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
  res.json({ user });
});

// admin: list users
exports.listUsers = asyncHandler(async (req,res) => {
  const users = await User.find().select('-password');
  res.json({ users });
});