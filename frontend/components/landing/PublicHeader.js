import Link from "next/link";


export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-xl">

      <div className="mx-auto flex h-[72px] max-w-[1500px] items-center justify-between px-6 lg:px-10">

        <Link
          href="/"
          className="flex items-center gap-3"
        >

          <CrisLogo />

          <span className="text-2xl font-bold tracking-tight text-slate-950">
            Cris
          </span>

        </Link>


        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 lg:flex">

          <a
            href="#features"
            className="transition hover:text-slate-950"
          >
            Features
          </a>

          <a
            href="#security"
            className="transition hover:text-slate-950"
          >
            Security
          </a>

          <a
            href="#platform"
            className="transition hover:text-slate-950"
          >
            Platform
          </a>

        </nav>


        <div className="flex items-center gap-3">

          <Link
            href="/login"
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            Sign in
          </Link>

          <Link
            href="/register/company"
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Create account
          </Link>

        </div>

      </div>

    </header>
  );
}


function CrisLogo() {
  return (
    <div className="relative h-9 w-11">

      <div className="absolute left-0 top-1 h-8 w-8 rounded-full bg-blue-500" />

      <div className="absolute right-0 top-1 h-8 w-8 rounded-full bg-emerald-500/90" />

      <div className="absolute left-[14px] top-1 h-8 w-4 bg-gradient-to-r from-blue-500/70 to-emerald-500/70" />

    </div>
  );
}