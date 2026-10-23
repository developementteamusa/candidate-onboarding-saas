import DriversLicenseReview from "@/components/dashboard/DriversLicenseReview";


export default async function DriversLicenseReviewPage({
  params,
}) {
  const {
    applicationId,
  } = await params;

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <DriversLicenseReview
        applicationId={applicationId}
      />
    </main>
  );
}