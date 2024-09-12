const jwt = require('jsonwebtoken');
const prisma = require('../models/prisma');

exports.authenticate = async (req, res, next) => {
  console.log("Admin Authentication: Checking token...");

  const token = req.header('x-auth-token') || req.header('Authorization')?.split(' ')[1];

  console.log("Received Token (Admin):", token);

  if (!token) {
    console.log("No token provided in Admin Authentication");
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY || '8c04f92e2190366ab216f1cf6f9d1cd42aef45b2aa4e7980435b4869f4e2bbcda3a1423b8903410d2f9af4a5c0b8b7887c5957dc7f2673ead821212b999f5186');
    req.user = decoded;

    console.log('Decoded Token (Admin):', decoded);

    const user = await prisma.user.findUnique({ where: { id: req.user.id }, include: { role: true } });

    if (!user || user.role.name !== 'admin') {
      console.log("Access denied for Admin Authentication");
      return res.status(403).json({ error: 'Access denied' });
    }

    next();
  } catch (err) {
    console.error('Token verification error (Admin):', err);
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token has expired' });
    } else {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }
};


exports.authenticateStudent = async (req, res, next) => {
  console.log("Student Authentication: Checking token...");

  const token = req.header('x-auth-token') || req.header('Authorization')?.split(' ')[1];

  console.log("Received Token (Student):", token);

  if (!token) {
    console.log("No token provided in Student Authentication");
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY || '8c04f92e2190366ab216f1cf6f9d1cd42aef45b2aa4e7980435b4869f4e2bbcda3a1423b8903410d2f9af4a5c0b8b7887c5957dc7f2673ead821212b999f5186');
    req.user = decoded;

    console.log('Decoded Token (Student):', decoded);

    const student = await prisma.student.findUnique({
      where: { id: req.user.id },
      include: { role: true },  
    });
    

    if (!student || student.role.name !== 'user') {
      console.log("Access denied for Student Authentication");
      return res.status(403).json({ error: 'Access denied' });
    }

    next();
  } catch (err) {
    console.error('Token verification error (Student):', err);
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token has expired' });
    } else {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }
};
