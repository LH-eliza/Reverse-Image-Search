const express = require("express");
const multer = require("multer");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const searchGoogle = require("./services/google");
const { searchGoogleCustom } = require("./services/googleCustomSearch");
const { performOCR } = require("./services/ocr");
const { analyzeMetadata } = require("./services/metadata");
const { checkStockPhoto } = require("./services/stockPhotoCheck");
const { performFacialRecognition } = require("./services/facialRecognition");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(express.static("public"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|bmp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {
      googleVision: !!process.env.GOOGLE_VISION_API_KEY,
      googleCustomSearch: !!(
        process.env.GOOGLE_CUSTOM_SEARCH_API_KEY &&
        process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID
      ),
      ocr: true,
      metadata: true,
      stockPhoto: true,
      facialRecognition: true,
    },
  });
});

app.post("/api/search", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: "No image file provided",
      message: "Please upload an image file",
    });
  }

  const imagePath = req.file.path;
  const startTime = Date.now();

  try {
    console.log(`Processing image: ${req.file.originalname}`);

    const imageBase64 = fs.readFileSync(imagePath, { encoding: "base64" });

    const [
      googleVisionResults,
      customSearchResults,
      ocrResults,
      metadataResults,
      stockPhotoResults,
      facialRecognitionResults,
    ] = await Promise.allSettled([
      searchGoogle(imageBase64),
      searchGoogleCustom(imagePath),
      performOCR(imagePath),
      analyzeMetadata(imagePath),
      checkStockPhoto(imageBase64),
      performFacialRecognition(imageBase64),
    ]);

    const results = {
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime,
      originalFilename: req.file.originalname,
      fileSize: req.file.size,
      services: {
        googleVision:
          googleVisionResults.status === "fulfilled"
            ? googleVisionResults.value
            : { error: googleVisionResults.reason?.message },
        googleCustomSearch:
          customSearchResults.status === "fulfilled"
            ? customSearchResults.value
            : { error: customSearchResults.reason?.message },
        ocr:
          ocrResults.status === "fulfilled"
            ? ocrResults.value
            : { error: ocrResults.reason?.message },
        metadata:
          metadataResults.status === "fulfilled"
            ? metadataResults.value
            : { error: metadataResults.reason?.message },
        stockPhoto:
          stockPhotoResults.status === "fulfilled"
            ? stockPhotoResults.value
            : { error: stockPhotoResults.reason?.message },
        facialRecognition:
          facialRecognitionResults.status === "fulfilled"
            ? facialRecognitionResults.value
            : { error: facialRecognitionResults.reason?.message },
      },
    };

    results.summary = generateAnalysisSummary(results);

    res.json(results);
  } catch (error) {
    console.error("Error handling search:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  } finally {
    try {
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    } catch (cleanupError) {
      console.error("Error cleaning up file:", cleanupError);
    }
  }
});

app.post("/api/search/enhanced", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: "No image file provided",
      message: "Please upload an image file",
    });
  }

  const imagePath = req.file.path;
  const startTime = Date.now();

  try {
    console.log(`Processing enhanced search for: ${req.file.originalname}`);

    const imageBase64 = fs.readFileSync(imagePath, { encoding: "base64" });

    const metadataResult = await analyzeMetadata(imagePath);
    const metadata = metadataResult.success ? metadataResult.metadata : {};

    const [
      googleVisionResults,
      ocrResults,
      stockPhotoResults,
      facialRecognitionResults,
    ] = await Promise.allSettled([
      searchGoogle(imageBase64),
      performOCR(imagePath),
      checkStockPhoto(imageBase64),
      performFacialRecognition(imageBase64),
    ]);

    const results = {
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime,
      originalFilename: req.file.originalname,
      fileSize: req.file.size,
      enhancedAnalysis: true,
      services: {
        googleVision:
          googleVisionResults.status === "fulfilled"
            ? googleVisionResults.value
            : { error: googleVisionResults.reason?.message },
        ocr:
          ocrResults.status === "fulfilled"
            ? ocrResults.value
            : { error: ocrResults.reason?.message },
        stockPhoto:
          stockPhotoResults.status === "fulfilled"
            ? stockPhotoResults.value
            : { error: stockPhotoResults.reason?.message },
        facialRecognition:
          facialRecognitionResults.status === "fulfilled"
            ? facialRecognitionResults.value
            : { error: facialRecognitionResults.reason?.message },
        metadata: metadataResult,
      },
    };

    results.summary = generateEnhancedAnalysisSummary(results);

    res.json(results);
  } catch (error) {
    console.error("Error handling enhanced search:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  } finally {
    try {
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    } catch (cleanupError) {
      console.error("Error cleaning up file:", cleanupError);
    }
  }
});

app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({
    error: "Internal server error",
    message: error.message,
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    message: "The requested resource was not found",
    timestamp: new Date().toISOString(),
  });
});

function generateAnalysisSummary(results) {
  const summary = {
    overallRisk: "low",
    confidence: 0,
    keyFindings: [],
    recommendations: [],
  };

  let riskScore = 0;
  let confidenceScore = 0;
  let serviceCount = 0;

  Object.entries(results.services).forEach(([serviceName, serviceResult]) => {
    if (serviceResult && !serviceResult.error) {
      serviceCount++;

      switch (serviceName) {
        case "facialRecognition":
          if (serviceResult.impersonationRisk === "high") {
            riskScore += 0.4;
            summary.keyFindings.push("High impersonation risk detected");
          }
          if (serviceResult.facesDetected > 0) {
            summary.keyFindings.push(
              `${serviceResult.facesDetected} face(s) detected`
            );
          }
          break;

        case "stockPhoto":
          if (serviceResult.isStockPhoto) {
            riskScore += 0.2;
            summary.keyFindings.push("Potential stock photo detected");
          }
          break;

        case "ocr":
          if (serviceResult.text && serviceResult.text.trim()) {
            summary.keyFindings.push("Text detected in image");
          }
          break;

        case "googleVision":
          if (serviceResult.labels && serviceResult.labels.length > 0) {
            summary.keyFindings.push(
              `${serviceResult.labels.length} labels identified`
            );
          }
          break;
      }

      confidenceScore += 0.8;
    }
  });

  summary.confidence = serviceCount > 0 ? confidenceScore / serviceCount : 0;

  if (riskScore >= 0.6) summary.overallRisk = "high";
  else if (riskScore >= 0.3) summary.overallRisk = "medium";
  else summary.overallRisk = "low";

  if (summary.overallRisk === "high") {
    summary.recommendations.push(
      "Exercise caution - multiple risk factors detected"
    );
  }
  if (summary.confidence < 0.5) {
    summary.recommendations.push(
      "Low confidence in analysis - consider manual review"
    );
  }

  return summary;
}

function generateEnhancedAnalysisSummary(results) {
  const summary = generateAnalysisSummary(results);

  if (results.services.metadata && results.services.metadata.success) {
    const metadata = results.services.metadata.metadata;

    if (metadata.exif && metadata.exif.gps) {
      summary.keyFindings.push("GPS location data found");
    }

    if (metadata.imageInfo && metadata.imageInfo.width >= 3000) {
      summary.keyFindings.push("High resolution image");
    }
  }

  return summary;
}

app.listen(PORT, () => {
  console.log(`🚀 Reverse Image Detection Server running on port ${PORT}`);
  console.log(`📊 Health check available at: http://localhost:${PORT}/health`);
  console.log(`🌐 Web interface available at: http://localhost:${PORT}/`);
  console.log(
    `🔍 API endpoint available at: http://localhost:${PORT}/api/search`
  );
});
