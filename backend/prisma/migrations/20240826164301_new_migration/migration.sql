/*
  Warnings:

  - You are about to drop the column `studentId` on the `Result` table. All the data in the column will be lost.
  - Added the required column `studentID` to the `Result` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `studentID` on the `Student` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Result" DROP CONSTRAINT "Result_studentId_fkey";

-- AlterTable
ALTER TABLE "Result" DROP COLUMN "studentId",
ADD COLUMN     "studentID" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Student" DROP COLUMN "studentID",
ADD COLUMN     "studentID" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Student_studentID_key" ON "Student"("studentID");

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_studentID_fkey" FOREIGN KEY ("studentID") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
