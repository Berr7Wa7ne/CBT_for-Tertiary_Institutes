-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_studentID_fkey";

-- AlterTable
ALTER TABLE "Answer" ADD COLUMN     "userId" INTEGER;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_studentID_fkey" FOREIGN KEY ("studentID") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
