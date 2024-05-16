const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const searchGoogle = require("./services/google");
const searchGoogleCustom = require("./services/googleCustomSearch");
const performOCR = require("./services/ocr");
const analyzeMetadata = require("./services/metadata");
const checkStockPhoto = require("./services/stockPhotoCheck");
const performFacialRecognition = require("./services/facialRecognition");

const app = express();
const upload = multer({ dest: "uploads/" });

app.post("/search", upload.single("image"), async (req, res) => {
  const imagePath = req.file.path;

  try {
    const imageBase64 = fs.readFileSync(imagePath, { encoding: "base64" });

    const googleVisionResults = await searchGoogle(imageBase64);
    const customSearchResults = await searchGoogleCustom(imagePath);
    const ocrText = await performOCR(imagePath);
    const metadata = await analyzeMetadata(imagePath);
    const stockPhotoResults = await checkStockPhoto(imageBase64);
    const facialRecognitionResults = await performFacialRecognition(
      imageBase64
    );

    res.json({
      googleVision: googleVisionResults,
      googleCustomSearch: customSearchResults,
      ocr: ocrText,
      metadata: metadata,
      stockPhotos: stockPhotoResults,
      facialRecognition: facialRecognitionResults,
    });
  } catch (error) {
    console.error("Error handling search:", error);
    res.status(500).send("Error performing image search");
  } finally {
    fs.unlinkSync(imagePath); // Clean up the uploaded image
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
