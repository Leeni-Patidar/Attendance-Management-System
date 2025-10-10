require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');
const { User, Class, Subject, Timetable } = require('../models');
const { logger } = require('../utils/logger');

/**
 * Seed database with initial data
 */
const seedDatabase = async () => {
  try {
    // Sync database
    await sequelize.sync({ force: true });
    
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
      loginId: 'admin',
      isEmailVerified: true,
      isActive: true
    });
    
    logger.info('Admin user created');
    
    // Create class teacher
    const teacherPassword = await bcrypt.hash('teacher123', 10);
    const classTeacher = await User.create({
      name: 'Class Teacher',
      email: 'classteacher@example.com',
      password: teacherPassword,
      role: 'class_teacher',
      loginId: 'classteacher',
      employeeId: 'EMP001',
      department: 'Computer Science',
      isEmailVerified: true,
      isActive: true
    });
    
    logger.info('Class teacher created');
    
    // Create subject teachers
    const subjectTeacher1 = await User.create({
      name: 'Subject Teacher 1',
      email: 'teacher1@example.com',
      password: teacherPassword,
      role: 'subject_teacher',
      loginId: 'teacher1',
      employeeId: 'EMP002',
      department: 'Computer Science',
      isEmailVerified: true,
      isActive: true
    });
    
    const subjectTeacher2 = await User.create({
      name: 'Subject Teacher 2',
      email: 'teacher2@example.com',
      password: teacherPassword,
      role: 'subject_teacher',
      loginId: 'teacher2',
      employeeId: 'EMP003',
      department: 'Mathematics',
      isEmailVerified: true,
      isActive: true
    });
    
    logger.info('Subject teachers created');
    
    // Create class
    const class1 = await Class.create({
      name: 'CS-101',
      year: '1st Year',
      semester: '1st Semester',
      section: 'A',
      department: 'Computer Science',
      program: 'B.Tech',
      academicYear: '2023-2024',
      classTeacherId: classTeacher.id,
      isActive: true
    });
    
    logger.info('Class created');
    
    // Create subjects
    const subject1 = await Subject.create({
      name: 'Introduction to Programming',
      code: 'CS101',
      description: 'Basic programming concepts using C',
      credits: 4,
      teacherId: subjectTeacher1.id,
      classId: class1.id,
      isActive: true
    });
    
    const subject2 = await Subject.create({
      name: 'Mathematics I',
      code: 'MA101',
      description: 'Calculus and Linear Algebra',
      credits: 4,
      teacherId: subjectTeacher2.id,
      classId: class1.id,
      isActive: true
    });
    
    logger.info('Subjects created');
    
    // Create timetable entries
    await Timetable.create({
      dayOfWeek: 'Monday',
      startTime: '09:00:00',
      endTime: '10:30:00',
      room: 'Room 101',
      subjectId: subject1.id,
      classId: class1.id,
      isActive: true
    });
    
    await Timetable.create({
      dayOfWeek: 'Monday',
      startTime: '11:00:00',
      endTime: '12:30:00',
      room: 'Room 102',
      subjectId: subject2.id,
      classId: class1.id,
      isActive: true
    });
    
    await Timetable.create({
      dayOfWeek: 'Wednesday',
      startTime: '09:00:00',
      endTime: '10:30:00',
      room: 'Room 101',
      subjectId: subject1.id,
      classId: class1.id,
      isActive: true
    });
    
    await Timetable.create({
      dayOfWeek: 'Wednesday',
      startTime: '11:00:00',
      endTime: '12:30:00',
      room: 'Room 102',
      subjectId: subject2.id,
      classId: class1.id,
      isActive: true
    });
    
    logger.info('Timetable entries created');
    
    // Create students
    const studentPassword = await bcrypt.hash('student123', 10);
    
    for (let i = 1; i <= 10; i++) {
      await User.create({
        name: `Student ${i}`,
        email: `student${i}@example.com`,
        password: studentPassword,
        role: 'student',
        loginId: `student${i}`,
        rollNumber: `CS101${i.toString().padStart(2, '0')}`,
        department: 'Computer Science',
        year: '1st Year',
        semester: '1st Semester',
        program: 'B.Tech',
        classId: class1.id,
        isEmailVerified: true,
        isActive: true
      });
    }
    
    logger.info('Students created');
    
    logger.info('Database seeded successfully');
    return true;
  } catch (error) {
    logger.error('Error seeding database:', error);
    return false;
  }
};

// Run seeder if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Database seeded successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Error seeding database:', error);
      process.exit(1);
    });
}

module.exports = {
  seedDatabase
};

