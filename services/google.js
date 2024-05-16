const axios = require("axios");

async function searchGoogle(imageBase64) {
  const apiKey = process.env.GOOGLE_API_KEY;

  try {
    const response = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        requests: [
          {
            image: {
              content: imageBase64,
            },
            features: [
              {
                type: "WEB_DETECTION",
                maxResults: 10,
              },
            ],
          },
        ],
      }
    );

    return response.data.responses[0].webDetection.webEntities;
  } catch (error) {
    console.error("Error searching Google:", error);
    return [];
  }
}

module.exports = searchGoogle;
