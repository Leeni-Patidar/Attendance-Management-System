const { executeQuery } = require('../config/database');
const { formatResponse, getPaginationData } = require('../utils/helpers');

// Get attendance dashboard data
const getDashboardData = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        
        // Default to current month if no dates provided
        const startDate = start_date || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        const endDate = end_date || new Date().toISOString().split('T')[0];

        // Overall statistics
        const overallStatsQuery = `
            SELECT 
                COUNT(DISTINCT ar.user_id) as total_employees,
                COUNT(ar.id) as total_records,
                SUM(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END) as present_count,
                SUM(CASE WHEN ar.status = 'absent' THEN 1 ELSE 0 END) as absent_count,
                SUM(CASE WHEN ar.status = 'late' THEN 1 ELSE 0 END) as late_count,
                SUM(CASE WHEN ar.status = 'half_day' THEN 1 ELSE 0 END) as half_day_count,
                ROUND(AVG(ar.total_hours), 2) as avg_working_hours,
                SUM(ar.overtime_hours) as total_overtime_hours
            FROM attendance_records ar
            JOIN users u ON ar.user_id = u.id
            WHERE ar.date BETWEEN ? AND ? AND u.is_active = TRUE
        `;

        const overallStats = await executeQuery(overallStatsQuery, [startDate, endDate]);

        // Department wise statistics
        const deptStatsQuery = `
            SELECT 
                u.department,
                COUNT(DISTINCT ar.user_id) as employee_count,
                COUNT(ar.id) as total_records,
                SUM(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END) as present_count,
                ROUND(AVG(ar.total_hours), 2) as avg_hours,
                SUM(ar.overtime_hours) as total_overtime
            FROM attendance_records ar
            JOIN users u ON ar.user_id = u.id
            WHERE ar.date BETWEEN ? AND ? AND u.is_active = TRUE AND u.department IS NOT NULL
            GROUP BY u.department
            ORDER BY present_count DESC
        `;

        const deptStats = await executeQuery(deptStatsQuery, [startDate, endDate]);

        // Daily attendance trend
        const dailyTrendQuery = `
            SELECT 
                ar.date,
                COUNT(ar.id) as total_records,
                SUM(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END) as present_count,
                SUM(CASE WHEN ar.status = 'absent' THEN 1 ELSE 0 END) as absent_count,
                SUM(CASE WHEN ar.status = 'late' THEN 1 ELSE 0 END) as late_count,
                ROUND(AVG(ar.total_hours), 2) as avg_hours
            FROM attendance_records ar
            JOIN users u ON ar.user_id = u.id
            WHERE ar.date BETWEEN ? AND ? AND u.is_active = TRUE
            GROUP BY ar.date
            ORDER BY ar.date DESC
            LIMIT 30
        `;

        const dailyTrend = await executeQuery(dailyTrendQuery, [startDate, endDate]);

        // Top performers (by attendance rate)
        const topPerformersQuery = `
            SELECT 
                u.employee_id,
                CONCAT(u.first_name, ' ', u.last_name) as full_name,
                u.department,
                COUNT(ar.id) as total_days,
                SUM(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END) as present_days,
                ROUND((SUM(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END) / COUNT(ar.id)) * 100, 2) as attendance_rate,
                ROUND(AVG(ar.total_hours), 2) as avg_hours
            FROM users u
            JOIN attendance_records ar ON u.id = ar.user_id
            WHERE ar.date BETWEEN ? AND ? AND u.is_active = TRUE
            GROUP BY u.id, u.employee_id, u.first_name, u.last_name, u.department
            HAVING COUNT(ar.id) >= 5
            ORDER BY attendance_rate DESC, avg_hours DESC
            LIMIT 10
        `;

        const topPerformers = await executeQuery(topPerformersQuery, [startDate, endDate]);

        if (!overallStats.success || !deptStats.success || !dailyTrend.success || !topPerformers.success) {
            return res.status(500).json(
                formatResponse(false, 'Failed to fetch dashboard data')
            );
        }

        res.json(
            formatResponse(true, 'Dashboard data retrieved successfully', {
                period: { start_date: startDate, end_date: endDate },
                overall_stats: overallStats.data[0],
                department_stats: deptStats.data,
                daily_trend: dailyTrend.data,
                top_performers: topPerformers.data
            })
        );

    } catch (error) {
        console.error('Get dashboard data error:', error);
        res.status(500).json(
            formatResponse(false, 'Internal server error', null, error.message)
        );
    }
};

// Get detailed attendance report
const getAttendanceReport = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 50, 
            start_date, 
            end_date, 
            department, 
            user_id,
            status 
        } = req.query;

        // Build query conditions
        const conditions = ['u.is_active = TRUE'];
        const params = [];

        if (start_date) {
            conditions.push('ar.date >= ?');
            params.push(start_date);
        }

        if (end_date) {
            conditions.push('ar.date <= ?');
            params.push(end_date);
        }

        if (department) {
            conditions.push('u.department = ?');
            params.push(department);
        }

        if (user_id) {
            conditions.push('u.id = ?');
            params.push(user_id);
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
            JOIN users u ON ar.user_id = u.id
            WHERE ${whereClause}
        `;
        
        const countResult = await executeQuery(countQuery, params);
        const total = countResult.data[0].total;

        // Get paginated records
        const pagination = getPaginationData(page, limit, total);
        
        const reportQuery = `
            SELECT 
                ar.id,
                ar.date,
                u.employee_id,
                CONCAT(u.first_name, ' ', u.last_name) as full_name,
                u.department,
                u.position,
                ar.check_in_time,
                ar.check_out_time,
                ar.break_start_time,
                ar.break_end_time,
                ar.total_hours,
                ar.break_duration,
                ar.overtime_hours,
                ar.status,
                ar.location,
                ar.notes
            FROM attendance_records ar
            JOIN users u ON ar.user_id = u.id
            WHERE ${whereClause}
            ORDER BY ar.date DESC, ar.check_in_time DESC
            LIMIT ? OFFSET ?
        `;

        params.push(pagination.limit, pagination.offset);
        const reportResult = await executeQuery(reportQuery, params);

        if (!reportResult.success) {
            return res.status(500).json(
                formatResponse(false, 'Failed to generate attendance report', null, reportResult.error)
            );
        }

        res.json(
            formatResponse(true, 'Attendance report generated successfully', {
                records: reportResult.data,
                pagination,
                filters: { start_date, end_date, department, user_id, status }
            })
        );

    } catch (error) {
        console.error('Get attendance report error:', error);
        res.status(500).json(
            formatResponse(false, 'Internal server error', null, error.message)
        );
    }
};

// Get monthly attendance summary
const getMonthlyReport = async (req, res) => {
    try {
        const { year, month, department } = req.query;
        
        const currentDate = new Date();
        const reportYear = year || currentDate.getFullYear();
        const reportMonth = month || (currentDate.getMonth() + 1);

        // Build query conditions
        const conditions = ['YEAR(ar.date) = ?', 'MONTH(ar.date) = ?', 'u.is_active = TRUE'];
        const params = [reportYear, reportMonth];

        if (department) {
            conditions.push('u.department = ?');
            params.push(department);
        }

        const whereClause = conditions.join(' AND ');

        const monthlyReportQuery = `
            SELECT 
                u.employee_id,
                CONCAT(u.first_name, ' ', u.last_name) as full_name,
                u.department,
                u.position,
                COUNT(ar.id) as total_days,
                SUM(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END) as present_days,
                SUM(CASE WHEN ar.status = 'absent' THEN 1 ELSE 0 END) as absent_days,
                SUM(CASE WHEN ar.status = 'late' THEN 1 ELSE 0 END) as late_days,
                SUM(CASE WHEN ar.status = 'half_day' THEN 1 ELSE 0 END) as half_days,
                SUM(ar.total_hours) as total_hours,
                SUM(ar.overtime_hours) as total_overtime_hours,
                ROUND(AVG(ar.total_hours), 2) as avg_hours_per_day,
                ROUND((SUM(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END) / COUNT(ar.id)) * 100, 2) as attendance_rate
            FROM users u
            LEFT JOIN attendance_records ar ON u.id = ar.user_id AND ${whereClause}
            WHERE u.is_active = TRUE
            ${department ? 'AND u.department = ?' : ''}
            GROUP BY u.id, u.employee_id, u.first_name, u.last_name, u.department, u.position
            ORDER BY u.department, u.first_name, u.last_name
        `;

        // Adjust params for the final query
        const finalParams = department ? [...params, department] : params;
        const monthlyResult = await executeQuery(monthlyReportQuery, finalParams);

        if (!monthlyResult.success) {
            return res.status(500).json(
                formatResponse(false, 'Failed to generate monthly report', null, monthlyResult.error)
            );
        }

        // Get summary statistics
        const summaryQuery = `
            SELECT 
                COUNT(DISTINCT u.id) as total_employees,
                ROUND(AVG(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END) * 100, 2) as overall_attendance_rate,
                SUM(ar.total_hours) as total_working_hours,
                SUM(ar.overtime_hours) as total_overtime_hours
            FROM users u
            LEFT JOIN attendance_records ar ON u.id = ar.user_id AND ${whereClause}
            WHERE u.is_active = TRUE
            ${department ? 'AND u.department = ?' : ''}
        `;

        const summaryResult = await executeQuery(summaryQuery, finalParams);

        res.json(
            formatResponse(true, 'Monthly report generated successfully', {
                period: { year: reportYear, month: reportMonth, department },
                summary: summaryResult.data[0],
                employee_records: monthlyResult.data
            })
        );

    } catch (error) {
        console.error('Get monthly report error:', error);
        res.status(500).json(
            formatResponse(false, 'Internal server error', null, error.message)
        );
    }
};

// Get late arrivals report
const getLateArrivalsReport = async (req, res) => {
    try {
        const { start_date, end_date, page = 1, limit = 20 } = req.query;
        
        // Default to current month if no dates provided
        const startDate = start_date || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        const endDate = end_date || new Date().toISOString().split('T')[0];

        // Get total count
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM attendance_records ar
            JOIN users u ON ar.user_id = u.id
            WHERE ar.date BETWEEN ? AND ? 
            AND ar.status = 'late' 
            AND u.is_active = TRUE
        `;
        
        const countResult = await executeQuery(countQuery, [startDate, endDate]);
        const total = countResult.data[0].total;

        // Get paginated late arrivals
        const pagination = getPaginationData(page, limit, total);
        
        const lateArrivalsQuery = `
            SELECT 
                ar.date,
                u.employee_id,
                CONCAT(u.first_name, ' ', u.last_name) as full_name,
                u.department,
                ar.check_in_time,
                CASE 
                    WHEN HOUR(ar.check_in_time) < 9 THEN 'On Time'
                    WHEN HOUR(ar.check_in_time) = 9 AND MINUTE(ar.check_in_time) <= 15 THEN 'Grace Period'
                    ELSE CONCAT(
                        TIMESTAMPDIFF(MINUTE, 
                            CONCAT(ar.date, ' 09:00:00'), 
                            ar.check_in_time
                        ), ' mins late'
                    )
                END as late_duration,
                ar.notes
            FROM attendance_records ar
            JOIN users u ON ar.user_id = u.id
            WHERE ar.date BETWEEN ? AND ? 
            AND ar.status = 'late' 
            AND u.is_active = TRUE
            ORDER BY ar.date DESC, ar.check_in_time DESC
            LIMIT ? OFFSET ?
        `;

        const params = [startDate, endDate, pagination.limit, pagination.offset];
        const lateArrivalsResult = await executeQuery(lateArrivalsQuery, params);

        if (!lateArrivalsResult.success) {
            return res.status(500).json(
                formatResponse(false, 'Failed to generate late arrivals report', null, lateArrivalsResult.error)
            );
        }

        res.json(
            formatResponse(true, 'Late arrivals report generated successfully', {
                period: { start_date: startDate, end_date: endDate },
                records: lateArrivalsResult.data,
                pagination
            })
        );

    } catch (error) {
        console.error('Get late arrivals report error:', error);
        res.status(500).json(
            formatResponse(false, 'Internal server error', null, error.message)
        );
    }
};

// Get overtime report
const getOvertimeReport = async (req, res) => {
    try {
        const { start_date, end_date, page = 1, limit = 20 } = req.query;
        
        // Default to current month if no dates provided
        const startDate = start_date || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
        const endDate = end_date || new Date().toISOString().split('T')[0];

        // Get total count
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM attendance_records ar
            JOIN users u ON ar.user_id = u.id
            WHERE ar.date BETWEEN ? AND ? 
            AND ar.overtime_hours > 0 
            AND u.is_active = TRUE
        `;
        
        const countResult = await executeQuery(countQuery, [startDate, endDate]);
        const total = countResult.data[0].total;

        // Get paginated overtime records
        const pagination = getPaginationData(page, limit, total);
        
        const overtimeQuery = `
            SELECT 
                ar.date,
                u.employee_id,
                CONCAT(u.first_name, ' ', u.last_name) as full_name,
                u.department,
                ar.check_in_time,
                ar.check_out_time,
                ar.total_hours,
                ar.overtime_hours,
                ar.notes
            FROM attendance_records ar
            JOIN users u ON ar.user_id = u.id
            WHERE ar.date BETWEEN ? AND ? 
            AND ar.overtime_hours > 0 
            AND u.is_active = TRUE
            ORDER BY ar.overtime_hours DESC, ar.date DESC
            LIMIT ? OFFSET ?
        `;

        const params = [startDate, endDate, pagination.limit, pagination.offset];
        const overtimeResult = await executeQuery(overtimeQuery, params);

        // Get summary statistics
        const summaryQuery = `
            SELECT 
                COUNT(DISTINCT ar.user_id) as employees_with_overtime,
                SUM(ar.overtime_hours) as total_overtime_hours,
                ROUND(AVG(ar.overtime_hours), 2) as avg_overtime_hours,
                MAX(ar.overtime_hours) as max_overtime_hours
            FROM attendance_records ar
            JOIN users u ON ar.user_id = u.id
            WHERE ar.date BETWEEN ? AND ? 
            AND ar.overtime_hours > 0 
            AND u.is_active = TRUE
        `;

        const summaryResult = await executeQuery(summaryQuery, [startDate, endDate]);

        if (!overtimeResult.success || !summaryResult.success) {
            return res.status(500).json(
                formatResponse(false, 'Failed to generate overtime report')
            );
        }

        res.json(
            formatResponse(true, 'Overtime report generated successfully', {
                period: { start_date: startDate, end_date: endDate },
                summary: summaryResult.data[0],
                records: overtimeResult.data,
                pagination
            })
        );

    } catch (error) {
        console.error('Get overtime report error:', error);
        res.status(500).json(
            formatResponse(false, 'Internal server error', null, error.message)
        );
    }
};

module.exports = {
    getDashboardData,
    getAttendanceReport,
    getMonthlyReport,
    getLateArrivalsReport,
    getOvertimeReport
};