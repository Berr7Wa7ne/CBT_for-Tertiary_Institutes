const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../models/prisma');
const { sendPasswordResetEmail } = require('../utils/emailHelper');

exports.studentLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt with email:', email); 

    const student = await prisma.student.findUnique({
      where: { email },
    });

    if (!student) {
      console.log('No student found with the given email.'); 
      return res.status(401).json({ error: 'Invalid credentials or not a student account' });
    }

    console.log('Student found:', student); 

    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (!isPasswordValid) {
      console.log('Password is invalid for the given email.'); 
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Password is valid, generating token...'); 

    const token = jwt.sign(
      { id: student.id, email: student.email, role: 'user' },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '2h' }
    );

    console.log('Token generated:', token); 

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Login failed:', error); 
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    console.log('Password change request received for email:', email); 

    const student = await prisma.student.findUnique({
      where: { email },
    });

    if (!student) {
      console.log('User not found for email:', email); 
      return res.status(404).json({ error: "User not found" });
    }

    console.log('User found:', student); 

    const isMatch = await bcrypt.compare(currentPassword, student.password);
    if (!isMatch) {
      console.log('Current password does not match for user:', email); 
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    console.log('Current password matches for user:', email); 

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    console.log('New password hashed for user:', email); 

    await prisma.student.update({
      where: { email },
      data: { password: hashedNewPassword },
    });

    console.log('Password updated successfully for user:', email); 

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error); 
    res.status(500).json({ error: "Failed to change password" });
  }
};


exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log('Received password reset request for email:', email); 

  try {
    const student = await prisma.student.findUnique({ where: { email } });
    if (!student) {
      console.log('User not found for email:', email); 
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('User found:', student); 

    const resetToken = jwt.sign({ studentId: student.id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
    console.log('Generated reset token for user:', resetToken); 

    const hashedToken = await bcrypt.hash(resetToken, 10);
    console.log('Hashed reset token for storage:', hashedToken); 

    await prisma.passwordReset.create({
      data: {
        studentId: student.id,
        token: hashedToken,
        createdAt: new Date(),
      },
    });
    console.log('Password reset token stored in DB for user ID:', student.id); 

    await sendPasswordResetEmail(student.email, resetToken);
    console.log('Password reset email sent to:', student.email); 

    res.status(200).json({ message: 'Password reset link sent' });
  } catch (error) {
    console.error('Error during forgotPassword process:', error); 
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decoded.userId;

    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        userId: userId,
        createdAt: {
          gte: new Date(Date.now() - 3600000), 
        },
      },
    });

    if (!resetRecord) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const isValid = await bcrypt.compare(token, resetRecord.token);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.student.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    await prisma.passwordReset.delete({ where: { id: resetRecord.id } });

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


