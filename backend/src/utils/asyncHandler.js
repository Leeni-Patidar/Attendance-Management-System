/*
  utils/asyncHandler.js - Express async handler to avoid try/catch noise
*/

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
