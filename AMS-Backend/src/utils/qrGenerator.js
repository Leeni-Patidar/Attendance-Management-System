import QRCode from 'qrcode';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

class QRGenerator {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.secretKey = process.env.QR_SECRET_KEY || 'default-qr-secret-key-change-in-production';
    this.keyBuffer = crypto.scryptSync(this.secretKey, 'salt', 32);
  }

  // Generate encrypted QR code for attendance session
  async generateAttendanceQR(sessionData) {
    try {
      const {
        sessionId,
        facultyId,
        subject,
        subjectCode,
        className,
        startTime,
        validityDuration = 5 // minutes
      } = sessionData;

      // Calculate expiry time
      const expiryTime = new Date(Date.now() + (validityDuration * 60 * 1000));

      // Create payload for QR code
      const payload = {
        sessionId,
        facultyId,
        subject,
        subjectCode,
        className,
        timestamp: new Date().toISOString(),
        expiryTime: expiryTime.toISOString(),
        nonce: crypto.randomBytes(16).toString('hex'),
        type: 'attendance'
      };

      // Create JWT token
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: `${validityDuration}m`
      });

      // Encrypt the token
      const encryptedData = this.encrypt(token);

      // Create QR data object
      const qrData = {
        v: '1.0', // Version
        t: 'att', // Type: attendance
        d: encryptedData.encryptedData,
        iv: encryptedData.iv,
        tag: encryptedData.tag
      };

      // Convert to compact string format
      const qrString = this.encodeQRData(qrData);

      // Generate QR code image
      const qrCodeImage = await QRCode.toDataURL(qrString, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });

      return {
        qrToken: token,
        qrString,
        qrCodeImage,
        encryptedData: encryptedData.encryptedData,
        expiryTime,
        payload
      };
    } catch (error) {
      console.error('QR generation error:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  // Verify and decode QR code
  async verifyAttendanceQR(qrString) {
    try {
      // Decode QR data
      const qrData = this.decodeQRData(qrString);

      if (!qrData || qrData.v !== '1.0' || qrData.t !== 'att') {
        throw new Error('Invalid QR code format');
      }

      // Decrypt the data
      const decryptedToken = this.decrypt({
        encryptedData: qrData.d,
        iv: qrData.iv,
        tag: qrData.tag
      });

      // Verify JWT token
      const payload = jwt.verify(decryptedToken, process.env.JWT_SECRET);

      // Check if QR code has expired
      const now = new Date();
      const expiryTime = new Date(payload.expiryTime);

      if (now > expiryTime) {
        throw new Error('QR code has expired');
      }

      // Additional validation
      if (payload.type !== 'attendance') {
        throw new Error('Invalid QR code type');
      }

      return {
        isValid: true,
        payload,
        sessionId: payload.sessionId,
        facultyId: payload.facultyId,
        subject: payload.subject,
        subjectCode: payload.subjectCode,
        className: payload.className,
        expiryTime: payload.expiryTime
      };
    } catch (error) {
      console.error('QR verification error:', error);
      
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid QR code token');
      }
      
      if (error.name === 'TokenExpiredError') {
        throw new Error('QR code has expired');
      }
      
      throw new Error('QR code verification failed: ' + error.message);
    }
  }

  // Encrypt data using AES-256-GCM
  encrypt(text) {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher(this.algorithm, this.keyBuffer);
      cipher.setAAD(Buffer.from('attendance-qr'));

      let encryptedData = cipher.update(text, 'utf8', 'hex');
      encryptedData += cipher.final('hex');

      const tag = cipher.getAuthTag();

      return {
        encryptedData,
        iv: iv.toString('hex'),
        tag: tag.toString('hex')
      };
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Encryption failed');
    }
  }

  // Decrypt data using AES-256-GCM
  decrypt(encryptedObj) {
    try {
      const { encryptedData, iv, tag } = encryptedObj;
      
      const decipher = crypto.createDecipher(this.algorithm, this.keyBuffer);
      decipher.setAAD(Buffer.from('attendance-qr'));
      decipher.setAuthTag(Buffer.from(tag, 'hex'));

      let decryptedData = decipher.update(encryptedData, 'hex', 'utf8');
      decryptedData += decipher.final('utf8');

      return decryptedData;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Decryption failed');
    }
  }

  // Encode QR data to compact string
  encodeQRData(qrData) {
    try {
      // Convert object to base64 encoded string
      const jsonString = JSON.stringify(qrData);
      return Buffer.from(jsonString).toString('base64');
    } catch (error) {
      console.error('QR encoding error:', error);
      throw new Error('QR encoding failed');
    }
  }

  // Decode QR data from string
  decodeQRData(qrString) {
    try {
      // Decode base64 string to object
      const jsonString = Buffer.from(qrString, 'base64').toString('utf8');
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('QR decoding error:', error);
      throw new Error('QR decoding failed');
    }
  }

  // Generate QR code for device registration
  async generateDeviceRegistrationQR(studentId, deviceInfo) {
    try {
      const payload = {
        studentId,
        deviceInfo,
        timestamp: new Date().toISOString(),
        expiryTime: new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString(), // 24 hours
        nonce: crypto.randomBytes(16).toString('hex'),
        type: 'device_registration'
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '24h'
      });

      const encryptedData = this.encrypt(token);

      const qrData = {
        v: '1.0',
        t: 'dev',
        d: encryptedData.encryptedData,
        iv: encryptedData.iv,
        tag: encryptedData.tag
      };

      const qrString = this.encodeQRData(qrData);
      const qrCodeImage = await QRCode.toDataURL(qrString, {
        width: 200,
        margin: 2,
        errorCorrectionLevel: 'H'
      });

      return {
        qrToken: token,
        qrString,
        qrCodeImage,
        payload
      };
    } catch (error) {
      console.error('Device registration QR generation error:', error);
      throw new Error('Failed to generate device registration QR code');
    }
  }

  // Verify device registration QR
  async verifyDeviceRegistrationQR(qrString) {
    try {
      const qrData = this.decodeQRData(qrString);

      if (!qrData || qrData.v !== '1.0' || qrData.t !== 'dev') {
        throw new Error('Invalid device registration QR code format');
      }

      const decryptedToken = this.decrypt({
        encryptedData: qrData.d,
        iv: qrData.iv,
        tag: qrData.tag
      });

      const payload = jwt.verify(decryptedToken, process.env.JWT_SECRET);

      if (payload.type !== 'device_registration') {
        throw new Error('Invalid QR code type');
      }

      return {
        isValid: true,
        payload,
        studentId: payload.studentId,
        deviceInfo: payload.deviceInfo
      };
    } catch (error) {
      console.error('Device registration QR verification error:', error);
      throw new Error('Device registration QR verification failed: ' + error.message);
    }
  }

  // Generate QR code for general purposes (admin use)
  async generateGenericQR(data, type = 'generic') {
    try {
      const payload = {
        data,
        type,
        timestamp: new Date().toISOString(),
        nonce: crypto.randomBytes(16).toString('hex')
      };

      const qrString = JSON.stringify(payload);
      const qrCodeImage = await QRCode.toDataURL(qrString, {
        width: 250,
        margin: 2,
        errorCorrectionLevel: 'M'
      });

      return {
        qrString,
        qrCodeImage,
        payload
      };
    } catch (error) {
      console.error('Generic QR generation error:', error);
      throw new Error('Failed to generate generic QR code');
    }
  }

  // Validate QR code format
  isValidQRFormat(qrString) {
    try {
      const qrData = this.decodeQRData(qrString);
      return qrData && qrData.v && qrData.t;
    } catch (error) {
      return false;
    }
  }

  // Get QR code type
  getQRType(qrString) {
    try {
      const qrData = this.decodeQRData(qrString);
      const typeMap = {
        'att': 'attendance',
        'dev': 'device_registration',
        'gen': 'generic'
      };
      return typeMap[qrData.t] || 'unknown';
    } catch (error) {
      return 'invalid';
    }
  }

  // Generate QR code with custom options
  async generateCustomQR(data, options = {}) {
    try {
      const defaultOptions = {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      };

      const qrOptions = { ...defaultOptions, ...options };
      const qrCodeImage = await QRCode.toDataURL(data, qrOptions);

      return {
        qrCodeImage,
        qrString: data,
        options: qrOptions
      };
    } catch (error) {
      console.error('Custom QR generation error:', error);
      throw new Error('Failed to generate custom QR code');
    }
  }

  // Batch generate QR codes
  async batchGenerateQR(dataArray, type = 'attendance') {
    try {
      const results = [];
      
      for (const data of dataArray) {
        if (type === 'attendance') {
          const qr = await this.generateAttendanceQR(data);
          results.push(qr);
        } else if (type === 'device_registration') {
          const qr = await this.generateDeviceRegistrationQR(data.studentId, data.deviceInfo);
          results.push(qr);
        }
      }

      return results;
    } catch (error) {
      console.error('Batch QR generation error:', error);
      throw new Error('Failed to generate batch QR codes');
    }
  }

  // Clean up expired QR tokens (utility function)
  isQRExpired(qrString) {
    try {
      const verification = this.verifyAttendanceQR(qrString);
      return false; // If verification succeeds, QR is not expired
    } catch (error) {
      if (error.message.includes('expired')) {
        return true;
      }
      return false; // Other errors don't necessarily mean expired
    }
  }

  // Generate analytics QR for tracking
  async generateAnalyticsQR(sessionId, analyticsData) {
    try {
      const payload = {
        sessionId,
        analytics: analyticsData,
        timestamp: new Date().toISOString(),
        type: 'analytics'
      };

      const qrString = JSON.stringify(payload);
      const qrCodeImage = await QRCode.toDataURL(qrString, {
        width: 150,
        margin: 1,
        errorCorrectionLevel: 'L'
      });

      return {
        qrString,
        qrCodeImage,
        payload
      };
    } catch (error) {
      console.error('Analytics QR generation error:', error);
      throw new Error('Failed to generate analytics QR code');
    }
  }
}

// Create and export singleton instance
const qrGenerator = new QRGenerator();

export default qrGenerator;

// Export class for testing or multiple instances
export { QRGenerator };