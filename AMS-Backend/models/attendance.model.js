const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('present', 'absent', 'late', 'excused'),
    allowNull: false,
    defaultValue: 'present'
  },
  markMethod: {
    type: DataTypes.ENUM('qr', 'manual', 'auto'),
    allowNull: false,
    defaultValue: 'qr'
  },
  markTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  deviceInfo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  subjectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Subjects',
      key: 'id'
    }
  },
  classId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Classes',
      key: 'id'
    }
  },
  markedById: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  qrSessionId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'QRSessions',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  tableName: 'attendances',
  indexes: [
    {
      unique: true,
      fields: ['date', 'studentId', 'subjectId'],
      name: 'attendance_date_student_subject_unique'
    }
  ]
});

module.exports = Attendance;

