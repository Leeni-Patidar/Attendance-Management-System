# API Testing Examples

This document provides comprehensive examples for testing all API endpoints in the Attendance Management System.

## Base URL
```
Development: http://localhost:5000
Production: https://api.attendance.edu
```

## Authentication

### 1. Register a Student

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "loginId": "student001",
    "email": "john.doe@college.edu",
    "password": "SecurePass123",
    "name": "John Doe",
    "role": "student",
    "phoneNumber": "+1234567890",
    "studentInfo": {
      "rollNumber": "CS21B001",
      "class": "CS 3rd Year - Section A",
      "year": "3rd Year",
      "semester": "6th Semester",
      "program": "B.Tech",
      "branch": "Computer Science & Engineering",
      "admissionYear": 2021
    },
    "address": {
      "street": "123 Main St",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001",
      "country": "India"
    }
  }'
```

### 2. Register a Subject Teacher

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "loginId": "teacher001",
    "email": "sarah.johnson@college.edu",
    "password": "SecurePass123",
    "name": "Dr. Sarah Johnson",
    "role": "subject_teacher",
    "phoneNumber": "+1234567891",
    "teacherInfo": {
      "employeeId": "EMP001",
      "department": "Computer Science",
      "designation": "Assistant Professor",
      "qualification": ["PhD in Computer Science", "M.Tech"],
      "experience": 5,
      "joiningDate": "2020-01-15"
    }
  }'
```

### 3. Register an Admin

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "loginId": "admin001",
    "email": "admin@college.edu",
    "password": "SecurePass123",
    "name": "System Administrator",
    "role": "admin",
    "phoneNumber": "+1234567892"
  }'
```

### 4. Login (Student)

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "id": "student001",
    "password": "SecurePass123",
    "userType": "student"
  }'
```

### 5. Login (Faculty)

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "id": "teacher001",
    "password": "SecurePass123",
    "userType": "subject_teacher"
  }'
```

### 6. Get Current User Profile

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 7. Update Profile

```bash
curl -X PUT http://localhost:5000/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "John Doe Updated",
    "phoneNumber": "+1234567899",
    "address": {
      "street": "456 Updated St",
      "city": "Delhi",
      "state": "Delhi",
      "pincode": "110001"
    }
  }'
```

### 8. Change Password

```bash
curl -X PUT http://localhost:5000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "currentPassword": "SecurePass123",
    "newPassword": "NewSecurePass456",
    "confirmPassword": "NewSecurePass456"
  }'
```

### 9. Forgot Password

```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@college.edu"
  }'
```

### 10. Reset Password

```bash
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "RESET_TOKEN_FROM_EMAIL",
    "newPassword": "NewSecurePass789"
  }'
```

### 11. Refresh Token

```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### 12. Logout

```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Device Management (Students Only)

### 13. Generate Device Registration QR

```bash
curl -X POST http://localhost:5000/api/auth/generate-device-qr \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer STUDENT_ACCESS_TOKEN" \
  -H "X-Device-ID: device_12345" \
  -H "X-Platform: Android" \
  -H "X-Screen-Resolution: 1920x1080" \
  -H "X-Timezone: Asia/Kolkata" \
  -H "X-Language: en" \
  -d '{
    "deviceInfo": {
      "userAgent": "Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36",
      "platform": "Android",
      "screenResolution": "1920x1080",
      "timezone": "Asia/Kolkata",
      "language": "en",
      "hardwareConcurrency": 8,
      "maxTouchPoints": 10,
      "colorDepth": 24,
      "pixelRatio": 2
    }
  }'
```

### 14. Register Device

```bash
curl -X POST http://localhost:5000/api/auth/register-device \
  -H "Content-Type: application/json" \
  -H "X-Device-ID: device_12345" \
  -d '{
    "qrData": "BASE64_QR_DATA_FROM_STEP_13",
    "deviceInfo": {
      "userAgent": "Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36",
      "platform": "Android",
      "screenResolution": "1920x1080",
      "timezone": "Asia/Kolkata",
      "language": "en",
      "hardwareConcurrency": 8,
      "maxTouchPoints": 10,
      "colorDepth": 24,
      "pixelRatio": 2
    }
  }'
```

## Testing with JavaScript (Frontend)

### Student Registration and Login Flow

```javascript
// Student Registration
const registerStudent = async () => {
  const response = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      loginId: 'student001',
      email: 'john.doe@college.edu',
      password: 'SecurePass123',
      name: 'John Doe',
      role: 'student',
      phoneNumber: '+1234567890',
      studentInfo: {
        rollNumber: 'CS21B001',
        class: 'CS 3rd Year - Section A',
        year: '3rd Year',
        semester: '6th Semester',
        program: 'B.Tech',
        branch: 'Computer Science & Engineering'
      }
    })
  });
  
  const data = await response.json();
  console.log('Registration:', data);
  
  if (data.success) {
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
  }
  
  return data;
};

// Student Login
const loginStudent = async () => {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Device-ID': 'device_12345',
      'X-Platform': 'Web',
      'X-Screen-Resolution': '1920x1080',
      'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
      'X-Language': navigator.language
    },
    body: JSON.stringify({
      id: 'student001',
      password: 'SecurePass123',
      userType: 'student'
    })
  });
  
  const data = await response.json();
  console.log('Login:', data);
  
  if (data.success) {
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
  }
  
  return data;
};

// Get User Profile
const getUserProfile = async () => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch('http://localhost:5000/api/auth/me', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  console.log('Profile:', data);
  
  return data;
};

// Auto-refresh token if needed
const makeAuthenticatedRequest = async (url, options = {}) => {
  let token = localStorage.getItem('accessToken');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });
  
  // Check if token needs refresh
  const newToken = response.headers.get('X-New-Token');
  if (newToken) {
    localStorage.setItem('accessToken', newToken);
  }
  
  return response;
};
```

## Error Handling Examples

### 1. Invalid Credentials
```json
{
  "success": false,
  "message": "Invalid login credentials"
}
```

### 2. Validation Errors
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required",
      "value": "invalid-email"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters",
      "value": "123"
    }
  ]
}
```

### 3. Duplicate User
```json
{
  "success": false,
  "message": "User with this login ID or email already exists"
}
```

### 4. Account Locked
```json
{
  "success": false,
  "message": "Account is temporarily locked due to too many failed login attempts"
}
```

### 5. Token Expired
```json
{
  "success": false,
  "message": "Token expired"
}
```

## Testing Sequence

1. **Register Users**: Create student, teacher, and admin accounts
2. **Login**: Test login for each role
3. **Profile Management**: Get and update profiles
4. **Device Binding**: Test device registration for students
5. **Security**: Test password change, forgot password
6. **Token Management**: Test token refresh and logout

## Environment Setup

Create a `.env` file:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/attendance_management
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_complex
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_token_secret_here
JWT_REFRESH_EXPIRES_IN=30d
QR_SECRET_KEY=your_qr_encryption_secret_key_here
QR_EXPIRY_MINUTES=5
BCRYPT_SALT_ROUNDS=12
CORS_ORIGIN=http://localhost:3000
ENABLE_DEVICE_BINDING=true
```

## Health Check

```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "development",
  "database": "Connected",
  "memory": {
    "rss": 52428800,
    "heapTotal": 20971520,
    "heapUsed": 15728640,
    "external": 1638400,
    "arrayBuffers": 163840
  },
  "version": "v18.17.0"
}
```

## API Documentation

Visit `http://localhost:5000/api-docs` for interactive Swagger documentation.