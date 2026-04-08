import { Check, X } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMargin, formatShortDateTime, joinNames } from "@/lib/format";

type CompetitionViewProps = {
  currentRound: {
    name: string;
    locked: boolean;
    matches: {
      id: string;
      startsAt: Date;
      homeTeam: string;
      awayTeam: string;
      homeTeamShort: string;
      awayTeamShort: string;
      homeScore: number | null;
      awayScore: number | null;
      winnerTeam: string | null;
      stateLabel: string | null;
      visibleTips: {
        memberSlug: string;
        memberName: string;
        selectedTeam: string;
        selectedShort: string;
        isCorrect: boolean | null;
      }[];
    }[];
  };
  leaderboard: {
    rank: number;
    memberSlug: string;
    memberName: string;
    totalPoints: number;
    correctTips: number;
    marginGuess: number | null;
    marginError: number | null;
  }[];
  lastWeekWinner: {
    roundName: string;
    winnerNames: string[];
    points: number;
  } | null;
  showAllTips: boolean;
};

export function CompetitionView({
  currentRound,
  leaderboard,
  lastWeekWinner,
  showAllTips,
}: CompetitionViewProps) {
  return (
    <div className="space-y-4">
      {lastWeekWinner ? (
        <Card className="border-[#26553f] bg-[#102218]">
          <CardHeader>
            <div className="text-xs uppercase tracking-[0.18em] text-[#7ce5b2]">Last week winner</div>
            <CardTitle className="mt-2">{joinNames(lastWeekWinner.winnerNames)}</CardTitle>
            <CardDescription className="text-[#c7d9cb]">
              {lastWeekWinner.roundName} with {lastWeekWinner.points} points.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{currentRound.name} leaderboard</CardTitle>
          <CardDescription>
            Ranked by correct tips first. If people are tied, the closest first-game margin breaks the tie.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {leaderboard.map((row) => (
            <div key={row.memberSlug} className="rounded-[22px] border border-[#243445] bg-[#111b26] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-[#89a0b7]">#{row.rank}</div>
                  <div className="mt-1 text-xl font-semibold">{row.memberName}</div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-semibold">{row.totalPoints}</div>
                  <div className="text-xs uppercase tracking-[0.18em] text-[#89a0b7]">points</div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-sm text-[#c5d0db]">
                <div>{row.correctTips} correct</div>
                <div>{formatMargin(row.marginGuess)}</div>
                <div>
                  {row.marginError === null ? "No margin yet" : `${row.marginError} away`}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Who tipped what</CardTitle>
          <CardDescription>
            {showAllTips
              ? "The round has started, so everyone’s tips are visible now."
              : "Tips stay hidden until the round starts and locks."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {showAllTips ? (
            currentRound.matches.map((match, index) => (
              <div key={match.id} className="rounded-[24px] border border-[#243445] bg-[#111b26] p-4">
                <div className="text-xs uppercase tracking-[0.18em] text-[#89a0b7]">
                  Match {index + 1} · {formatShortDateTime(match.startsAt)}
                </div>
                <div className="mt-2 text-lg font-semibold">
                  {match.homeTeamShort} v {match.awayTeamShort}
                </div>
                <div className="mt-1 text-sm text-[#9fb0c2]">
                  {match.stateLabel ?? "Upcoming"}
                  {match.homeScore !== null && match.awayScore !== null
                    ? ` · ${match.homeScore}-${match.awayScore}`
                    : ""}
                </div>

                <div className="mt-4 space-y-2">
                  {match.visibleTips.map((tip) => (
                    <div
                      key={`${match.id}-${tip.memberSlug}`}
                      className={`flex items-center justify-between rounded-2xl px-3 py-3 ${
                        tip.isCorrect === true
                          ? "bg-[#143223]"
                          : tip.isCorrect === false
                            ? "bg-[#3a1b1b]"
                            : "bg-[#0c1520]"
                      }`}
                    >
                      <div className="font-semibold">{tip.memberName}</div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold">{tip.selectedShort}</div>
                        {tip.isCorrect === true ? (
                          <Check className="h-4 w-4 text-[#7ce5b2]" />
                        ) : tip.isCorrect === false ? (
                          <X className="h-4 w-4 text-[#ff9a9a]" />
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[24px] border border-[#243445] bg-[#111b26] p-4 text-sm text-[#c5d0db]">
              Once the first game starts, all family tips will appear here.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
