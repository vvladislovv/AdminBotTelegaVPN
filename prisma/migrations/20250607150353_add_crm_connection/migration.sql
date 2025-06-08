/*
  Warnings:

  - You are about to drop the `crm_connections` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "crm_connections" DROP CONSTRAINT "crm_connections_userId_fkey";

-- DropTable
DROP TABLE "crm_connections";

-- CreateTable
CREATE TABLE "CrmUser" (
    "id" SERIAL NOT NULL,
    "telegramId" TEXT NOT NULL,
    "username" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "botId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CrmUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CrmConnection" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "provider" "CrmProvider" NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "domain" TEXT,
    "otherData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CrmConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CrmUser_telegramId_key" ON "CrmUser"("telegramId");

-- CreateIndex
CREATE UNIQUE INDEX "CrmConnection_userId_key" ON "CrmConnection"("userId");

-- AddForeignKey
ALTER TABLE "CrmUser" ADD CONSTRAINT "CrmUser_botId_fkey" FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CrmConnection" ADD CONSTRAINT "CrmConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
