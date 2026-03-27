"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type TipsFormProps = {
  roundId: string;
  roundName: string;
  locked: boolean;
  stale: boolean;
  initialMarginGuess: number | null;
  matches: {
    id: string;
    homeTeam: string;
    awayTeam: string;
    homeTeamShort: string;
    awayTeamShort: string;
    ownTip: string | null;
  }[];
};

export function TipsForm({
  roundId,
  roundName,
  locked,
  stale,
  initialMarginGuess,
  matches,
}: TipsFormProps) {
  const router = useRouter();
  const [picks, setPicks] = useState<Record<string, string>>(
    Object.fromEntries(matches.map((match) => [match.id, match.ownTip ?? ""])),
  );
  const [marginGuess, setMarginGuess] = useState(initialMarginGuess ?? 24);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const incomplete = useMemo(
    () => matches.some((match) => !picks[match.id]),
    [matches, picks],
  );

  async function handleSave() {
    setPending(true);
    setError(null);

    const response = await fetch("/api/tips/current-round", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roundId,
        marginGuess,
        tips: matches.map((match) => ({
          matchId: match.id,
          selectedTeam: picks[match.id],
        })),
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? "Could not save your tips.");
      setPending(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{roundName}</CardTitle>
          <CardDescription>
            Pick every winner and set your first-game margin. Once the first match starts, the whole round locks.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-[24px] border border-[#243445] bg-[#111b26] p-4">
            <div className="text-sm font-semibold">First game winning margin</div>
            <div className="mt-2 text-3xl font-semibold">{marginGuess} pts</div>
            <input
              type="range"
              min={0}
              max={120}
              step={1}
              value={marginGuess}
              onChange={(event) => setMarginGuess(Number(event.target.value))}
              disabled={locked || stale}
              className="mt-4 h-2 w-full accent-[#20b26f]"
            />
          </div>

          {matches.map((match, index) => (
            <div key={match.id} className="rounded-[24px] border border-[#243445] bg-[#111b26] p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-[#89a0b7]">
                Match {index + 1}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {[
                  { team: match.homeTeam, short: match.homeTeamShort },
                  { team: match.awayTeam, short: match.awayTeamShort },
                ].map((team) => (
                  <button
                    key={team.team}
                    type="button"
                    disabled={locked || stale}
                    onClick={() =>
                      setPicks((current) => ({
                        ...current,
                        [match.id]: team.team,
                      }))
                    }
                    className={`rounded-[22px] border px-3 py-4 text-left transition ${
                      picks[match.id] === team.team
                        ? "border-[#20b26f] bg-[#153425]"
                        : "border-[#243445] bg-[#0c1520]"
                    }`}
                  >
                    <div className="text-xs uppercase tracking-[0.18em] text-[#89a0b7]">{team.short}</div>
                    <div className="mt-2 text-base font-semibold">{team.team}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {locked ? <p className="text-sm text-[#ffd388]">This round is locked now.</p> : null}
          {stale ? (
            <p className="text-sm text-[#ffd388]">
              Live AFL data could not refresh, so tipping is read only for now.
            </p>
          ) : null}
          {error ? <p className="text-sm text-[#ff8f8f]">{error}</p> : null}

          <Button className="w-full" size="lg" onClick={handleSave} disabled={pending || locked || stale || incomplete}>
            {pending ? "Saving..." : "Save tips"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

