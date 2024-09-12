-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "examId" INTEGER;

-- CreateTable
CREATE TABLE "Answer" (
    "id" SERIAL NOT NULL,
    "studentID" INTEGER NOT NULL,
    "examID" INTEGER NOT NULL,
    "questionID" INTEGER NOT NULL,
    "answer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Answer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_studentID_fkey" FOREIGN KEY ("studentID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_examID_fkey" FOREIGN KEY ("examID") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionID_fkey" FOREIGN KEY ("questionID") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
