# Reverse Image Detection

This project is a reverse image detection bot that leverages the Google Vision API, Google Custom Search API, and Tesseract.js for Optical Character Recognition (OCR). The project is Dockerized for easy deployment and scalability.

## Purpose?

The project was created to allow people to easily access reverse image searching capabilities utilizing the features of Google Lens, but allows for full transparency. This project was created without malicious intent, it allows others to be safe within online spaces providing full transparency and safety.

## Features

Reverse image search using Google Vision API.
Comprehensive web search using Google Custom Search API.
Optical Character Recognition (OCR) using Tesseract.js.
Metadata analysis to retrieve image details.
Stock photo check to identify commonly used stock images.
Facial recognition for identifying potential impersonations.
Dockerized for a consistent and portable environment.

## Prerequisites

Node.js and npm installed.
Docker installed.
Google Cloud API key.
Google Custom Search Engine ID.

Getting Started

1. Clone the repository

```
git clone https://github.com/LH-eliza/reverse-image-bot.git
cd reverse-image-bot
```

2. Install dependencies

```
npm install
```

3. Set up environment variables
   Create a .env file in the root directory and add your Google API key and Custom Search Engine ID.

```
GOOGLE_API_KEY=your_google_api_key
GOOGLE_CX=your_google_cx
AZURE_FACE_API_KEY=your_azure_face_api_key
AZURE_FACE_ENDPOINT=your_azure_face_endpoint

```

4. Build and run with Docker
   Build the Docker image:

```
docker build -t reverse-image-bot.
```

Run the Docker container:

```
docker run -p 3000:3000 reverse-image-bot
```

5. Test the Application
   Use Postman or any other tool to send a POST request to http://localhost:3000/search with an image file as form-data.

Services

- Google Vision API: Performs web detection to identify entities in the image.
- Google Custom Search API: Searches for images across the web.
- Tesseract.js: Performs OCR to extract text from images.
- Metadata Analysis: Retrieves EXIF data from images.
- Stock Photo Check: Identifies commonly used stock images.
- Facial Recognition: Identifies potential impersonations using Azure Face API.

License
This project is licensed under the MIT License. See the LICENSE file for details.

Acknowledgments

- Google Vision API
- Google Custom Search API
- Tesseract.js
- EXIF Library
- Azure Face API
