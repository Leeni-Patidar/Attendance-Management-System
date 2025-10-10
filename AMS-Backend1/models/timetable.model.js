const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Timetable = sequelize.define('Timetable', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  dayOfWeek: {
    type: DataTypes.ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Day of week is required'
      }
    }
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Start time is required'
      }
    }
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'End time is required'
      },
      isAfterStartTime(value) {
        if (value <= this.startTime) {
          throw new Error('End time must be after start time');
        }
      }
    }
  },
  room: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
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
  }
}, {
  timestamps: true,
  tableName: 'timetables',
  indexes: [
    {
      unique: true,
      fields: ['dayOfWeek', 'startTime', 'endTime', 'classId'],
      name: 'timetable_class_time_unique'
    }
  ]
});

module.exports = Timetable;

