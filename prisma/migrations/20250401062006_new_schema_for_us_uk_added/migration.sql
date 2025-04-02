-- CreateTable
CREATE TABLE "AllUKPlan" (
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

    CONSTRAINT "AllUKPlan_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "AllUSPlan" (
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

    CONSTRAINT "AllUSPlan_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "UserAllUKPlan" (
    "userId" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "UsedlegalGptToken" INTEGER NOT NULL DEFAULT 0,
    "UsedLegalGPTime" INTEGER NOT NULL DEFAULT 0,
    "UsedAdiraToken" INTEGER NOT NULL DEFAULT 0,
    "UsedAdiraTime" INTEGER NOT NULL DEFAULT 0,
    "UsedWarroomToken" INTEGER NOT NULL DEFAULT 0,
    "UsedWarroomTime" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subscriptionId" TEXT NOT NULL DEFAULT '',
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "referralCodeId" TEXT,
    "Paidprice" INTEGER NOT NULL DEFAULT 0,
    "isCouponCode" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "UserAllUKPlan_pkey" PRIMARY KEY ("userId","planName")
);

-- CreateTable
CREATE TABLE "UserAllUSPlan" (
    "userId" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "UsedlegalGptToken" INTEGER NOT NULL DEFAULT 0,
    "UsedLegalGPTime" INTEGER NOT NULL DEFAULT 0,
    "UsedAdiraToken" INTEGER NOT NULL DEFAULT 0,
    "UsedAdiraTime" INTEGER NOT NULL DEFAULT 0,
    "UsedWarroomToken" INTEGER NOT NULL DEFAULT 0,
    "UsedWarroomTime" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subscriptionId" TEXT NOT NULL DEFAULT '',
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "referralCodeId" TEXT,
    "Paidprice" INTEGER NOT NULL DEFAULT 0,
    "isCouponCode" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "UserAllUSPlan_pkey" PRIMARY KEY ("userId","planName")
);

-- AddForeignKey
ALTER TABLE "UserAllUKPlan" ADD CONSTRAINT "UserAllUKPlan_planName_fkey" FOREIGN KEY ("planName") REFERENCES "AllUKPlan"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAllUKPlan" ADD CONSTRAINT "UserAllUKPlan_referralCodeId_fkey" FOREIGN KEY ("referralCodeId") REFERENCES "ReferralCode"("referralCode") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAllUKPlan" ADD CONSTRAINT "UserAllUKPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("mongoId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAllUSPlan" ADD CONSTRAINT "UserAllUSPlan_planName_fkey" FOREIGN KEY ("planName") REFERENCES "AllUSPlan"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAllUSPlan" ADD CONSTRAINT "UserAllUSPlan_referralCodeId_fkey" FOREIGN KEY ("referralCodeId") REFERENCES "ReferralCode"("referralCode") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAllUSPlan" ADD CONSTRAINT "UserAllUSPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("mongoId") ON DELETE CASCADE ON UPDATE CASCADE;
