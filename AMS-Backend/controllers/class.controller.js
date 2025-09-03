const { Class, User, Subject } = require('../models');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

/**
 * Get all classes
 * @route GET /api/classes
 */
const getClasses = asyncHandler(async (req, res) => {
  // Find all classes
  const classes = await Class.findAll({
    include: [
      { model: User, as: 'classTeacher', attributes: ['id', 'name', 'email'] }
    ],
    order: [['name', 'ASC']]
  });
  
  // Return classes
  res.status(200).json({
    success: true,
    count: classes.length,
    data: classes
  });
});

/**
 * Get class by ID
 * @route GET /api/classes/:id
 */
const getClassById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Find class
  const classRecord = await Class.findByPk(id, {
    include: [
      { model: User, as: 'classTeacher', attributes: ['id', 'name', 'email'] },
      { model: Subject, as: 'subjects', include: [
        { model: User, as: 'teacher', attributes: ['id', 'name', 'email'] }
      ]},
      { model: User, as: 'students', attributes: ['id', 'name', 'email', 'rollNumber'] }
    ]
  });
  
  if (!classRecord) {
    throw new AppError('Class not found', 404);
  }
  
  // Return class
  res.status(200).json({
    success: true,
    data: classRecord
  });
});

/**
 * Create class
 * @route POST /api/classes
 */
const createClass = asyncHandler(async (req, res) => {
  const {
    name,
    year,
    semester,
    section,
    department,
    program,
    academicYear,
    classTeacherId
  } = req.body;
  
  // Check if user is authorized to create classes
  if (req.user.role !== 'admin') {
    throw new AppError('You are not authorized to create classes', 403);
  }
  
  // Check if class name already exists
  const classExists = await Class.findOne({ where: { name } });
  if (classExists) {
    throw new AppError('Class name already exists', 400);
  }
  
  // Check if class teacher exists and is a teacher
  if (classTeacherId) {
    const teacher = await User.findOne({
      where: {
        id: classTeacherId,
        role: {
          [Op.in]: ['teacher', 'subject_teacher', 'class_teacher']
        }
      }
    });
    
    if (!teacher) {
      throw new AppError('Class teacher not found or is not a teacher', 404);
    }
    
    // Update teacher role to class_teacher if not already
    if (teacher.role !== 'class_teacher') {
      teacher.role = 'class_teacher';
      await teacher.save();
    }
  }
  
  // Create class
  const classRecord = await Class.create({
    name,
    year,
    semester,
    section,
    department,
    program,
    academicYear,
    classTeacherId,
    isActive: true
  });
  
  // Return class
  res.status(201).json({
    success: true,
    message: 'Class created successfully',
    data: classRecord
  });
});

/**
 * Update class
 * @route PUT /api/classes/:id
 */
const updateClass = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    year,
    semester,
    section,
    department,
    program,
    academicYear,
    classTeacherId,
    isActive
  } = req.body;
  
  // Check if user is authorized to update classes
  if (req.user.role !== 'admin') {
    throw new AppError('You are not authorized to update classes', 403);
  }
  
  // Find class
  const classRecord = await Class.findByPk(id);
  
  if (!classRecord) {
    throw new AppError('Class not found', 404);
  }
  
  // Check if class name is being changed and already exists
  if (name && name !== classRecord.name) {
    const classExists = await Class.findOne({ where: { name } });
    if (classExists) {
      throw new AppError('Class name already exists', 400);
    }
  }
  
  // Check if class teacher is being changed
  if (classTeacherId && classTeacherId !== classRecord.classTeacherId) {
    // Check if new class teacher exists and is a teacher
    const newTeacher = await User.findOne({
      where: {
        id: classTeacherId,
        role: {
          [Op.in]: ['teacher', 'subject_teacher', 'class_teacher']
        }
      }
    });
    
    if (!newTeacher) {
      throw new AppError('Class teacher not found or is not a teacher', 404);
    }
    
    // Update new teacher role to class_teacher if not already
    if (newTeacher.role !== 'class_teacher') {
      newTeacher.role = 'class_teacher';
      await newTeacher.save();
    }
    
    // Update old class teacher role to teacher if not assigned to any other class
    if (classRecord.classTeacherId) {
      const oldTeacher = await User.findByPk(classRecord.classTeacherId);
      if (oldTeacher) {
        // Check if old teacher is assigned to any other class
        const otherClasses = await Class.findOne({
          where: {
            id: { [Op.ne]: id },
            classTeacherId: classRecord.classTeacherId
          }
        });
        
        if (!otherClasses) {
          oldTeacher.role = 'teacher';
          await oldTeacher.save();
        }
      }
    }
  }
  
  // Update class
  classRecord.name = name || classRecord.name;
  classRecord.year = year || classRecord.year;
  classRecord.semester = semester || classRecord.semester;
  classRecord.section = section !== undefined ? section : classRecord.section;
  classRecord.department = department || classRecord.department;
  classRecord.program = program !== undefined ? program : classRecord.program;
  classRecord.academicYear = academicYear || classRecord.academicYear;
  classRecord.classTeacherId = classTeacherId !== undefined ? classTeacherId : classRecord.classTeacherId;
  classRecord.isActive = isActive !== undefined ? isActive : classRecord.isActive;
  
  await classRecord.save();
  
  // Return updated class
  res.status(200).json({
    success: true,
    message: 'Class updated successfully',
    data: classRecord
  });
});

/**
 * Delete class
 * @route DELETE /api/classes/:id
 */
const deleteClass = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if user is authorized to delete classes
  if (req.user.role !== 'admin') {
    throw new AppError('You are not authorized to delete classes', 403);
  }
  
  // Find class
  const classRecord = await Class.findByPk(id);
  
  if (!classRecord) {
    throw new AppError('Class not found', 404);
  }
  
  // Check if class has students
  const students = await User.findOne({
    where: {
      classId: id,
      role: 'student'
    }
  });
  
  if (students) {
    throw new AppError('Cannot delete class with students. Please remove or reassign students first.', 400);
  }
  
  // Check if class has subjects
  const subjects = await Subject.findOne({
    where: {
      classId: id
    }
  });
  
  if (subjects) {
    throw new AppError('Cannot delete class with subjects. Please remove or reassign subjects first.', 400);
  }
  
  // Update class teacher role to teacher if not assigned to any other class
  if (classRecord.classTeacherId) {
    const teacher = await User.findByPk(classRecord.classTeacherId);
    if (teacher) {
      // Check if teacher is assigned to any other class
      const otherClasses = await Class.findOne({
        where: {
          id: { [Op.ne]: id },
          classTeacherId: classRecord.classTeacherId
        }
      });
      
      if (!otherClasses) {
        teacher.role = 'teacher';
        await teacher.save();
      }
    }
  }
  
  // Delete class
  await classRecord.destroy();
  
  // Return success
  res.status(200).json({
    success: true,
    message: 'Class deleted successfully'
  });
});

/**
 * Promote students to next semester/year
 * @route POST /api/classes/:id/promote
 */
const promoteStudents = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { targetClassId, updateYear = true, updateSemester = true } = req.body;
  
  // Check if user is authorized to promote students
  if (req.user.role !== 'admin' && req.user.role !== 'class_teacher') {
    throw new AppError('You are not authorized to promote students', 403);
  }
  
  // Find source class
  const sourceClass = await Class.findByPk(id);
  
  if (!sourceClass) {
    throw new AppError('Source class not found', 404);
  }
  
  // Check if user is the class teacher of the source class
  if (req.user.role === 'class_teacher' && sourceClass.classTeacherId !== req.user.id) {
    throw new AppError('You are not authorized to promote students from this class', 403);
  }
  
  // Find target class if provided
  let targetClass = null;
  if (targetClassId) {
    targetClass = await Class.findByPk(targetClassId);
    
    if (!targetClass) {
      throw new AppError('Target class not found', 404);
    }
  }
  
  // Find students in the source class
  const students = await User.findAll({
    where: {
      role: 'student',
      classId: id
    }
  });
  
  if (students.length === 0) {
    throw new AppError('No students found in the source class', 404);
  }
  
  // Promote students
  const promotedStudents = [];
  
  for (const student of students) {
    // Update year if needed
    if (updateYear) {
      const yearMatch = student.year.match(/(\d+)(?:st|nd|rd|th)/);
      if (yearMatch) {
        const currentYear = parseInt(yearMatch[1]);
        const nextYear = currentYear + 1;
        const suffix = getSuffix(nextYear);
        student.year = `${nextYear}${suffix} Year`;
      }
    }
    
    // Update semester if needed
    if (updateSemester) {
      const semesterMatch = student.semester.match(/(\d+)(?:st|nd|rd|th)/);
      if (semesterMatch) {
        const currentSemester = parseInt(semesterMatch[1]);
        const nextSemester = currentSemester + 1;
        const suffix = getSuffix(nextSemester);
        student.semester = `${nextSemester}${suffix} Semester`;
      }
    }
    
    // Update class if target class is provided
    if (targetClass) {
      student.classId = targetClass.id;
    }
    
    await student.save();
    promotedStudents.push(student);
  }
  
  // Return promoted students
  res.status(200).json({
    success: true,
    message: `${promotedStudents.length} students promoted successfully`,
    data: {
      count: promotedStudents.length,
      students: promotedStudents.map(student => ({
        id: student.id,
        name: student.name,
        rollNumber: student.rollNumber,
        year: student.year,
        semester: student.semester,
        classId: student.classId
      }))
    }
  });
});

/**
 * Helper function to get suffix for ordinal numbers
 */
const getSuffix = (num) => {
  if (num >= 11 && num <= 13) {
    return 'th';
  }
  
  switch (num % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

module.exports = {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  promoteStudents
};

