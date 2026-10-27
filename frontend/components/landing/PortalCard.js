import Link from "next/link";


export default function PortalCard({
  type,
  title,
  description,
  signInHref,
  createHref,
  items,
}) {
  const company =
    type === "company";


  return (
    <div
      className={
        company
          ? "rounded-2xl border border-blue-100 bg-white/90 p-6 shadow-sm backdrop-blur"
          : "rounded-2xl border border-emerald-100 bg-white/90 p-6 shadow-sm backdrop-blur"
      }
    >

      <div
        className={
          company
            ? "flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl text-blue-600"
            : "flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-xl text-emerald-600"
        }
      >
        {company
          ? "▦"
          : "●"}
      </div>


      <h2 className="mt-5 text-xl font-bold text-slate-950">
        {title}
      </h2>

      <p className="mt-2 min-h-[48px] text-sm leading-6 text-slate-600">
        {description}
      </p>


      <div className="mt-6 space-y-3">

        <Link
          href={signInHref}

          className={
            company
              ? "flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              : "flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          }
        >
          Sign in
          <span className="ml-2">
            →
          </span>
        </Link>


        <Link
          href={createHref}
          className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
        >
          Create account
        </Link>

      </div>


      <div className="mt-6 space-y-3">

        {items.map(
          (item) => (
            <div
              key={item}
              className="flex items-start gap-3 text-sm text-slate-600"
            >

              <span
                className={
                  company
                    ? "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600"
                    : "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-600"
                }
              >
                ✓
              </span>

              {item}

            </div>
          )
        )}

      </div>

    </div>
  );
}