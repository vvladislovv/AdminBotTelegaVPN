/*
  Warnings:

  - You are about to drop the `CrmUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CrmUser" DROP CONSTRAINT "CrmUser_botId_fkey";

-- DropTable
DROP TABLE "CrmUser";
