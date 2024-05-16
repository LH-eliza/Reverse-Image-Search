const ExifImage = require("exif").ExifImage;

async function analyzeMetadata(imagePath) {
  return new Promise((resolve, reject) => {
    try {
      new ExifImage({ image: imagePath }, (error, exifData) => {
        if (error) {
          console.error("Error reading EXIF data:", error);
          resolve({});
        } else {
          resolve(exifData);
        }
      });
    } catch (error) {
      console.error("Error analyzing metadata:", error);
      resolve({});
    }
  });
}

module.exports = analyzeMetadata;

