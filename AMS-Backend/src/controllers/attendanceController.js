const { executeQuery } = require('../config/database');
const { 
    formatResponse, 
    getCurrentDate, 
    getCurrentDateTime, 
    calculateWorkingHours,
    calculateOvertimeHours,
    getPaginationData 
} = require('../utils/helpers');

// Check-in
const checkIn = async (req, res) => {
    try {
        const userId = req.user.id;
        const { location, notes } = req.body;
        const currentDate = getCurrentDate();
        const currentDateTime = getCurrentDateTime();
        const clientIP = req.ip || req.connection.remoteAddress;

        // Check if user already checked in today
        const existingRecordQuery = `
            SELECT id, check_in_time, check_out_time 
            FROM attendance_records 
            WHERE user_id = ? AND date = ?
        `;
        
        const existingRecord = await executeQuery(existingRecordQuery, [userId, currentDate]);

        if (!existingRecord.success) {
            return res.status(500).json(
                formatResponse(false, 'Database error', null, existingRecord.error)
            );
        }

        if (existingRecord.data.length > 0) {
            const record = existingRecord.data[0];
            if (record.check_in_time && !record.check_out_time) {
                return res.status(400).json(
                    formatResponse(false, 'You have already checked in today. Please check out first.')
                );
            }
            if (record.check_in_time && record.check_out_time) {
                return res.status(400).json(
                    formatResponse(false, 'You have already completed attendance for today.')
                );
            }
        }

        // Create or update attendance record
        let query, params;
        
        if (existingRecord.data.length === 0) {
            // Create new record
            query = `
                INSERT INTO attendance_records 
                (user_id, date, check_in_time, location, ip_address, notes, status) 
                VALUES (?, ?, ?, ?, ?, ?, 'present')
            `;
            params = [userId, currentDate, currentDateTime, location, clientIP, notes];
        } else {
            // Update existing record
            query = `
                UPDATE attendance_records 
                SET check_in_time = ?, location = ?, ip_address = ?, notes = ?, status = 'present', updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;
            params = [currentDateTime, location, clientIP, notes, existingRecord.data[0].id];
        }

        const result = await executeQuery(query, params);

        if (!result.success) {
            return res.status(500).json(
                formatResponse(false, 'Failed to record check-in', null, result.error)
            );
        }

        // Get the attendance record
        const recordId = existingRecord.data.length > 0 ? existingRecord.data[0].id : result.data.insertId;
        const attendanceRecord = await executeQuery(
            'SELECT * FROM attendance_records WHERE id = ?',
            [recordId]
        );

        res.json(
            formatResponse(true, 'Check-in recorded successfully', attendanceRecord.data[0])
        );

    } catch (error) {
        console.error('Check-in error:', error);
        res.status(500).json(
            formatResponse(false, 'Internal server error', null, error.message)
        );
    }
};

// Check-out
const checkOut = async (req, res) => {
    try {
        const userId = req.user.id;
        const { notes } = req.body;
        const currentDate = getCurrentDate();
        const currentDateTime = getCurrentDateTime();

        // Find today's attendance record
        const recordQuery = `
            SELECT id, check_in_time, check_out_time, break_start_time, break_end_time
            FROM attendance_records 
            WHERE user_id = ? AND date = ?
        `;
        
        const recordResult = await executeQuery(recordQuery, [userId, currentDate]);

        if (!recordResult.success) {
            return res.status(500).json(
                formatResponse(false, 'Database error', null, recordResult.error)
            );
        }

        if (recordResult.data.length === 0) {
            return res.status(400).json(
                formatResponse(false, 'No check-in record found for today. Please check in first.')
            );
        }

        const record = recordResult.data[0];

        if (!record.check_in_time) {
            return res.status(400).json(
                formatResponse(false, 'No check-in time found. Please check in first.')
            );
        }

        if (record.check_out_time) {
            return res.status(400).json(
                formatResponse(false, 'You have already checked out today.')
            );
        }

        // Calculate working hours
        const breakDuration = record.break_start_time && record.break_end_time 
            ? calculateWorkingHours(record.break_start_time, record.break_end_time)
            : 0;
        
        const totalHours = calculateWorkingHours(record.check_in_time, currentDateTime, breakDuration);
        const overtimeHours = calculateOvertimeHours(totalHours, 8); // Assuming 8 hours standard

        // Update attendance record
        const updateQuery = `
            UPDATE attendance_records 
            SET check_out_time = ?, total_hours = ?, break_duration = ?, 
                overtime_hours = ?, notes = CONCAT(COALESCE(notes, ''), ?, ?), 
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        
        const notesUpdate = notes ? (record.notes ? '\n' : '') + `Check-out: ${notes}` : '';
        const params = [
            currentDateTime, 
            totalHours, 
            breakDuration, 
            overtimeHours, 
            record.notes ? '\n' : '', 
            notesUpdate, 
            record.id
        ];

        const updateResult = await executeQuery(updateQuery, params);

        if (!updateResult.success) {
            return res.status(500).json(
                formatResponse(false, 'Failed to record check-out', null, updateResult.error)
            );
        }

        // Get updated attendance record
        const updatedRecord = await executeQuery(
            'SELECT * FROM attendance_records WHERE id = ?',
            [record.id]
        );

        res.json(
            formatResponse(true, 'Check-out recorded successfully', updatedRecord.data[0])
        );

    } catch (error) {
        console.error('Check-out error:', error);
        res.status(500).json(
            formatResponse(false, 'Internal server error', null, error.message)
        );
    }
};

// Start break
const startBreak = async (req, res) => {
    try {
        const userId = req.user.id;
        const currentDate = getCurrentDate();
        const currentDateTime = getCurrentDateTime();

        // Find today's attendance record
        const recordQuery = `
            SELECT id, check_in_time, check_out_time, break_start_time, break_end_time
            FROM attendance_records 
            WHERE user_id = ? AND date = ?
        `;
        
        const recordResult = await executeQuery(recordQuery, [userId, currentDate]);

        if (!recordResult.success || recordResult.data.length === 0) {
            return res.status(400).json(
                formatResponse(false, 'No attendance record found for today. Please check in first.')
            );
        }

        const record = recordResult.data[0];

        if (!record.check_in_time) {
            return res.status(400).json(
                formatResponse(false, 'Please check in first before taking a break.')
            );
        }

        if (record.check_out_time) {
            return res.status(400).json(
                formatResponse(false, 'Cannot start break after checking out.')
            );
        }

        if (record.break_start_time && !record.break_end_time) {
            return res.status(400).json(
                formatResponse(false, 'Break already started. Please end current break first.')
            );
        }

        // Update break start time
        const updateResult = await executeQuery(
            'UPDATE attendance_records SET break_start_time = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [currentDateTime, record.id]
        );

        if (!updateResult.success) {
            return res.status(500).json(
                formatResponse(false, 'Failed to start break', null, updateResult.error)
            );
        }

        res.json(
            formatResponse(true, 'Break started successfully', { break_start_time: currentDateTime })
        );

    } catch (error) {
        console.error('Start break error:', error);
        res.status(500).json(
            formatResponse(false, 'Internal server error', null, error.message)
        );
    }
};

// End break
const endBreak = async (req, res) => {
    try {
        const userId = req.user.id;
        const currentDate = getCurrentDate();
        const currentDateTime = getCurrentDateTime();

        // Find today's attendance record
        const recordQuery = `
            SELECT id, break_start_time, break_end_time
            FROM attendance_records 
            WHERE user_id = ? AND date = ?
        `;
        
        const recordResult = await executeQuery(recordQuery, [userId, currentDate]);

        if (!recordResult.success || recordResult.data.length === 0) {
            return res.status(400).json(
                formatResponse(false, 'No attendance record found for today.')
            );
        }

        const record = recordResult.data[0];

        if (!record.break_start_time) {
            return res.status(400).json(
                formatResponse(false, 'No break started. Please start break first.')
            );
        }

        if (record.break_end_time) {
            return res.status(400).json(
                formatResponse(false, 'Break already ended.')
            );
        }

        // Update break end time
        const updateResult = await executeQuery(
            'UPDATE attendance_records SET break_end_time = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [currentDateTime, record.id]
        );

        if (!updateResult.success) {
            return res.status(500).json(
                formatResponse(false, 'Failed to end break', null, updateResult.error)
            );
        }

        res.json(
            formatResponse(true, 'Break ended successfully', { break_end_time: currentDateTime })
        );

    } catch (error) {
        console.error('End break error:', error);
        res.status(500).json(
            formatResponse(false, 'Internal server error', null, error.message)
        );
    }
};

// Get current status
const getCurrentStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const currentDate = getCurrentDate();

        // Get today's attendance record
        const recordQuery = `
            SELECT ar.*, u.first_name, u.last_name, u.employee_id
            FROM attendance_records ar
            JOIN users u ON ar.user_id = u.id
            WHERE ar.user_id = ? AND ar.date = ?
        `;
        
        const recordResult = await executeQuery(recordQuery, [userId, currentDate]);

        if (!recordResult.success) {
            return res.status(500).json(
                formatResponse(false, 'Database error', null, recordResult.error)
            );
        }

        let status = 'not_checked_in';
        let data = null;

        if (recordResult.data.length > 0) {
            const record = recordResult.data[0];
            data = record;

            if (record.check_in_time && !record.check_out_time) {
                if (record.break_start_time && !record.break_end_time) {
                    status = 'on_break';
                } else {
                    status = 'checked_in';
                }
            } else if (record.check_in_time && record.check_out_time) {
                status = 'checked_out';
            }
        }

        res.json(
            formatResponse(true, 'Current status retrieved successfully', { status, record: data })
        );

    } catch (error) {
        console.error('Get current status error:', error);
        res.status(500).json(
            formatResponse(false, 'Internal server error', null, error.message)
        );
    }
};

// Get attendance records
const getAttendanceRecords = async (req, res) => {
    try {
        const userId = req.user.role === 'employee' ? req.user.id : req.query.user_id;
        const { page = 1, limit = 10, start_date, end_date, status } = req.query;

        // Build query conditions
        const conditions = ['ar.user_id = ?'];
        const params = [userId];

        if (start_date) {
            conditions.push('ar.date >= ?');
            params.push(start_date);
        }

        if (end_date) {
            conditions.push('ar.date <= ?');
            params.push(end_date);
        }

        if (status) {
            conditions.push('ar.status = ?');
            params.push(status);
        }

        const whereClause = conditions.join(' AND ');

        // Get total count
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM attendance_records ar 
            WHERE ${whereClause}
        `;
        
        const countResult = await executeQuery(countQuery, params);
        const total = countResult.data[0].total;

        // Get paginated records
        const pagination = getPaginationData(page, limit, total);
        
        const recordsQuery = `
            SELECT ar.*, u.first_name, u.last_name, u.employee_id, u.department
            FROM attendance_records ar
            JOIN users u ON ar.user_id = u.id
            WHERE ${whereClause}
            ORDER BY ar.date DESC, ar.created_at DESC
            LIMIT ? OFFSET ?
        `;

        params.push(pagination.limit, pagination.offset);
        const recordsResult = await executeQuery(recordsQuery, params);

        if (!recordsResult.success) {
            return res.status(500).json(
                formatResponse(false, 'Failed to fetch attendance records', null, recordsResult.error)
            );
        }

        res.json(
            formatResponse(true, 'Attendance records retrieved successfully', {
                records: recordsResult.data,
                pagination
            })
        );

    } catch (error) {
        console.error('Get attendance records error:', error);
        res.status(500).json(
            formatResponse(false, 'Internal server error', null, error.message)
        );
    }
};

// Get attendance summary
const getAttendanceSummary = async (req, res) => {
    try {
        const userId = req.user.role === 'employee' ? req.user.id : req.query.user_id;
        const { start_date, end_date } = req.query;

        // Default to current month if no dates provided
        const startDate = start_date || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        const endDate = end_date || new Date().toISOString().split('T')[0];

        const summaryQuery = `
            SELECT 
                COUNT(*) as total_days,
                SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
                SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days,
                SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_days,
                SUM(CASE WHEN status = 'half_day' THEN 1 ELSE 0 END) as half_days,
                SUM(total_hours) as total_hours,
                SUM(overtime_hours) as total_overtime_hours,
                ROUND(AVG(total_hours), 2) as average_hours_per_day
            FROM attendance_records 
            WHERE user_id = ? AND date BETWEEN ? AND ?
        `;

        const summaryResult = await executeQuery(summaryQuery, [userId, startDate, endDate]);

        if (!summaryResult.success) {
            return res.status(500).json(
                formatResponse(false, 'Failed to fetch attendance summary', null, summaryResult.error)
            );
        }

        res.json(
            formatResponse(true, 'Attendance summary retrieved successfully', {
                summary: summaryResult.data[0],
                period: { start_date: startDate, end_date: endDate }
            })
        );

    } catch (error) {
        console.error('Get attendance summary error:', error);
        res.status(500).json(
            formatResponse(false, 'Internal server error', null, error.message)
        );
    }
};

module.exports = {
    checkIn,
    checkOut,
    startBreak,
    endBreak,
    getCurrentStatus,
    getAttendanceRecords,
    getAttendanceSummary
};