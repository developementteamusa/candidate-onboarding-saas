const candidates = [
  {
    name: "Alex Morgan",
    role: "Software Engineer",
    status: "Onboarding",
  },

  {
    name: "Jamie Lee",
    role: "Product Manager",
    status: "Background check",
  },

  {
    name: "Taylor Kim",
    role: "Operations",
    status: "Documents",
  },

  {
    name: "Jordan Patel",
    role: "Sales Associate",
    status: "Completed",
  },
];


export default function DashboardPreview() {
  return (
    <div className="w-full rounded-[28px] border border-white/70 bg-white/80 p-3 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl">

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">

        {/* TOP BAR */}

        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">

          <div className="flex items-center gap-2 font-bold">

            <span className="inline-block h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500" />

            Cris
          </div>


          <div className="hidden w-64 rounded-lg bg-slate-100 px-4 py-2 text-xs text-slate-400 md:block">
            Search candidates...
          </div>


          <div className="flex items-center gap-3">

            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-200 to-emerald-200" />

            <div className="hidden text-xs sm:block">

              <div className="font-semibold text-slate-800">
                Sarah Chen
              </div>

              <div className="text-slate-400">
                Admin
              </div>

            </div>

          </div>

        </div>


        <div className="grid md:grid-cols-[150px_1fr]">

          {/* SIDEBAR */}

          <aside className="hidden border-r border-slate-200 bg-white p-4 md:block">

            <SidebarItem active>
              Dashboard
            </SidebarItem>

            <SidebarItem>
              Candidates
            </SidebarItem>

            <SidebarItem>
              Onboarding
            </SidebarItem>

            <SidebarItem>
              Background
            </SidebarItem>

            <SidebarItem>
              Documents
            </SidebarItem>

            <SidebarItem>
              Reports
            </SidebarItem>

          </aside>


          {/* CONTENT */}

          <div className="p-5">

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

              <StatCard
                label="Candidates"
                value="248"
              />

              <StatCard
                label="Onboarding"
                value="86"
              />

              <StatCard
                label="Background checks"
                value="72"
              />

              <StatCard
                label="Completed"
                value="90"
              />

            </div>


            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">

              <div className="flex justify-between">

                <h3 className="text-sm font-semibold">
                  Onboarding Progress
                </h3>

                <span className="text-xs font-medium text-blue-600">
                  View all
                </span>

              </div>


              <div className="mt-6 flex items-center">

                <ProgressStep
                  number="1"
                  label="Application"
                  complete
                />

                <Line complete />

                <ProgressStep
                  number="2"
                  label="Documents"
                  complete
                />

                <Line complete />

                <ProgressStep
                  number="3"
                  label="Background"
                  active
                />

                <Line />

                <ProgressStep
                  number="4"
                  label="Complete"
                />

              </div>

            </div>


            <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">

              <div className="rounded-xl border border-slate-200 bg-white p-5">

                <div className="mb-4 flex justify-between">

                  <h3 className="text-sm font-semibold">
                    Recent Candidates
                  </h3>

                  <span className="text-xs text-blue-600">
                    View all
                  </span>

                </div>


                <div className="space-y-3">

                  {candidates.map(
                    (candidate) => (
                      <div
                        key={candidate.name}
                        className="grid grid-cols-[1fr_auto] items-center gap-3 text-xs"
                      >

                        <div className="flex items-center gap-3">

                          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-100 to-emerald-100" />

                          <div>

                            <div className="font-semibold text-slate-800">
                              {candidate.name}
                            </div>

                            <div className="text-slate-400">
                              {candidate.role}
                            </div>

                          </div>

                        </div>


                        <StatusBadge
                          status={
                            candidate.status
                          }
                        />

                      </div>
                    )
                  )}

                </div>

              </div>


              <div className="rounded-xl border border-slate-200 bg-white p-5">

                <h3 className="text-sm font-semibold">
                  Onboarding
                </h3>


                <div className="mx-auto mt-6 flex h-32 w-32 items-center justify-center rounded-full bg-[conic-gradient(#2563eb_0_34%,#10b981_34%_62%,#93c5fd_62%_78%,#d1fae5_78%_100%)]">

                  <div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white">

                    <strong className="text-xl">
                      86
                    </strong>

                    <span className="text-[10px] text-slate-400">
                      In progress
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}


function SidebarItem({
  children,
  active = false,
}) {
  return (
    <div
      className={
        active
          ? "mb-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600"
          : "mb-2 rounded-lg px-3 py-2 text-xs text-slate-500"
      }
    >
      {children}
    </div>
  );
}


function StatCard({
  label,
  value,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">

      <div className="text-[10px] font-medium text-slate-400">
        {label}
      </div>

      <div className="mt-2 text-2xl font-bold">
        {value}
      </div>

      <div className="mt-1 text-[10px] font-semibold text-emerald-600">
        ↑ 12%
      </div>

    </div>
  );
}


function ProgressStep({
  number,
  label,
  complete,
  active,
}) {
  return (
    <div className="flex shrink-0 flex-col items-center">

      <div
        className={
          complete
            ? "flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white"
            : active
              ? "flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-500 bg-white text-xs font-bold text-blue-600"
              : "flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 bg-white text-xs font-bold text-slate-400"
        }
      >
        {number}
      </div>

      <span className="mt-2 hidden text-[9px] font-medium text-slate-500 sm:block">
        {label}
      </span>

    </div>
  );
}


function Line({
  complete = false,
}) {
  return (
    <div
      className={
        complete
          ? "mb-5 h-0.5 flex-1 bg-emerald-500"
          : "mb-5 h-0.5 flex-1 bg-slate-200"
      }
    />
  );
}


function StatusBadge({
  status,
}) {
  let classes =
    "bg-blue-50 text-blue-600";


  if (
    status === "Completed"
  ) {
    classes =
      "bg-emerald-50 text-emerald-700";
  }


  if (
    status ===
    "Background check"
  ) {
    classes =
      "bg-amber-50 text-amber-700";
  }


  return (
    <span
      className={`rounded-full px-2 py-1 text-[9px] font-semibold ${classes}`}
    >
      {status}
    </span>
  );
}