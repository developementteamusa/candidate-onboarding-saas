import Link from "next/link";

import PublicHeader from "@/components/landing/PublicHeader";
import PortalCard from "@/components/landing/PortalCard";
import DashboardPreview from "@/components/landing/DashboardPreview";


export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-slate-950">

      <PublicHeader />


      <main>

        {/* =================================================
            HERO
        ================================================= */}

        <section className="relative overflow-hidden border-b border-slate-100">

          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_70%_20%,rgba(59,130,246,0.12),transparent_35%),radial-gradient(circle_at_90%_10%,rgba(16,185,129,0.12),transparent_30%)]" />


          <div className="mx-auto grid max-w-[1500px] gap-12 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:px-10 lg:py-20">

            {/* LEFT */}

            <div className="flex flex-col justify-center">

              <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">

                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                  ✓
                </span>

                Secure candidate onboarding
              </div>


              <h1 className="max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight text-slate-950 md:text-6xl">

                Modern onboarding
                <br />

                and background checks
                <br />

                in{" "}

                <span className="text-blue-600">
                  one secure platform
                </span>

              </h1>


              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">

                Cris helps companies review candidates,
                verify identity documents, collect
                onboarding information, manage consent,
                and coordinate background checks through
                one secure workflow.

              </p>


              {/* PORTALS */}

              <div className="mt-10 grid gap-5 sm:grid-cols-2">

                <PortalCard
                  type="company"

                  title="Company Portal"

                  description="For recruiters, hiring managers and administrators."

                  signInHref="/login"

                  createHref="/register/company"

                  items={[
                    "Manage applications and onboarding",
                    "Review identity verification",
                    "Coordinate background checks",
                  ]}
                />


                <PortalCard
                  type="candidate"

                  title="Candidate Portal"

                  description="For applicants and new hires."

                  signInHref="/candidate/login"

                  createHref="/candidate/start"

                  items={[
                    "Complete onboarding",
                    "Upload and verify documents",
                    "Track onboarding progress",
                  ]}
                />

              </div>

            </div>


            {/* RIGHT */}

            <div className="flex items-center">

              <DashboardPreview />

            </div>

          </div>

        </section>


        {/* =================================================
            FEATURES
        ================================================= */}

        <section className="border-b border-slate-100 bg-white">

          <div className="mx-auto grid max-w-[1500px] gap-8 px-6 py-10 md:grid-cols-2 lg:grid-cols-4 lg:px-10">

            <Feature
              icon="▣"
              title="Secure Document Upload"
              description="Encrypted storage for sensitive candidate information."
            />

            <Feature
              icon="◫"
              title="Driver's License Verification"
              description="Identity-document processing powered by automated OCR."
            />

            <Feature
              icon="◇"
              title="Background Checks"
              description="Consent-aware workflows ready for screening integrations."
            />

            <Feature
              icon="⚙"
              title="Automated Onboarding"
              description="Structured workflows that keep companies and candidates aligned."
            />

          </div>

        </section>


        {/* =================================================
            VALUE SECTION
        ================================================= */}

        <section className="bg-slate-50">

          <div className="mx-auto max-w-7xl px-6 py-20 text-center">

            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
              Built for better onboarding
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
              A better onboarding experience for everyone
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              Give hiring teams a clear operational
              workspace while giving candidates a simple,
              secure onboarding experience.
            </p>


            <div className="mt-12 grid gap-5 md:grid-cols-3">

              <ValueCard
                title="Secure by design"
                description="Private document storage, tenant isolation and role-based access."
              />

              <ValueCard
                title="Human-in-the-loop"
                description="Automated identity comparisons with company review when needed."
              />

              <ValueCard
                title="Candidate friendly"
                description="Clear onboarding steps with progress and action-oriented workflows."
              />

            </div>

          </div>

        </section>

      </main>


      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">

          <div className="font-semibold text-slate-900">
            Cris
          </div>

          <div>
            Secure Candidate Onboarding Platform
          </div>

        </div>

      </footer>

    </div>
  );
}


function Feature({
  icon,
  title,
  description,
}) {
  return (
    <div className="flex gap-4">

      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-xl font-bold text-blue-600">
        {icon}
      </div>

      <div>

        <h3 className="font-semibold text-slate-950">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-6 text-slate-600">
          {description}
        </p>

      </div>

    </div>
  );
}


function ValueCard({
  title,
  description,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-7 text-left shadow-sm">

      <div className="mb-5 h-10 w-10 rounded-xl bg-gradient-to-br from-blue-100 to-emerald-100" />

      <h3 className="text-lg font-semibold">
        {title}
      </h3>

      <p className="mt-2 leading-7 text-slate-600">
        {description}
      </p>

    </div>
  );
}