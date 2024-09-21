/*
  Warnings:

  - Added the required column `feedbackMessage` to the `Feedback` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN     "feedbackMessage" TEXT NOT NULL,
ADD COLUMN     "feedbackType" TEXT NOT NULL DEFAULT 'ResponseGenerated',
ADD COLUMN     "impression" TEXT NOT NULL DEFAULT 'Positive',
ALTER COLUMN "rating" DROP NOT NULL;
