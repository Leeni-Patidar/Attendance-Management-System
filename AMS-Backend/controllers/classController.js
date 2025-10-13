const Class = require('../models/Class');
const User = require('../models/User');

exports.createClass = async (req, res, next) => {
  try {
    const { name, code, teacherId } = req.body;
    const cls = await Class.create({ name, code, teacher: teacherId });
    res.status(201).json(cls);
  } catch (err) {
    next(err);
  }
};

exports.getClasses = async (req, res, next) => {
  try {
    const classes = await Class.find().populate('teacher', 'name email').populate('students', 'name email');
    res.json(classes);
  } catch (err) {
    next(err);
  }
};

exports.getClass = async (req, res, next) => {
  try {
    const cls = await Class.findById(req.params.id).populate('teacher', 'name email').populate('students', 'name email');
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    res.json(cls);
  } catch (err) {
    next(err);
  }
};

exports.updateClass = async (req, res, next) => {
  try {
    const updates = req.body;
    const cls = await Class.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(cls);
  } catch (err) {
    next(err);
  }
};

exports.deleteClass = async (req, res, next) => {
  try {
    await Class.findByIdAndDelete(req.params.id);
    res.json({ message: 'Class deleted' });
  } catch (err) {
    next(err);
  }
};

exports.assignStudent = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const { studentId } = req.body;
    const cls = await Class.findById(classId);
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    if (cls.students.includes(studentId)) return res.status(400).json({ message: 'Student already assigned' });
    cls.students.push(studentId);
    await cls.save();
    res.json(cls);
  } catch (err) {
    next(err);
  }
};

exports.removeStudent = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const { studentId } = req.body;
    const cls = await Class.findById(classId);
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    cls.students = cls.students.filter(s => s.toString() !== studentId.toString());
    await cls.save();
    res.json(cls);
  } catch (err) {
    next(err);
  }
};
