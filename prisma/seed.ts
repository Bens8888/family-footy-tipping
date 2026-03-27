import { prisma } from "@/lib/prisma";
import { FAMILY_MEMBERS } from "@/lib/constants";

async function main() {
  for (const member of FAMILY_MEMBERS) {
    await prisma.member.upsert({
      where: {
        slug: member.slug,
      },
      update: {
        name: member.name,
      },
      create: {
        slug: member.slug,
        name: member.name,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
