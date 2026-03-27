import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { joinNames } from "@/lib/format";

type WinnersArchiveProps = {
  winners: {
    id: string;
    roundName: string;
    roundNumber: number;
    winnerNames: string[];
    points: number;
    correctTips: number;
    marginError: number | null;
  }[];
};

export function WinnersArchive({ winners }: WinnersArchiveProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Previous round winners</CardTitle>
          <CardDescription>Simple round-by-round winners list for the family.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {winners.map((winner) => (
            <div key={winner.id} className="rounded-[22px] border border-[#243445] bg-[#111b26] p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-[#89a0b7]">
                {winner.roundName}
              </div>
              <div className="mt-2 text-xl font-semibold">{joinNames(winner.winnerNames)}</div>
              <div className="mt-2 text-sm text-[#c5d0db]">
                {winner.points} points · {winner.correctTips} correct
                {winner.marginError !== null ? ` · margin miss ${winner.marginError}` : ""}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

