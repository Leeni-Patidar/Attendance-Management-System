const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

// Generate JWT token
const generateToken = (payload) => {
    try {
        return jwt.sign(payload, JWT_SECRET, {
            expiresIn: JWT_EXPIRE,
            issuer: 'attendance-management-system',
            audience: 'ams-users'
        });
    } catch (error) {
        throw new Error('Token generation failed');
    }
};

// Verify JWT token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET, {
            issuer: 'attendance-management-system',
            audience: 'ams-users'
        });
    } catch (error) {
        throw new Error('Token verification failed');
    }
};

// Generate refresh token (longer expiry)
const generateRefreshToken = (payload) => {
    try {
        return jwt.sign(payload, JWT_SECRET, {
            expiresIn: '30d',
            issuer: 'attendance-management-system',
            audience: 'ams-users'
        });
    } catch (error) {
        throw new Error('Refresh token generation failed');
    }
};

// Decode token without verification (for expired token handling)
const decodeToken = (token) => {
    try {
        return jwt.decode(token, { complete: true });
    } catch (error) {
        return null;
    }
};

// Check if token is expired
const isTokenExpired = (token) => {
    try {
        const decoded = jwt.decode(token);
        if (!decoded || !decoded.exp) return true;
        
        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp < currentTime;
    } catch (error) {
        return true;
    }
};

module.exports = {
    generateToken,
    verifyToken,
    generateRefreshToken,
    decodeToken,
    isTokenExpired
};