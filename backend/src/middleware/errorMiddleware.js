/*
  middleware/errorMiddleware.js - Centralized error and 404 handling
*/

import httpStatus from 'http-status';

export function notFound(req, res, next) {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = httpStatus.NOT_FOUND;
  next(error);
}

export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const statusCode = err.statusCode || err.status || httpStatus.INTERNAL_SERVER_ERROR;
  const response = {
    message: err.message || 'Internal Server Error',
  };

  if (process.env.NODE_ENV === 'development' && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}
