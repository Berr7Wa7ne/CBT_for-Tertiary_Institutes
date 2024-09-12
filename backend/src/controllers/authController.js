const prisma = require('../models/prisma');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const secretKey = process.env.JWT_SECRET_KEY;

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const roleData = await prisma.role.findUnique({ where: { name: role } });
    if (!roleData) {
      console.error('Error: Invalid role provided -', role);
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: { connect: { id: roleData.id } },
      },
    });

    const isAdmin = roleData.name === 'admin'; 

    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin },
      secretKey,
      { expiresIn: '1h' }
    );

    return res.status(201).json({ message: 'User registered successfully!', token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to register user' });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, isAdmin: user.isAdmin },
      secretKey,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to log in' });
  }
};


exports.changePassword = async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    console.log('Password change request received for email:', email); 

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('User not found for email:', email); 
      return res.status(404).json({ error: "User not found" });
    }

    console.log('User found:', user); 

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      console.log('Current password does not match for user:', email); 
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    console.log('Current password matches for user:', email); 

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    console.log('New password hashed for user:', email); 

    await prisma.user.update({
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
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log('User not found for email:', email); 
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('User found:', user); 

    const resetToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
    console.log('Generated reset token for user:', resetToken); 

    const hashedToken = await bcrypt.hash(resetToken, 10);
    console.log('Hashed reset token for storage:', hashedToken); 

    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        token: hashedToken,
        createdAt: new Date(),
      },
    });
    console.log('Password reset token stored in DB for user ID:', user.id); // Log DB operation

    await sendPasswordResetEmail(user.email, resetToken);
    console.log('Password reset email sent to:', user.email); 

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




