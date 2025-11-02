
const Class = require('../models/Class');
const User = require('../models/User');

// @desc    Create a class
// @route   POST /api/classes
// @access  Private/Admin
exports.createClass = async (req, res, next) => {
  try {
    const { name, teacher } = req.body;
    const newClass = new Class({ name, teacher });
    const savedClass = await newClass.save();
    res.status(201).json(savedClass);
  } catch (err) {
    next(err);
  }
};

// @desc    Get all classes
// @route   GET /api/classes
// @access  Private
exports.getClasses = async (req, res, next) => {
  try {
    const classes = await Class.find().populate('teacher', 'name');
    res.json(classes);
  } catch (err) {
    next(err);
  }
};

// @desc    Get single class
// @route   GET /api/classes/:id
// @access  Private
exports.getClass = async (req, res, next) => {
  try {
    const class_ = await Class.findById(req.params.id)
      .populate('teacher', 'name')
      .populate('students', 'name');
    if (!class_) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json(class_);
  } catch (err) {
    next(err);
  }
};

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Private/Admin
exports.updateClass = async (req, res, next) => {
  try {
    const { name, teacher } = req.body;
    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      { name, teacher },
      { new: true, runValidators: true }
    );
    if (!updatedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.json(updatedClass);
  } catch (err) {
    next(err);
  }
};

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Private/Admin
exports.deleteClass = async (req, res, next) => {
  try {
    const class_ = await Class.findById(req.params.id);
    if (!class_) {
      return res.status(404).json({ message: 'Class not found' });
    }
    await class_.remove();
    res.json({ message: 'Class removed' });
  } catch (err) {
    next(err);
  }
};

// @desc    Assign student to class
// @route   POST /api/classes/:classId/assign-student
// @access  Private/Admin or Teacher
exports.assignStudent = async (req, res, next) => {
  try {
    const { studentId } = req.body;
    const class_ = await Class.findById(req.params.classId);
    const student = await User.findById(studentId);

    if (!class_ || !student) {
      return res.status(404).json({ message: 'Class or Student not found' });
    }

    if (student.role !== 'Student') {
        return res.status(400).json({ message: 'User is not a student' });
    }

    class_.students.push(studentId);
    await class_.save();

    res.json(class_);
  } catch (err) {
    next(err);
  }
};

// @desc    Remove student from class
// @route   POST /api/classes/:classId/remove-student
// @access  Private/Admin or Teacher
exports.removeStudent = async (req, res, next) => {
    try {
        const { studentId } = req.body;
        const class_ = await Class.findById(req.params.classId);
        const student = await User.findById(studentId);

        if (!class_ || !student) {
            return res.status(404).json({ message: 'Class or Student not found' });
        }

        class_.students = class_.students.filter(id => id.toString() !== studentId);
        await class_.save();

        res.json(class_);
    } catch (err) {
        next(err);
    }
};

