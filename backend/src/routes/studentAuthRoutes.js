const express = require('express');
const router = express.Router();
const studentAuthController = require('../students/studentAuthController');
const loginLimiter = require('../middlewares/rateLimiter');

router.post('/login', loginLimiter, studentAuthController.studentLogin);
router.post('/change-password', studentAuthController.changePassword);
router.post('/forgot-password', studentAuthController.forgotPassword);
router.post('/reset-password', studentAuthController.resetPassword);

module.exports = router;
