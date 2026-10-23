import DashboardShell from "@/components/dashboard/DashboardShell";


export const metadata = {
  title: "Dashboard | Candidate Onboarding",
};


export default function DashboardPage() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <DashboardShell />
    </section>
  );
}