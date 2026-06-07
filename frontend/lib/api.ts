import type { AnalysisResponse } from "./types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";

export async function analyzeCSV(file: File): Promise<AnalysisResponse> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API}/analyze`, { method: "POST", body: form });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { detail?: string }).detail ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<AnalysisResponse>;
}
