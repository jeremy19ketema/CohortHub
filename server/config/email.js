const nodemailer = require('nodemailer');
const logger = require('./logger');
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});
const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!process.env.EMAIL_USER) return;
    await transporter.sendMail({ from: '"CohortHub" <noreply@cohorthub.com>', to, subject, html });
    logger.info(`Email sent to ${to}`);
  } catch (error) { logger.error(`Email failed: ${error.message}`); }
};
module.exports = { sendEmail };