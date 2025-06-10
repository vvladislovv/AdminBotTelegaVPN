-- CreateEnum
CREATE TYPE "TelegapayTransactionType" AS ENUM ('PAYIN', 'PAYOUT');

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "telegapayStatus" TEXT,
ADD COLUMN     "telegapayTransactionType" "TelegapayTransactionType";
