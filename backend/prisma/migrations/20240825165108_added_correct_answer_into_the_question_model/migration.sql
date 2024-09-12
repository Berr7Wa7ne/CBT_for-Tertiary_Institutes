/*
  Warnings:

  - You are about to drop the column `examId` on the `Question` table. All the data in the column will be lost.
  - The `options` column on the `Question` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `correctAnswer` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `examID` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_examId_fkey";

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "examId",
ADD COLUMN     "correctAnswer" TEXT NOT NULL,
ADD COLUMN     "examID" INTEGER NOT NULL,
DROP COLUMN "options",
ADD COLUMN     "options" TEXT[];

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_examID_fkey" FOREIGN KEY ("examID") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
