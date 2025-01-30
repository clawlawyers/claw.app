-- CreateTable
CREATE TABLE "AllPlan" (
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "duration" TEXT NOT NULL,
    "legalGptToken" INTEGER NOT NULL,
    "LegalGPTime" INTEGER NOT NULL,
    "AdiraToken" INTEGER NOT NULL,
    "AdiraTime" INTEGER NOT NULL,
    "WarroomToken" INTEGER NOT NULL,
    "WarroomTime" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AllPlan_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "UserAllPlan" (
    "userId" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subscriptionId" TEXT NOT NULL DEFAULT '',
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "referralCodeId" TEXT,
    "Paidprice" INTEGER NOT NULL DEFAULT 0,
    "isCouponCode" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "UserAllPlan_pkey" PRIMARY KEY ("userId","planName")
);

-- AddForeignKey
ALTER TABLE "UserAllPlan" ADD CONSTRAINT "UserAllPlan_planName_fkey" FOREIGN KEY ("planName") REFERENCES "AllPlan"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAllPlan" ADD CONSTRAINT "UserAllPlan_referralCodeId_fkey" FOREIGN KEY ("referralCodeId") REFERENCES "ReferralCode"("referralCode") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAllPlan" ADD CONSTRAINT "UserAllPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("mongoId") ON DELETE CASCADE ON UPDATE CASCADE;
