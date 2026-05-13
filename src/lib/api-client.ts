import type { AnalyzeResponse } from "@/types/resume";

type ApiErrorPayload = {
  success?: false;
  error?: string;
};

function getReadableApiError(response: Response, payload?: ApiErrorPayload) {
  if (payload?.error) {
    return payload.error;
  }

  if (response.status === 413) {
    return "Resume is too large. Upload a file under 8 MB.";
  }

  if (response.status >= 500) {
    return "Something went wrong while analyzing the resume.";
  }

  return "We could not analyze this resume. Please try again.";
}

export async function analyzeResumeRequest(formData: FormData): Promise<AnalyzeResponse> {
  const response = await fetch("/api/analyze", {
    method: "POST",
    body: formData,
  });

  const raw = await response.text();
  const contentType = response.headers.get("content-type") || "";
  const looksJson =
    contentType.includes("application/json") ||
    raw.trim().startsWith("{") ||
    raw.trim().startsWith("[");

  let payload: AnalyzeResponse | ApiErrorPayload | null = null;

  if (raw.trim()) {
    if (looksJson) {
      try {
        payload = JSON.parse(raw) as AnalyzeResponse | ApiErrorPayload;
      } catch (error) {
        console.error("Failed to parse analysis API JSON", error, {
          status: response.status,
          contentType,
        });
      }
    } else {
      console.error("Analysis API returned non-JSON response", {
        status: response.status,
        contentType,
        preview: raw.slice(0, 160),
      });
    }
  } else {
    console.error("Analysis API returned an empty response", {
      status: response.status,
      contentType,
    });
  }

  if (!response.ok) {
    throw new Error(getReadableApiError(response, payload as ApiErrorPayload | undefined));
  }

  if (!payload || !("analysis" in payload) || !("resumeText" in payload) || !("fileName" in payload)) {
    throw new Error("Something went wrong while analyzing the resume.");
  }

  return payload;
}
