const Tesseract = require("tesseract.js");

async function performOCR(imagePath) {
  try {
    console.log("Starting OCR processing...");

    const result = await Tesseract.recognize(imagePath, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    console.log("OCR processing completed");

    return {
      text: result.data.text,
      confidence: result.data.confidence,
      words: result.data.words || [],
      lines: result.data.lines || [],
      paragraphs: result.data.paragraphs || [],
      blocks: result.data.blocks || [],
      error: null,
    };
  } catch (error) {
    console.error("OCR processing error:", error.message);
    return {
      text: "",
      confidence: 0,
      words: [],
      lines: [],
      paragraphs: [],
      blocks: [],
      error: error.message,
    };
  }
}

async function performOCRCustom(imagePath, options = {}) {
  try {
    const defaultOptions = {
      lang: "eng",
      oem: 3,
      psm: 3,
      ...options,
    };

    const result = await Tesseract.recognize(imagePath, defaultOptions.lang, {
      ...defaultOptions,
      logger: (m) => {
        if (m.status === "recognizing text") {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    return {
      text: result.data.text,
      confidence: result.data.confidence,
      words: result.data.words || [],
      lines: result.data.lines || [],
      paragraphs: result.data.paragraphs || [],
      blocks: result.data.blocks || [],
      error: null,
    };
  } catch (error) {
    console.error("Custom OCR processing error:", error.message);
    return {
      text: "",
      confidence: 0,
      words: [],
      lines: [],
      paragraphs: [],
      blocks: [],
      error: error.message,
    };
  }
}

module.exports = { performOCR, performOCRCustom };
