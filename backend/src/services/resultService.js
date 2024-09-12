const prisma = require('../models/prisma');

const getResults = async (userID, role) => {
  try {
    let results;
    if (role === 'admin') {
      results = await prisma.result.findMany({
        include: {
          student: true,
          exam: true,
          course: true,
        },
      });
    } else if (role === 'user') {
      results = await prisma.result.findMany({
        where: { studentID: userID },
        include: {
          exam: true,
          course: true,
        },
      });
    } else {
      throw new Error('Invalid role');
    }

    return results;
  } catch (error) {
    console.error('Error fetching results:', error);
    throw new Error('Failed to fetch results');
  }
};

module.exports = { getResults };
