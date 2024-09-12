const prisma = require('../models/prisma');
const { sendStudentCredentialsEmail } = require('../utils/emailHelper');
const bcryptjs = require('bcryptjs');
const { getResults: getResultsAdmin } = require('../services/resultService');



exports.addStudent = async (req, res) => {
  try {
    const { studentID, name, email, department, level } = req.body;

    if (!studentID || !name || !email || !department || !level) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingStudent = await prisma.student.findUnique({ where: { studentID } });
    if (existingStudent) {
      return res.status(409).json({ error: 'Student with this ID already exists' });
    }

    const studentRole = await prisma.role.findUnique({
      where: { name: 'user' },
    });

    if (!studentRole) {
      return res.status(500).json({ error: 'Role "user" not found' });
    }

    const tempPassword = Math.random().toString(36).slice(-8);
    console.log('Generated plain-text password:', tempPassword);
    const hashedPassword = await bcryptjs.hash(tempPassword, 10);

    const student = await prisma.student.create({
      data: {
        studentID,
        name,
        email,
        department,
        level,
        password: hashedPassword,
        roleId: studentRole.id,
      },
    });

    await sendStudentCredentialsEmail(email, name, studentID, tempPassword);

    res.status(201).json({ student, message: "Student registered and credentials sent via email." });
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).json({ error: "Failed to add student" });
  }
};


exports.addCourse = async (req, res) => {
  try {
    console.log("Request Body:", req.body);

    const { courseCode, courseTitle, courseDescription, department, level, credits } = req.body;

    if (!courseCode || !courseTitle || !courseDescription || !department || !level || !credits) {
      console.log("Validation Error: Missing fields");
      return res.status(400).json({ error: "All fields are required." });
    }

    if (typeof level !== 'number' || typeof credits !== 'number') {
      console.log("Validation Error: Invalid level or credits");
      return res.status(400).json({ error: "Invalid level or credits." });
    }


    const existingCourse = await prisma.course.findUnique({
      where: { courseCode }
    });

    if (existingCourse) {
      console.log("Duplicate Error: Course code already exists");
      return res.status(409).json({ error: "Course code already exists." });
    }

    console.log("Creating course with data:", {
      courseCode,
      courseTitle,
      courseDescription,
      department,
      level,
      credits,
    });

    const course = await prisma.course.create({
      data: {
        courseCode,
        courseTitle,
        courseDescription,
        department,
        level,
        credits,
      },
    });

    console.log("Course created successfully:", course);

    res.status(201).json({
      message: "Course added successfully",
      course,
    });
  } catch (error) {
    console.error("Error adding course:", error);
    res.status(500).json({ error: "Failed to add course" });
  }
};

exports.enrollStudent = async (req, res) => {
  try {
    console.log('Received enrollStudent request with data:', req.body);

    const studentID = parseInt(req.body.studentID);
    const courseID = parseInt(req.body.courseID);
    const examID = parseInt(req.body.examID);

    if (isNaN(studentID) || isNaN(courseID) || isNaN(examID)) {
      console.log('Validation Error: studentID, courseID, or examID is not a valid integer.');
      return res.status(400).json({ error: "studentID, courseID, and examID must be valid integers." });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentID },
    });

    console.log('Fetched student:', student);

    if (!student) {
      console.log('Student not found:', studentID);
      return res.status(404).json({ error: "Student not found." });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseID },
      include: {
        exams: {
          where: { id: examID } 
        }
      },
    });

    console.log('Fetched course and specific exam:', course);

    if (!course) {
      console.log('Course not found:', courseID);
      return res.status(404).json({ error: "Course not found." });
    }

    if (!course.exams.length) {
      console.log('No exam found for this course with the given examID.');
      return res.status(400).json({ error: "No exam found for this course with the provided examID." });
    }

    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        studentID: studentID,
        courseId: courseID,
        examId: examID,  
      },
    });

    console.log('Existing enrollment:', existingEnrollment);

    if (existingEnrollment) {
      console.log('Student is already enrolled in this course:', existingEnrollment);
      return res.status(400).json({ error: "Student is already enrolled in this course." });
    }

    const newEnrollment = await prisma.enrollment.create({
      data: {
        studentID: studentID,
        courseId: courseID,
        examId: examID,  
      },
    });

    console.log('Created new enrollment:', newEnrollment);

    const studentExamData = {
      studentID: studentID,
      examId: examID,
      submitted: false,
      score: 0,
    };

    console.log('Data to be inserted into StudentExam:', studentExamData);

    await prisma.studentExam.create({
      data: studentExamData,
    });

    console.log('StudentExam record created successfully.');

    res.status(201).json({
      message: "Student enrolled successfully and linked to the specific exam.",
      enrollment: newEnrollment,
    });
  } catch (error) {
    console.error("Error enrolling student:", error);
    res.status(500).json({ error: "Failed to enroll student." });
  }
};



exports.addExam = async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    
    const { examID, examTitle, courseCode, examDate, examTime, duration } = req.body;

    if (!examID || !examTitle || !examDate || !examTime || !duration) {
      console.log("Validation Error: Missing required fields.");
      return res.status(400).json({ error: "All fields are required" });
    }

    const course = await prisma.course.findUnique({ where: { courseCode } });
    
    if (!course) {
      console.log("The course code is invalid input another")
      return res.status(400).json({ error: "Invalid course code" });
    }

    const existingExam = await prisma.exam.findFirst({
      where: { examID, courseId: course.id },
    });
    if (existingExam) {
      return res.status(409).json({ error: "Exam with this ID already exists for the course" });
    }

    const exam = await prisma.exam.create({
      data: {
        examID,
        examTitle,
        courseId: course.id,
        examDate: new Date(examDate),
        examTime,
        duration,
      },
    });

    res.status(201).json({
      message: "Exam added successfully",
      exam,
    });
  } catch (err) {  
    console.error("Error adding exam:", err); 
    res.status(500).json({ error: "Failed to add exam" });
  }
};


exports.addQuestion = async (req, res) => {
  try {
    const { questionID, questionText, courseCode, examID, questionType, options, correctAnswer } = req.body;

    if (!questionID || !questionText || !courseCode || !examID || !questionType) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (questionType === 'MCQ') {
      if (!Array.isArray(options) || options.length === 0) {
        return res.status(400).json({ error: "Options are required for MCQ type" });
      }
      if (!correctAnswer || !options.includes(correctAnswer)) {
        return res.status(400).json({ error: "A valid correct answer is required for MCQ type" });
      }
    }

    const course = await prisma.course.findUnique({ where: { courseCode } });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const exam = await prisma.exam.findUnique({ where: { examID, courseId: course.id } });
    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    const question = await prisma.question.create({
      data: {
        questionID,
        questionText,
        questionType,
        options: questionType === 'MCQ' ? options : undefined,  
        correctAnswer: questionType === 'MCQ' ? correctAnswer : undefined,  
        examID: exam.id,
        courseId: course.id,
      },
    });

    res.status(201).json({
      message: "Question added successfully",
      question,
    });

  } catch (error) {
    console.error("Error adding question:", error);
    res.status(500).json({ error: "Failed to add question" });
  }
};

exports.viewResults = async (req, res) => {
  try {
    console.log('viewResults endpoint called');

    const adminID = req.user.id; 
    console.log(`Received adminID: ${adminID}`);

    const results = await getResultsAdmin(null, 'admin');

    if (results.length === 0) {
      console.log('No results found');
      return res.status(404).json({ message: "No results found." });
    }

    console.log('Sending response...');
    res.status(200).json({ message: "Results retrieved successfully", results });
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ error: `Failed to retrieve results: ${error.message}` });
  }
};





