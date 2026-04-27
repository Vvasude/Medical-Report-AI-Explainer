const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export type LabStatus = "Normal" | "Low" | "High";

export interface AnalysisResultRow {
  test_name: string;
  value: number;
  unit: string;
  reference_low: number;
  reference_high: number;
  status: LabStatus;
  explanation: string;
}

export interface AnalysisResult {
  summary: string;
  flagged_count: number;
  results: AnalysisResultRow[];
}

function readErrorDetail(res: Response, bodyText: string): string {
  try {
    const j = JSON.parse(bodyText) as { detail?: unknown };
    if (j.detail != null) {
      return typeof j.detail === "string" ? j.detail : JSON.stringify(j.detail);
    }
  } catch {
    /* not JSON */
  }
  return bodyText.trim() || res.statusText || `Request failed (${res.status})`;
}

export async function analyzePdf(file: File): Promise<AnalysisResult> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    body: form,
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(readErrorDetail(res, text));
  }

  return JSON.parse(text) as AnalysisResult;
}
