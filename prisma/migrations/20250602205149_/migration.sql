-- CreateEnum
CREATE TYPE "CrmProvider" AS ENUM ('AMOCRM', 'BITRIX24', 'TELEGA_VPN');

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
CREATE UNIQUE INDEX "CrmConnection_userId_key" ON "CrmConnection"("userId");

-- AddForeignKey
ALTER TABLE "CrmConnection" ADD CONSTRAINT "CrmConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
