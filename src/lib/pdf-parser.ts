import { getDocument, VerbosityLevel } from "pdfjs-dist/legacy/build/pdf.mjs";

export class PdfExtractionError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 422) {
    super(message);
    this.name = "PdfExtractionError";
    this.statusCode = statusCode;
  }
}

export async function extractTextFromPdf(buffer: Buffer) {
  const loadingTask = getDocument({
    data: new Uint8Array(buffer),
    disableFontFace: true,
    isImageDecoderSupported: false,
    isOffscreenCanvasSupported: false,
    stopAtErrors: true,
    useSystemFonts: false,
    useWorkerFetch: false,
    verbosity: VerbosityLevel.ERRORS,
  });

  try {
    const pdf = await loadingTask.promise;
    const pages: string[] = [];

    try {
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);

        try {
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item) => {
              if (!("str" in item)) {
                return "";
              }

              return item.hasEOL ? `${item.str}\n` : item.str;
            })
            .join(" ")
            .trim();

          if (pageText) {
            pages.push(pageText);
          }
        } finally {
          page.cleanup();
        }
      }
    } finally {
      await pdf.cleanup();
      await pdf.destroy();
    }

    if (!pages.length) {
      throw new PdfExtractionError(
        "Unable to extract text from this PDF. Please try another file.",
      );
    }

    return pages.join("\n\n");
  } catch (error) {
    await loadingTask.destroy();

    if (error instanceof PdfExtractionError) {
      throw error;
    }

    throw new PdfExtractionError(
      "Unable to extract text from this PDF. Please try another file.",
    );
  }
}
