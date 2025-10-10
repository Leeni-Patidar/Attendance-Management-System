const nodemailer = require('nodemailer');
const { logger } = require('./logger');

/**
 * Create nodemailer transporter
 */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Send email
 * @param {Object} options - Email options
 * @param {String} options.to - Recipient email
 * @param {String} options.subject - Email subject
 * @param {String} options.text - Email text content
 * @param {String} options.html - Email HTML content
 * @returns {Promise} Nodemailer response
 */
const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text || '',
      html: options.html || ''
    };
    
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send OTP email
 * @param {Object} options - Email options
 * @param {String} options.to - Recipient email
 * @param {String} options.name - Recipient name
 * @param {String} options.otp - OTP code
 * @param {String} options.purpose - Purpose of OTP (email_verification, password_reset)
 * @returns {Promise} Nodemailer response
 */
const sendOTPEmail = async (options) => {
  const subject = options.purpose === 'email_verification' 
    ? 'Email Verification - Attendance Management System' 
    : 'Password Reset - Attendance Management System';
  
  const text = options.purpose === 'email_verification'
    ? `Hello ${options.name},\n\nYour OTP for email verification is: ${options.otp}\n\nThis OTP will expire in 10 minutes.\n\nRegards,\nAttendance Management System`
    : `Hello ${options.name},\n\nYour OTP for password reset is: ${options.otp}\n\nThis OTP will expire in 10 minutes.\n\nRegards,\nAttendance Management System`;
  
  const html = options.purpose === 'email_verification'
    ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Email Verification</h2>
        <p>Hello ${options.name},</p>
        <p>Your OTP for email verification is:</p>
        <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
          ${options.otp}
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>Regards,<br>Attendance Management System</p>
      </div>
    `
    : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset</h2>
        <p>Hello ${options.name},</p>
        <p>Your OTP for password reset is:</p>
        <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
          ${options.otp}
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>Regards,<br>Attendance Management System</p>
      </div>
    `;
  
  return sendEmail({
    to: options.to,
    subject,
    text,
    html
  });
};

/**
 * Send attendance confirmation email
 * @param {Object} options - Email options
 * @param {String} options.to - Recipient email
 * @param {String} options.name - Recipient name
 * @param {Object} options.attendance - Attendance details
 * @param {Object} options.subject - Subject details
 * @returns {Promise} Nodemailer response
 */
const sendAttendanceConfirmationEmail = async (options) => {
  const subject = `Attendance Confirmation - ${options.subject.name}`;
  
  const text = `Hello ${options.name},\n\nYour attendance has been marked for ${options.subject.name} (${options.subject.code}) on ${new Date(options.attendance.date).toDateString()}.\n\nStatus: ${options.attendance.status}\nTime: ${new Date(options.attendance.markTime).toLocaleTimeString()}\n\nRegards,\nAttendance Management System`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Attendance Confirmation</h2>
      <p>Hello ${options.name},</p>
      <p>Your attendance has been marked for <strong>${options.subject.name} (${options.subject.code})</strong> on <strong>${new Date(options.attendance.date).toDateString()}</strong>.</p>
      <div style="background-color: #f4f4f4; padding: 15px; margin: 15px 0;">
        <p><strong>Status:</strong> ${options.attendance.status}</p>
        <p><strong>Time:</strong> ${new Date(options.attendance.markTime).toLocaleTimeString()}</p>
      </div>
      <p>Regards,<br>Attendance Management System</p>
    </div>
  `;
  
  return sendEmail({
    to: options.to,
    subject,
    text,
    html
  });
};

module.exports = {
  sendEmail,
  sendOTPEmail,
  sendAttendanceConfirmationEmail
};

