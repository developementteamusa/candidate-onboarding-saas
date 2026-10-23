import ApplicationsManager from "@/components/dashboard/ApplicationsManager";


export const metadata = {
  title: "Applications | Candidate Onboarding",
};


export default function ApplicationsPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <ApplicationsManager />
    </main>
  );
}