const prisma = require('../models/prisma');
const { getResults: getResultsStudent } = require('../services/resultService');


exports.getAvailableExams = async (req, res) => {
  try {
    console.log("Request received for getAvailableExams"); 
    
    let { studentID } = req.query;  
    console.log("studentID:", studentID); 

    studentID = parseInt(studentID);

    const enrollments = await prisma.enrollment.findMany({
      where: { student: { id: studentID } },
      include: { course: true },
    });
    console.log("Enrollments fetched:", enrollments); 

    const courseIds = enrollments.map((enrollment) => enrollment.courseId);
    console.log("Course IDs:", courseIds); 

    const exams = await prisma.exam.findMany({
      where: {
        courseId: { in: courseIds },
        examDate: { gte: new Date() }, 
      },
    });
    console.log("Exams fetched:", exams); 

    res.status(200).json({ message: "This is the available exams:", exams });
  } catch (error) {
    console.error("Error fetching available exams:", error);
    res.status(500).json({ error: "Failed to fetch available exams" });
  }
};


exports.loadExamDetails = async (req, res) => {
  try {
    const { examID, studentID } = req.body;

    const studentExam = await prisma.studentExam.findUnique({
      where: {
        studentID_examId: {
          studentID: studentID,
          examId: examID,
        },
      },
    });

    if (!studentExam) {
      return res.status(403).json({ error: "You are not allowed to access this exam or you are not enrolled in this exam." });
    }

    const exam = await prisma.exam.findUnique({
      where: { id: examID },
      include: {
        questions: {
          select: {
            id: true,
            questionText: true,
            options: true,
          },
        },
      },
    });

    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    res.status(200).json({
      examTitle: exam.examTitle,
      duration: exam.duration,
      questions: exam.questions,
    });
  } catch (error) {
    console.error("Error loading exam details:", error);
    res.status(500).json({ error: "Failed to load exam details" });
  }
};

exports.submitAnswer = async (req, res) => {
  try {
    console.log('Received request to submit answer:', req.body);
    const { examID, studentID, answers } = req.body;
    console.log('Extracted examID, studentID, and answers:', examID, studentID, answers);

    if (!examID || !studentID || !Array.isArray(answers)) {
      console.log("Validation Error: Missing required fields or invalid answers format");
      return res.status(400).json({ error: "examID, studentID, and answers (array) are required." });
    }

    if (!answers.every(answer => answer.questionID && answer.selectedOption)) {
      console.log("Validation Error: Invalid answer format");
      return res.status(400).json({ error: "Each answer must include questionID and selectedOption." });
    }

    const exam = await prisma.exam.findUnique({
      where: { id: examID },
      include: {
        Enrollment: {
          where: { studentID: studentID },
        },
      },
    });

    console.log('Fetched exam:', exam);

    if (!exam) {
      console.log('Exam not found:', examID);
      return res.status(404).json({ error: "Exam not found" });
    }

    if (exam.Enrollment.length<1) {
      console.log('Student is not enrolled in this exam.');
      return res.status(400).json({ error: "Student is not enrolled in this exam." });
    }

    const examEndTime = new Date(exam.examDate);
    examEndTime.setMinutes(examEndTime.getMinutes() + exam.duration);
    console.log('Calculated exam end time:', examEndTime);

    const currentTime = new Date();
    console.log('Exam end time:', examEndTime);
    console.log('Current time:', currentTime);

    if (currentTime >= examEndTime) {
      console.log('Time\'s up! You cannot submit answers anymore.');
      return res.status(400).json({ error: "Time's up! You cannot submit answers anymore." });
    }

    const answerData = answers.map((answer) => ({
      studentID: studentID,
      examID: examID,
      questionID: answer.questionID,
      answer: answer.selectedOption,
    }));

    console.log("Data being passed to createMany:", answerData);

    const savedAnswers = await prisma.answer.createMany({
      data: answerData,
    });

    console.log('Answers submitted successfully:', savedAnswers);
    res.status(200).json({ message: "Answers submitted successfully", savedAnswers });
  } catch (error) {
    console.error('Error submitting answers:', error);
    res.status(500).json({ error: "Failed to submit answers" });
  }
};

exports.submitExam = async (req, res) => {
  try {
    const { examID, studentID } = req.body;

    console.log('Received submitExam request with:', { examID, studentID });

    const studentExam = await prisma.studentExam.update({
      where: {
        studentID_examId: {
          studentID: studentID,
          examId: examID,
        },
      },
      data: {
        submitted: true,
      },
    });

    console.log('Updated StudentExam:', studentExam);

    if (!studentExam) {
      throw new Error(`StudentExam record not found`);
    }

    const answers = await prisma.answer.findMany({
      where: { studentID: studentID, question: { examID: examID } },
      include: { question: true },
    });

    console.log('Fetched answers for the exam:', answers);

    let score = 0;
    for (const answer of answers) {
      if (answer.answer === answer.question.correctAnswer) {
        score += 1;
      }
    }

    console.log('Calculated score:', score);

    let grade;
    const totalQuestions = answers.length;
    const percentage = (score / totalQuestions) * 100;

    if (percentage >= 90) {
      grade = 'A';
    } else if (percentage >= 80) {
      grade = 'B';
    } else if (percentage >= 70) {
      grade = 'C';
    } else if (percentage >= 60) {
      grade = 'D';
    } else {
      grade = 'F';
    }

    console.log('Calculated grade:', grade);

    const exam = await prisma.exam.findUnique({
      where: { id: examID },
      select: { courseId: true }, 
    });

    if (!exam) {
      throw new Error(`Exam not found for ID: ${examID}`);
    }

    const courseID = exam.courseId;

    const result = await prisma.result.create({
      data: {
        studentID: studentID, 
        examId: examID,       
        courseId: courseID,   
        score,
        grade,                
      },
    });

    console.log('Created result:', result);

    res.status(200).json({ message: "Exam submitted successfully", score, grade });
  } catch (error) {
    console.error("Error submitting exam:", error);
    res.status(500).json({ error: "Failed to submit exam" });
  }
};


exports.viewResults = async (req, res) => {
  try {
    console.log('viewResults endpoint called');

    const studentID = req.user.id; 
    console.log(`Received studentID: ${studentID}`);

    const results = await getResultsStudent(studentID, 'user');

    if (results.length === 0) {
      console.log('No results found for this student');
      return res.status(404).json({ message: "No results found for this student." });
    }

    console.log('Sending response...');
    res.status(200).json({ message: "This is your result", results });
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).json({ error: `Failed to retrieve results: ${error.message}` });
  }
};








  