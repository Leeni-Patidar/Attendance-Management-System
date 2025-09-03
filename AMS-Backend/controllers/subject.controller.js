const { Subject, User, Class } = require('../models');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

/**
 * Get all subjects
 * @route GET /api/subjects
 */
const getSubjects = asyncHandler(async (req, res) => {
  // Find all subjects
  const subjects = await Subject.findAll({
    include: [
      { model: User, as: 'teacher', attributes: ['id', 'name', 'email'] },
      { model: Class, as: 'class' }
    ],
    order: [['name', 'ASC']]
  });
  
  // Return subjects
  res.status(200).json({
    success: true,
    count: subjects.length,
    data: subjects
  });
});

/**
 * Get subject by ID
 * @route GET /api/subjects/:id
 */
const getSubjectById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Find subject
  const subject = await Subject.findByPk(id, {
    include: [
      { model: User, as: 'teacher', attributes: ['id', 'name', 'email'] },
      { model: Class, as: 'class' }
    ]
  });
  
  if (!subject) {
    throw new AppError('Subject not found', 404);
  }
  
  // Return subject
  res.status(200).json({
    success: true,
    data: subject
  });
});

/**
 * Create subject
 * @route POST /api/subjects
 */
const createSubject = asyncHandler(async (req, res) => {
  const {
    name,
    code,
    description,
    credits,
    teacherId,
    classId
  } = req.body;
  
  // Check if user is authorized to create subjects
  if (req.user.role !== 'admin' && req.user.role !== 'class_teacher') {
    throw new AppError('You are not authorized to create subjects', 403);
  }
  
  // Check if class teacher is creating subject for their class
  if (req.user.role === 'class_teacher') {
    const classRecord = await Class.findByPk(classId);
    
    if (!classRecord) {
      throw new AppError('Class not found', 404);
    }
    
    if (classRecord.classTeacherId !== req.user.id) {
      throw new AppError('You are not authorized to create subjects for this class', 403);
    }
  }
  
  // Check if subject code already exists
  const subjectExists = await Subject.findOne({ where: { code } });
  if (subjectExists) {
    throw new AppError('Subject code already exists', 400);
  }
  
  // Check if class exists
  const classRecord = await Class.findByPk(classId);
  if (!classRecord) {
    throw new AppError('Class not found', 404);
  }
  
  // Check if teacher exists and is a teacher
  let teacher = null;
  if (teacherId) {
    teacher = await User.findOne({
      where: {
        id: teacherId,
        role: {
          [Op.in]: ['teacher', 'subject_teacher', 'class_teacher']
        }
      }
    });
    
    if (!teacher) {
      throw new AppError('Teacher not found or is not a teacher', 404);
    }
    
    // Update teacher role to subject_teacher if not already a class_teacher
    if (teacher.role !== 'class_teacher' && teacher.role !== 'subject_teacher') {
      teacher.role = 'subject_teacher';
      await teacher.save();
    }
  }
  
  // Create subject
  const subject = await Subject.create({
    name,
    code,
    description,
    credits,
    teacherId,
    classId,
    isActive: true
  });
  
  // Return subject
  res.status(201).json({
    success: true,
    message: 'Subject created successfully',
    data: subject
  });
});

/**
 * Update subject
 * @route PUT /api/subjects/:id
 */
const updateSubject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    code,
    description,
    credits,
    teacherId,
    classId,
    isActive
  } = req.body;
  
  // Find subject
  const subject = await Subject.findByPk(id, {
    include: [
      { model: Class, as: 'class' }
    ]
  });
  
  if (!subject) {
    throw new AppError('Subject not found', 404);
  }
  
  // Check if user is authorized to update subject
  if (req.user.role === 'admin') {
    // Admin can update any subject
  } else if (req.user.role === 'class_teacher') {
    // Class teacher can only update subjects for their class
    if (subject.class.classTeacherId !== req.user.id) {
      throw new AppError('You are not authorized to update this subject', 403);
    }
  } else {
    throw new AppError('You are not authorized to update subjects', 403);
  }
  
  // Check if subject code is being changed and already exists
  if (code && code !== subject.code) {
    const subjectExists = await Subject.findOne({ where: { code } });
    if (subjectExists) {
      throw new AppError('Subject code already exists', 400);
    }
  }
  
  // Check if class is being changed and exists
  if (classId && classId !== subject.classId) {
    const classRecord = await Class.findByPk(classId);
    if (!classRecord) {
      throw new AppError('Class not found', 404);
    }
    
    // Check if class teacher is updating to their class
    if (req.user.role === 'class_teacher' && classRecord.classTeacherId !== req.user.id) {
      throw new AppError('You are not authorized to assign this subject to this class', 403);
    }
  }
  
  // Check if teacher is being changed and exists
  if (teacherId && teacherId !== subject.teacherId) {
    const teacher = await User.findOne({
      where: {
        id: teacherId,
        role: {
          [Op.in]: ['teacher', 'subject_teacher', 'class_teacher']
        }
      }
    });
    
    if (!teacher) {
      throw new AppError('Teacher not found or is not a teacher', 404);
    }
    
    // Update teacher role to subject_teacher if not already a class_teacher
    if (teacher.role !== 'class_teacher' && teacher.role !== 'subject_teacher') {
      teacher.role = 'subject_teacher';
      await teacher.save();
    }
  }
  
  // Update subject
  subject.name = name || subject.name;
  subject.code = code || subject.code;
  subject.description = description !== undefined ? description : subject.description;
  subject.credits = credits !== undefined ? credits : subject.credits;
  subject.teacherId = teacherId !== undefined ? teacherId : subject.teacherId;
  subject.classId = classId || subject.classId;
  subject.isActive = isActive !== undefined ? isActive : subject.isActive;
  
  await subject.save();
  
  // Return updated subject
  res.status(200).json({
    success: true,
    message: 'Subject updated successfully',
    data: subject
  });
});

/**
 * Delete subject
 * @route DELETE /api/subjects/:id
 */
const deleteSubject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Find subject
  const subject = await Subject.findByPk(id, {
    include: [
      { model: Class, as: 'class' }
    ]
  });
  
  if (!subject) {
    throw new AppError('Subject not found', 404);
  }
  
  // Check if user is authorized to delete subject
  if (req.user.role === 'admin') {
    // Admin can delete any subject
  } else if (req.user.role === 'class_teacher') {
    // Class teacher can only delete subjects for their class
    if (subject.class.classTeacherId !== req.user.id) {
      throw new AppError('You are not authorized to delete this subject', 403);
    }
  } else {
    throw new AppError('You are not authorized to delete subjects', 403);
  }
  
  // Delete subject
  await subject.destroy();
  
  // Return success
  res.status(200).json({
    success: true,
    message: 'Subject deleted successfully'
  });
});

/**
 * Get subjects by teacher
 * @route GET /api/subjects/teacher/:teacherId
 */
const getSubjectsByTeacher = asyncHandler(async (req, res) => {
  const { teacherId } = req.params;
  
  // Check if teacher exists
  const teacher = await User.findOne({
    where: {
      id: teacherId,
      role: {
        [Op.in]: ['teacher', 'subject_teacher', 'class_teacher']
      }
    }
  });
  
  if (!teacher) {
    throw new AppError('Teacher not found', 404);
  }
  
  // Find subjects
  const subjects = await Subject.findAll({
    where: {
      teacherId
    },
    include: [
      { model: Class, as: 'class' }
    ],
    order: [['name', 'ASC']]
  });
  
  // Return subjects
  res.status(200).json({
    success: true,
    count: subjects.length,
    data: subjects
  });
});

/**
 * Get subjects by class
 * @route GET /api/subjects/class/:classId
 */
const getSubjectsByClass = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  
  // Check if class exists
  const classRecord = await Class.findByPk(classId);
  
  if (!classRecord) {
    throw new AppError('Class not found', 404);
  }
  
  // Find subjects
  const subjects = await Subject.findAll({
    where: {
      classId
    },
    include: [
      { model: User, as: 'teacher', attributes: ['id', 'name', 'email'] }
    ],
    order: [['name', 'ASC']]
  });
  
  // Return subjects
  res.status(200).json({
    success: true,
    count: subjects.length,
    data: subjects
  });
});

/**
 * Assign teacher to subject
 * @route PUT /api/subjects/:id/assign-teacher
 */
const assignTeacher = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { teacherId } = req.body;
  
  // Find subject
  const subject = await Subject.findByPk(id, {
    include: [
      { model: Class, as: 'class' }
    ]
  });
  
  if (!subject) {
    throw new AppError('Subject not found', 404);
  }
  
  // Check if user is authorized to assign teacher
  if (req.user.role === 'admin') {
    // Admin can assign any teacher
  } else if (req.user.role === 'class_teacher') {
    // Class teacher can only assign teachers to subjects for their class
    if (subject.class.classTeacherId !== req.user.id) {
      throw new AppError('You are not authorized to assign teachers to this subject', 403);
    }
  } else {
    throw new AppError('You are not authorized to assign teachers', 403);
  }
  
  // Check if teacher exists and is a teacher
  const teacher = await User.findOne({
    where: {
      id: teacherId,
      role: {
        [Op.in]: ['teacher', 'subject_teacher', 'class_teacher']
      }
    }
  });
  
  if (!teacher) {
    throw new AppError('Teacher not found or is not a teacher', 404);
  }
  
  // Update teacher role to subject_teacher if not already a class_teacher
  if (teacher.role !== 'class_teacher' && teacher.role !== 'subject_teacher') {
    teacher.role = 'subject_teacher';
    await teacher.save();
  }
  
  // Update subject
  subject.teacherId = teacherId;
  await subject.save();
  
  // Return updated subject
  res.status(200).json({
    success: true,
    message: 'Teacher assigned successfully',
    data: {
      subject: {
        id: subject.id,
        name: subject.name,
        code: subject.code
      },
      teacher: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        role: teacher.role
      }
    }
  });
});

module.exports = {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  getSubjectsByTeacher,
  getSubjectsByClass,
  assignTeacher
};

