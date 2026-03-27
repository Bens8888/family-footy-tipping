import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { FAMILY_MEMBERS, MEMBER_COOKIE_NAME, type FamilyMemberSlug } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export async function getSelectedMemberSlug(): Promise<FamilyMemberSlug | null> {
  const store = await cookies();
  const value = store.get(MEMBER_COOKIE_NAME)?.value;

  if (!value) {
    return null;
  }

  return FAMILY_MEMBERS.some((member) => member.slug === value) ? (value as FamilyMemberSlug) : null;
}

export async function requireSelectedMember() {
  const slug = await getSelectedMemberSlug();

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

