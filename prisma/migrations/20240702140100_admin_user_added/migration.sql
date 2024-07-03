-- AlterTable
ALTER TABLE "User" ADD COLUMN     "adminUserId" TEXT;

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
