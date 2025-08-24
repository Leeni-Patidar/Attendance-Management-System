require('dotenv').config();
const { sequelize } = require('../config/database');
const { logger } = require('../utils/logger');

/**
 * Create all tables in the database
 */
const createTables = async () => {
  try {
    // Import models
    const { User, Class, Subject, Timetable, Attendance, QRSession, Log, OTP } = require('../models');
    
    // Sync all models with database
    await sequelize.sync({ force: true });
    
    logger.info('All tables created successfully');
    return true;
  } catch (error) {
    logger.error('Error creating tables:', error);
    return false;
  }
};

// Run migrations if this file is executed directly
if (require.main === module) {
  createTables()
    .then(() => {
      console.log('Tables created successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('Error creating tables:', error);
      process.exit(1);
    });
}

module.exports = {
  createTables
};

