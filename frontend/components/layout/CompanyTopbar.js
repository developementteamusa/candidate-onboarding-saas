"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  getCurrentUser,
  logout,
} from "@/lib/api";


function getPageLabel(
  pathname
) {
  if (
    pathname.startsWith(
      "/dashboard/applications"
    )
  ) {
    if (
      pathname.includes(
        "/drivers-license"
      )
    ) {
      return "Driver's License Verification";
    }

    if (
      pathname.includes(
        "/background-check"
      )
    ) {
      return "Background Check";
    }

    return "Applications";
  }


  if (
    pathname.startsWith(
      "/dashboard/candidates"
    )
  ) {
    return "Candidates";
  }


  if (
    pathname.startsWith(
      "/dashboard/onboarding"
    )
  ) {
    return "Onboarding";
  }


  if (
    pathname.startsWith(
      "/dashboard/background-checks"
    )
  ) {
    return "Background Checks";
  }


  if (
    pathname.startsWith(
      "/dashboard/documents"
    )
  ) {
    return "Documents";
  }


  if (
    pathname.startsWith(
      "/dashboard/reports"
    )
  ) {
    return "Reports";
  }


  return "Dashboard";
}


export default function CompanyTopbar() {
  const pathname =
    usePathname();

  const router =
    useRouter();


  const pageLabel =
    getPageLabel(
      pathname
    );


  const [
    currentUser,
    setCurrentUser,
  ] = useState(null);

  const [
    userLoading,
    setUserLoading,
  ] = useState(true);

  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  const [
    signingOut,
    setSigningOut,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  /* =====================================================
     LOAD AUTHENTICATED USER
  ====================================================== */

  useEffect(() => {
    let active = true;


    async function loadUser() {
      try {
        const user =
          await getCurrentUser();


        if (!active) {
          return;
        }


        setCurrentUser(
          user
        );

      } catch (err) {
        if (!active) {
          return;
        }


        setError(
          err?.message ||
            "Unable to load account information."
        );

      } finally {
        if (active) {
          setUserLoading(
            false
          );
        }
      }
    }


    loadUser();


    return () => {
      active = false;
    };
  }, []);


  /* =====================================================
     DERIVED USER VALUES
  ====================================================== */

  const displayName =
    useMemo(
      () => {
        if (!currentUser) {
          return "Company User";
        }


        const fullName =
          [
            currentUser.first_name,
            currentUser.last_name,
          ]
            .filter(Boolean)
            .join(" ")
            .trim();


        return (
          fullName ||
          currentUser.email ||
          "Company User"
        );
      },
      [
        currentUser,
      ]
    );


  const displayRole =
    useMemo(
      () =>
        formatRole(
          currentUser?.role
        ),
      [
        currentUser,
      ]
    );


  const initials =
    useMemo(
      () =>
        getInitials(
          displayName
        ),
      [
        displayName,
      ]
    );


  /* =====================================================
     SIGN OUT
  ====================================================== */

  async function handleSignOut() {
    if (signingOut) {
      return;
    }


    setSigningOut(
      true
    );

    setError("");


    try {
      await logout();


      router.replace(
        "/login"
      );

      router.refresh();

    } catch (err) {
      setError(
        err?.message ||
          "Unable to sign out."
      );

      setSigningOut(
        false
      );
    }
  }


  return (
    <header className="sticky top-0 z-30 h-[72px] border-b border-slate-200 bg-white/95 backdrop-blur-xl">

      <div className="flex h-full items-center justify-between px-5 sm:px-7 lg:px-9">

        {/* =================================================
            LEFT
        ================================================== */}

        <div className="pl-14 lg:pl-0">

          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
            Company Portal
          </p>

          <h1 className="mt-0.5 text-lg font-semibold text-slate-950">
            {pageLabel}
          </h1>

        </div>


        {/* =================================================
            GLOBAL SEARCH
        ================================================== */}

        <div className="mx-8 hidden max-w-md flex-1 xl:block">

          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5">

            <span className="mr-3 text-slate-400">
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search candidates, applications..."
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />

          </div>

        </div>


        {/* =================================================
            RIGHT
        ================================================== */}

        <div className="relative flex items-center gap-3">

          {/* NOTIFICATIONS */}

          <button
            type="button"
            aria-label="Notifications"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
          >
            ◇
          </button>


          <div className="hidden h-8 w-px bg-slate-200 sm:block" />


          {/* =================================================
              AUTHENTICATED USER
          ================================================== */}

          <button
            type="button"
            onClick={() =>
              setMenuOpen(
                (current) =>
                  !current
              )
            }
            className="flex items-center gap-3 rounded-xl px-2 py-1.5 text-left transition hover:bg-slate-50"
          >

            {/* AVATAR */}

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-emerald-100 text-sm font-bold uppercase text-slate-700">

              {userLoading
                ? "..."
                : initials}

            </div>


            {/* USER DETAILS */}

            <div className="hidden min-w-0 sm:block">

              <div className="max-w-[180px] truncate text-sm font-semibold text-slate-900">

                {userLoading
                  ? "Loading..."
                  : displayName}

              </div>


              <div className="max-w-[180px] truncate text-xs text-slate-400">

                {userLoading
                  ? "Company account"
                  : displayRole}

              </div>

            </div>


            <span
              className={`hidden text-xs text-slate-400 transition-transform sm:block ${
                menuOpen
                  ? "rotate-180"
                  : ""
              }`}
            >
              ▾
            </span>

          </button>


          {/* =================================================
              DROPDOWN
          ================================================== */}

          {menuOpen && (
            <div className="absolute right-0 top-[54px] z-50 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">

              {/* USER HEADER */}

              <div className="border-b border-slate-100 px-4 py-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-emerald-100 text-sm font-bold uppercase text-slate-700">
                    {initials}
                  </div>


                  <div className="min-w-0">

                    <p className="truncate text-sm font-semibold text-slate-900">
                      {displayName}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {
                        currentUser?.email ||
                        "Company account"
                      }
                    </p>

                  </div>

                </div>


                <div className="mt-3">

                  <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700">
                    {displayRole}
                  </span>

                </div>

              </div>


              {/* MENU */}

              <div className="p-2">

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(
                      false
                    );

                    router.push(
                      "/dashboard"
                    );
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >

                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                    ⌂
                  </span>

                  <div>

                    <div>
                      Company dashboard
                    </div>

                    <div className="mt-0.5 text-xs font-normal text-slate-400">
                      Return to your workspace
                    </div>

                  </div>

                </button>


                <div className="my-2 border-t border-slate-100" />


                <button
                  type="button"
                  disabled={
                    signingOut
                  }
                  onClick={
                    handleSignOut
                  }
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
                    ↪
                  </span>


                  <div>

                    <div>
                      {signingOut
                        ? "Signing out..."
                        : "Sign out"}
                    </div>

                    {!signingOut && (
                      <div className="mt-0.5 text-xs font-normal text-red-400">
                        End this Cris session
                      </div>
                    )}

                  </div>

                </button>

              </div>


              {/* ERROR */}

              {error && (
                <div className="border-t border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600">
                  {error}
                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </header>
  );
}


/* =========================================================
   FORMAT ROLE
========================================================= */

function formatRole(
  role
) {
  if (!role) {
    return "Company User";
  }


  const labels = {
    COMPANY_OWNER:
      "Company Owner",

    COMPANY_ADMIN:
      "Company Administrator",

    ADMIN:
      "Administrator",

    HIRING_MANAGER:
      "Hiring Manager",

    RECRUITER:
      "Recruiter",

    REVIEWER:
      "Reviewer",
  };


  if (
    labels[role]
  ) {
    return labels[
      role
    ];
  }


  return role
    .replaceAll(
      "_",
      " "
    )
    .toLowerCase()
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}


/* =========================================================
   INITIALS
========================================================= */

function getInitials(
  value
) {
  if (!value) {
    return "CU";
  }


  const parts =
    value
      .trim()
      .split(/\s+/)
      .filter(Boolean);


  if (
    parts.length === 0
  ) {
    return "CU";
  }


  if (
    parts.length === 1
  ) {
    return parts[0]
      .slice(
        0,
        2
      )
      .toUpperCase();
  }


  return (
    `${parts[0][0]}${
      parts[
        parts.length - 1
      ][0]
    }`
  ).toUpperCase();
}