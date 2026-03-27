import { cookies } from "next/headers";

import { WinnersArchive } from "@/components/home/winners-archive";
import { SiteShell } from "@/components/layout/site-shell";
import { MEMBER_COOKIE_NAME } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { getWinnerArchive } from "@/server/tipping-service";

export const metadata = {
  title: "Winners",
};

export const dynamic = "force-dynamic";

export default async function WinnersPage() {
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

  const winners = await getWinnerArchive();

  return (
    <SiteShell memberName={member.name} pathname="/winners">
      <WinnersArchive
        winners={winners.map((winner) => ({
          id: winner.id,
          roundName: winner.round.name,
          roundNumber: winner.round.number,
          winnerNames: winner.winnerNames,
          points: winner.points,
          correctTips: winner.correctTips,
          marginError: winner.marginError,
        }))}
      />
    </SiteShell>
  );
}

