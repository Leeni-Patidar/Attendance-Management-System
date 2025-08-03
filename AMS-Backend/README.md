# Attendance Management System - Backend

A secure and scalable backend for College Attendance Management System built with Node.js, Express.js, and MongoDB.

## Features

### 🧑‍🎓 Student Module
- Student registration and login with JWT authentication
- QR code scanning for attendance marking
- Device binding for security (one device per student)
- Personal attendance history viewing
- Submit reasons for missed classes

### 🧑‍🏫 Faculty Module
- Faculty registration and login with role-based access
- Generate encrypted QR codes for attendance sessions
- Real-time attendance monitoring
- Manual attendance override (limited to 3-5 students per session)
- Export attendance reports as CSV

### 📊 Admin Module
- Comprehensive user management
- Attendance reports and analytics
- Override activity monitoring
- Class and subject schedule management
- System-wide configuration

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **QR Generation**: qrcode package
- **Security**: bcryptjs, helmet, express-rate-limit
- **Documentation**: Swagger/OpenAPI
- **File Handling**: Multer

## Security Features

- JWT-based authentication with refresh tokens
- Encrypted QR codes with time-based expiration
- Device binding to prevent attendance proxy
- Rate limiting to prevent abuse
- Input validation and sanitization
- Role-based access control
- Secure session management

## Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd AMS-Backend
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env
# Edit .env with your configuration
\`\`\`

4. Start MongoDB service (make sure MongoDB is installed and running)

5. Run the application:
\`\`\`bash
# Development mode
npm run dev

# Production mode
npm start
\`\`\`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/attendance_management |
| JWT_SECRET | JWT signing secret | - |
| QR_SECRET_KEY | QR code encryption key | - |
| QR_EXPIRY_MINUTES | QR code validity duration | 5 |

See `.env.example` for all available environment variables.

## API Documentation

Once the server is running, visit:
- **Swagger UI**: `http://localhost:5000/api-docs`
- **API Endpoints**: `http://localhost:5000/api/`

## Project Structure

\`\`\`
AMS-Backend/
├── src/
│   ├── controllers/        # Request handlers
│   ├── models/            # Mongoose schemas
│   ├── routes/            # Express routes
│   ├── middleware/        # Custom middleware
│   ├── services/          # Business logic
│   ├── utils/             # Utility functions
│   └── config/            # Configuration files
├── uploads/               # File uploads directory
├── tests/                 # Test files
├── docs/                  # API documentation
├── server.js              # Entry point
├── package.json
└── README.md
\`\`\`

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

### Student Routes
- `GET /api/student/profile` - Get student profile
- `POST /api/student/scan-qr` - Scan QR code for attendance
- `GET /api/student/attendance` - Get attendance history
- `POST /api/student/missed-class` - Submit reason for missed class

### Faculty Routes
- `POST /api/faculty/generate-qr` - Generate QR code for session
- `GET /api/faculty/sessions` - Get active sessions
- `GET /api/faculty/attendance/:sessionId` - Get session attendance
- `POST /api/faculty/override` - Manual attendance override
- `GET /api/faculty/export/:sessionId` - Export attendance as CSV

### Admin Routes
- `GET /api/admin/users` - Get all users
- `POST /api/admin/users` - Create new user
- `GET /api/admin/reports` - Get attendance reports
- `GET /api/admin/overrides` - Get override logs
- `POST /api/admin/schedule` - Create class schedule

## Testing

\`\`\`bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository.