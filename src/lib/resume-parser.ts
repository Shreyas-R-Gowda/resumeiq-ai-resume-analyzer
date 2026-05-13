import mammoth from "mammoth";
import { extractTextFromPdf, PdfExtractionError } from "@/lib/pdf-parser";

export class ResumeParsingError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 422) {
    super(message);
    this.name = "ResumeParsingError";
    this.statusCode = statusCode;
  }
}

export async function parseResumeFile(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);

  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    try {
      console.log("[resume-parser] PDF extraction starting", {
        fileName: file.name,
        fileSize: file.size,
      });
      const text = await extractTextFromPdf(data);
      return normalizeResumeText(text);
    } catch (error) {
      console.error("[resume-parser] PDF extraction failed", error);
      if (error instanceof PdfExtractionError) {
        throw new ResumeParsingError(error.message, error.statusCode);
      }

      throw new ResumeParsingError(
        "Unable to extract text from this PDF. Please try another file.",
      );
    }
  }

  if (
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.name.toLowerCase().endsWith(".docx")
  ) {
    try {
      console.log("[resume-parser] DOCX extraction starting", {
        fileName: file.name,
        fileSize: file.size,
      });
      const buffer = Buffer.from(arrayBuffer);
      const result = await mammoth.extractRawText({ buffer });
      console.log("[resume-parser] DOCX parsed", {
        extractedLength: result.value.length,
      });
      return normalizeResumeText(result.value);
    } catch (error) {
      console.error("[resume-parser] DOCX extraction failed", error);
      throw new ResumeParsingError(
        "Unable to extract text from this DOCX file. Please try another file.",
      );
    }
  }

  throw new Error("Unsupported file type. Please upload a PDF or DOCX resume.");
}

function normalizeResumeText(text: string) {
  return text
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
