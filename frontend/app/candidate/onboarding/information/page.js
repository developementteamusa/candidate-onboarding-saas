import CandidateInformationForm from "@/components/candidate/CandidateInformationForm";


export const metadata = {
  title:
    "Candidate Information | Candidate Onboarding",
};


export default function CandidateInformationPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">

      <CandidateInformationForm />

    </main>
  );
}