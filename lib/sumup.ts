// lib/sumup.ts

export const SUMUP_API_URL = "https://api.sumup.com/v0.1";

export function getSumupHeaders(): HeadersInit {
  const key = process.env.SUMUP_SECRET_KEY;
  if (!key) throw new Error("SUMUP_SECRET_KEY is not defined");
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}
