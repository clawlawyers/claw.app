-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "textArray" TEXT[] DEFAULT ARRAY[]::TEXT[];
