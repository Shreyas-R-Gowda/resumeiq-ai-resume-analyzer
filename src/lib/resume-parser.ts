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
  const buffer = Buffer.from(arrayBuffer);

  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    try {
      const text = await extractTextFromPdf(buffer);
      return normalizeResumeText(text);
    } catch (error) {
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
    const result = await mammoth.extractRawText({ buffer });
    return normalizeResumeText(result.value);
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
