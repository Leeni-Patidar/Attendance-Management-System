/*
  utils/token.js - JWT helper utilities
*/

import jwt from 'jsonwebtoken';

export function signToken(payload, options = {}) {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn, ...options });
}

export function getTokenFromRequest(req) {
  // Authorization: Bearer <token>
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  // Or cookie named "token"
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  return null;
}
