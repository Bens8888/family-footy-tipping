-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "RoundStatus" AS ENUM ('UPCOMING', 'IN_PROGRESS', 'COMPLETE');

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Round" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "firstMatchAt" TIMESTAMP(3) NOT NULL,
    "status" "RoundStatus" NOT NULL DEFAULT 'UPCOMING',
    "syncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "externalId" INTEGER NOT NULL,
    "roundId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "venue" TEXT,
    "homeTeam" TEXT NOT NULL,
    "awayTeam" TEXT NOT NULL,
    "homeTeamShort" TEXT NOT NULL,
    "awayTeamShort" TEXT NOT NULL,
    "homeScore" INTEGER,
    "awayScore" INTEGER,
    "complete" INTEGER NOT NULL DEFAULT 0,
    "winnerTeam" TEXT,
    "winnerTeamShort" TEXT,
    "stateLabel" TEXT,
    "isFinal" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tip" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "selectedTeam" TEXT NOT NULL,
    "selectedShort" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarginTip" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "guess" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarginTip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyWin" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "winnerSlugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "winnerNames" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "points" INTEGER NOT NULL,
    "correctTips" INTEGER NOT NULL,
    "marginError" INTEGER,
    "marginBonusAwarded" BOOLEAN NOT NULL DEFAULT false,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeeklyWin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Member_slug_key" ON "Member"("slug");

-- CreateIndex
CREATE INDEX "Round_year_number_idx" ON "Round"("year", "number");

-- CreateIndex
CREATE INDEX "Round_status_firstMatchAt_idx" ON "Round"("status", "firstMatchAt");

-- CreateIndex
CREATE UNIQUE INDEX "Round_year_number_key" ON "Round"("year", "number");

-- CreateIndex
CREATE UNIQUE INDEX "Match_externalId_key" ON "Match"("externalId");

-- CreateIndex
CREATE INDEX "Match_roundId_startsAt_idx" ON "Match"("roundId", "startsAt");

-- CreateIndex
CREATE INDEX "Tip_matchId_idx" ON "Tip"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "Tip_memberId_matchId_key" ON "Tip"("memberId", "matchId");

-- CreateIndex
CREATE INDEX "MarginTip_roundId_idx" ON "MarginTip"("roundId");

-- CreateIndex
CREATE UNIQUE INDEX "MarginTip_memberId_roundId_key" ON "MarginTip"("memberId", "roundId");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyWin_roundId_key" ON "WeeklyWin"("roundId");

-- CreateIndex
CREATE INDEX "WeeklyWin_computedAt_idx" ON "WeeklyWin"("computedAt");

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tip" ADD CONSTRAINT "Tip_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tip" ADD CONSTRAINT "Tip_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarginTip" ADD CONSTRAINT "MarginTip_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarginTip" ADD CONSTRAINT "MarginTip_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyWin" ADD CONSTRAINT "WeeklyWin_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

