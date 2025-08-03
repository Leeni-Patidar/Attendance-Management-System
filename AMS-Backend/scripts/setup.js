import dotenv from 'dotenv';
import database from '../src/config/database.js';
import { User, Subject } from '../src/models/index.js';

// Load environment variables
dotenv.config();

// Default admin user
const defaultAdmin = {
  loginId: 'admin',
  email: process.env.ADMIN_EMAIL || 'admin@college.edu',
  password: process.env.ADMIN_PASSWORD || 'admin123',
  name: 'System Administrator',
  role: 'admin',
  phoneNumber: '+919999999999',
  address: {
    street: 'College Campus',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    country: 'India'
  },
  isActive: true,
  emailVerified: true
};

// Sample subjects data
const sampleSubjects = [
  {
    name: 'Data Structures & Algorithms',
    code: 'CS301',
    description: 'Fundamental data structures and algorithmic techniques',
    credits: 4,
    type: 'theory',
    category: 'core',
    department: 'Computer Science',
    program: 'B.Tech',
    year: '3rd Year',
    semester: '6th Semester',
    academicYear: '2024-2025',
    assessment: {
      attendanceWeightage: 10,
      minimumAttendance: 75
    },
    isActive: true,
    approvalStatus: 'approved'
  },
  {
    name: 'Database Management Systems',
    code: 'CS302',
    description: 'Database design, implementation, and management',
    credits: 3,
    type: 'theory',
    category: 'core',
    department: 'Computer Science',
    program: 'B.Tech',
    year: '3rd Year',
    semester: '6th Semester',
    academicYear: '2024-2025',
    assessment: {
      attendanceWeightage: 10,
      minimumAttendance: 75
    },
    isActive: true,
    approvalStatus: 'approved'
  },
  {
    name: 'Computer Networks Lab',
    code: 'CS303',
    description: 'Practical implementation of networking concepts',
    credits: 2,
    type: 'practical',
    category: 'core',
    department: 'Computer Science',
    program: 'B.Tech',
    year: '3rd Year',
    semester: '6th Semester',
    academicYear: '2024-2025',
    assessment: {
      attendanceWeightage: 15,
      minimumAttendance: 80
    },
    isActive: true,
    approvalStatus: 'approved'
  },
  {
    name: 'Software Engineering',
    code: 'CS304',
    description: 'Software development methodologies and practices',
    credits: 3,
    type: 'theory',
    category: 'core',
    department: 'Computer Science',
    program: 'B.Tech',
    year: '3rd Year',
    semester: '6th Semester',
    academicYear: '2024-2025',
    assessment: {
      attendanceWeightage: 10,
      minimumAttendance: 75
    },
    isActive: true,
    approvalStatus: 'approved'
  },
  {
    name: 'Machine Learning',
    code: 'CS305',
    description: 'Introduction to machine learning algorithms and techniques',
    credits: 3,
    type: 'elective',
    category: 'elective',
    department: 'Computer Science',
    program: 'B.Tech',
    year: '3rd Year',
    semester: '6th Semester',
    academicYear: '2024-2025',
    assessment: {
      attendanceWeightage: 10,
      minimumAttendance: 75
    },
    isActive: true,
    approvalStatus: 'approved'
  }
];

// Sample demo users
const demoUsers = [
  {
    loginId: 'student001',
    email: 'student@college.edu',
    password: 'demo123',
    name: 'John Doe',
    role: 'student',
    phoneNumber: '+919876543210',
    studentInfo: {
      rollNumber: 'CS21B001',
      class: 'CS 3rd Year - Section A',
      year: '3rd Year',
      semester: '6th Semester',
      branch: 'Computer Science & Engineering',
      program: 'B.Tech',
      admissionYear: 2021
    },
    isActive: true,
    emailVerified: true
  },
  {
    loginId: 'classteach01',
    email: 'class.teacher@college.edu',
    password: 'demo123',
    name: 'Dr. Sarah Johnson',
    role: 'class_teacher',
    phoneNumber: '+919876543211',
    teacherInfo: {
      employeeId: 'EMP001',
      department: 'Computer Science',
      designation: 'Associate Professor',
      qualification: ['PhD in Computer Science'],
      experience: 8,
      joiningDate: new Date('2018-06-01'),
      assignedClasses: ['CS 3rd Year - Section A']
    },
    isActive: true,
    emailVerified: true
  },
  {
    loginId: 'subjectteach01',
    email: 'subject.teacher@college.edu',
    password: 'demo123',
    name: 'Prof. Michael Chen',
    role: 'subject_teacher',
    phoneNumber: '+919876543212',
    teacherInfo: {
      employeeId: 'EMP002',
      department: 'Computer Science',
      designation: 'Assistant Professor',
      qualification: ['M.Tech in Computer Science', 'PhD pursuing'],
      experience: 5,
      joiningDate: new Date('2020-07-01')
    },
    isActive: true,
    emailVerified: true
  }
];

const setupDatabase = async () => {
  try {
    console.log('🔄 Starting database setup...');
    
    // Connect to database
    await database.connect();
    
    // Setup indexes
    await database.setupIndexes();
    
    console.log('✅ Connected to database and indexes created');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (!existingAdmin) {
      console.log('👤 Creating default admin user...');
      const admin = new User(defaultAdmin);
      await admin.save();
      console.log(`✅ Admin user created with login ID: ${defaultAdmin.loginId}`);
      console.log(`📧 Email: ${defaultAdmin.email}`);
      console.log(`🔑 Password: ${defaultAdmin.password}`);
    } else {
      console.log('ℹ️  Admin user already exists');
    }
    
    // Create demo users if they don't exist
    console.log('👥 Creating demo users...');
    for (const userData of demoUsers) {
      const existingUser = await User.findOne({ 
        $or: [
          { loginId: userData.loginId },
          { email: userData.email }
        ]
      });
      
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        console.log(`✅ Created demo user: ${userData.name} (${userData.loginId})`);
      } else {
        console.log(`ℹ️  Demo user already exists: ${userData.loginId}`);
      }
    }
    
    // Create sample subjects if they don't exist
    console.log('📚 Creating sample subjects...');
    for (const subjectData of sampleSubjects) {
      const existingSubject = await Subject.findOne({ 
        code: subjectData.code,
        academicYear: subjectData.academicYear
      });
      
      if (!existingSubject) {
        const subject = new Subject(subjectData);
        await subject.save();
        console.log(`✅ Created subject: ${subjectData.name} (${subjectData.code})`);
      } else {
        console.log(`ℹ️  Subject already exists: ${subjectData.code}`);
      }
    }
    
    // Display summary
    console.log('\n📊 Database Setup Summary:');
    console.log('============================');
    
    const userCounts = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);
    
    userCounts.forEach(({ _id, count }) => {
      console.log(`${_id}: ${count} users`);
    });
    
    const subjectCount = await Subject.countDocuments({ isActive: true });
    console.log(`subjects: ${subjectCount} active subjects`);
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n🚀 You can now start the server with: npm run dev');
    console.log('📚 API Documentation: http://localhost:5000/api-docs');
    console.log('💚 Health Check: http://localhost:5000/health');
    
    console.log('\n🔐 Demo Login Credentials:');
    console.log('==========================');
    console.log('Admin:');
    console.log(`  Login ID: ${defaultAdmin.loginId}`);
    console.log(`  Password: ${defaultAdmin.password}`);
    console.log('');
    demoUsers.forEach(user => {
      console.log(`${user.role.replace('_', ' ').toUpperCase()}:`);
      console.log(`  Login ID: ${user.loginId}`);
      console.log(`  Password: demo123`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await database.disconnect();
    process.exit(0);
  }
};

const resetDatabase = async () => {
  try {
    console.log('⚠️  DANGER: This will delete all data in the database!');
    
    // Add a safety check
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ Cannot reset database in production environment');
      process.exit(1);
    }
    
    console.log('🔄 Connecting to database...');
    await database.connect();
    
    console.log('🗑️  Dropping database...');
    await database.dropDatabase();
    
    console.log('✅ Database reset completed');
    
    // Run setup after reset
    await setupDatabase();
    
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  }
};

// Command line argument handling
const command = process.argv[2];

switch (command) {
  case 'reset':
    console.log('🔄 Resetting database...');
    resetDatabase();
    break;
  case 'setup':
  default:
    setupDatabase();
    break;
}

export { setupDatabase, resetDatabase };