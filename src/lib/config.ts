import { getEnv } from "@/lib/env";

export function getAppConfig() {
  const env = getEnv();

  return {
    appUrl: env.APP_URL,
    port: env.PORT,
    seasonYear: env.AFL_SEASON_YEAR,
    squiggleBaseUrl: env.SQUIGGLE_BASE_URL,
    squiggleUserAgent: env.SQUIGGLE_USER_AGENT,
    dataSyncIntervalMs: env.DATA_SYNC_INTERVAL_SECONDS * 1000,
  };
}

