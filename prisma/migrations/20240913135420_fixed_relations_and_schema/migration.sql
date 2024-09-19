/*
  Warnings:

  - You are about to drop the column `redeemedAndPayById` on the `ReferralCode` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ReferralCode" DROP CONSTRAINT "ReferralCode_redeemedAndPayById_fkey";

-- AlterTable
ALTER TABLE "ReferralCode" DROP COLUMN "redeemedAndPayById";

-- CreateTable
CREATE TABLE "_RedeemedAndPayByUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_RedeemedAndPayByUser_AB_unique" ON "_RedeemedAndPayByUser"("A", "B");

-- CreateIndex
CREATE INDEX "_RedeemedAndPayByUser_B_index" ON "_RedeemedAndPayByUser"("B");

-- AddForeignKey
ALTER TABLE "_RedeemedAndPayByUser" ADD CONSTRAINT "_RedeemedAndPayByUser_A_fkey" FOREIGN KEY ("A") REFERENCES "ReferralCode"("referralCode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RedeemedAndPayByUser" ADD CONSTRAINT "_RedeemedAndPayByUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("mongoId") ON DELETE CASCADE ON UPDATE CASCADE;
