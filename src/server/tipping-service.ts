import { RoundStatus } from "@prisma/client";
import { redirect } from "next/navigation";

import { FAMILY_MEMBERS, TEAM_SHORT_NAMES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { absoluteDifference, sortByDateAsc } from "@/lib/utils";
import { fetchSeasonGames } from "@/server/squiggle";

let lastSyncAt = 0;
let syncPromise: Promise<{ stale: boolean; error?: string }> | null = null;

function teamShortName(team: string) {
  return TEAM_SHORT_NAMES[team] ?? team.slice(0, 3).toUpperCase();
}

function roundStatusFor(matches: { startsAt: Date; complete: number }[], now: Date) {
  if (matches.every((match) => match.complete >= 100)) {
    return RoundStatus.COMPLETE;
  }

  const firstMatchAt = matches[0]?.startsAt;

  if (firstMatchAt && firstMatchAt <= now) {
    return RoundStatus.IN_PROGRESS;
  }

  return RoundStatus.UPCOMING;
}

async function computeAndStoreWeeklyWinners() {
  const completeRounds = await prisma.round.findMany({
    where: {
      status: RoundStatus.COMPLETE,
    },
    include: {
      matches: {
        include: {
          tips: {
            include: {
              member: true,
            },
          },
        },
        orderBy: {
          startsAt: "asc",
        },
      },
      marginTips: {
        include: {
          member: true,
        },
      },
    },
    orderBy: [
      { year: "asc" },
      { number: "asc" },
    ],
  });

  for (const round of completeRounds) {
    const memberRows = FAMILY_MEMBERS.map((member) => ({
      slug: member.slug,
      name: member.name,
      correctTips: 0,
      marginGuess: round.marginTips.find((tip) => tip.member.slug === member.slug)?.guess ?? null,
      marginError: null as number | null,
    }));

    for (const match of round.matches) {
      if (!match.winnerTeam) {
        continue;
      }

      for (const row of memberRows) {
        const tip = match.tips.find((entry) => entry.member.slug === row.slug);
        if (tip?.selectedTeam === match.winnerTeam) {
          row.correctTips += 1;
        }
      }
    }

    const firstMatch = round.matches[0];
    const actualMargin =
      firstMatch?.winnerTeam && firstMatch.homeScore !== null && firstMatch.awayScore !== null
        ? Math.abs(firstMatch.homeScore - firstMatch.awayScore)
        : null;

    if (actualMargin !== null) {
      for (const row of memberRows) {
        row.marginError = absoluteDifference(row.marginGuess, actualMargin);
      }
    }

    const ranked = [...memberRows].sort((left, right) => {
      return (
        right.correctTips - left.correctTips ||
        (left.marginError ?? Number.POSITIVE_INFINITY) -
          (right.marginError ?? Number.POSITIVE_INFINITY) ||
        left.name.localeCompare(right.name)
      );
    });

    const leader = ranked[0];
    const winnerRows = ranked.filter((row) => {
      return (
        row.correctTips === leader.correctTips &&
        (row.marginError ?? Number.POSITIVE_INFINITY) ===
          (leader.marginError ?? Number.POSITIVE_INFINITY)
      );
    });

    await prisma.weeklyWin.upsert({
      where: {
        roundId: round.id,
      },
      update: {
        winnerSlugs: winnerRows.map((row) => row.slug),
        winnerNames: winnerRows.map((row) => row.name),
        points: leader.correctTips,
        correctTips: leader.correctTips,
        marginError: leader.marginError,
        marginBonusAwarded: actualMargin !== null,
        computedAt: new Date(),
      },
      create: {
        roundId: round.id,
        winnerSlugs: winnerRows.map((row) => row.slug),
        winnerNames: winnerRows.map((row) => row.name),
        points: leader.correctTips,
        correctTips: leader.correctTips,
        marginError: leader.marginError,
        marginBonusAwarded: actualMargin !== null,
      },
    });
  }
}

export async function ensureDataFresh(force = false) {
  const intervalMs = Number(process.env.DATA_SYNC_INTERVAL_SECONDS ?? "300") * 1000;

  if (!force && Date.now() - lastSyncAt < intervalMs) {
    return { stale: false as const };
  }

  if (!force && syncPromise) {
    return syncPromise;
  }

  syncPromise = (async () => {
    try {
      const games = await fetchSeasonGames();
      const grouped = new Map<number, typeof games>();

      for (const game of games) {
        const list = grouped.get(game.round) ?? [];
        list.push(game);
        grouped.set(game.round, list);
      }

      await prisma.$transaction(async (tx) => {
        for (const [roundNumber, group] of [...grouped.entries()].sort((a, b) => a[0] - b[0])) {
          const ordered = sortByDateAsc(group, (item) => new Date(item.unixtime * 1000));
          const startsAt = new Date(ordered[0].unixtime * 1000);
          const endsAt = new Date(ordered[ordered.length - 1].unixtime * 1000);
          const status = roundStatusFor(
            ordered.map((item) => ({
              startsAt: new Date(item.unixtime * 1000),
              complete: item.complete,
            })),
            new Date(),
          );

          const round = await tx.round.upsert({
            where: {
              year_number: {
                year: ordered[0].year,
                number: roundNumber,
              },
            },
            update: {
              name: ordered[0].roundname,
              startsAt,
              endsAt,
              firstMatchAt: startsAt,
              status,
              syncedAt: new Date(),
            },
            create: {
              year: ordered[0].year,
              number: roundNumber,
              name: ordered[0].roundname,
              startsAt,
              endsAt,
              firstMatchAt: startsAt,
              status,
              syncedAt: new Date(),
            },
          });

          for (const game of ordered) {
            const winnerTeam =
              game.complete >= 100 && game.winner
                ? game.winner
                : null;

            await tx.match.upsert({
              where: {
                externalId: game.id,
              },
              update: {
                roundId: round.id,
                year: game.year,
                roundNumber: roundNumber,
                startsAt: new Date(game.unixtime * 1000),
                venue: game.venue,
                homeTeam: game.hteam!,
                awayTeam: game.ateam!,
                homeTeamShort: teamShortName(game.hteam!),
                awayTeamShort: teamShortName(game.ateam!),
                homeScore: game.hscore,
                awayScore: game.ascore,
                complete: game.complete,
                winnerTeam,
                winnerTeamShort: winnerTeam ? teamShortName(winnerTeam) : null,
                stateLabel: game.timestr,
                isFinal: game.is_final > 0 || game.is_grand_final > 0,
                updatedAt: new Date(game.updated),
              },
              create: {
                externalId: game.id,
                roundId: round.id,
                year: game.year,
                roundNumber,
                startsAt: new Date(game.unixtime * 1000),
                venue: game.venue,
                homeTeam: game.hteam!,
                awayTeam: game.ateam!,
                homeTeamShort: teamShortName(game.hteam!),
                awayTeamShort: teamShortName(game.ateam!),
                homeScore: game.hscore,
                awayScore: game.ascore,
                complete: game.complete,
                winnerTeam,
                winnerTeamShort: winnerTeam ? teamShortName(winnerTeam) : null,
                stateLabel: game.timestr,
                isFinal: game.is_final > 0 || game.is_grand_final > 0,
                updatedAt: new Date(game.updated),
              },
            });
          }
        }
      });

      await computeAndStoreWeeklyWinners();
      lastSyncAt = Date.now();
      return { stale: false as const };
    } catch (error) {
      const existing = await prisma.round.count();

      if (!existing) {
        throw error;
      }

      return {
        stale: true as const,
        error: error instanceof Error ? error.message : "Unable to refresh AFL data.",
      };
    } finally {
      syncPromise = null;
    }
  })();

  return syncPromise;
}

export async function getCurrentRoundBundle(memberSlug?: string) {
  const sync = await ensureDataFresh();
  const now = new Date();
  const rounds = await prisma.round.findMany({
    include: {
      matches: {
        include: {
          tips: {
            include: {
              member: true,
            },
          },
        },
        orderBy: {
          startsAt: "asc",
        },
      },
      marginTips: {
        include: {
          member: true,
        },
      },
      weeklyWin: true,
    },
    orderBy: [
      { year: "asc" },
      { number: "asc" },
    ],
  });

  const currentRound =
    rounds.find((round) => round.status === RoundStatus.IN_PROGRESS) ??
    rounds.find((round) => round.status === RoundStatus.UPCOMING) ??
    rounds[rounds.length - 1];

  if (!currentRound) {
    throw new Error("No AFL round data is available.");
  }

  const locked = now >= currentRound.firstMatchAt;
  const lastCompletedRound = [...rounds]
    .filter((round) => round.status === RoundStatus.COMPLETE && round.id !== currentRound.id && round.weeklyWin)
    .at(-1);

  const selectedMember =
    memberSlug
      ? await prisma.member.findUnique({
          where: {
            slug: memberSlug,
          },
        })
      : null;

  const memberTipMap = new Map<string, string>();
  const tipVisibility = locked;

  if (selectedMember) {
    for (const match of currentRound.matches) {
      const ownTip = match.tips.find((tip) => tip.memberId === selectedMember.id);
      if (ownTip) {
        memberTipMap.set(match.id, ownTip.selectedTeam);
      }
    }
  }

  const ownMarginTip = selectedMember
    ? currentRound.marginTips.find((tip) => tip.memberId === selectedMember.id)?.guess ?? null
    : null;

  const leaderboard = await getRoundLeaderboard(currentRound.id);

  return {
    sync,
    currentRound: {
      id: currentRound.id,
      year: currentRound.year,
      number: currentRound.number,
      name: currentRound.name,
      startsAt: currentRound.startsAt,
      firstMatchAt: currentRound.firstMatchAt,
      locked,
      status: currentRound.status,
      matches: currentRound.matches.map((match) => ({
        id: match.id,
        startsAt: match.startsAt,
        venue: match.venue,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        homeTeamShort: match.homeTeamShort,
        awayTeamShort: match.awayTeamShort,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        complete: match.complete,
        winnerTeam: match.winnerTeam,
        stateLabel: match.stateLabel,
        ownTip: memberTipMap.get(match.id) ?? null,
        visibleTips: tipVisibility
          ? match.tips
              .map((tip) => ({
                memberSlug: tip.member.slug,
                memberName: tip.member.name,
                selectedTeam: tip.selectedTeam,
                selectedShort: tip.selectedShort,
                isCorrect: match.winnerTeam ? tip.selectedTeam === match.winnerTeam : null,
              }))
              .sort(
                (left, right) =>
                  FAMILY_MEMBERS.findIndex((member) => member.slug === left.memberSlug) -
                  FAMILY_MEMBERS.findIndex((member) => member.slug === right.memberSlug),
              )
          : [],
      })),
      ownMarginTip,
    },
    lastWeekWinner: lastCompletedRound?.weeklyWin
      ? {
          roundName: lastCompletedRound.name,
          winnerNames: lastCompletedRound.weeklyWin.winnerNames,
          points: lastCompletedRound.weeklyWin.points,
        }
      : null,
    leaderboard,
    visibility: {
      showAllTips: tipVisibility,
      allowEditing: !locked && !sync.stale,
    },
  };
}

export async function getRoundLeaderboard(roundId: string) {
  const [members, round] = await Promise.all([
    prisma.member.findMany({
      orderBy: {
        name: "asc",
      },
    }),
    prisma.round.findUniqueOrThrow({
      where: {
        id: roundId,
      },
      include: {
        matches: {
          include: {
            tips: {
              include: {
                member: true,
              },
            },
          },
          orderBy: {
            startsAt: "asc",
          },
        },
        marginTips: true,
      },
    }),
  ]);

  const firstMatch = round.matches[0];
  const actualMargin =
    firstMatch?.winnerTeam && firstMatch.homeScore !== null && firstMatch.awayScore !== null
      ? Math.abs(firstMatch.homeScore - firstMatch.awayScore)
      : null;

  const rows = members.map((member) => {
    const correctTips = round.matches.reduce((total, match) => {
      if (!match.winnerTeam) {
        return total;
      }

      const tip = match.tips.find((entry) => entry.memberId === member.id);
      return total + (tip?.selectedTeam === match.winnerTeam ? 1 : 0);
    }, 0);

    const marginGuess = round.marginTips.find((tip) => tip.memberId === member.id)?.guess ?? null;

    return {
      memberSlug: member.slug,
      memberName: member.name,
      correctTips,
      marginGuess,
      marginError: absoluteDifference(marginGuess, actualMargin),
    };
  });

  return rows
    .map((row) => ({
      ...row,
      totalPoints: row.correctTips,
    }))
    .sort((left, right) => {
      return (
        right.totalPoints - left.totalPoints ||
        (left.marginError ?? Number.POSITIVE_INFINITY) -
          (right.marginError ?? Number.POSITIVE_INFINITY) ||
        left.memberName.localeCompare(right.memberName)
      );
    })
    .map((row, index) => ({
      rank: index + 1,
      ...row,
    }));
}

export async function saveCurrentRoundTips(input: {
  memberSlug: string;
  roundId: string;
  marginGuess: number;
  tips: {
    matchId: string;
    selectedTeam: string;
  }[];
}) {
  const member = await prisma.member.findUniqueOrThrow({
    where: {
      slug: input.memberSlug,
    },
  });

  const round = await prisma.round.findUniqueOrThrow({
    where: {
      id: input.roundId,
    },
    include: {
      matches: {
        orderBy: {
          startsAt: "asc",
        },
      },
    },
  });

  if (new Date() >= round.firstMatchAt) {
    throw new Error("Tips are locked once the first game of the round starts.");
  }

  const validTeamsByMatchId = new Map(
    round.matches.map((match) => [match.id, [match.homeTeam, match.awayTeam]]),
  );

  if (input.tips.length !== round.matches.length) {
    throw new Error("You need to tip every game in the round.");
  }

  if (new Set(input.tips.map((tip) => tip.matchId)).size !== round.matches.length) {
    throw new Error("Each match must be tipped once.");
  }

  for (const tip of input.tips) {
    const teams = validTeamsByMatchId.get(tip.matchId);
    if (!teams || !teams.includes(tip.selectedTeam)) {
      throw new Error("One of the selected teams is not valid for this round.");
    }
  }

  await prisma.$transaction(async (tx) => {
    for (const tip of input.tips) {
      await tx.tip.upsert({
        where: {
          memberId_matchId: {
            memberId: member.id,
            matchId: tip.matchId,
          },
        },
        update: {
          selectedTeam: tip.selectedTeam,
          selectedShort: teamShortName(tip.selectedTeam),
        },
        create: {
          memberId: member.id,
          matchId: tip.matchId,
          selectedTeam: tip.selectedTeam,
          selectedShort: teamShortName(tip.selectedTeam),
        },
      });
    }

    await tx.marginTip.upsert({
      where: {
        memberId_roundId: {
          memberId: member.id,
          roundId: round.id,
        },
      },
      update: {
        guess: input.marginGuess,
      },
      create: {
        memberId: member.id,
        roundId: round.id,
        guess: input.marginGuess,
      },
    });
  });
}

export async function getWinnerArchive() {
  await ensureDataFresh();

  const rounds = await prisma.round.findMany({
    where: {
      weeklyWin: {
        isNot: null,
      },
    },
    include: {
      weeklyWin: true,
    },
    orderBy: [
      { year: "desc" },
      { number: "desc" },
    ],
  });

  return rounds
    .filter((round) => round.weeklyWin)
    .map((round) => ({
      ...round.weeklyWin!,
      round,
    }));
}

export async function getMemberOrRedirect(slug: string | null) {
  if (!slug) {
    redirect("/login");
  }

  const member = await prisma.member.findUnique({
    where: {
      slug,
    },
  });

  if (!member) {
    redirect("/login");
  }

  return member;
}
