import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import connectDB from './config.db.js';
// import { errorHandler } from './middleware/error.middleware.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import subjectRoutes from './routes/subject.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import timetableRoutes from './routes/timetable.routes.js';
import qrRoutes from './routes/qr.routes.js';

dotenv.config();
const app = express();

// Database connection
connectDB();

// Middlewares
app.use(express.json());
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/qr', qrRoutes);

app.get('/', (req, res) => res.json({ msg: 'AMS backend (MongoDB) up ✅' }));

// Error Handler
// app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
