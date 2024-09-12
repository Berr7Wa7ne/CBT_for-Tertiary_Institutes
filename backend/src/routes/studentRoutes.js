const express = require('express');
const studentController = require('../students/studentController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();
const prisma = require('../models/prisma');

const isStudent = async (req, res, next) => {
  try {
    const user = await prisma.student.findUnique({ 
      where: { id: req.user.id },
      include: { role: true } 
    });

    console.log('isStudent middleware: user:', user);

    if (!user || user.role.name !== 'user') {
      console.log('isStudent middleware: access denied');
      return res.status(403).json({ error: 'Access denied' });
    }

    next(); 
  } catch (error) {
    console.error('Error checking student role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

router.get('/exams', authMiddleware.authenticateStudent, isStudent, studentController.getAvailableExams);
router.post('/exam-details', authMiddleware.authenticateStudent, isStudent, studentController.loadExamDetails);
router.post('/submit-answer', authMiddleware.authenticateStudent, isStudent, studentController.submitAnswer);
router.post('/submit-exam', authMiddleware.authenticateStudent, isStudent, studentController.submitExam);
router.get('/results', authMiddleware.authenticateStudent, isStudent, studentController.viewResults);

module.exports = router;
