"use client";

import Link from "next/link";

import {
  usePathname,
} from "next/navigation";


const NAVIGATION = [
  {
    label:
      "Overview",

    href:
      "/candidate/onboarding",

    icon:
      "⌂",

    enabled:
      true,
  },

  {
    label:
      "Information",

    href:
      "/candidate/onboarding/information",

    icon:
      "▤",

    enabled:
      true,
  },

  {
    label:
      "Driver's License",

    href:
      "/candidate/onboarding/drivers-license",

    icon:
      "▣",

    enabled:
      true,
  },

  {
    label:
      "Photo Upload",

    href:
      "/candidate/onboarding/photo",

    icon:
      "◉",

    enabled:
      false,
  },

  {
    label:
      "Selfie Verification",

    href:
      "/candidate/onboarding/selfie",

    icon:
      "◎",

    enabled:
      false,
  },

  {
    label:
      "Background Check",

    href:
      "/candidate/onboarding/background-authorization",

    icon:
      "◇",

    enabled:
      true,
  },

  {
    label:
      "Legal Documents",

    href:
      "/candidate/onboarding/legal-documents",

    icon:
      "▧",

    enabled:
      false,
  },
];


export default function CandidateSidebar() {
  const pathname =
    usePathname();


  return (
    <aside className="fixed bottom-0 left-0 top-0 z-40 hidden w-[220px] border-r border-slate-200 bg-white lg:flex lg:flex-col">

      {/* =====================================================
          BRAND
      ====================================================== */}

      <div className="flex h-[72px] items-center border-b border-slate-200 px-5">

        <Link
          href="/candidate/onboarding"
          className="flex items-center gap-3"
        >

          {/* CRIS LOGO */}

          <div className="relative h-8 w-10">

            <div className="absolute left-0 top-1 h-7 w-7 rounded-full bg-blue-500" />

            <div className="absolute right-0 top-1 h-7 w-7 rounded-full bg-emerald-500/90" />

          </div>


          <span className="text-xl font-bold tracking-tight text-slate-950">
            Cris
          </span>

        </Link>

      </div>


      {/* =====================================================
          NAVIGATION
      ====================================================== */}

      <div className="flex-1 overflow-y-auto px-3 py-5">

        <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Candidate Workspace
        </p>


        <nav className="mt-4 space-y-1">

          {NAVIGATION.map(
            (item) => {
              const active =
                isActiveRoute(
                  pathname,
                  item.href
                );


              if (
                !item.enabled
              ) {
                return (
                  <div
                    key={
                      item.label
                    }
                    className="flex cursor-not-allowed items-center justify-between rounded-xl px-3 py-3 text-sm text-slate-400"
                  >

                    <div className="flex items-center gap-3">

                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-xs text-slate-400">
                        {item.icon}
                      </span>

                      <span>
                        {item.label}
                      </span>

                    </div>


                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                      Soon
                    </span>

                  </div>
                );
              }


              return (
                <Link
                  key={
                    item.label
                  }
                  href={
                    item.href
                  }
                  className={
                    active
                      ? "flex items-center gap-3 rounded-xl bg-emerald-50 px-3 py-3 text-sm font-semibold text-emerald-700 transition"
                      : "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                  }
                >

                  <span
                    className={
                      active
                        ? "flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-xs text-emerald-700"
                        : "flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-xs text-slate-500"
                    }
                  >
                    {item.icon}
                  </span>


                  <span>
                    {item.label}
                  </span>

                </Link>
              );
            }
          )}

        </nav>

      </div>


      {/* =====================================================
          FOOTER
      ====================================================== */}

      <div className="border-t border-slate-100 p-3">

        <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-blue-50 p-4">

          <p className="text-xs font-semibold text-slate-900">
            Cris Candidate Portal
          </p>

          <p className="mt-2 text-[11px] leading-5 text-slate-500">
            Complete your onboarding,
            securely upload documents,
            verify your identity, and
            track your progress.
          </p>

        </div>

      </div>

    </aside>
  );
}


/* =========================================================
   ACTIVE ROUTE
========================================================= */

function isActiveRoute(
  pathname,
  href
) {
  if (
    href ===
    "/candidate/onboarding"
  ) {
    return (
      pathname ===
      href
    );
  }


  return (
    pathname ===
      href ||
    pathname.startsWith(
      `${href}/`
    )
  );
}