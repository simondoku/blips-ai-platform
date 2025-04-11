// server/services/emailService.js
const nodemailer = require('nodemailer');

// For development, use a fake transport that just logs to console
let transporter;

if (process.env.NODE_ENV === 'production') {
  // Create a real transporter for production
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
} else {
  // Use a mock transporter for development
  transporter = {
    sendMail: (mailOptions) => {
      console.log('DEVELOPMENT MODE - Email not sent');
      console.log('Email details:', JSON.stringify(mailOptions, null, 2));
      return Promise.resolve({ messageId: 'dev-mode-' + Date.now() });
    }
  };
}

/**
 * Send an email notification for new feedback
 * @param {Object} feedback - The feedback object
 * @param {Object} user - The user object (optional)
 */
exports.sendFeedbackNotification = async (feedback, user = null) => {
  // The destination email address
  const to = 'simondoku9@gmail.com';
  
  // Create subject line
  const subject = `New Feedback: ${feedback.type.toUpperCase()} - ${feedback.subject}`;
  
  // Build email body
  let emailBody = `
    <h2>New Feedback Submission</h2>
    <p><strong>Type:</strong> ${feedback.type}</p>
    <p><strong>Subject:</strong> ${feedback.subject}</p>
    <p><strong>Submitted:</strong> ${new Date(feedback.createdAt).toLocaleString()}</p>
    
    <h3>Message:</h3>
    <p>${feedback.message.replace(/\n/g, '<br>')}</p>
    
    <hr>
  `;
  
  // Add user information if available
  if (user) {
    emailBody += `
      <h3>User Information:</h3>
      <p><strong>Username:</strong> ${user.username}</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Display Name:</strong> ${user.displayName || 'Not set'}</p>
    `;
  } else if (feedback.email) {
    emailBody += `
      <h3>User Information:</h3>
      <p><strong>Email:</strong> ${feedback.email}</p>
      <p><em>User was not logged in</em></p>
    `;
  } else {
    emailBody += `
      <p><em>No user information available</em></p>
    `;
  }
  
  // Add metadata if available
  if (feedback.metadata) {
    emailBody += `
      <h3>Metadata:</h3>
      <p><strong>User Agent:</strong> ${feedback.metadata.userAgent || 'Not available'}</p>
      <p><strong>IP Address:</strong> ${feedback.metadata.ipAddress || 'Not available'}</p>
    `;
  }
  
  // Create mail options
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'notifications@blips-ai.com',
    to: to,
    subject: subject,
    html: emailBody
  };
  
  try {
    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Feedback notification email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send feedback notification email:', error);
    // We'll just log the error but not throw it, as we don't want to fail the feedback submission
    return false;
  }
};

/**
 * Test the email configuration
 */
exports.testEmailConfig = async () => {
  const testMailOptions = {
    from: process.env.EMAIL_FROM || 'notifications@blips-ai.com',
    to: 'simondoku9@gmail.com',
    subject: 'Test Email from Blips Platform',
    html: '<h1>Test Email</h1><p>This is a test email to verify the email service configuration.</p>'
  };
  
  try {
    const info = await transporter.sendMail(testMailOptions);
    console.log('Test email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send test email:', error);
    throw error;
  }
};

/**
 * Send an email
 * @param {Object} options - Email options (to, subject, html, text)
 */
exports.sendEmail = async (options) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'notifications@blips-ai.com',
      ...options
    });
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
};