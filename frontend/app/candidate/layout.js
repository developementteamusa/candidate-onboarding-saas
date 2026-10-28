import CandidateHeader from "@/components/candidate/CandidateHeader";


export default function CandidateLayout({
  children,
}) {
  return (
    <div className="min-h-screen bg-slate-50">

      <CandidateHeader />

      <main>
        {children}
      </main>

    </div>
  );
}