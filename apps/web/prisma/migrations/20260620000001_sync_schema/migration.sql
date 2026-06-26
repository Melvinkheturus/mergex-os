-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'ACCOUNT_DELETED';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "firstLogin" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "UserTourState" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "userId" TEXT NOT NULL,
    "tourId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserTourState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserTourState_userId_idx" ON "UserTourState"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserTourState_userId_tourId_key" ON "UserTourState"("userId", "tourId");

-- AddForeignKey
ALTER TABLE "UserTourState" ADD CONSTRAINT "UserTourState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

