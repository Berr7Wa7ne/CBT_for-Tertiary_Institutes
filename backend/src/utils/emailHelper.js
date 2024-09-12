const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  }
});


const sendStudentCredentialsEmail = async (email, name, studentID, tempPassword) => {
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: 'Your Login Credentials',
    text: `Dear ${name},\n\nYour account has been created. Here are your login credentials:\n\nStudent ID: ${studentID}\nPassword: ${tempPassword}\n\nPlease log in and change your password immediately.\n\nBest regards,\nAdmin Team`,
  };

  await transporter.sendMail(mailOptions);
};


const sendPasswordResetEmail = async (recipientEmail, token) => {
  const resetLink = `http://your-domain.com/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: recipientEmail,
    subject: 'Password Reset Request',
    text: `You requested a password reset. Click here to reset your password: ${resetLink}`,
    html: `<p>You requested a password reset. Click <a href="${resetLink}">here</a> to reset your password.</p>`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendStudentCredentialsEmail,
  sendPasswordResetEmail,
};
