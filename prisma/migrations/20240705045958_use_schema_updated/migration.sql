-- AlterTable
ALTER TABLE "User" ADD COLUMN     "caseSearchTokenUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "gptTokenUsed" INTEGER NOT NULL DEFAULT 0;
