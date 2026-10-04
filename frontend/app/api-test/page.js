import { getApiHealth } from "@/lib/api";

export default async function ApiTestPage() {
  let health = null;
  let error = null;

  try {
    health = await getApiHealth();
  } catch (err) {
    error = err.message;
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-3xl font-bold">
        API Connection Test
      </h1>

      {health && (
        <div className="mt-8 rounded-xl border bg-white p-6">
          <p>
            API Status:{" "}
            <strong>{health.status}</strong>
          </p>

          <p>Service: {health.service}</p>

          <p>Environment: {health.environment}</p>

          <p>Version: {health.version}</p>
        </div>
      )}

      {error && (
        <div className="mt-8 rounded-xl border p-6">
          <p>API connection failed: {error}</p>
        </div>
      )}
    </main>
  );
}