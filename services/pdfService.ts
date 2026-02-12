/**
 * Converts a File object (PDF) into an array of Base64 image strings (JPEG).
 */
export const convertPdfToImages = async (file: File): Promise<string[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!window.pdfjsLib) {
        reject(new Error("PDF.js library not loaded."));
        return;
      }

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      const imagePromises: Promise<string>[] = [];
      let totalWordCount = 0;
      const MAX_WORD_COUNT = 950;

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const text = textContent.items.map((item: any) => item.str).join(" ");
        const wordCount = text
          .split(/\s+/)
          .filter((w: string) => w.length > 0).length;

        if (totalWordCount + wordCount > MAX_WORD_COUNT) {
          if (pageNum === 1) {
            imagePromises.push(renderPageToImage(pdf, pageNum));
          }
          break;
        }

        totalWordCount += wordCount;
        imagePromises.push(renderPageToImage(pdf, pageNum));
      }

      const images = await Promise.all(imagePromises);
      resolve(images);
    } catch (error) {
      console.error("Error converting PDF to images:", error);
      reject(error);
    }
  });
};

const renderPageToImage = async (
  pdf: any,
  pageNumber: number,
): Promise<string> => {
  const page = await pdf.getPage(pageNumber);

  // Set scale to 2.0 for better text clarity for OCR
  const viewport = page.getViewport({ scale: 2.0 });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas context could not be created");
  }

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  await page.render({
    canvasContext: context,
    viewport: viewport,
  }).promise;

  // Convert to JPEG base64 (removing the data URL prefix for Gemini API compatibility later if needed,
  // but for now keeping it standard, we will strip it in the service layer)
  const base64 = canvas.toDataURL("image/jpeg", 0.8);

  // Clean up
  canvas.remove();

  return base64; // Returns "data:image/jpeg;base64,..."
};
