-- AlterTable
ALTER TABLE "Plan" ALTER COLUMN "token" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "StateLocation" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "duration" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalTokenUsed" DOUBLE PRECISION NOT NULL DEFAULT 0.0;