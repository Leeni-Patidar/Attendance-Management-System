const { Timetable, Subject, Class, User } = require('../models');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

/**
 * Get all timetable entries
 * @route GET /api/timetable
 */
const getTimetable = asyncHandler(async (req, res) => {
  // Find all timetable entries
  const timetable = await Timetable.findAll({
    include: [
      { model: Subject, as: 'subject', include: [
        { model: User, as: 'teacher', attributes: ['id', 'name', 'email'] }
      ]},
      { model: Class, as: 'class' }
    ],
    order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']]
  });
  
  // Return timetable
  res.status(200).json({
    success: true,
    count: timetable.length,
    data: timetable
  });
});

/**
 * Get timetable entry by ID
 * @route GET /api/timetable/:id
 */
const getTimetableById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Find timetable entry
  const timetableEntry = await Timetable.findByPk(id, {
    include: [
      { model: Subject, as: 'subject', include: [
        { model: User, as: 'teacher', attributes: ['id', 'name', 'email'] }
      ]},
      { model: Class, as: 'class' }
    ]
  });
  
  if (!timetableEntry) {
    throw new AppError('Timetable entry not found', 404);
  }
  
  // Return timetable entry
  res.status(200).json({
    success: true,
    data: timetableEntry
  });
});

/**
 * Create timetable entry
 * @route POST /api/timetable
 */
const createTimetable = asyncHandler(async (req, res) => {
  const {
    dayOfWeek,
    startTime,
    endTime,
    room,
    subjectId,
    classId
  } = req.body;
  
  // Check if user is authorized to create timetable entries
  if (req.user.role !== 'admin' && req.user.role !== 'class_teacher') {
    throw new AppError('You are not authorized to create timetable entries', 403);
  }
  
  // Check if subject exists
  const subject = await Subject.findByPk(subjectId, {
    include: [
      { model: Class, as: 'class' }
    ]
  });
  
  if (!subject) {
    throw new AppError('Subject not found', 404);
  }
  
  // Check if class exists
  const classRecord = await Class.findByPk(classId);
  
  if (!classRecord) {
    throw new AppError('Class not found', 404);
  }
  
  // Check if subject belongs to the class
  if (subject.classId !== parseInt(classId)) {
    throw new AppError('Subject does not belong to the specified class', 400);
  }
  
  // Check if class teacher is creating timetable for their class
  if (req.user.role === 'class_teacher' && classRecord.classTeacherId !== req.user.id) {
    throw new AppError('You are not authorized to create timetable entries for this class', 403);
  }
  
  // Check for time conflicts for the class
  const classConflicts = await Timetable.findOne({
    where: {
      classId,
      dayOfWeek,
      [Op.or]: [
        {
          // New entry starts during an existing entry
          startTime: {
            [Op.lt]: endTime,
            [Op.gte]: startTime
          }
        },
        {
          // New entry ends during an existing entry
          endTime: {
            [Op.lte]: endTime,
            [Op.gt]: startTime
          }
        },
        {
          // New entry completely contains an existing entry
          startTime: {
            [Op.gte]: startTime
          },
          endTime: {
            [Op.lte]: endTime
          }
        },
        {
          // New entry is completely contained within an existing entry
          startTime: {
            [Op.lte]: startTime
          },
          endTime: {
            [Op.gte]: endTime
          }
        }
      ]
    }
  });
  
  if (classConflicts) {
    throw new AppError('Time conflict with existing timetable entry for this class', 400);
  }
  
  // Check for time conflicts for the teacher
  if (subject.teacherId) {
    const teacherConflicts = await Timetable.findOne({
      include: [
        {
          model: Subject,
          as: 'subject',
          where: {
            teacherId: subject.teacherId
          }
        }
      ],
      where: {
        dayOfWeek,
        [Op.or]: [
          {
            // New entry starts during an existing entry
            startTime: {
              [Op.lt]: endTime,
              [Op.gte]: startTime
            }
          },
          {
            // New entry ends during an existing entry
            endTime: {
              [Op.lte]: endTime,
              [Op.gt]: startTime
            }
          },
          {
            // New entry completely contains an existing entry
            startTime: {
              [Op.gte]: startTime
            },
            endTime: {
              [Op.lte]: endTime
            }
          },
          {
            // New entry is completely contained within an existing entry
            startTime: {
              [Op.lte]: startTime
            },
            endTime: {
              [Op.gte]: endTime
            }
          }
        ]
      }
    });
    
    if (teacherConflicts) {
      throw new AppError('Time conflict with existing timetable entry for this teacher', 400);
    }
  }
  
  // Create timetable entry
  const timetableEntry = await Timetable.create({
    dayOfWeek,
    startTime,
    endTime,
    room,
    subjectId,
    classId,
    isActive: true
  });
  
  // Return timetable entry
  res.status(201).json({
    success: true,
    message: 'Timetable entry created successfully',
    data: timetableEntry
  });
});

/**
 * Update timetable entry
 * @route PUT /api/timetable/:id
 */
const updateTimetable = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    dayOfWeek,
    startTime,
    endTime,
    room,
    subjectId,
    classId,
    isActive
  } = req.body;
  
  // Find timetable entry
  const timetableEntry = await Timetable.findByPk(id, {
    include: [
      { model: Subject, as: 'subject' },
      { model: Class, as: 'class' }
    ]
  });
  
  if (!timetableEntry) {
    throw new AppError('Timetable entry not found', 404);
  }
  
  // Check if user is authorized to update timetable entries
  if (req.user.role === 'admin') {
    // Admin can update any timetable entry
  } else if (req.user.role === 'class_teacher') {
    // Class teacher can only update timetable entries for their class
    const classRecord = await Class.findByPk(timetableEntry.classId);
    
    if (classRecord.classTeacherId !== req.user.id) {
      throw new AppError('You are not authorized to update timetable entries for this class', 403);
    }
  } else {
    throw new AppError('You are not authorized to update timetable entries', 403);
  }
  
  // Check if subject is being changed and exists
  let newSubject = null;
  if (subjectId && subjectId !== timetableEntry.subjectId) {
    newSubject = await Subject.findByPk(subjectId);
    
    if (!newSubject) {
      throw new AppError('Subject not found', 404);
    }
  }
  
  // Check if class is being changed and exists
  let newClass = null;
  if (classId && classId !== timetableEntry.classId) {
    newClass = await Class.findByPk(classId);
    
    if (!newClass) {
      throw new AppError('Class not found', 404);
    }
    
    // Check if class teacher is updating to their class
    if (req.user.role === 'class_teacher' && newClass.classTeacherId !== req.user.id) {
      throw new AppError('You are not authorized to update timetable entries for this class', 403);
    }
  }
  
  // Check if subject belongs to the class
  if (newSubject && newClass && newSubject.classId !== parseInt(classId)) {
    throw new AppError('Subject does not belong to the specified class', 400);
  } else if (newSubject && !newClass && newSubject.classId !== timetableEntry.classId) {
    throw new AppError('Subject does not belong to the specified class', 400);
  } else if (!newSubject && newClass && timetableEntry.subject.classId !== parseInt(classId)) {
    throw new AppError('Subject does not belong to the specified class', 400);
  }
  
  // Check for time conflicts if time or day is being changed
  if (dayOfWeek || startTime || endTime || classId || subjectId) {
    const newDayOfWeek = dayOfWeek || timetableEntry.dayOfWeek;
    const newStartTime = startTime || timetableEntry.startTime;
    const newEndTime = endTime || timetableEntry.endTime;
    const newClassId = classId || timetableEntry.classId;
    const newSubjectId = subjectId || timetableEntry.subjectId;
    
    // Check for time conflicts for the class
    const classConflicts = await Timetable.findOne({
      where: {
        id: {
          [Op.ne]: id
        },
        classId: newClassId,
        dayOfWeek: newDayOfWeek,
        [Op.or]: [
          {
            // New entry starts during an existing entry
            startTime: {
              [Op.lt]: newEndTime,
              [Op.gte]: newStartTime
            }
          },
          {
            // New entry ends during an existing entry
            endTime: {
              [Op.lte]: newEndTime,
              [Op.gt]: newStartTime
            }
          },
          {
            // New entry completely contains an existing entry
            startTime: {
              [Op.gte]: newStartTime
            },
            endTime: {
              [Op.lte]: newEndTime
            }
          },
          {
            // New entry is completely contained within an existing entry
            startTime: {
              [Op.lte]: newStartTime
            },
            endTime: {
              [Op.gte]: newEndTime
            }
          }
        ]
      }
    });
    
    if (classConflicts) {
      throw new AppError('Time conflict with existing timetable entry for this class', 400);
    }
    
    // Check for time conflicts for the teacher
    const teacherId = newSubject ? newSubject.teacherId : timetableEntry.subject.teacherId;
    
    if (teacherId) {
      const teacherConflicts = await Timetable.findOne({
        include: [
          {
            model: Subject,
            as: 'subject',
            where: {
              teacherId
            }
          }
        ],
        where: {
          id: {
            [Op.ne]: id
          },
          dayOfWeek: newDayOfWeek,
          [Op.or]: [
            {
              // New entry starts during an existing entry
              startTime: {
                [Op.lt]: newEndTime,
                [Op.gte]: newStartTime
              }
            },
            {
              // New entry ends during an existing entry
              endTime: {
                [Op.lte]: newEndTime,
                [Op.gt]: newStartTime
              }
            },
            {
              // New entry completely contains an existing entry
              startTime: {
                [Op.gte]: newStartTime
              },
              endTime: {
                [Op.lte]: newEndTime
              }
            },
            {
              // New entry is completely contained within an existing entry
              startTime: {
                [Op.lte]: newStartTime
              },
              endTime: {
                [Op.gte]: newEndTime
              }
            }
          ]
        }
      });
      
      if (teacherConflicts) {
        throw new AppError('Time conflict with existing timetable entry for this teacher', 400);
      }
    }
  }
  
  // Update timetable entry
  timetableEntry.dayOfWeek = dayOfWeek || timetableEntry.dayOfWeek;
  timetableEntry.startTime = startTime || timetableEntry.startTime;
  timetableEntry.endTime = endTime || timetableEntry.endTime;
  timetableEntry.room = room !== undefined ? room : timetableEntry.room;
  timetableEntry.subjectId = subjectId || timetableEntry.subjectId;
  timetableEntry.classId = classId || timetableEntry.classId;
  timetableEntry.isActive = isActive !== undefined ? isActive : timetableEntry.isActive;
  
  await timetableEntry.save();
  
  // Return updated timetable entry
  res.status(200).json({
    success: true,
    message: 'Timetable entry updated successfully',
    data: timetableEntry
  });
});

/**
 * Delete timetable entry
 * @route DELETE /api/timetable/:id
 */
const deleteTimetable = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Find timetable entry
  const timetableEntry = await Timetable.findByPk(id, {
    include: [
      { model: Class, as: 'class' }
    ]
  });
  
  if (!timetableEntry) {
    throw new AppError('Timetable entry not found', 404);
  }
  
  // Check if user is authorized to delete timetable entries
  if (req.user.role === 'admin') {
    // Admin can delete any timetable entry
  } else if (req.user.role === 'class_teacher') {
    // Class teacher can only delete timetable entries for their class
    if (timetableEntry.class.classTeacherId !== req.user.id) {
      throw new AppError('You are not authorized to delete timetable entries for this class', 403);
    }
  } else {
    throw new AppError('You are not authorized to delete timetable entries', 403);
  }
  
  // Delete timetable entry
  await timetableEntry.destroy();
  
  // Return success
  res.status(200).json({
    success: true,
    message: 'Timetable entry deleted successfully'
  });
});

/**
 * Get timetable by class
 * @route GET /api/timetable/class/:classId
 */
const getTimetableByClass = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  
  // Check if class exists
  const classRecord = await Class.findByPk(classId);
  
  if (!classRecord) {
    throw new AppError('Class not found', 404);
  }
  
  // Find timetable entries
  const timetable = await Timetable.findAll({
    where: {
      classId
    },
    include: [
      { model: Subject, as: 'subject', include: [
        { model: User, as: 'teacher', attributes: ['id', 'name', 'email'] }
      ]}
    ],
    order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']]
  });
  
  // Group timetable entries by day
  const groupedTimetable = {};
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  days.forEach(day => {
    groupedTimetable[day] = timetable.filter(entry => entry.dayOfWeek === day);
  });
  
  // Return timetable
  res.status(200).json({
    success: true,
    data: {
      class: {
        id: classRecord.id,
        name: classRecord.name,
        year: classRecord.year,
        semester: classRecord.semester
      },
      timetable: groupedTimetable
    }
  });
});

/**
 * Get timetable by teacher
 * @route GET /api/timetable/teacher/:teacherId
 */
const getTimetableByTeacher = asyncHandler(async (req, res) => {
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
  
  // Find timetable entries
  const timetable = await Timetable.findAll({
    include: [
      {
        model: Subject,
        as: 'subject',
        where: {
          teacherId
        }
      },
      { model: Class, as: 'class' }
    ],
    order: [['dayOfWeek', 'ASC'], ['startTime', 'ASC']]
  });
  
  // Group timetable entries by day
  const groupedTimetable = {};
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  days.forEach(day => {
    groupedTimetable[day] = timetable.filter(entry => entry.dayOfWeek === day);
  });
  
  // Return timetable
  res.status(200).json({
    success: true,
    data: {
      teacher: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        role: teacher.role
      },
      timetable: groupedTimetable
    }
  });
});

/**
 * Get current class for teacher
 * @route GET /api/timetable/current-class/:teacherId
 */
const getCurrentClass = asyncHandler(async (req, res) => {
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
  
  // Get current day and time
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = days[now.getDay()];
  const currentTime = now.toTimeString().split(' ')[0];
  
  // Find current timetable entry
  const currentEntry = await Timetable.findOne({
    include: [
      {
        model: Subject,
        as: 'subject',
        where: {
          teacherId
        }
      },
      { model: Class, as: 'class' }
    ],
    where: {
      dayOfWeek: currentDay,
      startTime: {
        [Op.lte]: currentTime
      },
      endTime: {
        [Op.gt]: currentTime
      }
    }
  });
  
  if (!currentEntry) {
    return res.status(200).json({
      success: true,
      data: null,
      message: 'No class scheduled at the current time'
    });
  }
  
  // Return current class
  res.status(200).json({
    success: true,
    data: {
      timetableEntry: currentEntry,
      subject: currentEntry.subject,
      class: currentEntry.class,
      currentTime: currentTime,
      remainingTime: getTimeDifference(currentTime, currentEntry.endTime)
    }
  });
});

/**
 * Helper function to calculate time difference in minutes
 */
const getTimeDifference = (startTime, endTime) => {
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  
  return Math.round((end - start) / 60000); // Convert milliseconds to minutes
};

module.exports = {
  getTimetable,
  getTimetableById,
  createTimetable,
  updateTimetable,
  deleteTimetable,
  getTimetableByClass,
  getTimetableByTeacher,
  getCurrentClass
};

