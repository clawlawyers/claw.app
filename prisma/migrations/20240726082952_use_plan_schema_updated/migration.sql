-- AlterTable
ALTER TABLE "UserPlan" ADD COLUMN     "duration" TEXT NOT NULL DEFAULT 'monthly',
ADD COLUMN     "expiresAt" TIMESTAMP(3) DEFAULT '2024-08-30 00:00:00 +00:00';
