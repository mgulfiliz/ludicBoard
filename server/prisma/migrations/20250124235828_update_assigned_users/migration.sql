/*
  Warnings:

  - You are about to drop the column `assignedUserId` on the `Task` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_assignedUserId_fkey";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "assignedUserId";

-- CreateTable
CREATE TABLE "_TaskAssignee" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_TaskAssignee_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_TaskAssignee_B_index" ON "_TaskAssignee"("B");

-- AddForeignKey
ALTER TABLE "_TaskAssignee" ADD CONSTRAINT "_TaskAssignee_A_fkey" FOREIGN KEY ("A") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaskAssignee" ADD CONSTRAINT "_TaskAssignee_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
