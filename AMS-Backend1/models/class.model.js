const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Class = sequelize.define('Class', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      msg: 'Class name already exists'
    },
    validate: {
      notEmpty: {
        msg: 'Class name is required'
      }
    }
  },
  year: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Year is required'
      }
    }
  },
  semester: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Semester is required'
      }
    }
  },
  section: {
    type: DataTypes.STRING,
    allowNull: true
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Department is required'
      }
    }
  },
  program: {
    type: DataTypes.STRING,
    allowNull: true
  },
  academicYear: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Academic year is required'
      }
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  classTeacherId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  tableName: 'classes'
});

module.exports = Class;

