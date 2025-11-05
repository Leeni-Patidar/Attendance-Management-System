/*
  middleware/authMiddleware.js - JWT authentication and role authorization
*/

import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import { getTokenFromRequest } from '../utils/token.js';
import User from '../models/User.js';

export async function protect(req, res, next) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      const err = new Error('Not authorized, token missing');
      err.statusCode = httpStatus.UNAUTHORIZED;
      return next(err);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      const err = new Error('Not authorized, user not found');
      err.statusCode = httpStatus.UNAUTHORIZED;
      return next(err);
    }

    req.user = user; // attach sanitized user
    return next();
  } catch (error) {
    const err = new Error('Not authorized, invalid token');
    err.statusCode = httpStatus.UNAUTHORIZED;
    return next(err);
  }
}

export function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      const err = new Error('Forbidden: insufficient permissions');
      err.statusCode = httpStatus.FORBIDDEN;
      return next(err);
    }
    return next();
  };
}
