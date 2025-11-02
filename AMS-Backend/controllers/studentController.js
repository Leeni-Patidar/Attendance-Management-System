const Student = require('../models/Student');

// @desc Get all students
// @route GET /api/students
// @access Private (Admin/Teacher)
exports.getAllStudents = async (req, res, next) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (err) {
    next(err);
  }
};

// @desc Get student by id (Mongo _id or studentID)
// @route GET /api/students/:id
// @access Private
exports.getStudent = async (req, res, next) => {
  try {
    const id = req.params.id;

    // Try to find by Mongo _id first, otherwise by studentID or rollNo
    let student = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      student = await Student.findById(id);
    }

    if (!student) {
      student = await Student.findOne({ $or: [{ studentID: id }, { rollNo: id }] });
    }

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (err) {
    next(err);
  }
};

// @desc Get current authenticated student's profile
// @route GET /api/students/me
// @access Private (Student)
exports.getMyStudent = async (req, res, next) => {
  try {
    const email = req.user && req.user.email
    if (!email) return res.status(400).json({ message: 'Email not available in token' })

    const student = await Student.findOne({ email })
    if (!student) return res.status(404).json({ message: 'Student not found' })

    res.json(student)
  } catch (err) {
    next(err)
  }
}
