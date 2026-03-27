import { getAppConfig } from "@/lib/config";

type SquiggleGame = {
  id: number;
  year: number;
  round: number;
  roundname: string;
  date: string;
  unixtime: number;
  venue: string | null;
  hteam: string | null;
  ateam: string | null;
  hscore: number | null;
  ascore: number | null;
  winner: string | null;
  complete: number;
  updated: string;
  timestr: string | null;
  is_final: number;
  is_grand_final: number;
};

export async function fetchSeasonGames() {
  const config = getAppConfig();
  const url = new URL(config.squiggleBaseUrl);
  url.searchParams.set("q", `games;year=${config.seasonYear};format=json`);

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "User-Agent": config.squiggleUserAgent,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Squiggle returned ${response.status}.`);
  }

  const text = await response.text();

  if (text.trim().startsWith("<")) {
    throw new Error("Squiggle returned HTML instead of JSON.");
  }

  let data: { games?: SquiggleGame[] };

  try {
    data = JSON.parse(text) as { games?: SquiggleGame[] };
  } catch {
    throw new Error("Squiggle returned invalid JSON.");
  }

  const first = data.games?.[0];

  if (first && "error" in first) {
    throw new Error("Squiggle rejected the request. Check the configured user agent.");
  }

  return (data.games ?? []).filter((game) => game.hteam && game.ateam);
}
