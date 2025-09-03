const QRCode = require('qrcode');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const { logger } = require('./logger');

// Create uploads/qrcodes directory if it doesn't exist
const qrCodesDir = path.join(__dirname, '../uploads/qrcodes');
if (!fs.existsSync(qrCodesDir)) {
  fs.mkdirSync(qrCodesDir, { recursive: true });
}

/**
 * Generate a unique QR code
 * @param {Object} data - Data to encode in QR code
 * @param {String} data.subjectCode - Subject code
 * @param {Number} data.subjectId - Subject ID
 * @param {Number} data.classId - Class ID
 * @param {Number} data.teacherId - Teacher ID
 * @returns {Object} QR code data
 */
const generateQRCode = async (data) => {
  try {
    // Generate a unique code
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(4).toString('hex');
    const qrCodeString = `QR_${data.subjectCode}_${timestamp}_${randomString}`;
    
    // Create QR code payload with encrypted data
    const payload = {
      code: qrCodeString,
      subjectId: data.subjectId,
      classId: data.classId,
      teacherId: data.teacherId,
      timestamp
    };
    
    // Encrypt payload
    const encryptedPayload = encryptPayload(payload);
    
    // Generate QR code image
    const qrImagePath = path.join(qrCodesDir, `qr_${data.subjectCode}_${timestamp}.png`);
    await QRCode.toFile(qrImagePath, encryptedPayload);
    
    // Return QR code data
    return {
      code: qrCodeString,
      qrImage: `/uploads/qrcodes/qr_${data.subjectCode}_${timestamp}.png`,
      timestamp
    };
  } catch (error) {
    logger.error('Error generating QR code:', error);
    throw error;
  }
};

/**
 * Encrypt QR code payload
 * @param {Object} payload - Data to encrypt
 * @returns {String} Encrypted payload
 */
const encryptPayload = (payload) => {
  try {
    // Convert payload to string
    const payloadString = JSON.stringify(payload);
    
    // Create HMAC signature
    const hmac = crypto.createHmac('sha256', process.env.QR_CODE_SECRET);
    hmac.update(payloadString);
    const signature = hmac.digest('hex');
    
    // Return signed payload
    return `${payloadString}|${signature}`;
  } catch (error) {
    logger.error('Error encrypting payload:', error);
    throw error;
  }
};

/**
 * Verify and decrypt QR code payload
 * @param {String} encryptedPayload - Encrypted payload from QR code
 * @returns {Object} Decrypted payload
 */
const verifyQRCode = (encryptedPayload) => {
  try {
    // Split payload and signature
    const [payloadString, signature] = encryptedPayload.split('|');
    
    // Verify signature
    const hmac = crypto.createHmac('sha256', process.env.QR_CODE_SECRET);
    hmac.update(payloadString);
    const calculatedSignature = hmac.digest('hex');
    
    if (calculatedSignature !== signature) {
      throw new Error('Invalid QR code signature');
    }
    
    // Parse payload
    const payload = JSON.parse(payloadString);
    
    return payload;
  } catch (error) {
    logger.error('Error verifying QR code:', error);
    throw error;
  }
};

module.exports = {
  generateQRCode,
  verifyQRCode
};

