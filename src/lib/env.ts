import { z } from "zod";

import { AFL_SEASON_YEAR } from "@/lib/constants";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z
    .string()
    .min(1)
    .default("postgresql://footytips:footytips@localhost:5432/footytips?schema=public"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  POSTGRES_DB: z.string().default("footytips"),
  POSTGRES_USER: z.string().default("footytips"),
  POSTGRES_PASSWORD: z.string().default("footytips"),
  AFL_SEASON_YEAR: z.coerce.number().int().default(AFL_SEASON_YEAR),
  SQUIGGLE_BASE_URL: z.string().url().default("https://api.squiggle.com.au/"),
  SQUIGGLE_USER_AGENT: z
    .string()
    .min(8)
    .default("FamilyFootyTips/1.0 (contact: local-family-app)"),
  DATA_SYNC_INTERVAL_SECONDS: z.coerce.number().int().min(30).max(3600).default(300),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
});

export type AppEnv = z.infer<typeof envSchema>;

let cachedEnv: AppEnv | null = null;

export function getEnv() {
  if (!cachedEnv) {
    cachedEnv = envSchema.parse(process.env);
  }

  return cachedEnv;
}

