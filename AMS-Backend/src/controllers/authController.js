const { executeQuery } = require('../config/database');
const { generateToken, generateRefreshToken, verifyToken } = require('../utils/jwt');
const { hashPassword, comparePassword, formatResponse, generateEmployeeId } = require('../utils/helpers');

// User registration
const register = async (req, res) => {
    try {
        const {
            employee_id,
            email,
            password,
            first_name,
            last_name,
            role = 'employee',
            department,
            position,
            phone,
            hire_date
        } = req.body;

        // Check if user already exists
        const existingUserQuery = 'SELECT id FROM users WHERE email = ? OR employee_id = ?';
        const existingUser = await executeQuery(existingUserQuery, [email, employee_id]);
        
        if (!existingUser.success) {
            return res.status(500).json(
                formatResponse(false, 'Database error', null, existingUser.error)
            );
        }

        if (existingUser.data.length > 0) {
            return res.status(409).json(
                formatResponse(false, 'User already exists with this email or employee ID')
            );
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Insert new user
        const insertQuery = `
            INSERT INTO users (
                employee_id, email, password, first_name, last_name, 
                role, department, position, phone, hire_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const insertResult = await executeQuery(insertQuery, [
            employee_id,
            email,
            hashedPassword,
            first_name,
            last_name,
            role,
            department,
            position,
            phone,
            hire_date || null
        ]);

        if (!insertResult.success) {
            return res.status(500).json(
                formatResponse(false, 'Failed to create user', null, insertResult.error)
            );
        }

        // Get the created user
        const newUser = await executeQuery(
            'SELECT id, employee_id, email, first_name, last_name, role, department, position, phone, hire_date, created_at FROM users WHERE id = ?',
            [insertResult.data.insertId]
        );

        res.status(201).json(
            formatResponse(true, 'User registered successfully', newUser.data[0])
        );

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json(
            formatResponse(false, 'Internal server error', null, error.message)
        );
    }
};

// User login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const userQuery = `
            SELECT id, employee_id, email, password, first_name, last_name, 
                   role, department, position, is_active
            FROM users 
            WHERE email = ? AND is_active = TRUE
        `;
        
        const userResult = await executeQuery(userQuery, [email]);

        if (!userResult.success) {
            return res.status(500).json(
                formatResponse(false, 'Database error', null, userResult.error)
            );
        }

        if (userResult.data.length === 0) {
            return res.status(401).json(
                formatResponse(false, 'Invalid email or password')
            );
        }

        const user = userResult.data[0];

        // Compare password
        const isPasswordValid = await comparePassword(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json(
                formatResponse(false, 'Invalid email or password')
            );
        }

        // Generate tokens
        const tokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role
        };

        const token = generateToken(tokenPayload);
        const refreshToken = generateRefreshToken(tokenPayload);

        // Update last login
        await executeQuery(
            'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [user.id]
        );

        // Remove password from response
        delete user.password;

        res.json(
            formatResponse(true, 'Login successful', {
                user,
                token,
                refreshToken,
                expiresIn: process.env.JWT_EXPIRE || '7d'
            })
        );

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json(
            formatResponse(false, 'Internal server error', null, error.message)
        );
    }
};

// Refresh token
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json(
                formatResponse(false, 'Refresh token is required')
            );
        }

        // Verify refresh token
        const decoded = verifyToken(refreshToken);
        
        // Check if user still exists and is active
        const userQuery = 'SELECT id, email, role, is_active FROM users WHERE id = ? AND is_active = TRUE';
        const userResult = await executeQuery(userQuery, [decoded.userId]);
        
        if (!userResult.success || userResult.data.length === 0) {
            return res.status(401).json(
                formatResponse(false, 'Invalid refresh token or user not found')
            );
        }

        const user = userResult.data[0];

        // Generate new tokens
        const tokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role
        };

        const newToken = generateToken(tokenPayload);
        const newRefreshToken = generateRefreshToken(tokenPayload);

        res.json(
            formatResponse(true, 'Token refreshed successfully', {
                token: newToken,
                refreshToken: newRefreshToken,
                expiresIn: process.env.JWT_EXPIRE || '7d'
            })
        );

    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(401).json(
            formatResponse(false, 'Invalid or expired refresh token')
        );
    }
};

// Get current user profile
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const userQuery = `
            SELECT id, employee_id, email, first_name, last_name, role, 
                   department, position, phone, hire_date, profile_image, 
                   created_at, updated_at
            FROM users 
            WHERE id = ? AND is_active = TRUE
        `;
        
        const userResult = await executeQuery(userQuery, [userId]);

        if (!userResult.success) {
            return res.status(500).json(
                formatResponse(false, 'Database error', null, userResult.error)
            );
        }

        if (userResult.data.length === 0) {
            return res.status(404).json(
                formatResponse(false, 'User not found')
            );
        }

        res.json(
            formatResponse(true, 'Profile retrieved successfully', userResult.data[0])
        );

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json(
            formatResponse(false, 'Internal server error', null, error.message)
        );
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { first_name, last_name, phone, department, position } = req.body;

        // Build dynamic update query
        const updates = [];
        const values = [];

        if (first_name !== undefined) {
            updates.push('first_name = ?');
            values.push(first_name);
        }
        if (last_name !== undefined) {
            updates.push('last_name = ?');
            values.push(last_name);
        }
        if (phone !== undefined) {
            updates.push('phone = ?');
            values.push(phone);
        }
        if (department !== undefined) {
            updates.push('department = ?');
            values.push(department);
        }
        if (position !== undefined) {
            updates.push('position = ?');
            values.push(position);
        }

        if (updates.length === 0) {
            return res.status(400).json(
                formatResponse(false, 'No fields provided for update')
            );
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(userId);

        const updateQuery = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
        const updateResult = await executeQuery(updateQuery, values);

        if (!updateResult.success) {
            return res.status(500).json(
                formatResponse(false, 'Failed to update profile', null, updateResult.error)
            );
        }

        // Get updated user data
        const userResult = await executeQuery(
            `SELECT id, employee_id, email, first_name, last_name, role, 
                    department, position, phone, hire_date, profile_image, 
                    created_at, updated_at
             FROM users WHERE id = ?`,
            [userId]
        );

        res.json(
            formatResponse(true, 'Profile updated successfully', userResult.data[0])
        );

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json(
            formatResponse(false, 'Internal server error', null, error.message)
        );
    }
};

// Change password
const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { current_password, new_password } = req.body;

        // Get current password hash
        const userQuery = 'SELECT password FROM users WHERE id = ?';
        const userResult = await executeQuery(userQuery, [userId]);

        if (!userResult.success || userResult.data.length === 0) {
            return res.status(404).json(
                formatResponse(false, 'User not found')
            );
        }

        // Verify current password
        const isCurrentPasswordValid = await comparePassword(current_password, userResult.data[0].password);
        
        if (!isCurrentPasswordValid) {
            return res.status(400).json(
                formatResponse(false, 'Current password is incorrect')
            );
        }

        // Hash new password
        const hashedNewPassword = await hashPassword(new_password);

        // Update password
        const updateResult = await executeQuery(
            'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [hashedNewPassword, userId]
        );

        if (!updateResult.success) {
            return res.status(500).json(
                formatResponse(false, 'Failed to update password', null, updateResult.error)
            );
        }

        res.json(
            formatResponse(true, 'Password changed successfully')
        );

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json(
            formatResponse(false, 'Internal server error', null, error.message)
        );
    }
};

// Logout (for client-side token removal)
const logout = async (req, res) => {
    try {
        // In a stateless JWT system, logout is typically handled client-side
        // by removing the token. Here we just send a success response.
        // In production, you might want to maintain a blacklist of tokens
        
        res.json(
            formatResponse(true, 'Logged out successfully')
        );
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json(
            formatResponse(false, 'Internal server error', null, error.message)
        );
    }
};

module.exports = {
    register,
    login,
    refreshToken,
    getProfile,
    updateProfile,
    changePassword,
    logout
};