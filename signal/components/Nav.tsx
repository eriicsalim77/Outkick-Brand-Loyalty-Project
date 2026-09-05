"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { clearProfile } from "@/lib/storage";

const tabs = [
  { href: "/dashboard", label: "Today" },
  { href: "/knowledge", label: "Knowledge" },
];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="sticky top-0 z-10 border-b border-black/5 bg-paper/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/dashboard" className="flex items-center">
          <Logo />
        </Link>
        <div className="flex items-center gap-1 text-sm">
          {tabs.map((t) => {
            const active = pathname?.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={
                  "rounded-full px-3 py-1.5 transition " +
                  (active
                    ? "bg-ink text-paper"
                    : "text-ink-muted hover:text-ink")
                }
              >
                {t.label}
              </Link>
            );
          })}
          <button
            onClick={() => {
              clearProfile();
              router.push("/onboarding");
            }}
            className="ml-2 rounded-full px-3 py-1.5 text-ink-muted hover:text-ink"
          >
            Reset
          </button>
        </div>
      </div>
    </nav>
  );
}
