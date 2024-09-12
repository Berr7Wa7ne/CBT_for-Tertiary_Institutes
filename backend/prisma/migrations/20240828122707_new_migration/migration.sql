-- CreateTable
CREATE TABLE "StudentExam" (
    "id" SERIAL NOT NULL,
    "studentID" INTEGER NOT NULL,
    "examId" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "submitted" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" TIMESTAMP(3),

    CONSTRAINT "StudentExam_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StudentExam" ADD CONSTRAINT "StudentExam_studentID_fkey" FOREIGN KEY ("studentID") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentExam" ADD CONSTRAINT "StudentExam_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
