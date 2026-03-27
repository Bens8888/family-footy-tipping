import Link from "next/link";
import { cookies } from "next/headers";

import { HomeOverview } from "@/components/home/home-overview";
import { Button } from "@/components/ui/button";
import { SiteShell } from "@/components/layout/site-shell";
import { MEMBER_COOKIE_NAME } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { getCurrentRoundBundle } from "@/server/tipping-service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const memberSlug = (await cookies()).get(MEMBER_COOKIE_NAME)?.value ?? null;
  const member = memberSlug
    ? await prisma.member.findUnique({
        where: {
          slug: memberSlug,
        },
      })
    : null;

  if (!member) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md items-center px-4">
        <div className="w-full rounded-[28px] border border-[#243445] bg-[#0c1520] p-6 text-center">
          <div className="text-2xl font-semibold">Pick your name to start tipping</div>
          <Link href="/login" className="mt-4 block">
            <Button className="w-full">Go to login</Button>
          </Link>
        </div>
      </div>
    );
  }

  const data = await getCurrentRoundBundle(member.slug);

  return (
    <SiteShell memberName={member.name} pathname="/">
      <HomeOverview
        memberName={member.name}
        currentRound={data.currentRound}
        lastWeekWinner={data.lastWeekWinner}
        allowEditing={data.visibility.allowEditing}
        stale={data.sync.stale}
      />
    </SiteShell>
  );
}

