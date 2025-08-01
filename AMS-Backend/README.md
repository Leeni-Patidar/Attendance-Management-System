# Attendance Management System - Backend API

A comprehensive backend API for managing employee attendance, built with Node.js, Express, and MySQL.

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Admin, HR, Manager, Employee)
  - Secure password hashing with bcrypt
  - Token refresh mechanism

- **User Management**
  - CRUD operations for users
  - Role and department management
  - User statistics and analytics
  - Password reset functionality

- **Attendance Tracking**
  - Check-in/Check-out functionality
  - Break time tracking
  - Real-time attendance status
  - Location and IP tracking
  - Working hours calculation
  - Overtime tracking

- **Reporting & Analytics**
  - Dashboard with attendance statistics
  - Detailed attendance reports
  - Monthly summaries
  - Late arrivals tracking
  - Overtime reports
  - Department-wise analytics

- **Security Features**
  - Rate limiting
  - CORS protection
  - Helmet security headers
  - Input validation and sanitization
  - SQL injection prevention

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

## 🛠 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AMS-Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=attendance_management
   DB_USER=root
   DB_PASSWORD=your_password
   
   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   
   # Security
   BCRYPT_ROUNDS=12
   
   # Rate Limiting
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   
   # CORS
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
   ```

4. **Set up the database**
   ```bash
   # Create the database and tables
   mysql -u root -p < database/schema.sql
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "employee_id": "EMP001",
  "email": "john.doe@company.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe",
  "role": "employee",
  "department": "IT",
  "position": "Developer",
  "phone": "+1234567890",
  "hire_date": "2024-01-15"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@company.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "employee_id": "EMP001",
      "email": "john.doe@company.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "employee",
      "department": "IT"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  }
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Smith",
  "phone": "+1234567890"
}
```

#### Change Password
```http
PUT /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "current_password": "oldPassword",
  "new_password": "NewSecurePass123!",
  "confirm_password": "NewSecurePass123!"
}
```

### Attendance Endpoints

#### Check In
```http
POST /api/attendance/check-in
Authorization: Bearer <token>
Content-Type: application/json

{
  "location": "Office - Floor 3",
  "notes": "Started work on project X"
}
```

#### Check Out
```http
POST /api/attendance/check-out
Authorization: Bearer <token>
Content-Type: application/json

{
  "notes": "Completed daily tasks"
}
```

#### Start Break
```http
POST /api/attendance/break/start
Authorization: Bearer <token>
```

#### End Break
```http
POST /api/attendance/break/end
Authorization: Bearer <token>
```

#### Get Current Status
```http
GET /api/attendance/status
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Current status retrieved successfully",
  "data": {
    "status": "checked_in",
    "record": {
      "id": 123,
      "date": "2024-01-15",
      "check_in_time": "2024-01-15T09:00:00.000Z",
      "check_out_time": null,
      "total_hours": 0,
      "status": "present"
    }
  }
}
```

#### Get Attendance Records
```http
GET /api/attendance/records?page=1&limit=10&start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer <token>
```

#### Get Attendance Summary
```http
GET /api/attendance/summary?start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer <token>
```

### User Management Endpoints (Admin/HR Only)

#### Get All Users
```http
GET /api/users?page=1&limit=10&department=IT&role=employee&search=john
Authorization: Bearer <admin_token>
```

#### Get User by ID
```http
GET /api/users/123
Authorization: Bearer <admin_token>
```

#### Create User
```http
POST /api/users
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "employee_id": "EMP002",
  "email": "jane.doe@company.com",
  "password": "TempPass123!",
  "first_name": "Jane",
  "last_name": "Doe",
  "role": "employee",
  "department": "HR"
}
```

#### Update User
```http
PUT /api/users/123
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "department": "Engineering",
  "position": "Senior Developer",
  "is_active": true
}
```

#### Delete User
```http
DELETE /api/users/123
Authorization: Bearer <admin_token>
```

#### Reset User Password
```http
PUT /api/users/123/reset-password
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "new_password": "NewTempPass123!"
}
```

#### Get User Statistics
```http
GET /api/users/statistics
Authorization: Bearer <admin_token>
```

### Reports Endpoints (Admin/HR/Manager Only)

#### Get Dashboard Data
```http
GET /api/reports/dashboard?start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer <admin_token>
```

#### Get Attendance Report
```http
GET /api/reports/attendance?page=1&limit=50&start_date=2024-01-01&end_date=2024-01-31&department=IT
Authorization: Bearer <admin_token>
```

#### Get Monthly Report
```http
GET /api/reports/monthly?year=2024&month=1&department=IT
Authorization: Bearer <admin_token>
```

#### Get Late Arrivals Report
```http
GET /api/reports/late-arrivals?page=1&limit=20&start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer <admin_token>
```

#### Get Overtime Report
```http
GET /api/reports/overtime?page=1&limit=20&start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer <admin_token>
```

## 👥 User Roles

1. **Employee**
   - Manage own attendance (check-in/out, breaks)
   - View own attendance records and summary
   - Update own profile

2. **Manager**
   - All employee permissions
   - View team reports and analytics
   - Access department-wise data

3. **HR**
   - All manager permissions
   - Manage users (create, update, view)
   - Access all reports and analytics
   - Reset user passwords

4. **Admin**
   - Full system access
   - User management (including deletion)
   - System configuration
   - All reports and analytics

## 🗄️ Database Schema

The system uses the following main tables:

- **users** - Employee information and authentication
- **attendance_records** - Daily attendance data
- **leave_types** - Types of leave available
- **leave_requests** - Employee leave applications
- **holidays** - Company and national holidays
- **overtime_records** - Overtime work tracking
- **departments** - Department management
- **work_schedules** - Employee work schedules
- **audit_logs** - System activity tracking
- **settings** - System configuration

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `DB_HOST` | Database host | localhost |
| `DB_PORT` | Database port | 3306 |
| `DB_NAME` | Database name | attendance_management |
| `DB_USER` | Database username | root |
| `DB_PASSWORD` | Database password | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRE` | JWT expiration time | 7d |
| `BCRYPT_ROUNDS` | Password hashing rounds | 12 |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |
| `ALLOWED_ORIGINS` | CORS allowed origins | localhost:3000,localhost:5173 |

## 📊 API Response Format

All API responses follow a consistent format:

```json
{
  "success": true|false,
  "message": "Description of the result",
  "data": {}, // Response data (optional)
  "error": {}, // Error details (optional)
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🚦 Error Handling

The API uses standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests
- `500` - Internal Server Error

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Rate Limiting** - Prevents abuse and DDoS attacks
- **CORS Protection** - Configurable cross-origin resource sharing
- **Helmet Security** - Security headers for protection
- **Input Validation** - Comprehensive request validation
- **SQL Injection Prevention** - Parameterized queries
- **Password Hashing** - Bcrypt with configurable rounds

## 🧪 Testing

### Manual Testing with cURL

1. **Register a user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "employee_id": "EMP001",
    "email": "test@company.com",
    "password": "SecurePass123!",
    "first_name": "Test",
    "last_name": "User"
  }'
```

2. **Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@company.com",
    "password": "SecurePass123!"
  }'
```

3. **Check in (replace TOKEN with actual token):**
```bash
curl -X POST http://localhost:5000/api/attendance/check-in \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "location": "Office",
    "notes": "Starting work"
  }'
```

## 📝 Development

### Project Structure
```
AMS-Backend/
├── src/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── userController.js    # User management
│   │   ├── attendanceController.js # Attendance tracking
│   │   └── reportsController.js # Reports and analytics
│   ├── middleware/
│   │   ├── auth.js             # Authentication middleware
│   │   └── validation.js       # Input validation
│   ├── routes/
│   │   ├── authRoutes.js       # Auth endpoints
│   │   ├── userRoutes.js       # User endpoints
│   │   ├── attendanceRoutes.js # Attendance endpoints
│   │   └── reportRoutes.js     # Report endpoints
│   ├── utils/
│   │   ├── jwt.js              # JWT utilities
│   │   └── helpers.js          # Helper functions
│   └── server.js               # Main server file
├── database/
│   └── schema.sql              # Database schema
├── package.json
├── .env.example
└── README.md
```

### Adding New Features

1. Create controller functions in appropriate controller file
2. Add validation middleware if needed
3. Create routes in appropriate route file
4. Test the new endpoints
5. Update documentation

## 🚀 Deployment

### Production Setup

1. **Set environment to production:**
   ```env
   NODE_ENV=production
   ```

2. **Use a process manager:**
   ```bash
   npm install -g pm2
   pm2 start src/server.js --name "attendance-api"
   ```

3. **Set up reverse proxy (Nginx example):**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Enable SSL with Let's Encrypt:**
   ```bash
   certbot --nginx -d your-domain.com
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Commit your changes
6. Push to the branch
7. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, email support@company.com or create an issue in the repository.

## 🔄 Version History

- **v1.0.0** - Initial release with core attendance management features
  - User authentication and authorization
  - Attendance tracking (check-in/out, breaks)
  - User management for admins
  - Comprehensive reporting system
  - Security features and rate limiting