import Link from "next/link";
import { CheckCircle2, Lock, PencilLine, Trophy } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatShortDateTime, formatStatusLabel, joinNames } from "@/lib/format";

type HomeOverviewProps = {
  memberName: string;
  currentRound: {
    name: string;
    firstMatchAt: Date;
    locked: boolean;
    matches: {
      ownTip: string | null;
      winnerTeam: string | null;
    }[];
  };
  lastWeekWinner: {
    roundName: string;
    winnerNames: string[];
    points: number;
  } | null;
  allowEditing: boolean;
  stale: boolean;
};

export function HomeOverview({
  memberName,
  currentRound,
  lastWeekWinner,
  allowEditing,
  stale,
}: HomeOverviewProps) {
  const tipCount = currentRound.matches.filter((match) => match.ownTip).length;
  const correctSoFar = currentRound.matches.filter(
    (match) => match.ownTip && match.winnerTeam && match.ownTip === match.winnerTeam,
  ).length;
  const hasTips = tipCount > 0;

  return (
    <div className="space-y-4">
      {lastWeekWinner ? (
        <Card className="border-[#26553f] bg-[#102218]">
          <CardHeader>
            <div className="flex items-center gap-2 text-[#7ce5b2]">
              <Trophy className="h-4 w-4" />
              Last week winner
            </div>
            <CardTitle className="mt-2">{joinNames(lastWeekWinner.winnerNames)}</CardTitle>
            <CardDescription className="text-[#c7d9cb]">
              {lastWeekWinner.roundName} with {lastWeekWinner.points} points.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <div className="text-xs uppercase tracking-[0.18em] text-[#89a0b7]">Current round</div>
          <CardTitle className="mt-2">{currentRound.name}</CardTitle>
          <CardDescription>
            {formatStatusLabel(currentRound.locked, stale)}. First game: {formatShortDateTime(currentRound.firstMatchAt)}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[22px] border border-[#243445] bg-[#111b26] p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-[#89a0b7]">Your tips</div>
              <div className="mt-2 text-3xl font-semibold">
                {tipCount}/{currentRound.matches.length}
              </div>
            </div>
            <div className="rounded-[22px] border border-[#243445] bg-[#111b26] p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-[#89a0b7]">Correct so far</div>
              <div className="mt-2 text-3xl font-semibold">{correctSoFar}</div>
            </div>
          </div>

          <div className="grid gap-3">
            <Link href="/competition">
              <Button className="w-full" size="lg">
                Competition
              </Button>
            </Link>

            <Link href="/tips">
              <Button variant="secondary" className="w-full" size="lg">
                {allowEditing ? (
                  hasTips ? (
                    <>
                      <PencilLine className="mr-2 h-4 w-4" />
                      Edit tips
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Enter this week&apos;s tips
                    </>
                  )
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Tips locked
                  </>
                )}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Simple for everyone</CardTitle>
          <CardDescription>
            Hi {memberName}. Tap your winner for every game, set the first-game margin, and you’re done.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

