export class PdfExtractionError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 422) {
    super(message);
    this.name = "PdfExtractionError";
    this.statusCode = statusCode;
  }
}

function getPdfFailureMessage(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (message.includes("password")) {
    return "This PDF is password protected. Please upload an unlocked resume PDF.";
  }

  if (message.includes("invalid pdf") || message.includes("malformed")) {
    return "This PDF appears to be corrupted or unsupported. Try exporting the resume again as a text-based PDF.";
  }

  if (message.includes("empty") || message.includes("no text")) {
    return "We could not detect text in this PDF. It may be a scanned image. Try exporting the resume again as a text-based PDF.";
  }

  return "Unable to extract text from this PDF. Try exporting the resume again as a text-based PDF.";
}

export async function extractTextFromPdf(data: Uint8Array) {
  try {
    console.log("[pdf-parser] PDF extraction starting", {
      byteLength: data.byteLength,
    });

    const { extractText } = await import("unpdf");
    const result = await extractText(data, { mergePages: false });

    console.log("[pdf-parser] Pages detected", {
      totalPages: result.totalPages,
    });

    const pages = result.text
      .map((pageText, index) => {
        const cleaned = pageText
          .replace(/\u0000/g, " ")
          .replace(/[ \t]+/g, " ")
          .replace(/\n{3,}/g, "\n\n")
          .trim();

        console.log("[pdf-parser] Page extraction result", {
          pageNumber: index + 1,
          extractedLength: cleaned.length,
        });

        return cleaned;
      })
      .filter(Boolean);

    const mergedText = pages.join("\n\n").trim();

    if (!mergedText) {
      throw new PdfExtractionError(
        "We could not detect text in this PDF. It may be a scanned image. Try exporting the resume again as a text-based PDF.",
      );
    }

    console.log("[pdf-parser] PDF parsed successfully", {
      totalPages: result.totalPages,
      extractedPages: pages.length,
      extractedLength: mergedText.length,
    });

    return mergedText;
  } catch (error) {
    if (error instanceof PdfExtractionError) {
      throw error;
    }

    console.error("[pdf-parser] PDF extraction failed", error);
    throw new PdfExtractionError(getPdfFailureMessage(error));
  }
}
