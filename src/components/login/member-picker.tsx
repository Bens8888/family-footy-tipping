"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FAMILY_MEMBERS } from "@/lib/constants";

export function MemberPicker() {
  const router = useRouter();
  const [selected, setSelected] = useState<string>(FAMILY_MEMBERS[0].slug);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleContinue() {
    setPending(true);
    setError(null);

    const response = await fetch("/api/session/select-member", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ memberSlug: selected }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? "Could not open your tipping page.");
      setPending(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-4 py-6">
      <Card className="w-full">
        <CardHeader>
          <div className="text-xs uppercase tracking-[0.2em] text-[#89a0b7]">Family Footy Tips</div>
          <CardTitle className="mt-3 text-3xl">Who are you?</CardTitle>
          <CardDescription>Pick your name and jump straight into this week’s AFL tips.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {FAMILY_MEMBERS.map((member) => (
            <button
              key={member.slug}
              type="button"
              onClick={() => setSelected(member.slug)}
              className={`w-full rounded-[24px] border px-5 py-4 text-left text-lg font-semibold transition ${
                selected === member.slug
                  ? "border-[#20b26f] bg-[#143223] text-white"
                  : "border-[#243445] bg-[#111b26] text-white"
              }`}
            >
              {member.name}
            </button>
          ))}

          {error ? <p className="text-sm text-[#ff8f8f]">{error}</p> : null}

          <Button className="mt-2 w-full" size="lg" onClick={handleContinue} disabled={pending}>
            {pending ? "Opening..." : "Enter"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

