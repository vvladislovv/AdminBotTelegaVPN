/*
  Warnings:

  - You are about to drop the column `username` on the `Bot` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[link]` on the table `Bot` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `link` to the `Bot` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Bot_username_key";

-- AlterTable
ALTER TABLE "Bot" DROP COLUMN "username",
ADD COLUMN     "link" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Bot_link_key" ON "Bot"("link");
