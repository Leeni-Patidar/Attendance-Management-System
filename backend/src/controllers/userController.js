/*
  controllers/userController.js - User self and admin management
*/

import httpStatus from 'http-status';
import Joi from 'joi';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(120),
  email: Joi.string().email(),
  password: Joi.string().min(6).max(128),
});

export const getMe = asyncHandler(async (req, res) => {
  res.status(httpStatus.OK).json(req.user);
});

export const updateMe = asyncHandler(async (req, res) => {
  const { error, value } = updateProfileSchema.validate(req.body);
  if (error) return res.status(httpStatus.BAD_REQUEST).json({ message: error.message });

  const updates = {};
  if (value.name) updates.name = value.name;
  if (value.email) updates.email = value.email.toLowerCase();
  if (value.password) updates.password = value.password;

  const updated = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  }).select('-password');

  res.status(httpStatus.OK).json(updated);
});

// Admin: list users
export const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password');
  res.status(httpStatus.OK).json(users);
});

// Admin: get user by id
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(httpStatus.NOT_FOUND).json({ message: 'User not found' });
  res.status(httpStatus.OK).json(user);
});

// Admin: update user (role, name, email, active)
export const updateUser = asyncHandler(async (req, res) => {
  const updates = {};
  const allowed = ['name', 'email', 'role', 'isActive', 'password'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  if (updates.email) updates.email = updates.email.toLowerCase();

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  }).select('-password');

  if (!user) return res.status(httpStatus.NOT_FOUND).json({ message: 'User not found' });
  res.status(httpStatus.OK).json(user);
});

// Admin: delete user
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(httpStatus.NOT_FOUND).json({ message: 'User not found' });
  res.status(httpStatus.NO_CONTENT).send();
});
