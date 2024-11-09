-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "contextId" TEXT,
ADD COLUMN     "isDocument" TEXT;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_contextId_fkey" FOREIGN KEY ("contextId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
