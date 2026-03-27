import Link from "next/link";
import { Home, ListChecks, Trophy, UserRound } from "lucide-react";

import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

type SiteShellProps = {
  memberName: string;
  pathname: string;
  children: React.ReactNode;
};

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/tips", label: "Tips", icon: ListChecks },
  { href: "/competition", label: "Comp", icon: Trophy },
  { href: "/winners", label: "Winners", icon: UserRound },
];

export function SiteShell({ memberName, pathname, children }: SiteShellProps) {
  return (
    <div className="min-h-screen bg-[#08111a] text-white">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-4">
        <header className="rounded-[28px] border border-[#243445] bg-[#0c1520] px-5 py-4">
          <div className="text-xs uppercase tracking-[0.2em] text-[#89a0b7]">{APP_NAME}</div>
          <div className="mt-2 flex items-end justify-between gap-3">
            <div>
              <div className="text-2xl font-semibold">Hi {memberName}</div>
              <div className="mt-1 text-sm text-[#9fb0c2]">Simple AFL tipping for the family.</div>
            </div>
            <Link href="/login" className="text-sm font-semibold text-[#7ce5b2]">
              Switch
            </Link>
          </div>
        </header>

        <main className="flex-1 py-4">{children}</main>

        <nav className="sticky bottom-4 mt-3 grid grid-cols-4 gap-2 rounded-[28px] border border-[#243445] bg-[#0c1520]/95 p-2 backdrop-blur">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-xs font-semibold text-[#91a5ba]",
                  active && "bg-[#1a2635] text-white",
                )}
              >
                <Icon className={cn("h-4 w-4", active && "text-[#7ce5b2]")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

