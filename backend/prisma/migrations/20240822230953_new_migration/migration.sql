/*
  Warnings:

  - Changed the type of `level` on the `Course` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropIndex
DROP INDEX "Course_courseCode_key";

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "level",
ADD COLUMN     "level" INTEGER NOT NULL;
