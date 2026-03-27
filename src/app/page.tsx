import Link from "next/link";
import { cookies } from "next/headers";

import { HomeOverview } from "@/components/home/home-overview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  let data:
    | Awaited<ReturnType<typeof getCurrentRoundBundle>>
    | null = null;
  let loadError: string | null = null;

  try {
    data = await getCurrentRoundBundle(member.slug);
  } catch (error) {
    loadError = error instanceof Error ? error.message : "Unknown data error.";
  }

  return (
    <SiteShell memberName={member.name} pathname="/">
      {data ? (
        <HomeOverview
          memberName={member.name}
          currentRound={data.currentRound}
          lastWeekWinner={data.lastWeekWinner}
          allowEditing={data.visibility.allowEditing}
          stale={data.sync.stale}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Live AFL data is not loading right now</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-6 text-[#c5d0db]">
              The site is up, but the AFL fixture feed did not return usable data from this server yet.
            </p>
            <p className="text-sm leading-6 text-[#ffb8b8]">
              {loadError ?? "Unknown data error."}
            </p>
          </CardContent>
        </Card>
      )}
    </SiteShell>
  );
}
