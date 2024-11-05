/*
  Warnings:

  - You are about to drop the column `isUser` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `textArray` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `adminUserId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `caseSearchTokenUsed` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `gptTokenUsed` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isCasesearch` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `tokenUsed` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `totalCaseSearchTokens` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `totalGptTokens` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `totalTokenUsed` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Admin` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_adminUserId_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "isUser",
DROP COLUMN "textArray",
ADD COLUMN     "referenceMessageId" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "adminUserId",
DROP COLUMN "caseSearchTokenUsed",
DROP COLUMN "duration",
DROP COLUMN "gptTokenUsed",
DROP COLUMN "isCasesearch",
DROP COLUMN "tokenUsed",
DROP COLUMN "totalCaseSearchTokens",
DROP COLUMN "totalGptTokens",
DROP COLUMN "totalTokenUsed";

-- DropTable
DROP TABLE "Admin";

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_referenceMessageId_fkey" FOREIGN KEY ("referenceMessageId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
