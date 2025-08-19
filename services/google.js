const axios = require("axios");

async function searchGoogle(imageBase64) {
  try {
    const apiKey = process.env.GOOGLE_VISION_API_KEY;
    if (!apiKey) {
      throw new Error("Google Vision API key not configured");
    }

    const requestBody = {
      requests: [
        {
          image: {
            content: imageBase64,
          },
          features: [
            {
              type: "LABEL_DETECTION",
              maxResults: 10,
            },
            {
              type: "WEB_DETECTION",
              maxResults: 10,
            },
            {
              type: "FACE_DETECTION",
              maxResults: 10,
            },
            {
              type: "TEXT_DETECTION",
              maxResults: 10,
            },
            {
              type: "OBJECT_LOCALIZATION",
              maxResults: 10,
            },
          ],
        },
      ],
    };

    const response = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const result = response.data.responses[0];

    return {
      labels: result.labelAnnotations || [],
      webDetection: result.webDetection || {},
      faces: result.faceAnnotations || [],
      text: result.textAnnotations || [],
      objects: result.localizedObjectAnnotations || [],
      error: result.error || null,
    };
  } catch (error) {
    console.error("Google Vision API error:", error.message);
    return {
      error: error.message,
      labels: [],
      webDetection: {},
      faces: [],
      text: [],
      objects: [],
    };
  }
}

module.exports = searchGoogle;
