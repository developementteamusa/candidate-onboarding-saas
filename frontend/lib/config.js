const publicApiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000/api/v1";


const internalApiBaseUrl =
  process.env.INTERNAL_API_BASE_URL ||
  publicApiBaseUrl;


export const config = {
  publicApiBaseUrl,
  internalApiBaseUrl,
};