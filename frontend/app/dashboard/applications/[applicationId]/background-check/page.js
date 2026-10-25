import BackgroundCheckManager from "@/components/dashboard/BackgroundCheckManager";


export default async function BackgroundCheckPage({
  params,
}) {
  const {
    applicationId,
  } = await params;


  return (
    <main className="mx-auto max-w-5xl px-6 py-12">

      <BackgroundCheckManager
        applicationId={
          applicationId
        }
      />

    </main>
  );
}