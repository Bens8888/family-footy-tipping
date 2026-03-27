import { promisify } from "node:util";
import { execFile } from "node:child_process";

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

const execFileAsync = promisify(execFile);

async function parseSquiggleResponse(text: string) {
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

async function fetchWithCurl(url: string, userAgent: string) {
  const { stdout } = await execFileAsync("curl", [
    "-sS",
    "-A",
    userAgent,
    "-H",
    "Accept: application/json",
    url,
  ]);

  return stdout;
}

export async function fetchSeasonGames() {
  const config = getAppConfig();
  const baseUrl = config.squiggleBaseUrl.endsWith("/")
    ? config.squiggleBaseUrl
    : `${config.squiggleBaseUrl}/`;
  const urlString = `${baseUrl}?q=games;year=${config.seasonYear};format=json`;

  try {
    const response = await fetch(urlString, {
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
    return await parseSquiggleResponse(text);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Squiggle fetch failed.";

    if (!message.includes("HTML") && !message.includes("invalid JSON")) {
      throw error;
    }

    const fallbackText = await fetchWithCurl(urlString, config.squiggleUserAgent);
    return await parseSquiggleResponse(fallbackText);
  }
}
