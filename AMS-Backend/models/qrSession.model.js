const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const QRSession = sequelize.define('QRSession', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      msg: 'QR code already exists'
    }
  },
  topic: {
    type: DataTypes.STRING,
    allowNull: true
  },
  validFrom: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  validTill: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      isAfterValidFrom(value) {
        if (value <= this.validFrom) {
          throw new Error('Valid till must be after valid from');
        }
      }
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  qrImage: {
    type: DataTypes.STRING,
    allowNull: true
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
  teacherId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  timestamps: true,
  tableName: 'qr_sessions'
});

module.exports = QRSession;

