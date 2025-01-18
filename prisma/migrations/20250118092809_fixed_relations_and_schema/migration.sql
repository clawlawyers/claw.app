-- AlterTable
ALTER TABLE "UserAdiraPlan" ADD COLUMN     "totalDocuments" INTEGER;

-- CreateTable
CREATE TABLE "UserAdiraPurchases" (
    "userId" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subscriptionId" TEXT NOT NULL DEFAULT '',
    "expiresAt" TIMESTAMP(3),
    "referralCodeId" TEXT,
    "Paidprice" INTEGER NOT NULL DEFAULT 0,
    "isCouponCode" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "UserAdiraPurchases_pkey" PRIMARY KEY ("userId","planName")
);

-- AddForeignKey
ALTER TABLE "UserAdiraPurchases" ADD CONSTRAINT "UserAdiraPurchases_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("mongoId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAdiraPurchases" ADD CONSTRAINT "UserAdiraPurchases_planName_fkey" FOREIGN KEY ("planName") REFERENCES "AdiraPlan"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAdiraPurchases" ADD CONSTRAINT "UserAdiraPurchases_referralCodeId_fkey" FOREIGN KEY ("referralCodeId") REFERENCES "ReferralCode"("referralCode") ON DELETE SET NULL ON UPDATE CASCADE;
