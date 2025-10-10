const crypto = require('crypto');
const { OTP } = require('../models');
const { logger } = require('./logger');

/**
 * Generate a random OTP
 * @param {Number} length - Length of OTP
 * @returns {String} Generated OTP
 */
const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  
  return otp;
};

/**
 * Create and save OTP in database
 * @param {Object} data - OTP data
 * @param {String} data.email - User email
 * @param {String} data.purpose - Purpose of OTP (email_verification, password_reset)
 * @param {Number} data.userId - User ID (optional)
 * @returns {String} Generated OTP
 */
const createOTP = async (data) => {
  try {
    // Generate OTP
    const otp = generateOTP();
    
    // Hash OTP for storage
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
    
    // Set expiry time (10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    // Delete any existing OTPs for this email and purpose
    await OTP.destroy({
      where: {
        email: data.email,
        purpose: data.purpose
      }
    });
    
    // Create new OTP record
    await OTP.create({
      email: data.email,
      otp: hashedOTP,
      purpose: data.purpose,
      expiresAt,
      userId: data.userId || null
    });
    
    return otp;
  } catch (error) {
    logger.error('Error creating OTP:', error);
    throw error;
  }
};

/**
 * Verify OTP
 * @param {Object} data - OTP verification data
 * @param {String} data.email - User email
 * @param {String} data.otp - OTP to verify
 * @param {String} data.purpose - Purpose of OTP (email_verification, password_reset)
 * @returns {Boolean} True if OTP is valid
 */
const verifyOTP = async (data) => {
  try {
    // Hash OTP for comparison
    const hashedOTP = crypto.createHash('sha256').update(data.otp).digest('hex');
    
    // Find OTP record
    const otpRecord = await OTP.findOne({
      where: {
        email: data.email,
        purpose: data.purpose,
        isUsed: false
      }
    });
    
    // Check if OTP exists
    if (!otpRecord) {
      return false;
    }
    
    // Check if OTP is expired
    if (new Date() > new Date(otpRecord.expiresAt)) {
      return false;
    }
    
    // Check if OTP matches
    if (otpRecord.otp !== hashedOTP) {
      return false;
    }
    
    // Mark OTP as used
    await otpRecord.update({ isUsed: true });
    
    return true;
  } catch (error) {
    logger.error('Error verifying OTP:', error);
    throw error;
  }
};

module.exports = {
  generateOTP,
  createOTP,
  verifyOTP
};

