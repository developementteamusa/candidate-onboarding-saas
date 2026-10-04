export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div>
          <p className="text-lg font-bold text-slate-900">
            Candidate Onboarding
          </p>

          <p className="text-xs text-slate-500">
            Secure SaaS Platform
          </p>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          Phase 1
        </span>
      </div>
    </header>
  );
}