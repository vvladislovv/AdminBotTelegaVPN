/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `Bot` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `Bot` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Bot_link_key";

-- AlterTable
ALTER TABLE "Bot" ADD COLUMN     "username" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Bot_username_key" ON "Bot"("username");
