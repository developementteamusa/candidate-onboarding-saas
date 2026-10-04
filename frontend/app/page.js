import StatusCard from "@/components/ui/StatusCard";

export default function HomePage() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="max-w-3xl">
        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
          Platform Foundation
        </span>

        <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
          Multi-Tenant Candidate Onboarding SaaS
        </h1>

        <p className="mt-6 text-lg leading-8 text-slate-600">
          A secure platform foundation for managing candidate applications,
          onboarding workflows, identity verification, background checks,
          and legal documentation.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatusCard
          title="Candidate Portal"
          description="Candidate-facing application and onboarding experience."
        />

        <StatusCard
          title="Company Portal"
          description="Company administration and candidate management experience."
        />

        <StatusCard
          title="REST API"
          description="FastAPI backend responsible for data, security, and business logic."
        />
      </div>
    </section>
  );
}