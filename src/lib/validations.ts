import { z } from "zod";

import { FAMILY_MEMBERS } from "@/lib/constants";

const memberSlugs = FAMILY_MEMBERS.map((member) => member.slug) as [string, ...string[]];

export const selectMemberSchema = z.object({
  memberSlug: z.enum(memberSlugs),
});

export const currentRoundTipSchema = z.object({
  roundId: z.string().cuid(),
  marginGuess: z.coerce.number().int().min(0).max(120),
  tips: z
    .array(
      z.object({
        matchId: z.string().cuid(),
        selectedTeam: z.string().min(1),
      }),
    )
    .min(1),
});

