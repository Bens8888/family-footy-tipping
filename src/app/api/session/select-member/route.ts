import { cookies } from "next/headers";

import { jsonError, jsonOk } from "@/lib/http";
import { MEMBER_COOKIE_NAME } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { selectMemberSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const payload = selectMemberSchema.parse(await request.json());
    const member = await prisma.member.findUnique({
      where: {
        slug: payload.memberSlug,
      },
    });

    if (!member) {
      return jsonError("That family member was not found.", 404);
    }

    (await cookies()).set(MEMBER_COOKIE_NAME, member.slug, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 120,
    });

    return jsonOk({ ok: true });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Could not choose that member.");
  }
}

