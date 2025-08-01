const { verifyToken } = require('../utils/jwt');
const { formatResponse } = require('../utils/helpers');
const { executeQuery } = require('../config/database');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json(
                formatResponse(false, 'Access token is required', null, 'NO_TOKEN')
            );
        }

        const decoded = verifyToken(token);
        
        // Check if user still exists and is active
        const userQuery = 'SELECT id, employee_id, email, role, is_active FROM users WHERE id = ? AND is_active = TRUE';
        const userResult = await executeQuery(userQuery, [decoded.userId]);
        
        if (!userResult.success || userResult.data.length === 0) {
            return res.status(401).json(
                formatResponse(false, 'Invalid token or user not found', null, 'INVALID_USER')
            );
        }

        req.user = {
            id: decoded.userId,
            employee_id: userResult.data[0].employee_id,
            email: userResult.data[0].email,
            role: userResult.data[0].role
        };

        next();
    } catch (error) {
        return res.status(401).json(
            formatResponse(false, 'Invalid or expired token', null, 'TOKEN_ERROR')
        );
    }
};

// Middleware to check user roles
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json(
                formatResponse(false, 'Authentication required', null, 'NO_AUTH')
            );
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json(
                formatResponse(false, 'Insufficient permissions', null, 'INSUFFICIENT_PERMISSIONS')
            );
        }

        next();
    };
};

// Middleware to check if user can access their own data or admin/hr can access any
const authorizeOwnerOrAdmin = (req, res, next) => {
    const { user } = req;
    const targetUserId = req.params.userId || req.params.id || req.body.userId;

    // Admin and HR can access any user's data
    if (user.role === 'admin' || user.role === 'hr') {
        return next();
    }

    // Manager can access their team members' data (this would need team/department logic)
    if (user.role === 'manager') {
        // For now, allow managers to access any employee data
        // In production, you'd check if the target user is in their department
        return next();
    }

    // Employees can only access their own data
    if (user.id.toString() === targetUserId?.toString()) {
        return next();
    }

    return res.status(403).json(
        formatResponse(false, 'Access denied. You can only access your own data', null, 'ACCESS_DENIED')
    );
};

// Optional authentication (for public endpoints that benefit from user context)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = verifyToken(token);
            const userQuery = 'SELECT id, employee_id, email, role, is_active FROM users WHERE id = ? AND is_active = TRUE';
            const userResult = await executeQuery(userQuery, [decoded.userId]);
            
            if (userResult.success && userResult.data.length > 0) {
                req.user = {
                    id: decoded.userId,
                    employee_id: userResult.data[0].employee_id,
                    email: userResult.data[0].email,
                    role: userResult.data[0].role
                };
            }
        }
        
        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
};

module.exports = {
    authenticateToken,
    authorizeRoles,
    authorizeOwnerOrAdmin,
    optionalAuth
};