/*
  Warnings:

  - You are about to drop the `_MessageToUKSession` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_MessageToUSSession` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_MessageToUKSession" DROP CONSTRAINT "_MessageToUKSession_A_fkey";

-- DropForeignKey
ALTER TABLE "_MessageToUKSession" DROP CONSTRAINT "_MessageToUKSession_B_fkey";

-- DropForeignKey
ALTER TABLE "_MessageToUSSession" DROP CONSTRAINT "_MessageToUSSession_A_fkey";

-- DropForeignKey
ALTER TABLE "_MessageToUSSession" DROP CONSTRAINT "_MessageToUSSession_B_fkey";

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "ukSessionId" TEXT,
ADD COLUMN     "usSessionId" TEXT,
ALTER COLUMN "sessionId" DROP NOT NULL;

-- DropTable
DROP TABLE "_MessageToUKSession";

-- DropTable
DROP TABLE "_MessageToUSSession";

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_UKSession_fkey" FOREIGN KEY ("ukSessionId") REFERENCES "UKSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_USSession_fkey" FOREIGN KEY ("usSessionId") REFERENCES "USSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
