const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const prisma = require('../models/prisma'); 

const isAdmin = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ 
      where: { id: req.user.id },
      include: { role: true } 
    });

    console.log('isAdmin middleware: user:', user);

    if (!user || user.role.name !== 'admin') {
      console.log('isAdmin middleware: access denied');
      return res.status(403).json({ error: 'Access denied' });
    }

    next(); 
  } catch (error) {
    console.error('Error checking admin role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

router.use(authMiddleware.authenticate);

router.post('/add-student', isAdmin, adminController.addStudent);
router.post('/add-course', isAdmin, adminController.addCourse);
router.post('/enrollStudent', isAdmin, adminController.enrollStudent);
router.post('/add-exam', isAdmin, adminController.addExam);
router.post('/add-question', isAdmin, adminController.addQuestion);
router.get('/results', isAdmin, adminController.viewResults);

router.get('/students', isAdmin, async (req, res) => {
  try {
    const students = await prisma.student.findMany();
    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

module.exports = router;
