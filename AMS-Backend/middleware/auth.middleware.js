const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.protect = (roles=[]) => async (req,res,next) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: 'No token' });
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role, email: decoded.email };
    if (roles && roles.length>0 && !roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};