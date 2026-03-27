import { cookies } from "next/headers";

import { CompetitionView } from "@/components/competition/competition-view";
import { SiteShell } from "@/components/layout/site-shell";
import { MEMBER_COOKIE_NAME } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { getCurrentRoundBundle } from "@/server/tipping-service";

export const metadata = {
  title: "Competition",
};

export const dynamic = "force-dynamic";

export default async function CompetitionPage() {
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
    <SiteShell memberName={member.name} pathname="/competition">
      <CompetitionView
        currentRound={data.currentRound}
        leaderboard={data.leaderboard}
        lastWeekWinner={data.lastWeekWinner}
        showAllTips={data.visibility.showAllTips}
      />
    </SiteShell>
  );
}

