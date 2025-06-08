/*
  Warnings:

  - You are about to drop the `CrmConnection` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CrmConnection" DROP CONSTRAINT "CrmConnection_userId_fkey";

-- DropTable
DROP TABLE "CrmConnection";

-- CreateTable
CREATE TABLE "crm_connections" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "otherData" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_connections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "crm_connections_userId_key" ON "crm_connections"("userId");

-- AddForeignKey
ALTER TABLE "crm_connections" ADD CONSTRAINT "crm_connections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
