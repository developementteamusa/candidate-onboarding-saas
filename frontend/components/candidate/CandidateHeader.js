"use client";

import Link from "next/link";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  candidateLogout,
  getCurrentCandidate,
} from "@/lib/api";


export default function CandidateHeader() {
  const router =
    useRouter();

  const pathname =
    usePathname();

  const menuRef =
    useRef(null);


  const [
    candidate,
    setCandidate,
  ] = useState(null);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);


  const [
    signingOut,
    setSigningOut,
  ] = useState(false);


  /* =========================================================
     LOAD CURRENT CANDIDATE
  ========================================================= */

  useEffect(() => {
    let active = true;


    async function loadCandidate() {
      setLoading(true);


      try {
        const data =
          await getCurrentCandidate();


        if (!active) {
          return;
        }


        /*
         * Depending on the backend response model,
         * candidate may be returned directly or nested.
         */
        const currentCandidate =
          data?.candidate ||
          data ||
          null;


        setCandidate(
          currentCandidate
        );

      } catch (error) {
        /*
         * A 401 here simply means there is no
         * authenticated candidate session.
         */
        if (active) {
          setCandidate(
            null
          );
        }

      } finally {
        if (active) {
          setLoading(
            false
          );
        }
      }
    }


    loadCandidate();


    return () => {
      active = false;
    };

  }, [
    pathname,
  ]);


  /* =========================================================
     CLOSE MENU WHEN CLICKING OUTSIDE
  ========================================================= */

  useEffect(() => {
    function handleOutsideClick(
      event
    ) {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target
        )
      ) {
        setMenuOpen(
          false
        );
      }
    }


    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );


    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);


  /* =========================================================
     SIGN OUT
  ========================================================= */

  async function handleSignOut() {
    if (signingOut) {
      return;
    }


    setSigningOut(
      true
    );


    try {
      await candidateLogout();

    } catch (error) {
      /*
       * Even if the server reports that the session
       * has already expired, return the browser to
       * candidate login.
       */
      console.error(
        "Candidate logout:",
        error
      );

    } finally {
      setCandidate(
        null
      );

      setMenuOpen(
        false
      );

      setSigningOut(
        false
      );


      router.replace(
        "/candidate/login"
      );


      router.refresh();
    }
  }


  /* =========================================================
     DISPLAY DATA
  ========================================================= */

  const displayName =
    getCandidateDisplayName(
      candidate
    );


  const email =
    candidate?.email ||
    "";


  const initials =
    getInitials(
      displayName
    );


  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">

      <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">

        {/* =====================================================
            CRIS LOGO
        ====================================================== */}

        <Link
          href={
            candidate
              ? "/candidate/onboarding"
              : "/candidate/login"
          }
          className="group flex items-center gap-3"
          aria-label={
            candidate
              ? "Return to candidate onboarding"
              : "Return to candidate login"
          }
        >

          <div className="relative h-8 w-10">

            <div className="absolute left-0 top-1 h-7 w-7 rounded-full bg-blue-500 transition-transform group-hover:-translate-x-0.5" />

            <div className="absolute right-0 top-1 h-7 w-7 rounded-full bg-emerald-500/90 transition-transform group-hover:translate-x-0.5" />

          </div>


          <span className="text-xl font-bold tracking-tight text-slate-950">
            Cris
          </span>

        </Link>


        {/* =====================================================
            RIGHT SIDE
        ====================================================== */}

        <div className="flex items-center">

          {/* LOADING */}

          {loading && (
            <div className="flex items-center gap-3">

              <div className="h-10 w-10 animate-pulse rounded-full bg-slate-100" />

              <div className="hidden space-y-2 sm:block">

                <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />

                <div className="h-2 w-16 animate-pulse rounded bg-slate-100" />

              </div>

            </div>
          )}


          {/* =================================================
              LOGGED-IN CANDIDATE
          ================================================== */}

          {!loading &&
            candidate && (

              <div
                ref={
                  menuRef
                }
                className="relative"
              >

                <button
                  type="button"
                  onClick={() =>
                    setMenuOpen(
                      (current) =>
                        !current
                    )
                  }
                  className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-slate-50"
                  aria-expanded={
                    menuOpen
                  }
                >

                  {/* AVATAR */}

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                    {initials}
                  </div>


                  {/* NAME */}

                  <div className="hidden text-left sm:block">

                    <p className="max-w-[180px] truncate text-sm font-semibold text-slate-900">
                      {displayName}
                    </p>


                    <p className="text-xs text-slate-400">
                      Candidate
                    </p>

                  </div>


                  {/* ARROW */}

                  <span
                    className={`hidden text-xs text-slate-400 transition-transform sm:inline ${
                      menuOpen
                        ? "rotate-180"
                        : ""
                    }`}
                  >
                    ▾
                  </span>

                </button>


                {/* =============================================
                    DROPDOWN
                ============================================== */}

                {menuOpen && (

                  <div className="absolute right-0 top-[54px] w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">

                    {/* ACCOUNT */}

                    <div className="border-b border-slate-100 px-4 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                          {initials}
                        </div>


                        <div className="min-w-0">

                          <p className="truncate text-sm font-semibold text-slate-900">
                            {displayName}
                          </p>


                          {email && (
                            <p className="mt-0.5 truncate text-xs text-slate-500">
                              {email}
                            </p>
                          )}

                        </div>

                      </div>

                    </div>


                    {/* MENU */}

                    <div className="p-2">

                      {/* ONBOARDING */}

                      <Link
                        href="/candidate/onboarding"
                        onClick={() =>
                          setMenuOpen(
                            false
                          )
                        }
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >

                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                          ✓
                        </span>


                        <div>

                          <p>
                            Candidate onboarding
                          </p>


                          <p className="mt-0.5 text-xs font-normal text-slate-400">
                            Return to your workspace
                          </p>

                        </div>

                      </Link>


                      <div className="my-2 border-t border-slate-100" />


                      {/* SIGN OUT */}

                      <button
                        type="button"
                        onClick={
                          handleSignOut
                        }
                        disabled={
                          signingOut
                        }
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >

                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
                          ↪
                        </span>


                        <div>

                          <p>
                            {signingOut
                              ? "Signing out..."
                              : "Sign out"}
                          </p>


                          {!signingOut && (
                            <p className="mt-0.5 text-xs font-normal text-red-400">
                              End your Cris session
                            </p>
                          )}

                        </div>

                      </button>

                    </div>

                  </div>

                )}

              </div>

            )}


          {/* =================================================
              LOGGED-OUT CANDIDATE
          ================================================== */}

          {!loading &&
            !candidate && (

              <div className="flex items-center gap-3">

                <span className="hidden text-sm text-slate-500 sm:block">
                  Candidate Portal
                </span>


                <Link
                  href="/candidate/login"
                  className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Sign in
                </Link>

              </div>

            )}

        </div>

      </div>

    </header>
  );
}


/* =========================================================
   DISPLAY NAME
========================================================= */

function getCandidateDisplayName(
  candidate
) {
  if (!candidate) {
    return "Candidate";
  }


  /*
   * Candidate auth may return these directly.
   */
  const firstName =
    candidate.first_name ||
    candidate.legal_first_name ||
    "";


  const lastName =
    candidate.last_name ||
    candidate.legal_last_name ||
    "";


  const fullName =
    [
      firstName,
      lastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();


  if (fullName) {
    return fullName;
  }


  if (
    candidate.name
  ) {
    return candidate.name;
  }


  if (
    candidate.display_name
  ) {
    return candidate.display_name;
  }


  if (
    candidate.email
  ) {
    return candidate.email;
  }


  return "Candidate";
}


/* =========================================================
   INITIALS
========================================================= */

function getInitials(
  value
) {
  if (!value) {
    return "C";
  }


  const parts =
    String(
      value
    )
      .trim()
      .split(/\s+/)
      .filter(Boolean);


  if (
    parts.length === 0
  ) {
    return "C";
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