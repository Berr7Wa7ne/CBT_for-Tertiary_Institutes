/*
  Warnings:

  - A unique constraint covering the columns `[studentID,examId]` on the table `StudentExam` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "StudentExam_studentID_examId_key" ON "StudentExam"("studentID", "examId");
