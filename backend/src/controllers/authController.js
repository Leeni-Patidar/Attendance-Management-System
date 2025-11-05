/*
  controllers/authController.js - Registration and login
*/

import httpStatus from 'http-status';
import Joi from 'joi';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signToken } from '../utils/token.js';

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(120).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
});

export const register = asyncHandler(async (req, res) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: error.message });
  }

  const existing = await User.findOne({ email: value.email.toLowerCase() });
  if (existing) {
    return res.status(httpStatus.CONFLICT).json({ message: 'Email already in use' });
  }

  const user = await User.create({ ...value, email: value.email.toLowerCase() });
  const token = signToken({ id: user._id, role: user.role });

  res.status(httpStatus.CREATED).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: error.message });
  }

  const user = await User.findOne({ email: value.email.toLowerCase() }).select('+password');
  if (!user) {
    return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Invalid credentials' });
  }

  const isMatch = await user.comparePassword(value.password);
  if (!isMatch) {
    return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Invalid credentials' });
  }

  const token = signToken({ id: user._id, role: user.role });

  res.status(httpStatus.OK).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  });
});
