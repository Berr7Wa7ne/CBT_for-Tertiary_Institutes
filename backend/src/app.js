const express = require('express');
const app = express();
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes')
const studentAuthRoutes = require('./routes/studentAuthRoutes');

app.use(express.json());
app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);
app.use('/student', studentRoutes);
app.use('/student/auth', studentAuthRoutes);

module.exports = app;
