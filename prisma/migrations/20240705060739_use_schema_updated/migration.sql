-- AlterTable
ALTER TABLE "User" ADD COLUMN     "totalCaseSearchTokens" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalGptTokens" INTEGER NOT NULL DEFAULT 0;
