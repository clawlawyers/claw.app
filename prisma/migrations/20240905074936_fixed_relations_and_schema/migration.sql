-- CreateTable
CREATE TABLE "NewUserPlan" (
    "userId" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "NewUserPlan_pkey" PRIMARY KEY ("userId","planName")
);

-- CreateTable
CREATE TABLE "NewPlan" (
    "name" TEXT NOT NULL,
    "legalGptAccess" BOOLEAN NOT NULL DEFAULT false,
    "AICaseSearchAccess" BOOLEAN NOT NULL DEFAULT false,
    "AISummerizer" BOOLEAN NOT NULL DEFAULT false,
    "AddOnAccess" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "session" INTEGER NOT NULL DEFAULT 1,
    "duration" TEXT NOT NULL DEFAULT 'monthly',

    CONSTRAINT "NewPlan_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "_NewPlanToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "NewPlan_name_key" ON "NewPlan"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_NewPlanToUser_AB_unique" ON "_NewPlanToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_NewPlanToUser_B_index" ON "_NewPlanToUser"("B");

-- AddForeignKey
ALTER TABLE "NewUserPlan" ADD CONSTRAINT "NewUserPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("mongoId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewUserPlan" ADD CONSTRAINT "NewUserPlan_planName_fkey" FOREIGN KEY ("planName") REFERENCES "NewPlan"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NewPlanToUser" ADD CONSTRAINT "_NewPlanToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "NewPlan"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_NewPlanToUser" ADD CONSTRAINT "_NewPlanToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("mongoId") ON DELETE CASCADE ON UPDATE CASCADE;
