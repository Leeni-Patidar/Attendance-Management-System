const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Subject = sequelize.define('Subject', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Subject name is required'
      }
    }
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      msg: 'Subject code already exists'
    },
    validate: {
      notEmpty: {
        msg: 'Subject code is required'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  credits: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  teacherId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
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
  tableName: 'subjects'
});

module.exports = Subject;

