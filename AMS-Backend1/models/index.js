const User = require('./user.model');
const Class = require('./class.model');
const Subject = require('./subject.model');
const Timetable = require('./timetable.model');
const Attendance = require('./attendance.model');
const QRSession = require('./qrSession.model');
const Log = require('./log.model');
const OTP = require('./otp.model');

// User associations
User.belongsTo(Class, { foreignKey: 'classId', as: 'studentClass' });
User.hasMany(Subject, { foreignKey: 'teacherId', as: 'teachingSubjects' });
User.hasMany(Class, { foreignKey: 'classTeacherId', as: 'classTeacherOf' });
User.hasMany(Attendance, { foreignKey: 'studentId', as: 'attendanceRecords' });
User.hasMany(Attendance, { foreignKey: 'markedById', as: 'markedAttendance' });
User.hasMany(QRSession, { foreignKey: 'teacherId', as: 'qrSessions' });
User.hasMany(Log, { foreignKey: 'userId', as: 'logs' });
User.hasMany(OTP, { foreignKey: 'userId', as: 'otps' });

// Class associations
Class.belongsTo(User, { foreignKey: 'classTeacherId', as: 'classTeacher' });
Class.hasMany(User, { foreignKey: 'classId', as: 'students' });
Class.hasMany(Subject, { foreignKey: 'classId', as: 'subjects' });
Class.hasMany(Timetable, { foreignKey: 'classId', as: 'timetableEntries' });
Class.hasMany(Attendance, { foreignKey: 'classId', as: 'attendanceRecords' });
Class.hasMany(QRSession, { foreignKey: 'classId', as: 'qrSessions' });

// Subject associations
Subject.belongsTo(User, { foreignKey: 'teacherId', as: 'teacher' });
Subject.belongsTo(Class, { foreignKey: 'classId', as: 'class' });
Subject.hasMany(Timetable, { foreignKey: 'subjectId', as: 'timetableEntries' });
Subject.hasMany(Attendance, { foreignKey: 'subjectId', as: 'attendanceRecords' });
Subject.hasMany(QRSession, { foreignKey: 'subjectId', as: 'qrSessions' });

// Timetable associations
Timetable.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });
Timetable.belongsTo(Class, { foreignKey: 'classId', as: 'class' });

// Attendance associations
Attendance.belongsTo(User, { foreignKey: 'studentId', as: 'student' });
Attendance.belongsTo(User, { foreignKey: 'markedById', as: 'markedBy' });
Attendance.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });
Attendance.belongsTo(Class, { foreignKey: 'classId', as: 'class' });
Attendance.belongsTo(QRSession, { foreignKey: 'qrSessionId', as: 'qrSession' });

// QRSession associations
QRSession.belongsTo(Subject, { foreignKey: 'subjectId', as: 'subject' });
QRSession.belongsTo(Class, { foreignKey: 'classId', as: 'class' });
QRSession.belongsTo(User, { foreignKey: 'teacherId', as: 'teacher' });
QRSession.hasMany(Attendance, { foreignKey: 'qrSessionId', as: 'attendanceRecords' });

// Log associations
Log.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// OTP associations
OTP.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  User,
  Class,
  Subject,
  Timetable,
  Attendance,
  QRSession,
  Log,
  OTP
};

