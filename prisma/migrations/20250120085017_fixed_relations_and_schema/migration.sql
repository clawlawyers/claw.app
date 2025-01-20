/*
  Warnings:

  - You are about to drop the column `totalDocuments` on the `UserAdiraPlan` table. All the data in the column will be lost.
  - You are about to drop the `UserAdiraPurchases` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserAdiraPurchases" DROP CONSTRAINT "UserAdiraPurchases_planName_fkey";

-- DropForeignKey
ALTER TABLE "UserAdiraPurchases" DROP CONSTRAINT "UserAdiraPurchases_referralCodeId_fkey";

-- DropForeignKey
ALTER TABLE "UserAdiraPurchases" DROP CONSTRAINT "UserAdiraPurchases_userId_fkey";

-- AlterTable
ALTER TABLE "UserAdiraPlan" DROP COLUMN "totalDocuments";

-- DropTable
DROP TABLE "UserAdiraPurchases";
