const { executeQuery } = require('../config/database');
const { 
    formatResponse, 
    hashPassword, 
    generateEmployeeId, 
    getPaginationData 
} = require('../utils/helpers');

// Get all users (Admin/HR only)
const getAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, department, role, status = 'active', search } = req.query;

        // Build query conditions
        const conditions = [];
        const params = [];

        if (department) {
            conditions.push('department = ?');
            params.push(department);
        }

        if (role) {
            conditions.push('role = ?');
            params.push(role);
        }

        if (status === 'active') {
            conditions.push('is_active = TRUE');
        } else if (status === 'inactive') {
            conditions.push('is_active = FALSE');
        }

        if (search) {
            conditions.push('(first_name LIKE ? OR last_name LIKE ? OR employee_id LIKE ? OR email LIKE ?)');
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Get total count
        const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
        const countResult = await executeQuery(countQuery, params);
        const total = countResult.data[0].total;

        // Get paginated users
        const pagination = getPaginationData(page, limit, total);
        
        const usersQuery = `
            SELECT id, employee_id, email, first_name, last_name, role, 
                   department, position, phone, hire_date, is_active, 
                   profile_image, created_at, updated_at
            FROM users 
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `;

        params.push(pagination.limit, pagination.offset);
        const usersResult = await executeQuery(usersQuery, params);

        if (!usersResult.success) {
            return res.status(500).json(
                formatResponse(false, 'Failed to fetch users', null, usersResult.error)
            );
        }

        res.json(
            formatResponse(true, 'Users retrieved successfully', {
                users: usersResult.data,
                pagination
            })
        );

    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json(
            formatResponse(false, 'Internal server error', null, error.message)
        );
    }
};

// Get user by ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const userQuery = `
            SELECT id, employee_id, email, first_name, last_name, role, 
                   department, position, phone, hire_date, is_active, 
                   profile_image, created_at, updated_at
            FROM users 
            WHERE id = ?
        `;

        const userResult = await executeQuery(userQuery, [id]);

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
            formatResponse(true, 'User retrieved successfully', userResult.data[0])
        );

    } catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json(
            formatResponse(false, 'Internal server error', null, error.message)
        );
    }
};

// Create new user (Admin/HR only)
const createUser = async (req, res) => {
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
            `SELECT id, employee_id, email, first_name, last_name, role, 
                    department, position, phone, hire_date, created_at 
             FROM users WHERE id = ?`,
            [insertResult.data.insertId]
        );

        res.status(201).json(
            formatResponse(true, 'User created successfully', newUser.data[0])
        );

    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json(
            formatResponse(false, 'Internal server error', null, error.message)
        );
    }
};

// Update user (Admin/HR only)
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            email, 
            first_name, 
            last_name, 
            role, 
            department, 
            position, 
            phone, 
            hire_date, 
            is_active 
        } = req.body;

        // Check if user exists
        const userCheck = await executeQuery('SELECT id FROM users WHERE id = ?', [id]);
        if (!userCheck.success || userCheck.data.length === 0) {
            return res.status(404).json(
                formatResponse(false, 'User not found')
            );
        }

        // Build dynamic update query
        const updates = [];
        const values = [];

        if (email !== undefined) {
            // Check if email is already taken by another user
            const emailCheck = await executeQuery(
                'SELECT id FROM users WHERE email = ? AND id != ?', 
                [email, id]
            );
            if (emailCheck.data.length > 0) {
                return res.status(409).json(
                    formatResponse(false, 'Email already taken by another user')
                );
            }
            updates.push('email = ?');
            values.push(email);
        }

        if (first_name !== undefined) {
            updates.push('first_name = ?');
            values.push(first_name);
        }

        if (last_name !== undefined) {
            updates.push('last_name = ?');
            values.push(last_name);
        }

        if (role !== undefined) {
            updates.push('role = ?');
            values.push(role);
        }

        if (department !== undefined) {
            updates.push('department = ?');
            values.push(department);
        }

        if (position !== undefined) {
            updates.push('position = ?');
            values.push(position);
        }

        if (phone !== undefined) {
            updates.push('phone = ?');
            values.push(phone);
        }

        if (hire_date !== undefined) {
            updates.push('hire_date = ?');
            values.push(hire_date);
        }

        if (is_active !== undefined) {
            updates.push('is_active = ?');
            values.push(is_active);
        }

        if (updates.length === 0) {
            return res.status(400).json(
                formatResponse(false, 'No fields provided for update')
            );
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        const updateQuery = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
        const updateResult = await executeQuery(updateQuery, values);

        if (!updateResult.success) {
            return res.status(500).json(
                formatResponse(false, 'Failed to update user', null, updateResult.error)
            );
        }

        // Get updated user data
        const userResult = await executeQuery(
            `SELECT id, employee_id, email, first_name, last_name, role, 
                    department, position, phone, hire_date, is_active, 
                    profile_image, created_at, updated_at
             FROM users WHERE id = ?`,
            [id]
        );

        res.json(
            formatResponse(true, 'User updated successfully', userResult.data[0])
        );

    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json(
            formatResponse(false, 'Internal server error', null, error.message)
        );
    }
};

// Delete user (Admin only)
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user exists
        const userCheck = await executeQuery('SELECT id FROM users WHERE id = ?', [id]);
        if (!userCheck.success || userCheck.data.length === 0) {
            return res.status(404).json(
                formatResponse(false, 'User not found')
            );
        }

        // Soft delete - set is_active to false
        const deleteResult = await executeQuery(
            'UPDATE users SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [id]
        );

        if (!deleteResult.success) {
            return res.status(500).json(
                formatResponse(false, 'Failed to delete user', null, deleteResult.error)
            );
        }

        res.json(
            formatResponse(true, 'User deleted successfully')
        );

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json(
            formatResponse(false, 'Internal server error', null, error.message)
        );
    }
};

// Reset user password (Admin/HR only)
const resetPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { new_password } = req.body;

        // Check if user exists
        const userCheck = await executeQuery('SELECT id FROM users WHERE id = ?', [id]);
        if (!userCheck.success || userCheck.data.length === 0) {
            return res.status(404).json(
                formatResponse(false, 'User not found')
            );
        }

        // Hash new password
        const hashedPassword = await hashPassword(new_password);

        // Update password
        const updateResult = await executeQuery(
            'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [hashedPassword, id]
        );

        if (!updateResult.success) {
            return res.status(500).json(
                formatResponse(false, 'Failed to reset password', null, updateResult.error)
            );
        }

        res.json(
            formatResponse(true, 'Password reset successfully')
        );

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json(
            formatResponse(false, 'Internal server error', null, error.message)
        );
    }
};

// Get user statistics
const getUserStatistics = async (req, res) => {
    try {
        const statsQuery = `
            SELECT 
                COUNT(*) as total_users,
                SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_users,
                SUM(CASE WHEN is_active = FALSE THEN 1 ELSE 0 END) as inactive_users,
                SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin_count,
                SUM(CASE WHEN role = 'hr' THEN 1 ELSE 0 END) as hr_count,
                SUM(CASE WHEN role = 'manager' THEN 1 ELSE 0 END) as manager_count,
                SUM(CASE WHEN role = 'employee' THEN 1 ELSE 0 END) as employee_count
            FROM users
        `;

        const statsResult = await executeQuery(statsQuery);

        // Get department wise statistics
        const deptStatsQuery = `
            SELECT 
                department, 
                COUNT(*) as count,
                SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_count
            FROM users 
            WHERE department IS NOT NULL 
            GROUP BY department
            ORDER BY count DESC
        `;

        const deptStatsResult = await executeQuery(deptStatsQuery);

        if (!statsResult.success || !deptStatsResult.success) {
            return res.status(500).json(
                formatResponse(false, 'Failed to fetch statistics')
            );
        }

        res.json(
            formatResponse(true, 'User statistics retrieved successfully', {
                overall: statsResult.data[0],
                by_department: deptStatsResult.data
            })
        );

    } catch (error) {
        console.error('Get user statistics error:', error);
        res.status(500).json(
            formatResponse(false, 'Internal server error', null, error.message)
        );
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
    getUserStatistics
};