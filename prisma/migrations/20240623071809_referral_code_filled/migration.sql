/*
  Warnings:

  - A unique constraint covering the columns `[referralCode]` on the table `ReferralCode` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ReferralCode" ALTER COLUMN "referralCode" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "ReferralCode_referralCode_key" ON "ReferralCode"("referralCode");
