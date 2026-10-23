import Link from "next/link";


export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">

      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        <Link
          href="/"
          className="block"
        >
          <p className="text-lg font-bold text-slate-900">
            Candidate Onboarding
          </p>

          <p className="text-xs text-slate-500">
            Secure SaaS Platform
          </p>
        </Link>


        <nav className="flex items-center gap-4">

          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 hover:text-slate-950"
          >
            Sign in
          </Link>

          <Link
            href="/dashboard"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Dashboard
          </Link>

        </nav>

      </div>

    </header>
  );
}