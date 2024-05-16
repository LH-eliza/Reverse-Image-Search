const Tesseract = require("tesseract.js");

async function performOCR(imagePath) {
  try {
    const {
      data: { text },
    } = await Tesseract.recognize(imagePath, "eng", {
      logger: (m) => console.log(m),
    });
    return text;
  } catch (error) {
    console.error("Error performing OCR:", error);
    return "";
  }
}

module.exports = performOCR;
