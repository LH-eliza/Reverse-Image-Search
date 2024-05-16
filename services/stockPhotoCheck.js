const axios = require("axios");

async function checkStockPhoto(imageBase64) {
  const apiKey = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_CX;

  try {
    const response = await axios.get(
      "https://www.googleapis.com/customsearch/v1",
      {
        params: {
          q: imageBase64,
          searchType: "image",
          cx: cx,
          key: apiKey,
        },
      }
    );

    const stockPhotoDomains = [
      "shutterstock.com",
      "istockphoto.com",
      "adobe.com",
      "dreamstime.com",
      "123rf.com",
      "depositphotos.com",
      "gettyimages.com",
    ];
    const stockPhotos = response.data.items.filter((item) =>
      stockPhotoDomains.some((domain) => item.link.includes(domain))
    );

    return stockPhotos;
  } catch (error) {
    console.error("Error checking stock photos:", error);
    return [];
  }
}

module.exports = checkStockPhoto;
