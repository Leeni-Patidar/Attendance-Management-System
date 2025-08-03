# Getting Started with Attendance Management System Backend

This guide will help you set up and run the Attendance Management System backend on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/)
- **npm** (comes with Node.js) or **yarn**

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AMS-Backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/attendance_management

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_complex
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_token_secret_here
JWT_REFRESH_EXPIRES_IN=30d

# QR Code Configuration
QR_SECRET_KEY=your_qr_encryption_secret_key_here
QR_EXPIRY_MINUTES=5

# Security Configuration
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Admin Configuration
ADMIN_EMAIL=admin@college.edu
ADMIN_PASSWORD=admin123

# Device Binding Configuration
ENABLE_DEVICE_BINDING=true
MAX_DEVICES_PER_STUDENT=1
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Ubuntu/Debian
sudo systemctl start mongod

# On Windows
# Start MongoDB from the installation directory or use MongoDB Compass
```

### 5. Setup Database

Initialize the database with sample data:

```bash
npm run setup
```

This will create:
- Default admin user
- Sample demo users (student, teachers)
- Sample subjects
- Required database indexes

### 6. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## Verification

### Check Server Status

1. **Health Check**: Visit `http://localhost:5000/health`
2. **API Documentation**: Visit `http://localhost:5000/api-docs`
3. **Root Endpoint**: Visit `http://localhost:5000`

### Test Authentication

Login with demo credentials:

**Admin:**
- Login ID: `admin`
- Password: `admin123`

**Student:**
- Login ID: `student001`
- Password: `demo123`

**Class Teacher:**
- Login ID: `classteach01`
- Password: `demo123`

**Subject Teacher:**
- Login ID: `subjectteach01`
- Password: `demo123`

### Test API Endpoints

```bash
# Login as student
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "id": "student001",
    "password": "demo123",
    "userType": "student"
  }'

# Get user profile (use token from login response)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Project Structure

```
AMS-Backend/
├── src/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── controllers/
│   │   └── authController.js    # Authentication controllers
│   ├── middleware/
│   │   ├── auth.js             # Authentication middleware
│   │   └── validation.js       # Input validation
│   ├── models/
│   │   ├── User.js             # User model
│   │   ├── Session.js          # Session model
│   │   ├── Attendance.js       # Attendance model
│   │   ├── OverrideLog.js      # Override log model
│   │   ├── DeviceBinding.js    # Device binding model
│   │   ├── Subject.js          # Subject model
│   │   └── index.js            # Model exports
│   ├── routes/
│   │   └── auth.js             # Authentication routes
│   └── utils/
│       └── qrGenerator.js      # QR code utilities
├── scripts/
│   └── setup.js                # Database setup script
├── docs/
│   └── API_Examples.md         # API testing examples
├── server.js                   # Main server file
├── package.json
├── .env.example
└── README.md
```

## Features Implemented

### ✅ Core Features

- **User Management**: Registration, login, profile management
- **Authentication**: JWT-based with refresh tokens
- **Role-based Access Control**: Student, Teacher, Admin roles
- **Device Binding**: Secure device registration for students
- **QR Code Generation**: Encrypted QR codes for attendance
- **Password Security**: Bcrypt hashing, account lockout
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Centralized error management
- **API Documentation**: Swagger/OpenAPI integration
- **Health Monitoring**: Server health check endpoints

### 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with configurable salt rounds
- **Account Lockout**: Automatic lockout after failed attempts
- **Rate Limiting**: Request rate limiting to prevent abuse
- **Input Sanitization**: XSS and injection protection
- **CORS Protection**: Configurable cross-origin policies
- **Helmet Security**: Security headers and protection
- **Device Fingerprinting**: Unique device identification

### 📊 Database Models

- **User**: Students, teachers, and admins with role-specific data
- **Session**: QR attendance sessions with encryption
- **Attendance**: Attendance records with validation flags
- **OverrideLog**: Manual attendance override tracking
- **DeviceBinding**: Student device registration and security
- **Subject**: Course/subject management with scheduling

## Development Workflow

### Database Management

```bash
# Setup database with sample data
npm run setup

# Reset database (WARNING: Deletes all data)
npm run reset

# View database in MongoDB Compass
# Connect to: mongodb://localhost:27017/attendance_management
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

### API Testing

Use the provided examples in `docs/API_Examples.md` or test via:

1. **Swagger UI**: `http://localhost:5000/api-docs`
2. **Postman**: Import the OpenAPI specification
3. **cURL**: Use command-line examples
4. **Frontend Integration**: Connect your React frontend

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   ```
   Error: MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017
   ```
   **Solution**: Make sure MongoDB is running and accessible

2. **Port Already in Use**
   ```
   Error: listen EADDRINUSE: address already in use :::5000
   ```
   **Solution**: Change PORT in `.env` or kill the process using port 5000

3. **JWT Secret Missing**
   ```
   Error: JWT_SECRET is required
   ```
   **Solution**: Set JWT_SECRET in your `.env` file

4. **Validation Errors**
   ```
   ValidationError: Path `email` is required
   ```
   **Solution**: Check your request body format and required fields

### Database Issues

```bash
# Check MongoDB status
mongosh --eval "db.adminCommand('ping')"

# View collections
mongosh attendance_management --eval "show collections"

# Reset to fresh state
npm run reset
```

### Debug Mode

Enable detailed logging by setting:

```env
NODE_ENV=development
```

## Production Deployment

### Environment Variables

Set production values:

```env
NODE_ENV=production
MONGODB_URI=mongodb://your-production-db/attendance_management
JWT_SECRET=your-production-jwt-secret
CORS_ORIGIN=https://your-frontend-domain.com
```

### Security Checklist

- [ ] Strong JWT secrets (32+ characters)
- [ ] Secure MongoDB connection
- [ ] HTTPS enabled
- [ ] Rate limiting configured
- [ ] Environment variables secured
- [ ] Admin password changed
- [ ] CORS origins restricted

### Monitoring

The application provides:
- Health check endpoint: `/health`
- Error logging and tracking
- Request/response monitoring
- Database connection status

## Next Steps

1. **Frontend Integration**: Connect with the React frontend
2. **Additional Routes**: Implement student, faculty, and admin routes
3. **Real-time Features**: Add WebSocket support for live attendance
4. **Email Services**: Configure email for password reset
5. **File Uploads**: Add profile image and document upload
6. **Analytics**: Implement attendance reporting and analytics

## Support

For issues and questions:

1. Check the troubleshooting section above
2. Review the API documentation at `/api-docs`
3. Examine the example requests in `docs/API_Examples.md`
4. Check server logs for detailed error information

## API Endpoints Summary

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Device Management
- `POST /api/auth/generate-device-qr` - Generate device QR (students)
- `POST /api/auth/register-device` - Register device with QR

### System
- `GET /health` - Health check
- `GET /` - API information
- `GET /api-docs` - Swagger documentation

The backend is now ready for development and testing! 🚀