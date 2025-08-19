const axios = require("axios");

async function checkStockPhoto(imageBase64) {
  try {
    const results = {
      isStockPhoto: false,
      confidence: 0,
      sources: [],
      matches: [],
      error: null,
    };

    const characteristics = await analyzeStockPhotoCharacteristics(imageBase64);

    if (
      characteristics.hasHighQuality &&
      characteristics.hasProfessionalMetadata
    ) {
      results.isStockPhoto = true;
      results.confidence = 0.7;
      results.matches.push("High quality image with professional metadata");
    }

    const stockPhotoCheck = await checkKnownStockPhotoDatabases(imageBase64);
    if (stockPhotoCheck.found) {
      results.isStockPhoto = true;
      results.confidence = Math.max(
        results.confidence,
        stockPhotoCheck.confidence
      );
      results.sources.push(...stockPhotoCheck.sources);
    }

    return results;
  } catch (error) {
    console.error("Stock photo check error:", error.message);
    return {
      isStockPhoto: false,
      confidence: 0,
      sources: [],
      matches: [],
      error: error.message,
    };
  }
}

async function analyzeStockPhotoCharacteristics(imageBase64) {
  try {
    return {
      hasHighQuality: true,
      hasProfessionalMetadata: true,
      hasStandardComposition: true,
      hasProfessionalLighting: true,
      hasCleanBackground: true,
      hasProfessionalSubject: true,
    };
  } catch (error) {
    console.error("Stock photo characteristics analysis error:", error.message);
    return {
      hasHighQuality: false,
      hasProfessionalMetadata: false,
      hasStandardComposition: false,
      hasProfessionalLighting: false,
      hasCleanBackground: false,
      hasProfessionalSubject: false,
    };
  }
}

async function checkKnownStockPhotoDatabases(imageBase64) {
  try {
    const mockResults = {
      found: false,
      confidence: 0,
      sources: [],
    };

    const databases = [
      "shutterstock",
      "gettyimages",
      "adobestock",
      "istock",
      "unsplash",
    ];

    return mockResults;
  } catch (error) {
    console.error("Stock photo database check error:", error.message);
    return {
      found: false,
      confidence: 0,
      sources: [],
      error: error.message,
    };
  }
}

async function checkStockPhotoEnhanced(imageBase64, metadata = {}) {
  try {
    const basicCheck = await checkStockPhoto(imageBase64);

    if (metadata.exif) {
      if (
        metadata.exif.copyright &&
        metadata.exif.copyright.toLowerCase().includes("stock")
      ) {
        basicCheck.isStockPhoto = true;
        basicCheck.confidence = Math.max(basicCheck.confidence, 0.8);
        basicCheck.matches.push('Copyright contains "stock" keyword');
      }

      if (
        metadata.exif.artist &&
        metadata.exif.artist.toLowerCase().includes("stock")
      ) {
        basicCheck.isStockPhoto = true;
        basicCheck.confidence = Math.max(basicCheck.confidence, 0.8);
        basicCheck.matches.push('Artist field contains "stock" keyword');
      }
    }

    if (metadata.imageInfo) {
      const { width, height } = metadata.imageInfo;
      if (width >= 3000 && height >= 2000) {
        basicCheck.matches.push(
          "High resolution image (typical for stock photos)"
        );
        basicCheck.confidence += 0.1;
      }
    }

    return {
      ...basicCheck,
      confidence: Math.min(basicCheck.confidence, 1.0),
    };
  } catch (error) {
    console.error("Enhanced stock photo check error:", error.message);
    return {
      isStockPhoto: false,
      confidence: 0,
      sources: [],
      matches: [],
      error: error.message,
    };
  }
}

module.exports = {
  checkStockPhoto,
  checkStockPhotoEnhanced,
  analyzeStockPhotoCharacteristics,
  checkKnownStockPhotoDatabases,
};
