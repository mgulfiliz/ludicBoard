/*
  Warnings:

  - You are about to drop the `_TaskAssignee` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_TaskAssignee" DROP CONSTRAINT "_TaskAssignee_A_fkey";

-- DropForeignKey
ALTER TABLE "_TaskAssignee" DROP CONSTRAINT "_TaskAssignee_B_fkey";

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "assignedUserId" INTEGER;

-- DropTable
DROP TABLE "_TaskAssignee";

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
