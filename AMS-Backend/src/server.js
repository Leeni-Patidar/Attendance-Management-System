const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import database connection
const { testConnection } = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Import utilities
const { formatResponse } = require('./utils/helpers');

// Create Express app
const app = express();

// Environment variables
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Trust proxy (important for rate limiting and IP detection)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false
}));

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1 || NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: formatResponse(false, 'Too many requests from this IP, please try again later.'),
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(429).json(
            formatResponse(false, 'Too many requests from this IP, please try again later.')
        );
    }
});

// Apply rate limiting to all routes
app.use(limiter);

// More strict rate limiting for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 auth requests per windowMs
    message: formatResponse(false, 'Too many authentication attempts, please try again later.'),
    skipSuccessfulRequests: true,
    handler: (req, res) => {
        res.status(429).json(
            formatResponse(false, 'Too many authentication attempts, please try again later.')
        );
    }
});

// Request logging
if (NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json(
        formatResponse(true, 'Server is running', {
            status: 'OK',
            timestamp: new Date().toISOString(),
            environment: NODE_ENV,
            version: '1.0.0'
        })
    );
});

// API routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/reports', reportRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
    res.json(
        formatResponse(true, 'Attendance Management System API', {
            version: '1.0.0',
            endpoints: {
                auth: {
                    'POST /api/auth/register': 'Register new user',
                    'POST /api/auth/login': 'User login',
                    'POST /api/auth/refresh-token': 'Refresh JWT token',
                    'POST /api/auth/logout': 'User logout',
                    'GET /api/auth/profile': 'Get user profile',
                    'PUT /api/auth/profile': 'Update user profile',
                    'PUT /api/auth/change-password': 'Change password'
                },
                users: {
                    'GET /api/users': 'Get all users (Admin/HR)',
                    'GET /api/users/:id': 'Get user by ID (Admin/HR)',
                    'POST /api/users': 'Create user (Admin/HR)',
                    'PUT /api/users/:id': 'Update user (Admin/HR)',
                    'DELETE /api/users/:id': 'Delete user (Admin)',
                    'GET /api/users/statistics': 'Get user statistics (Admin/HR)',
                    'PUT /api/users/:id/reset-password': 'Reset user password (Admin/HR)'
                },
                attendance: {
                    'POST /api/attendance/check-in': 'Check in',
                    'POST /api/attendance/check-out': 'Check out',
                    'POST /api/attendance/break/start': 'Start break',
                    'POST /api/attendance/break/end': 'End break',
                    'GET /api/attendance/status': 'Get current status',
                    'GET /api/attendance/records': 'Get attendance records',
                    'GET /api/attendance/summary': 'Get attendance summary'
                },
                reports: {
                    'GET /api/reports/dashboard': 'Get dashboard data (Admin/HR/Manager)',
                    'GET /api/reports/attendance': 'Get attendance report (Admin/HR/Manager)',
                    'GET /api/reports/monthly': 'Get monthly report (Admin/HR/Manager)',
                    'GET /api/reports/late-arrivals': 'Get late arrivals report (Admin/HR/Manager)',
                    'GET /api/reports/overtime': 'Get overtime report (Admin/HR/Manager)'
                }
            }
        })
    );
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
    res.status(404).json(
        formatResponse(false, `Route ${req.originalUrl} not found`)
    );
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    
    // CORS error
    if (error.message === 'Not allowed by CORS') {
        return res.status(403).json(
            formatResponse(false, 'CORS error: Origin not allowed')
        );
    }
    
    // JSON parsing error
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
        return res.status(400).json(
            formatResponse(false, 'Invalid JSON format')
        );
    }
    
    // Default error response
    res.status(error.status || 500).json(
        formatResponse(false, error.message || 'Internal server error', null, 
            NODE_ENV === 'development' ? error.stack : undefined)
    );
});

// Graceful shutdown handlers
const gracefulShutdown = (signal) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);
    
    server.close((err) => {
        if (err) {
            console.error('Error during server shutdown:', err);
            process.exit(1);
        }
        
        console.log('Server closed successfully');
        
        // Close database connections
        const { closePool } = require('./config/database');
        closePool().then(() => {
            console.log('Database connections closed');
            process.exit(0);
        }).catch((err) => {
            console.error('Error closing database connections:', err);
            process.exit(1);
        });
    });
    
    // Force shutdown after 30 seconds
    setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
    }, 30000);
};

// Start server
const startServer = async () => {
    try {
        // Test database connection
        const dbConnected = await testConnection();
        if (!dbConnected) {
            console.error('Failed to connect to database. Exiting...');
            process.exit(1);
        }
        
        // Start the server
        const server = app.listen(PORT, () => {
            console.log(`
╔══════════════════════════════════════════════════════════════╗
║                  Attendance Management System                ║
║                          Backend API                         ║
╠══════════════════════════════════════════════════════════════╣
║  Environment: ${NODE_ENV.padEnd(47)} ║
║  Port:        ${PORT.toString().padEnd(47)} ║
║  URL:         http://localhost:${PORT.toString().padEnd(38)} ║
║  API Docs:    http://localhost:${PORT}/api${' '.repeat(29)} ║
║  Health:      http://localhost:${PORT}/health${' '.repeat(25)} ║
╠══════════════════════════════════════════════════════════════╣
║  Status:      🟢 Server is running                          ║
║  Database:    🟢 Connected                                  ║
╚══════════════════════════════════════════════════════════════╝
            `);
        });
        
        // Setup graceful shutdown
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        
        // Global server variable for shutdown
        global.server = server;
        
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Start the server
startServer();

module.exports = app;