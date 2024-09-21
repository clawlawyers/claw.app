-- AlterTable
ALTER TABLE "NewUserPlan" ADD COLUMN     "isCouponCode" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "referralCodeId" TEXT;

-- AddForeignKey
ALTER TABLE "NewUserPlan" ADD CONSTRAINT "NewUserPlan_referralCodeId_fkey" FOREIGN KEY ("referralCodeId") REFERENCES "ReferralCode"("referralCode") ON DELETE SET NULL ON UPDATE CASCADE;
