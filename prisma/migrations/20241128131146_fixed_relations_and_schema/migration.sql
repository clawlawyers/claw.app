-- CreateTable
CREATE TABLE "AdiraPlan" (
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "duration" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isTypeOfDocument" BOOLEAN NOT NULL,
    "isPromptDrafting" BOOLEAN NOT NULL,
    "isUploadOwnDocument" BOOLEAN NOT NULL,
    "isUploadOwnDocumentWithPrompt" BOOLEAN NOT NULL,
    "isDownloadWithWaterMark" BOOLEAN NOT NULL,
    "isSummerizeDocument" BOOLEAN NOT NULL,
    "isSnippet" BOOLEAN NOT NULL,
    "isAnalysieAnyDocument" BOOLEAN NOT NULL,

    CONSTRAINT "AdiraPlan_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "UserAdiraPlan" (
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

    CONSTRAINT "UserAdiraPlan_pkey" PRIMARY KEY ("userId","planName")
);

-- AddForeignKey
ALTER TABLE "UserAdiraPlan" ADD CONSTRAINT "UserAdiraPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("mongoId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAdiraPlan" ADD CONSTRAINT "UserAdiraPlan_planName_fkey" FOREIGN KEY ("planName") REFERENCES "AdiraPlan"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAdiraPlan" ADD CONSTRAINT "UserAdiraPlan_referralCodeId_fkey" FOREIGN KEY ("referralCodeId") REFERENCES "ReferralCode"("referralCode") ON DELETE SET NULL ON UPDATE CASCADE;
