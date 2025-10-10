const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
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
        msg: 'Name is required'
      }
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      msg: 'Email already exists'
    },
    validate: {
      isEmail: {
        msg: 'Please provide a valid email'
      }
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Password is required'
      },
      len: {
        args: [6, 100],
        msg: 'Password must be at least 6 characters'
      }
    }
  },
  role: {
    type: DataTypes.ENUM('student', 'teacher', 'class_teacher', 'subject_teacher', 'admin'),
    allowNull: false,
    defaultValue: 'student'
  },
  loginId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      msg: 'Login ID already exists'
    },
    validate: {
      notEmpty: {
        msg: 'Login ID is required'
      }
    }
  },
  rollNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: {
      msg: 'Roll number already exists'
    }
  },
  employeeId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: {
      msg: 'Employee ID already exists'
    }
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true
  },
  year: {
    type: DataTypes.STRING,
    allowNull: true
  },
  semester: {
    type: DataTypes.STRING,
    allowNull: true
  },
  branch: {
    type: DataTypes.STRING,
    allowNull: true
  },
  program: {
    type: DataTypes.STRING,
    allowNull: true
  },
  profileImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  classId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Classes',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

// Instance method to check if password matches
User.prototype.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = User;

