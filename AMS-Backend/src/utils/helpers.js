const bcrypt = require('bcryptjs');
const moment = require('moment');

// Hash password
const hashPassword = async (password) => {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    return await bcrypt.hash(password, saltRounds);
};

// Compare password
const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

// Generate employee ID
const generateEmployeeId = (department = 'GEN', sequence = 1) => {
    const year = new Date().getFullYear().toString().slice(-2);
    const paddedSequence = sequence.toString().padStart(4, '0');
    return `${department.toUpperCase()}${year}${paddedSequence}`;
};

// Calculate working hours
const calculateWorkingHours = (checkIn, checkOut, breakDuration = 0) => {
    if (!checkIn || !checkOut) return 0;
    
    const start = moment(checkIn);
    const end = moment(checkOut);
    const duration = moment.duration(end.diff(start));
    const hours = duration.asHours() - (breakDuration || 0);
    
    return Math.max(0, parseFloat(hours.toFixed(2)));
};

// Calculate overtime hours
const calculateOvertimeHours = (totalHours, standardHours = 8) => {
    return Math.max(0, totalHours - standardHours);
};

// Check if employee is late
const isLateArrival = (checkInTime, scheduledTime, gracePeriod = 15) => {
    if (!checkInTime || !scheduledTime) return false;
    
    const checkIn = moment(checkInTime);
    const scheduled = moment(scheduledTime, 'HH:mm');
    const graceTime = scheduled.add(gracePeriod, 'minutes');
    
    return checkIn.isAfter(graceTime);
};

// Format date for database
const formatDateForDB = (date) => {
    return moment(date).format('YYYY-MM-DD');
};

// Format datetime for database
const formatDateTimeForDB = (datetime) => {
    return moment(datetime).format('YYYY-MM-DD HH:mm:ss');
};

// Get current date
const getCurrentDate = () => {
    return formatDateForDB(new Date());
};

// Get current datetime
const getCurrentDateTime = () => {
    return formatDateTimeForDB(new Date());
};

// Calculate date range
const getDateRange = (startDate, endDate) => {
    const start = moment(startDate);
    const end = moment(endDate);
    const dates = [];
    
    while (start <= end) {
        dates.push(start.format('YYYY-MM-DD'));
        start.add(1, 'day');
    }
    
    return dates;
};

// Check if date is weekend
const isWeekend = (date, weekendDays = ['saturday', 'sunday']) => {
    const dayOfWeek = moment(date).format('dddd').toLowerCase();
    return weekendDays.includes(dayOfWeek);
};

// Calculate working days between dates
const calculateWorkingDays = (startDate, endDate, excludeWeekends = true, holidays = []) => {
    const dates = getDateRange(startDate, endDate);
    
    return dates.filter(date => {
        if (excludeWeekends && isWeekend(date)) return false;
        if (holidays.includes(date)) return false;
        return true;
    }).length;
};

// Validate email format
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate phone number
const isValidPhone = (phone) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone);
};

// Generate random string
const generateRandomString = (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// Sanitize input
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/[<>]/g, '');
};

// Format response
const formatResponse = (success, message, data = null, error = null) => {
    return {
        success,
        message,
        data,
        error,
        timestamp: new Date().toISOString()
    };
};

// Pagination helper
const getPaginationData = (page = 1, limit = 10, total = 0) => {
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);
    
    return {
        page: parseInt(page),
        limit: parseInt(limit),
        offset,
        totalPages,
        total,
        hasNext: page < totalPages,
        hasPrev: page > 1
    };
};

module.exports = {
    hashPassword,
    comparePassword,
    generateEmployeeId,
    calculateWorkingHours,
    calculateOvertimeHours,
    isLateArrival,
    formatDateForDB,
    formatDateTimeForDB,
    getCurrentDate,
    getCurrentDateTime,
    getDateRange,
    isWeekend,
    calculateWorkingDays,
    isValidEmail,
    isValidPhone,
    generateRandomString,
    sanitizeInput,
    formatResponse,
    getPaginationData
};