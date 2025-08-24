# Attendance Management System - Backend

A comprehensive backend for an Attendance Management System built with Node.js, Express, and MySQL.

## Features

- **Authentication & Authorization**
  - Student, Teacher, and Admin login/signup
  - JWT-based session management
  - Role-based access control
  - Email verification and password reset

- **Attendance Management**
  - QR Code based attendance marking
  - Manual attendance management
  - Location/device validation
  - View attendance by student, teacher, class, or admin

- **User & Role Management**
  - Add/update/remove students & teachers
  - Assign teachers to subjects
  - Map students to classes
  - Manage class teachers

- **Timetable & Subject Management**
  - CRUD operations for subjects
  - CRUD operations for timetable entries
  - Conflict detection for schedules

- **Reporting & Analytics**
  - Generate attendance reports
  - Export reports in CSV format
  - Percentage calculation

- **Security & Logging**
  - Rate limiting
  - Password hashing
  - Comprehensive logging

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **ORM**: Sequelize
- **Authentication**: JWT + bcryptjs
- **Security**: helmet, express-rate-limit, CORS
- **Environment**: dotenv
- **Logging**: Winston
- **Email**: Nodemailer
- **QR Code**: qrcode

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example`
4. Create the MySQL database:
   ```sql
   CREATE DATABASE attendance_db;
   ```
5. Run migrations:
   ```
   npm run migrate
   ```
6. Seed the database with initial data:
   ```
   npm run seed
   ```
7. Start the server:
   ```
   npm start
   ```
   or for development:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/verify-email` - Verify email with OTP
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with OTP
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PUT /api/users/:id/change-password` - Change user password
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/profile/image` - Upload profile image
- `PUT /api/users/:id/assign-class-teacher` - Assign class teacher
- `GET /api/users/students/class/:classId` - Get students by class
- `GET /api/users/teachers` - Get all teachers

### Classes
- `GET /api/classes` - Get all classes
- `GET /api/classes/:id` - Get class by ID
- `POST /api/classes` - Create class
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class
- `POST /api/classes/:id/promote` - Promote students to next semester/year

### Subjects
- `GET /api/subjects` - Get all subjects
- `GET /api/subjects/:id` - Get subject by ID
- `POST /api/subjects` - Create subject
- `PUT /api/subjects/:id` - Update subject
- `DELETE /api/subjects/:id` - Delete subject
- `GET /api/subjects/teacher/:teacherId` - Get subjects by teacher
- `GET /api/subjects/class/:classId` - Get subjects by class
- `PUT /api/subjects/:id/assign-teacher` - Assign teacher to subject

### Timetable
- `GET /api/timetable` - Get all timetable entries
- `GET /api/timetable/:id` - Get timetable entry by ID
- `POST /api/timetable` - Create timetable entry
- `PUT /api/timetable/:id` - Update timetable entry
- `DELETE /api/timetable/:id` - Delete timetable entry
- `GET /api/timetable/class/:classId` - Get timetable by class
- `GET /api/timetable/teacher/:teacherId` - Get timetable by teacher
- `GET /api/timetable/current-class/:teacherId` - Get current class for teacher

### Attendance
- `POST /api/attendance/mark` - Mark attendance manually
- `POST /api/attendance/bulk` - Bulk mark attendance
- `GET /api/attendance/student/:studentId` - Get attendance by student
- `GET /api/attendance/subject/:subjectId` - Get attendance by subject
- `GET /api/attendance/class/:classId` - Get attendance by class
- `PUT /api/attendance/:id` - Update attendance
- `DELETE /api/attendance/:id` - Delete attendance

### QR Code
- `POST /api/qr/generate` - Generate QR code for attendance
- `POST /api/qr/scan` - Scan QR code for attendance
- `GET /api/qr/active` - Get active QR sessions for teacher
- `GET /api/qr/history` - Get QR session history
- `GET /api/qr/:id` - Get QR session details with attendance list
- `PUT /api/qr/:id/cancel` - Cancel QR session

### Reports
- `GET /api/reports/student/:studentId` - Generate student attendance report
- `GET /api/reports/class/:classId` - Generate class attendance report
- `GET /api/reports/subject/:subjectId` - Generate subject attendance report

## Default Users

After seeding the database, you can login with the following credentials:

- **Admin**
  - Login ID: admin
  - Password: admin123

- **Class Teacher**
  - Login ID: classteacher
  - Password: teacher123

- **Subject Teacher**
  - Login ID: teacher1
  - Password: teacher123

- **Student**
  - Login ID: student1
  - Password: student123

## License

ISC

