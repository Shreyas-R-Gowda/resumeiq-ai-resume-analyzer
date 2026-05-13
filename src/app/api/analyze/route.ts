import { NextResponse } from "next/server";
import { demoResponse } from "@/lib/demo-analysis";
import { analyzeResumeWithGroq, getAnalysisErrorMessage } from "@/lib/groq";
import { parseResumeFile } from "@/lib/resume-parser";
import { supportedMimeTypes, uploadSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("resume");
    const jobDescription = String(formData.get("jobDescription") || "");
    const useDemo = String(formData.get("useDemo") || "false");

    const parsedInput = uploadSchema.safeParse({ jobDescription, useDemo });
    if (!parsedInput.success) {
      return NextResponse.json({ error: "Invalid job description." }, { status: 400 });
    }

    if (parsedInput.data.useDemo === "true") {
      return NextResponse.json(demoResponse);
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Please upload a resume file." }, { status: 400 });
    }

    const isSupported =
      supportedMimeTypes.includes(file.type as (typeof supportedMimeTypes)[number]) ||
      /\.(pdf|docx)$/i.test(file.name);

    if (!isSupported) {
      return NextResponse.json(
        { error: "Only PDF and DOCX resumes are supported." },
        { status: 400 },
      );
    }

    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Resume is too large. Upload a file under 8 MB." },
        { status: 400 },
      );
    }

    const resumeText = await parseResumeFile(file);
    if (resumeText.length < 250) {
      return NextResponse.json(
        { error: "Could not extract enough resume text. Try a text-based PDF or DOCX." },
        { status: 422 },
      );
    }

    const analysis = await analyzeResumeWithGroq(
      resumeText.slice(0, 30000),
      parsedInput.data.jobDescription,
    );

    return NextResponse.json({
      analysis,
      resumeText: resumeText.slice(0, 8000),
      fileName: file.name,
    });
  } catch (error) {
    const { message, statusCode } = getAnalysisErrorMessage(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
