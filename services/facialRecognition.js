const axios = require("axios");

async function azureFaceRecognition(imageBase64) {
  const apiKey = process.env.AZURE_FACE_API_KEY;
  const endpoint = process.env.AZURE_FACE_ENDPOINT;

  try {
    const response = await axios.post(
      `${endpoint}/face/v1.0/detect`,
      {
        url: `data:image/jpeg;base64,${imageBase64}`,
      },
      {
        headers: {
          "Ocp-Apim-Subscription-Key": apiKey,
          "Content-Type": "application/json",
        },
        params: {
          returnFaceId: true,
          returnFaceLandmarks: false,
          returnFaceAttributes:
            "age,gender,smile,facialHair,glasses,emotion,hair,makeup,occlusion,accessories,blur,exposure,noise",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error performing Azure Face Recognition:", error);
    return [];
  }
}

module.exports = azureFaceRecognition;
