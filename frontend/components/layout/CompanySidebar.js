// frontend/components/layout/CompanySidebar.js

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import CrisMark from "@/components/layout/CrisMark";

const navigation = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "⌂",
  },
  {
    label: "Applications",
    href: "/dashboard/applications",
    icon: "◫",
  },
  {
    label: "Candidates",
    href: "/dashboard/candidates",
    icon: "♙",
  },
  {
    label: "Onboarding",
    href: "/dashboard/onboarding",
    icon: "✓",
  },
  {
    label: "Background Checks",
    href: "/dashboard/background-checks",
    icon: "◇",
  },
  {
    label: "Documents",
    href: "/dashboard/documents",
    icon: "▤",
  },
  {
    label: "Reports",
    href: "/dashboard/reports",
    icon: "⌁",
  },
];

export default function CompanySidebar() {
  const pathname = usePathname();

  function isActive(href) {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname.startsWith(href);
  }

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[260px] border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="flex h-[72px] items-center border-b border-slate-100 px-7">
          <Link href="/dashboard">
            <CrisMark />
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Company workspace
          </div>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    active
                      ? "flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700"
                      : "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                  }
                >
                  <span
                    className={
                      active
                        ? "flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600"
                        : "flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500"
                    }
                  >
                    {item.icon}
                  </span>

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-slate-100 p-4">
          <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-emerald-50 p-4">
            <div className="text-sm font-semibold text-slate-900">
              Cris Secure Workspace
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-600">
              Candidate onboarding, identity verification and background-check
              workflows in one place.
            </p>
          </div>
        </div>
      </aside>

      <div className="fixed left-4 top-[18px] z-[60] lg:hidden">
        <Link href="/dashboard">
          <CrisMark compact />
        </Link>
      </div>
    </>
  );
}