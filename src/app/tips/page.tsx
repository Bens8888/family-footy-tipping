import { cookies } from "next/headers";

import { SiteShell } from "@/components/layout/site-shell";
import { TipsForm } from "@/components/tips/tips-form";
import { MEMBER_COOKIE_NAME } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { getCurrentRoundBundle } from "@/server/tipping-service";

export const metadata = {
  title: "Tips",
};

export const dynamic = "force-dynamic";

export default async function TipsPage() {
  const memberSlug = (await cookies()).get(MEMBER_COOKIE_NAME)?.value ?? null;
  const member = memberSlug
    ? await prisma.member.findUnique({
        where: {
          slug: memberSlug,
        },
      })
    : null;

  if (!member) {
    return null;
  }

  const data = await getCurrentRoundBundle(member.slug);

  return (
    <SiteShell memberName={member.name} pathname="/tips">
      <TipsForm
        roundId={data.currentRound.id}
        roundName={data.currentRound.name}
        locked={data.currentRound.locked}
        stale={data.sync.stale}
        initialMarginGuess={data.currentRound.ownMarginTip}
        matches={data.currentRound.matches}
      />
    </SiteShell>
  );
}

