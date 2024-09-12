/*
  Warnings:

  - You are about to drop the column `testId` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the `Test` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[questionID]` on the table `Question` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `courseId` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `examId` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionID` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionText` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `questionType` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_testId_fkey";

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "testId",
DROP COLUMN "text",
ADD COLUMN     "courseId" INTEGER NOT NULL,
ADD COLUMN     "examId" INTEGER NOT NULL,
ADD COLUMN     "options" TEXT,
ADD COLUMN     "questionID" TEXT NOT NULL,
ADD COLUMN     "questionText" TEXT NOT NULL,
ADD COLUMN     "questionType" TEXT NOT NULL;

-- DropTable
DROP TABLE "Test";

-- CreateTable
CREATE TABLE "Student" (
    "id" SERIAL NOT NULL,
    "studentID" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "level" TEXT NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" SERIAL NOT NULL,
    "courseCode" TEXT NOT NULL,
    "courseTitle" TEXT NOT NULL,
    "courseDescription" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exam" (
    "id" SERIAL NOT NULL,
    "examID" TEXT NOT NULL,
    "examTitle" TEXT NOT NULL,
    "courseId" INTEGER NOT NULL,
    "examDate" TIMESTAMP(3) NOT NULL,
    "examTime" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Result" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "examId" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "grade" TEXT NOT NULL,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_studentID_key" ON "Student"("studentID");

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Course_courseCode_key" ON "Course"("courseCode");

-- CreateIndex
CREATE UNIQUE INDEX "Exam_examID_key" ON "Exam"("examID");

-- CreateIndex
CREATE UNIQUE INDEX "Question_questionID_key" ON "Question"("questionID");

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
