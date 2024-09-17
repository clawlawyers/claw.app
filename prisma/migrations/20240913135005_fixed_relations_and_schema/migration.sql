-- AlterTable
ALTER TABLE "ReferralCode" ADD COLUMN     "discount" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN     "freeTrial" INTEGER NOT NULL DEFAULT 7,
ADD COLUMN     "redeemedAndPayById" TEXT;

-- AddForeignKey
ALTER TABLE "ReferralCode" ADD CONSTRAINT "ReferralCode_redeemedAndPayById_fkey" FOREIGN KEY ("redeemedAndPayById") REFERENCES "User"("mongoId") ON DELETE SET NULL ON UPDATE CASCADE;
