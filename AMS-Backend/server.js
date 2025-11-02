require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const classRoutes = require('./routes/classes');
const attendanceRoutes = require('./routes/attendance');
const reportRoutes = require('./routes/reports');
const studentRoutes = require('./routes/students');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Optional dev seeding (creates default users if collection is empty)
const User = require('./models/User');
const bcrypt = require('bcryptjs');

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/students', studentRoutes);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    const mongoUri = process.env.MONGO_URI ;
    await mongoose.connect(mongoUri, { autoIndex: true });
    console.log('Connected to MongoDB');

    // Seed default users for local dev if none exist
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('No users found in DB — creating default dev users...');
      const hashed = await bcrypt.hash('Password123!', 10);
      try {
        await User.create([
          { name: 'Admin User', email: 'admin@example.com', password: hashed, role: 'Admin' },
          { name: 'Student User', email: 'student@example.com', password: hashed, role: 'Student' },
          { name: 'Teacher User', email: 'teacher@example.com', password: hashed, role: 'Teacher' },
        ]);
        console.log('Default users created: admin@example.com / student@example.com / teacher@example.com (Password123!)');
      } catch (seedErr) {
        console.error('Failed to create default users:', seedErr.message || seedErr);
      }
    }

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();
