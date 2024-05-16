const axios = require("axios");

async function searchGoogleCustom(imageUrl) {
  const apiKey = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_CX;

  try {
    const response = await axios.get(
      "https://www.googleapis.com/customsearch/v1",
      {
        params: {
          q: imageUrl,
          searchType: "image",
          cx: cx,
          key: apiKey,
        },
      }
    );

    return response.data.items;
  } catch (error) {
    console.error("Error searching Google Custom Search:", error);
    return [];
  }
}

module.exports = searchGoogleCustom;
