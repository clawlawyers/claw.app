/*
  Warnings:

  - The primary key for the `ReferralCode` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "ReferralCode" DROP CONSTRAINT "ReferralCode_pkey",
ADD CONSTRAINT "ReferralCode_pkey" PRIMARY KEY ("referralCode");

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "redeemedReferralCodeId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_redeemedReferralCodeId_fkey" FOREIGN KEY ("redeemedReferralCodeId") REFERENCES "ReferralCode"("referralCode") ON DELETE SET NULL ON UPDATE CASCADE;
