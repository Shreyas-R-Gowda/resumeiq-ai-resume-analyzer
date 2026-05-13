import { NextResponse } from "next/server";
import { demoResponse } from "@/lib/demo-analysis";
import { analyzeResumeWithGroq, getAnalysisErrorMessage } from "@/lib/groq";
import { parseResumeFile, ResumeParsingError } from "@/lib/resume-parser";
import type { AnalyzeErrorResponse } from "@/types/resume";
import { supportedMimeTypes, uploadSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const maxDuration = 60;

function errorResponse(message: string, status: number) {
  return NextResponse.json<AnalyzeErrorResponse>(
    { success: false, error: message },
    { status },
  );
}

export async function POST(request: Request) {
  try {
    console.error("[analyze] Request received");
    const formData = await request.formData();
    const file = formData.get("resume");
    const jobDescription = String(formData.get("jobDescription") || "");
    const useDemo = String(formData.get("useDemo") || "false");

    const parsedInput = uploadSchema.safeParse({ jobDescription, useDemo });
    if (!parsedInput.success) {
      console.error("[analyze] Invalid input payload", parsedInput.error.flatten());
      return errorResponse("Invalid job description.", 400);
    }

    if (parsedInput.data.useDemo === "true") {
      console.error("[analyze] Demo mode response");
      return NextResponse.json(demoResponse);
    }

    if (!(file instanceof File)) {
      console.error("[analyze] Missing resume file");
      return errorResponse("Please upload a resume file.", 400);
    }

    const isSupported =
      supportedMimeTypes.includes(file.type as (typeof supportedMimeTypes)[number]) ||
      /\.(pdf|docx)$/i.test(file.name);

    if (!isSupported) {
      console.error("[analyze] Unsupported file type", {
        fileName: file.name,
        fileType: file.type,
      });
      return errorResponse("Only PDF and DOCX resumes are supported.", 400);
    }

    if (file.size > 8 * 1024 * 1024) {
      console.error("[analyze] File too large", {
        fileName: file.name,
        fileSize: file.size,
      });
      return errorResponse("Resume is too large. Upload a file under 8 MB.", 400);
    }

    console.error("[analyze] Starting resume extraction", {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    });
    const resumeText = await parseResumeFile(file);
    if (resumeText.length < 250) {
      console.error("[analyze] Extracted text too short", {
        fileName: file.name,
        extractedLength: resumeText.length,
      });
      return errorResponse(
        "Could not extract enough resume text. Try a text-based PDF or DOCX.",
        422,
      );
    }

    if (!process.env.GROQ_API_KEY) {
      console.error("[analyze] Missing GROQ_API_KEY");
      return errorResponse("Missing GROQ_API_KEY.", 500);
    }

    console.error("[analyze] Sending content to Groq", {
      resumeLength: resumeText.length,
      hasJobDescription: Boolean(parsedInput.data.jobDescription?.trim()),
    });
    const analysis = await analyzeResumeWithGroq(
      resumeText.slice(0, 30000),
      parsedInput.data.jobDescription,
    );
    console.error("[analyze] Analysis completed successfully", {
      fileName: file.name,
      resumeScore: analysis.resumeScore,
      atsScore: analysis.atsScore,
    });

    return NextResponse.json({
      analysis,
      resumeText: resumeText.slice(0, 8000),
      fileName: file.name,
    });
  } catch (error) {
    if (error instanceof ResumeParsingError) {
      console.error("[analyze] Resume parsing failed", error);
      return errorResponse(error.message, error.statusCode);
    }

    const { message, statusCode } = getAnalysisErrorMessage(error);
    console.error("[analyze] Runtime failure", error);
    return errorResponse(message, statusCode);
  }
}
