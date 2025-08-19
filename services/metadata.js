const exifr = require("exifr");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

async function analyzeMetadata(imagePath) {
  try {
    const metadata = {};

    const exifData = await exifr.parse(imagePath);
    if (exifData) {
      metadata.exif = {
        make: exifData.Make,
        model: exifData.Model,
        dateTime: exifData.DateTime,
        dateTimeOriginal: exifData.DateTimeOriginal,
        software: exifData.Software,
        artist: exifData.Artist,
        copyright: exifData.Copyright,
        gps: exifData.gps
          ? {
              latitude: exifData.gps.latitude,
              longitude: exifData.gps.longitude,
              altitude: exifData.gps.altitude,
            }
          : null,
        orientation: exifData.Orientation,
      };
    }

    const imageInfo = await sharp(imagePath).metadata();
    metadata.imageInfo = {
      format: imageInfo.format,
      width: imageInfo.width,
      height: imageInfo.height,
      channels: imageInfo.channels,
      depth: imageInfo.depth,
      density: imageInfo.density,
      hasProfile: imageInfo.hasProfile,
      hasAlpha: imageInfo.hasAlpha,
      isOpaque: imageInfo.isOpaque,
      orientation: imageInfo.orientation,
    };

    const stats = fs.statSync(imagePath);
    metadata.fileInfo = {
      size: stats.size,
      sizeInMB: (stats.size / (1024 * 1024)).toFixed(2),
      created: stats.birthtime,
      modified: stats.mtime,
      accessed: stats.atime,
    };

    if (imageInfo.width && imageInfo.height) {
      metadata.aspectRatio = (imageInfo.width / imageInfo.height).toFixed(2);
      metadata.orientation =
        imageInfo.width > imageInfo.height
          ? "landscape"
          : imageInfo.width < imageInfo.height
          ? "portrait"
          : "square";
    }

    metadata.isCommonFormat = [
      "jpeg",
      "jpg",
      "png",
      "gif",
      "webp",
      "bmp",
    ].includes(imageInfo.format?.toLowerCase());

    const sizeInMB = parseFloat(metadata.fileInfo.sizeInMB);
    if (sizeInMB < 1) {
      metadata.sizeCategory = "small";
    } else if (sizeInMB < 5) {
      metadata.sizeCategory = "medium";
    } else if (sizeInMB < 20) {
      metadata.sizeCategory = "large";
    } else {
      metadata.sizeCategory = "very_large";
    }

    return {
      success: true,
      metadata,
      error: null,
    };
  } catch (error) {
    console.error("Metadata analysis error:", error.message);
    return {
      success: false,
      metadata: {},
      error: error.message,
    };
  }
}

async function analyzeMetadataEnhanced(imagePath) {
  try {
    const basicMetadata = await analyzeMetadata(imagePath);

    if (!basicMetadata.success) {
      return basicMetadata;
    }

    const enhanced = { ...basicMetadata.metadata };

    enhanced.manipulationIndicators = {
      hasExif: !!enhanced.exif,
      hasGps: !!enhanced.exif?.gps,
      hasSoftware: !!enhanced.exif?.software,
      hasArtist: !!enhanced.exif?.artist,
      hasCopyright: !!enhanced.exif?.copyright,
    };

    const imageInfo = enhanced.imageInfo;
    enhanced.qualityIndicators = {
      isHighResolution: imageInfo.width >= 1920 && imageInfo.height >= 1080,
      isLowResolution: imageInfo.width < 800 || imageInfo.height < 600,
      hasTransparency: imageInfo.hasAlpha,
      isCompressed: imageInfo.format === "jpeg" || imageInfo.format === "jpg",
      isLossless: imageInfo.format === "png" || imageInfo.format === "bmp",
    };

    enhanced.stockPhotoIndicators = {
      hasMetadata: !!enhanced.exif,
      hasCopyright: !!enhanced.exif?.copyright,
      hasArtist: !!enhanced.exif?.artist,
      isHighQuality: enhanced.qualityIndicators.isHighResolution,
      isCommonFormat: enhanced.isCommonFormat,
    };

    return {
      success: true,
      metadata: enhanced,
      error: null,
    };
  } catch (error) {
    console.error("Enhanced metadata analysis error:", error.message);
    return {
      success: false,
      metadata: {},
      error: error.message,
    };
  }
}

module.exports = { analyzeMetadata, analyzeMetadataEnhanced };
