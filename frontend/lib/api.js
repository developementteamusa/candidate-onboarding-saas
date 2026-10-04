import { config } from "@/lib/config";

export async function apiRequest(endpoint, options = {}) {
  const url = `${config.apiBaseUrl}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = new Error(
      `API request failed with status ${response.status}`
    );

    error.status = response.status;

    throw error;
  }

  return response.json();
}

export function getApiHealth() {
  return apiRequest("/health");
}

export function getDatabaseHealth() {
  return apiRequest("/health/db");
}