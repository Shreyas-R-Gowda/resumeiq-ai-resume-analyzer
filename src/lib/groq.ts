import OpenAI from "openai";
import { ZodError } from "zod";
import { calibrateAnalysis } from "@/lib/score-calibration";
import { buildResumePrompt, resumeAnalysisSystemPrompt } from "@/lib/prompts";
import { analysisSchema } from "@/lib/validation";
import type { AnalysisResult } from "@/types/resume";

const groqModel = "llama-3.3-70b-versatile";

export const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

class GroqResponseError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = "GroqResponseError";
    this.statusCode = statusCode;
  }
}

function extractJsonBlock(text: string) {
  const withoutFence = text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  if (withoutFence.startsWith("{") && withoutFence.endsWith("}")) {
    return withoutFence;
  }

  const match = withoutFence.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new GroqResponseError("Groq returned an invalid response format.", 502);
  }

  return match[0];
}

function repairJsonString(json: string) {
  return json
    .replace(/,\s*([}\]])/g, "$1")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'");
}

function parseAnalysisResponse(
  content: string,
  resumeText: string,
  jobDescription?: string,
): AnalysisResult {
  try {
    const cleaned = repairJsonString(extractJsonBlock(content));
    const parsed = analysisSchema.parse(JSON.parse(cleaned));
    return calibrateAnalysis(parsed, resumeText, jobDescription);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new GroqResponseError("Groq returned JSON, but it did not match the expected analysis schema.", 502);
    }

    if (error instanceof SyntaxError) {
      throw new GroqResponseError("Groq returned malformed JSON.", 502);
    }

    if (error instanceof GroqResponseError) {
      throw error;
    }

    throw new GroqResponseError("Failed to parse Groq analysis response.", 502);
  }
}

async function requestAnalysis(prompt: string) {
  const request = groq.chat.completions.create({
    model: groqModel,
    temperature: 0.2,
    response_format: {
      type: "json_object",
    },
    messages: [
      {
        role: "system",
        content: resumeAnalysisSystemPrompt,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new GroqResponseError("Groq request timed out. Please try again.", 504));
    }, 45000);
  });

  return Promise.race([request, timeout]);
}

export async function analyzeResumeWithGroq(
  resumeText: string,
  jobDescription?: string,
): Promise<AnalysisResult> {
  if (!process.env.GROQ_API_KEY) {
    throw new GroqResponseError(
      "Missing GROQ_API_KEY in Vercel environment variables.",
      500,
    );
  }

  const prompt = buildResumePrompt(resumeText, jobDescription);
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      console.log("[groq] AI request starting", {
        attempt: attempt + 1,
        model: groqModel,
        resumeLength: resumeText.length,
        hasJobDescription: Boolean(jobDescription?.trim()),
      });
      const response = await requestAnalysis(prompt);
      console.log("[groq] AI response received", {
        attempt: attempt + 1,
        choiceCount: response.choices.length,
      });
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new GroqResponseError("Groq returned an empty response.", 502);
      }

      return parseAnalysisResponse(content, resumeText, jobDescription);
    } catch (error) {
      console.error("[groq] AI request failed", error);
      lastError = error;
    }
  }

  throw lastError;
}

export function getAnalysisErrorMessage(error: unknown) {
  if (error instanceof GroqResponseError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      statusCode: 500,
    };
  }

  return {
    message: "Something went wrong while analyzing the resume.",
    statusCode: 500,
  };
}
