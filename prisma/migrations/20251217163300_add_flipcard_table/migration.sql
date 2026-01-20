-- CreateTable
CREATE TABLE "FlipCard" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "coachId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlipCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FlipCard_coachId_idx" ON "FlipCard"("coachId");

-- CreateIndex
CREATE INDEX "FlipCard_playerId_idx" ON "FlipCard"("playerId");

-- AddForeignKey
ALTER TABLE "FlipCard" ADD CONSTRAINT "FlipCard_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "CoachProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlipCard" ADD CONSTRAINT "FlipCard_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "PlayerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
