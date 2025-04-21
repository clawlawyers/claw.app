-- CreateTable
CREATE TABLE "UKSession" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UKSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "USSession" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "USSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MessageToUKSession" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_MessageToUSSession" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "UKSession_userId_idx" ON "UKSession"("userId");

-- CreateIndex
CREATE INDEX "USSession_userId_idx" ON "USSession"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "_MessageToUKSession_AB_unique" ON "_MessageToUKSession"("A", "B");

-- CreateIndex
CREATE INDEX "_MessageToUKSession_B_index" ON "_MessageToUKSession"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_MessageToUSSession_AB_unique" ON "_MessageToUSSession"("A", "B");

-- CreateIndex
CREATE INDEX "_MessageToUSSession_B_index" ON "_MessageToUSSession"("B");

-- AddForeignKey
ALTER TABLE "UKSession" ADD CONSTRAINT "UKSession_modelName_fkey" FOREIGN KEY ("modelName") REFERENCES "Model"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UKSession" ADD CONSTRAINT "UKSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("mongoId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "USSession" ADD CONSTRAINT "USSession_modelName_fkey" FOREIGN KEY ("modelName") REFERENCES "Model"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "USSession" ADD CONSTRAINT "USSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("mongoId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MessageToUKSession" ADD CONSTRAINT "_MessageToUKSession_A_fkey" FOREIGN KEY ("A") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MessageToUKSession" ADD CONSTRAINT "_MessageToUKSession_B_fkey" FOREIGN KEY ("B") REFERENCES "UKSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MessageToUSSession" ADD CONSTRAINT "_MessageToUSSession_A_fkey" FOREIGN KEY ("A") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MessageToUSSession" ADD CONSTRAINT "_MessageToUSSession_B_fkey" FOREIGN KEY ("B") REFERENCES "USSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
