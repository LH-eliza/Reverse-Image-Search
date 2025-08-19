const axios = require("axios");

async function searchGoogleCustom(imagePath) {
  try {
    const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
    const searchEngineId = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID;

    if (!apiKey || !searchEngineId) {
      throw new Error(
        "Google Custom Search API key or Search Engine ID not configured"
      );
    }

    const searchQuery = "image search";

    const response = await axios.get(
      `https://www.googleapis.com/customsearch/v1`,
      {
        params: {
          key: apiKey,
          cx: searchEngineId,
          q: searchQuery,
          searchType: "image",
          num: 10,
        },
      }
    );

    return {
      items: response.data.items || [],
      searchInformation: response.data.searchInformation || {},
      error: null,
    };
  } catch (error) {
    console.error("Google Custom Search API error:", error.message);
    return {
      items: [],
      searchInformation: {},
      error: error.message,
    };
  }
}

async function searchByImageUrl(imageUrl) {
  try {
    const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
    const searchEngineId = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID;

    if (!apiKey || !searchEngineId) {
      throw new Error(
        "Google Custom Search API key or Search Engine ID not configured"
      );
    }

    const response = await axios.get(
      `https://www.googleapis.com/customsearch/v1`,
      {
        params: {
          key: apiKey,
          cx: searchEngineId,
          searchType: "image",
          imgType: "photo",
          num: 10,
          imgSize: "large",
        },
      }
    );

    return {
      items: response.data.items || [],
      searchInformation: response.data.searchInformation || {},
      error: null,
    };
  } catch (error) {
    console.error("Google Custom Search by URL error:", error.message);
    return {
      items: [],
      searchInformation: {},
      error: error.message,
    };
  }
}

module.exports = { searchGoogleCustom, searchByImageUrl };
