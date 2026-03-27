import { cookies } from "next/headers";

import { jsonError, jsonOk } from "@/lib/http";
import { MEMBER_COOKIE_NAME } from "@/lib/constants";
import { currentRoundTipSchema } from "@/lib/validations";
import { saveCurrentRoundTips } from "@/server/tipping-service";

export async function POST(request: Request) {
  try {
    const memberSlug = (await cookies()).get(MEMBER_COOKIE_NAME)?.value ?? null;

    if (!memberSlug) {
      return jsonError("Please choose your family member first.", 401);
    }

    const payload = currentRoundTipSchema.parse(await request.json());

    await saveCurrentRoundTips({
      memberSlug,
      roundId: payload.roundId,
      marginGuess: payload.marginGuess,
      tips: payload.tips,
    });

    return jsonOk({ ok: true });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not save tips.");
  }
}

